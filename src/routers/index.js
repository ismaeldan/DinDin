const rotas = require('express').Router();
const usuarioRotas = require('./usuario');
const transacoesRotas = require('./transacoes');

rotas.get('/', (req, res) => res.send('Starting API...'));

rotas.use(usuarioRotas);
rotas.use(transacoesRotas);


module.exports = rotas;