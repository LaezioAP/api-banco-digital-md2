const validarSenha = (req, res, next) => {
    const { senha_banco } = req.query;
    
    if(senha_banco !== 'Cubos123Bank') return res.status(401).json({ mensagem: "A senha do banco informada é inválida!"});

    next();
}

const validarCadastroUsuario =  (req, res, next) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if(!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios, por favor preencha com cuidado!"});
    }

    if(cpf.length !== 11) {
        return res.status(400).json({ mensagem: "O CPF deve conter 11 numeros"});
    }

    if(!Number(cpf)) {
        return res.status(400).json({ mensagem: "O CPF deve conter apenas numeros"});
    }

    next();
}


module.exports = {
    validarSenha,
    validarCadastroUsuario
}