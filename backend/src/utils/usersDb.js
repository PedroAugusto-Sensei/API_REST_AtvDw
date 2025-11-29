// Um banco de dados de usuários simulado para fins de teste

const users = [

{

id: 1,

email: 'teste@exemplo.com',

// Senha 'senha123' criptografada com bcrypt. Nunca armazene senhas em texto puro!

password: '$2b$10$LiyqCoavh1L5Ezj9okWiUeEftZScf7KUYmG0dNk/Tdgp4BEkaQ12e'

},

{

id: 2,

email: 'usuario2@exemplo.com',

password: '$2b$10$LiyqCoavh1L5Ezj9okWiUeEftZScf7KUYmG0dNk/Tdgp4BEkaQ12e'

},

];

module.exports = users;