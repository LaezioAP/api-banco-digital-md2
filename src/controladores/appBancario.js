const bancoDeDados = require('../bd/bancodedados');
const { format } = require('date-fns');
let identificador = 0;

const listarContasBancarias = (req, res) => {
    const { contas } = bancoDeDados;
    res.json(contas);
};

const cadastroDeUsuario = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const resultado = bancoDeDados.contas.find( conta => {
        return conta.usuario.cpf === cpf || conta.usuario.email === email;
    })

    if(resultado) return res.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!"});

    const novoUsuario = {
        numero: ++identificador,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    bancoDeDados.contas.push(novoUsuario);
    res.status(201).send();
};

const atualizarUsuarioCadastrado = (req, res) => {
    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if(!Number(numeroConta)) {
        return res.status(400).json({mensagem: "Favor digitar um número válido!"});
    }

    if(!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios, por favor preencha com cuidado!"});
    }

    const usuarioEditado = bancoDeDados.contas.find( usuario => usuario.numero === Number(numeroConta));

    if(!usuarioEditado) return res.status(400).json( { mensagem: "Usuário não encontrado, por favor digite outro número!"});

    const resultado = bancoDeDados.contas.find( conta => conta.usuario.cpf === cpf || conta.usuario.email === email);

    if(resultado) return res.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!"});

    usuarioEditado.usuario.nome = nome;
    usuarioEditado.usuario.cpf = cpf;
    usuarioEditado.usuario.data_nascimento = data_nascimento;
    usuarioEditado.usuario.telefone = telefone;
    usuarioEditado.usuario.email = email;
    usuarioEditado.usuario.senha = senha;

    res.status(201).send();
}

const excluirUsuarioCadastrado = (req, res) => {
    const { numeroConta } = req.params;

    if(!Number(numeroConta)) return res.status(400).json({mensagem: "Favor digitar um número válido!"});

    const usuarioEditado = bancoDeDados.contas.find( usuario => usuario.numero === Number(numeroConta));

    if(!usuarioEditado) return res.status(400).json({ mensagem: "Usuário não encontrado, por favor digite outro número!"});

    if(usuarioEditado.saldo !== 0) return res.status(400).json({ mensagem: "A conta só pode ser removida se o saldo for zero!"})

    const indiceUsuario = bancoDeDados.contas.findIndex( usuario => usuario.numero === Number(numeroConta));

    bancoDeDados.contas.splice(indiceUsuario, 1);
    res.status(204).send();
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body;

    if(Number(valor) <= 0) return res.status(400).json({ mensagem: "Não são permitidos depositos em valores negativos ou zerados!" })

    if(!Number(numero_conta) || !Number(valor)) return res.status(400).json({mensagem: "O número da conta e o valor são obrigatórios e somente valores númericos!"});

    const contaBancariaExistente = bancoDeDados.contas.find( conta => conta.numero === Number(numero_conta));

    if(!contaBancariaExistente) return res.status(400).json( { mensagem: "Conta bancaria não encontrada!"});

    const historicoDeposito = {
        data: format(new Date(), "dd-MM-yyyy HH:mm:ss"),
        numero_conta,
        valor
    };

    contaBancariaExistente.saldo += Number(valor);
    bancoDeDados.depositos.push(historicoDeposito);
    res.status(204).send();
}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if(Number(valor) <= 0) return res.status(400).json({ mensagem: "O valor não pode ser menor que zero!" });

    if(!Number(numero_conta) || !Number(valor) || !senha ) return res.status(400).json({mensagem: "Todos os campos são obrigatórios"});

    const contaBancariaExistente = bancoDeDados.contas.find( conta => conta.numero === Number(numero_conta));

    if(!contaBancariaExistente) return res.status(400).json( { mensagem: "Conta bancaria não encontrada!"});

    if (contaBancariaExistente.saldo < Number(valor)) return res.status(400).json( { mensagem: "Saldo insuficiente para saque!"});

    if(senha !== contaBancariaExistente.usuario.senha) return res.status(400).json( { mensagem: "Senha inválida!"});

    const historicoSaque = {
        data: format(new Date(), "dd-MM-yyyy HH:mm:ss"),
        numero_conta,
        valor
    };

    contaBancariaExistente.saldo -= Number(valor);
    bancoDeDados.saques.push(historicoSaque);
    res.status(204).send();
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if(numero_conta_origem === numero_conta_destino) {
        return res.status(400).json({mensagem: "O campo destino e origem são iguais, escolha outro numero da conta destino."});
    }

    if(Number(valor) <= 0) return res.status(400).json({ mensagem: "O valor não pode ser menor que zero!" });

    if(!Number(numero_conta_origem) || !Number(numero_conta_destino) || !Number(valor) || !senha  ) return res.status(400).json({mensagem: "Todos os campos são obrigatórios"});

    const contaOrigem = bancoDeDados.contas.find( conta => Number(numero_conta_origem) === conta.numero);
    const contaDestino = bancoDeDados.contas.find( conta => Number(numero_conta_destino) === conta.numero);

    if(!contaOrigem) return res.status(400).json( { mensagem: "Conta bancaria de origem não encontrada!"});

    if(!contaDestino) return res.status(400).json( { mensagem: "Conta bancaria de destino não encontrada!"});
    
    if(senha !== contaOrigem.usuario.senha) return res.status(400).json( { mensagem: "Senha inválida!"});

    if (contaOrigem.saldo < Number(valor)) return res.status(400).json( { mensagem: "Saldo insuficiente para saque!"});

    const historicoDeTransferencia = {
        data: format(new Date(), "dd-MM-yyyy HH:mm:ss"),
        numero_conta_origem,
        numero_conta_destino,
        valor
    }
    contaOrigem.saldo -= Number(valor);
    contaDestino.saldo += Number(valor);
    bancoDeDados.transferencias.push(historicoDeTransferencia);
    res.status(204).send();
}

const saldo = (req, res) => {
    const { numero_conta, senha } = req.query;

    if(!Number(numero_conta) || !senha ) return res.status(400).json({ mensagem: "Todos os campos são obrigatório!" });

    if(!Number(numero_conta)) return res.status(400).json( { mensagem: "Conta bancaria não encontrada!" });

    const contaBancaria = bancoDeDados.contas.find( conta => conta.numero === Number(numero_conta));

    if(!contaBancaria) return res.status(400).json({ mensagem: "Conta bancária não encontada!" });

    if(senha !== contaBancaria.usuario.senha) return res.status(401).json({ mensagem: "A senha da conta bancaria inválida!"});

    res.json({ saldo: contaBancaria.saldo });
}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    if(!Number(numero_conta) || !senha ) return res.status(400).json({ mensagem: "Todos os campos são obrigatório!" });

    if(!Number(numero_conta)) return res.status(400).json( { mensagem: "Conta bancaria não encontrada!" });

    const contaBancaria = bancoDeDados.contas.find( conta => conta.numero === Number(numero_conta));

    if(!contaBancaria) return res.status(400).json({ mensagem: "Conta bancária não encontada!" });

    if(senha !== contaBancaria.usuario.senha) return res.status(401).json({ mensagem: "A senha da conta bancaria inválida!"});

    const deposito = bancoDeDados.depositos.filter( conta => conta.numero_conta === Number(numero_conta));
    const saque = bancoDeDados.saques.filter( conta => conta.numero_conta === Number(numero_conta));
    const transferenciaEnviadas = bancoDeDados.transferencias.filter (conta => conta.numero_conta_origem === Number(numero_conta));
    const transferenciaRecebidas = bancoDeDados.transferencias.filter (conta => conta.numero_conta_origem !== Number(numero_conta) && conta.numero_conta_destino === Number(numero_conta));

    res.json({
        deposito,
        saque,
        transferencias: {
            transferenciaEnviadas,
            transferenciaRecebidas
        }
    })
}

module.exports = { 
    listarContasBancarias,
    cadastroDeUsuario,
    atualizarUsuarioCadastrado,
    excluirUsuarioCadastrado,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
};