// backend/src/routes/auth.routes.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getUserByEmail, createUser } = require('../data/mock-data');

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
 *                          - username
 *                          - email
 *                          - password
 *                      properties:
 *                          username:
 *                              type: string
 *                              example: João Silva
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
        body('username')
            .trim()
            .notEmpty().withMessage('O nome é obrigatório.')
            .isLength({ min: 3, max: 50 }).withMessage('O nome deve ter entre 3 e 50 caracteres.'),
        body('email')
            .isEmail().withMessage('O e-mail fornecido não é válido.'),
        body('password')
            .isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            // Verifica se o email já existe
            const existingUser = getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email já cadastrado.' });
            }

            // Criptografa a senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Cria o novo usuário
            const newUser = createUser({
                username,
                email,
                password: hashedPassword
            });

            res.status(201).json({ 
                message: 'Usuário registrado com sucesso.',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                }
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ message: 'Erro no servidor.' });
        }
    }
);

// ----------------------------------------------------------------------
// ROTA DE LOGIN (POST /login)
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
 *                              example: pedro@email.com
 *                          password:
 *                              type: string
 *                              example: senha123
 *      responses:
 *          200:
 *              description: Login bem-sucedido. O token JWT é definido no cookie 'jwt'.
 *          401:
 *              description: Credenciais inválidas.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca o usuário pelo email
        const user = getUserByEmail(email);
        
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Verifica a senha
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Gera o token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        // Armazena o token como um cookie HTTP-Only
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 3600000 // 1 hora
        });

        res.status(200).json({ 
            message: 'Login bem-sucedido.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

// ----------------------------------------------------------------------
// ROTA DE LOGOUT (POST /logout)
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
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
});

// ----------------------------------------------------------------------
// ROTA PARA VERIFICAR SE ESTÁ AUTENTICADO (GET /me)
// ----------------------------------------------------------------------
/**
 * @swagger
 * /auth/me:
 *  get:
 *      summary: Retorna os dados do usuário autenticado
 *      tags: [Autenticação]
 *      responses:
 *          200:
 *              description: Dados do usuário
 *          401:
 *              description: Não autenticado
 */
router.get('/me', (req, res) => {
    try {
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ message: 'Não autenticado.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = getUserByEmail(decoded.email);
        
        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido.' });
    }
});

module.exports = router;