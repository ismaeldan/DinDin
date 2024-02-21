const pool = require('../database/connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const env = require('../configs/env')

const cadastrar = async (req, res) => {
  const { nome, email, senha } = req.body

  if (!nome) {
    return res.status(400).json({ messagem: 'Nome não informado' })
  }

  if (!email) {
    return res.status(400).json({ messagem: 'E-mail não informado' })
  }

  if (!senha) {
    return res.status(400).json({ messagem: 'Senha não informada' })
  }

  try {
    const usuario = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    )

    if (usuario.rows.length > 0) {
      return res.status(400).json({
        messagem: 'Já existe usuário cadastrado com o e-mail informado.'
      })
    }

    const senhaBcrypt = await bcrypt.hash(senha, 10)

    const novoUsuario = await pool.query(
      'insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *',
      [nome, email, senhaBcrypt]
    )

    const resultado = {
      id: novoUsuario.rows[0].id,
      nome: novoUsuario.rows[0].nome,
      email: novoUsuario.rows[0].email
    }

    return res.status(201).json(resultado)
  } catch (error) {
    return res.status(500).json({ messagem: 'Erro interno do servidor' })
  }
}

const login = async (req, res) => {
  const { email, senha } = req.body

  try {
    const usuario = await pool.query(
      'select * from usuarios where email = $1',
      [email]
    )

    if (usuario.rows.length != 1) {
      return res.status(404).json({ messagem: 'Email ou senha invalida' })
    }

    const validaSenhaBcrypt = await bcrypt.compare(senha, usuario.rows[0].senha)

    if (!validaSenhaBcrypt) {
      return res.status(400).json({ messagem: 'Email ou senha invalida' })
    }

    const token = jwt.sign({ id: usuario.rows[0].id }, env.chave_jwt, {
      expiresIn: '8h'
    })

    const { senha: _, ...usuarioLogado } = usuario.rows[0]

    return res.json({ usuario: usuarioLogado, token })
  } catch (error) {
    return res.status(500).json({ messagem: 'Erro interno do servidor' })
  }
}

const perfil = (req, res) => {
  const resultado = {
    id: req.usuario.id,
    nome: req.usuario.nome,
    email: req.usuario.email
  }

  return res.json(resultado)
}

const atualizar = async (req, res) => {
  const { nome, email, senha } = req.body

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ mensagem: 'Nome, email e senha são obrigatórios.' })
  }

  try {
    const usuario = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND id <> $2',
      [email, req.usuario.id]
    )

    if (usuario.rows.length > 0) {
      return res.status(400).json({
        messagem: 'Já existe usuário cadastrado com o e-mail informado.'
      })
    }

    const senhaBcrypt = await bcrypt.hash(senha, 10)

    await pool.query(
      'UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4',
      [nome, email, senhaBcrypt, req.usuario.id]
    )

    return res.status(204).send()
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

module.exports = {
  cadastrar,
  login,
  perfil,
  atualizar
}
