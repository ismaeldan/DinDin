const pool = require('../database/connection')

const listaTransacoes = async (req, res) => {
  try {
    const usuarioId = req.usuario.id
    let filtros = req.query.filtro

    if (!filtros) {
      filtros = []
    } else if (!filtros.join) {
      filtros = [filtros]
    }

    const filtrosFormatados = filtros.map(filtro =>
      isNaN(filtro) ? filtro.toLowerCase() : parseInt(filtro)
    )

    let query = `
      SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome
      FROM transacoes t
      LEFT JOIN categorias c ON t.categoria_id = c.id
      WHERE t.usuario_id = $1
    `
    let valores = [usuarioId]

    if (filtrosFormatados.length > 0) {
      query += `
        AND (
          LOWER(c.id::text) IN (SELECT LOWER(id::text) FROM categorias WHERE LOWER(descricao) = ANY($2::text[]))
          OR LOWER(c.descricao) = ANY($2::text[])
        )
      `
      valores.push(filtrosFormatados)
    }

    const { rows } = await pool.query(query, valores)
    return res.json(rows)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

const detalharTransacao = async (req, res) => {
  const { id } = req.params

  try {
    const { rows } = await pool.query(
      'select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome from transacoes t join categorias c on t.categoria_id = c.id  where t.id = $1 and usuario_id = $2;',
      [id, req.usuario.id]
    )

    if (rows.length != 1) {
      return res.status(404).json({ mensagem: 'Transação não encontrada.' })
    }

    return res.json(rows[0])
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

const cadastrarTransacao = async (req, res) => {
  const { descricao, valor, data, categoria_id, tipo } = req.body

  if (!descricao || !valor || !data || !categoria_id || !tipo) {
    return res
      .status(400)
      .json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
  }

  try {
    const verificaCategoria = await pool.query(
      'select * from categorias where id = $1',
      [categoria_id]
    )

    if (!verificaCategoria.rowCount) {
      return res
        .status(400)
        .json({ mensagem: 'Não existe nenhuma categoria para o Id informado' })
    }

    const { rows } = await pool.query(
      'insert into transacoes (descricao, valor, data, categoria_id, tipo, usuario_id) values ($1, $2, $3, $4, $5, $6) returning *',
      [descricao, valor, data, categoria_id, tipo, req.usuario.id]
    )

    const resultado = {
      id: rows[0].id,
      tipo: rows[0].tipo,
      descricao: rows[0].descricao,
      valor: rows[0].valor,
      data: rows[0].data,
      usuario_id: rows[0].usuario_id,
      categoria_id: rows[0].categoria_id,
      categoria_nome: verificaCategoria.rows[0].descricao
    }

    return res.status(201).json(resultado)
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

const atualizarTransacao = async (req, res) => {
  const { id } = req.params
  const { descricao, valor, data, categoria_id, tipo } = req.body

  if (!descricao || !valor || !data || !categoria_id || !tipo) {
    return res
      .status(400)
      .json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
  }

  if (tipo !== 'entrada') {
    if (tipo !== 'saida') {
      return res.status(400).json({
        mensagem: 'O tipo de transação não corresponde como entrada ou saida'
      })
    }
  }

  try {
    const verificaCategoria = await pool.query(
      'select * from categorias where id = $1',
      [categoria_id]
    )

    if (!verificaCategoria.rowCount) {
      return res
        .status(400)
        .json({ mensagem: 'Não existe nenhuma categoria para o Id informado' })
    }

    const { rows } = await pool.query(
      'update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 where id = $6 and usuario_id = $7',
      [descricao, valor, data, categoria_id, tipo, id, req.usuario.id]
    )

    return res.status(204).json()
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

const excluirTransacao = async (req, res) => {
  const usuarioId = req.usuario.id
  const transacaoId = req.params.id

  try {
    const queryVerificar =
      'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2'
    const { rowCount } = await pool.query(queryVerificar, [
      transacaoId,
      usuarioId
    ])

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: 'Transação não encontrada.' })
    }

    const queryExcluir = 'DELETE FROM transacoes WHERE id = $1'
    await pool.query(queryExcluir, [transacaoId])

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

const extratoTransacoes = async (req, res) => {
  try {
    const usuarioId = req.usuario.id

    const queryEntrada =
      "SELECT COALESCE(SUM(valor), 0) AS entrada FROM transacoes WHERE usuario_id = $1 AND tipo = 'entrada'"
    const resultadoEntrada = await pool.query(queryEntrada, [usuarioId])
    const totalEntrada = resultadoEntrada.rows[0].entrada

    const querySaida =
      "SELECT COALESCE(SUM(valor), 0) AS saida FROM transacoes WHERE usuario_id = $1 AND tipo = 'saida'"
    const resultadoSaida = await pool.query(querySaida, [usuarioId])
    const totalSaida = resultadoSaida.rows[0].saida

    const extrato = {
      entrada: totalEntrada,
      saida: totalSaida
    }
    res.status(200).json(extrato)
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

module.exports = {
  listaTransacoes,
  detalharTransacao,
  cadastrarTransacao,
  atualizarTransacao,
  excluirTransacao,
  extratoTransacoes
}
