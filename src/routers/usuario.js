const rotas = require('express').Router();
const usuario = require('../controllers/usuario');
const { listaCategorias } = require('../controllers/categorias');
const verificarUsuarioLogado = require('../middleware/authentication');

rotas.post('/usuario', usuario.cadastrar);
rotas.post('/login', usuario.login);

rotas.use(verificarUsuarioLogado);
rotas.get('/usuario', usuario.perfil);
rotas.put('/usuario', usuario.atualizar);

rotas.get('/categoria', listaCategorias);

module.exports = rotas;
