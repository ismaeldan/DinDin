const rotas = require('express').Router();
const transacoes = require('../controllers/transacoes');
const verificarUsuarioLogado = require('../middleware/authentication');

rotas.use(verificarUsuarioLogado);
rotas.post('/transacao', transacoes.cadastrarTransacao);

rotas.get('/transacao', transacoes.listaTransacoes);
rotas.get('/transacao/extrato', transacoes.extratoTransacoes);

rotas.get('/transacao/:id', transacoes.detalharTransacao);
rotas.put('/transacao/:id', transacoes.atualizarTransacao);
rotas.delete('/transacao/:id', transacoes.excluirTransacao);

module.exports = rotas;


