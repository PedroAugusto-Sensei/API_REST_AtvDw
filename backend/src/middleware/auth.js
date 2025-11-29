// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação que verifica o token JWT nos cookies
 * e adiciona o usuário ao objeto req
 */
const authMiddleware = (req, res, next) => {
    try {
        // Pega o token do cookie
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ 
                message: 'Acesso negado. Token não fornecido.' 
            });
        }

        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adiciona os dados do usuário ao objeto req
        req.user = { id: decoded.id };
        
        // Continua para a próxima função (rota)
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expirado. Faça login novamente.' 
            });
        }
        
        return res.status(401).json({ 
            message: 'Token inválido.' 
        });
    }
};

module.exports = authMiddleware;