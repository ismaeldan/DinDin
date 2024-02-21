const pool = require('../database/connection');

const listaCategorias = async (req, res) => {
  try {
    const { rows } = await pool.query('select * from categorias');

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
}

module.exports = {
  listaCategorias
};
