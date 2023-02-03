const express = require('express');
const { validarSenha, validarCadastroUsuario} = require('./intermediario');
const funcionalidades = require('./controladores/appBancario')
const rotas = express();

rotas.get('/contas' , validarSenha, funcionalidades.listarContasBancarias);
rotas.get('/contas/saldo', funcionalidades.saldo);
rotas.get('/contas/extrato', funcionalidades.extrato);
rotas.post('/contas', validarCadastroUsuario, funcionalidades.cadastroDeUsuario);
rotas.post('/transacoes/depositar', funcionalidades.depositar);
rotas.post('/transacoes/sacar', funcionalidades.sacar);
rotas.post('/transacoes/transferir', funcionalidades.transferir);
rotas.put('/contas/:numeroConta/usuario', funcionalidades.atualizarUsuarioCadastrado);
rotas.delete('/contas/:numeroConta', funcionalidades.excluirUsuarioCadastrado);

module.exports = rotas;