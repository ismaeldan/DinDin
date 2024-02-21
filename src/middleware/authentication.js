const pool = require('../database/connection');
const jwt = require('jsonwebtoken');
const env = require('../configs/env');

const verificarUsuarioLogado = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ mensagem: 'Não autorizado' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { id } = jwt.verify(token, env.chave_jwt);

    const { rowCount, rows } = await pool.query(
      'select * from usuarios where id = $1',
      [id]
    );

    if (rowCount < 1) {
      return res.status(401).json({ mensagem: 'Não autorizado' });
    }

    req.usuario = rows[0];

    next();
  } catch (error) {
    return res
      .status(401)
      .json({
        mensagem:
          'Para acessar este recurso um token de autenticação válido deve ser enviado.'
      });
  }
}

module.exports = verificarUsuarioLogado;
