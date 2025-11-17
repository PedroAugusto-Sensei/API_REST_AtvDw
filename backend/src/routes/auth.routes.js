// backend/src/routes/auth.routes.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const { body, validationResult } = require('express-validator');

// ----------------------------------------------------------------------
// ROTA DE REGISTRO (POST /register)
// ----------------------------------------------------------------------
/**
 * @swagger
 * tags:
 *  - name: Autenticação
 *    description: Rotas de registro, login e logout
 */

// ----------------------------------------------------------------------
// ROTA DE REGISTRO (POST /register)
// ----------------------------------------------------------------------
/**
 * @swagger
 * /auth/register:
 *  post:
 *      summary: Registra um novo usuário no sistema.
 *      tags: [Autenticação]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - password
 *                      properties:
 *                          email:
 *                              type: string
 *                              format: email
 *                              example: novo@usuario.com
 *                          password:
 *                              type: string
 *                              example: senha123456
 *      responses:
 *          201:
 *              description: Usuário registrado com sucesso.
 *          400:
 *              description: Erro de validação ou e-mail já cadastrado.
 */
router.post(
'/register', 
     [
         body('email').isEmail().withMessage('O e-mail fornecido não é válido.'),
         body('password').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.')
     ],
     async (req, res) => {
         const errors = validationResult(req);
        if (!errors.isEmpty()) {
             return res.status(400).json({ errors: errors.array() });
         }
     const { email, password } = req.body;
 
    try {
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);
         await db.execute(
             'INSERT INTO users (email, password) VALUES (?, ?)',
             [email, hashedPassword]
         );
        res.status(201).json({ message: 'Usuário registrado com sucesso.' });
         } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ message: 'Email já cadastrado.' });
        }
         res.status(500).json({ message: 'Erro no servidor.' });
    }
});

// ----------------------------------------------------------------------
// ROTA DE LOGIN (POST /login) - COM SWAGGER
// ----------------------------------------------------------------------
/**
 * @swagger
 * /auth/login:
 *  post:
 *      summary: Autentica um usuário e envia o token JWT via cookie HTTP-Only.
 *      tags: [Autenticação]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                        - email
 *                        - password
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: usuario@teste.com
 *                          password:
 *                              type: string
 *                              example: senha123
 *      responses:
 *          200:
 *              description: Login bem-sucedido. O token JWT é definido no cookie 'jwt'.
 *              headers:
 *                  Set-Cookie:
 *                      schema:
 *                          type: string
 *                          example: jwt=token_jwt_aqui; HttpOnly; Max-Age=3600
 *          401:
 *              description: Credenciais inválidas.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
         if (!user) {
             return res.status(401).json({ message: 'Credenciais inválidas.' });
         }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
             return res.status(401).json({ message: 'Credenciais inválidas.' });
         }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
         
         // MUDANÇA CRÍTICA: Armazena o token como um cookie HTTP-Only
        res.cookie('jwt', token, {
             httpOnly: true, // Proteção XSS
             secure: process.env.NODE_ENV === 'production', // Usar em HTTPS
            maxAge: 3600000 // 1 hora
         });

         res.status(200).json({ message: 'Login bem-sucedido. Token enviado via Cookie.' });
         console.log('Cookie JWT enviado com sucesso!');
         
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

// ----------------------------------------------------------------------
// ROTA DE LOGOUT (POST /logout) - NOVIDADE CRÍTICA E COM SWAGGER
// ----------------------------------------------------------------------
/**
 * @swagger
 * /auth/logout:
 *  post:
 *      summary: Limpa o cookie JWT no navegador para efetuar o logout.
 *      tags: [Autenticação]
 *      responses:
 *          200:
 *              description: Logout bem-sucedido. Cookie JWT limpo.
 */
router.post('/logout', (req, res) => {
    // Limpa o cookie "jwt" no navegador
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax', // Importante para ambiente local
        maxAge: 3600000
        //expires: new Date(0) // Define a data de expiração para o passado
    });
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
});

module.exports = router;