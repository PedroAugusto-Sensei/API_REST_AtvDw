// backend/server.js
require('dotenv').config(); // Isso deve ser a primeira linha

// === 1.IMPORTAÇÕES ===
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const express = require('express');
const cors = require('cors'); // Habilita a comunicação entre domínios
const cookieParser = require('cookie-parser'); // NOVIDADE

// Importa suas rotas de autenticação e rotas privadas
const authRoutes = require('./src/routes/auth.routes.js');
const privateRoutes = require('./src/routes/private.routes');
const { swaggerDocs } = require('./src/utils/swagger.js');

// === 2. INICIALIZAÇÃO DO APP ===
const app = express();
const PORT = process.env.PORT || 5000; // Define a porta, com 5000 como fallback

// === 3. MIDDLEWARES DE SEGURANÇA E BÁSICOS ===
app.use(express.json()); // Permite que a API leia JSON
app.use(cookieParser()); // NOVIDADE: Habilita a leitura de req.cookies

// === 4. Defesa de Cabeçalhos (Helmet) ===
app.use(helmet()); 

// === 5. Limitação de Requisições (Rate Limiting) ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // Máximo de 100 requisições por IP
});
app.use(limiter);

// === 6. Permissão de Acesso (CORS) ===
app.use(cors({
  origin: "http://localhost:5173",   // Apenas o domínio do nosso frontend é permitido
  credentials: true // Permite que o frontend envie e receba cookies
}));

// === 7. CONFIGURAÇÃO DAS ROTAS ===
// Rotas públicas (como login e registro)
app.use('/api/auth', authRoutes); // Qualquer requisição para /api/auth... vai para auth.routes.js

// Rotas protegidas (são as que exigem um token válido)
app.use('/api/private', privateRoutes); // Direciona as requisições para /api...

// === 8. Rotas de Documentação (Swagger UI) ===
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
swaggerDocs(app);

// === 9. INICIALIZAÇÃO DO SERVIDOR ===
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
});