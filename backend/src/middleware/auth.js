// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Extrair o JWT do Cookie
    const token = req.cookies.jwt;
    console.log('Cookies recebidos:', req.cookies);

    // 2. Cenário 401: Token Ausente
    //if (!token) return res.status(401).send('Acesso negado. Token não fornecido.');
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Token ausente ou inválido"
        });
    }

    try {
        // 3. Verificar a validade do Token (Assinatura e Expiração)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Se for válido, adiciona o 'payload' do token na requisição para ser usado depois
        req.user = decoded;
        
        // 4. Token Válido: Segue para a rota
        next();

    } catch (err) {
        // Cenário 401: Token Inválido ou Expirado (Slide 13: Cenários 2 e 3)
        // Falha de Autenticação (A assinatura não confere ou o token expirou)
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Token ausente ou inválido"
        });
    }
};

module.exports = verifyToken;
