// backend/src/utils/swagger.js
const swaggerJsdoc = require('swagger-jsdoc'); // Opções de configuração para o swagger-jsdoc
const swaggerUi = require('swagger-ui-express')

// configuração da API
const options = {
  definition: {
    // 1. Informações Básicas da API
    openapi: '3.0.3',
    info: {
      title: 'API do Projeto de Autenticação JWT (Express/MySQL)',
      version: '1.0.0',
      description: 'Documentação da API do projeto Desenvolvimento WEB II, utilizando JWT em Cookie HTTP-Only para segurança.'
    },
    // 2. Servidor Base
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor de Desenvolvimento'
      },
    ],
    // 3. Componentes de Segurança (Define como a API é protegida)
    components: {
      securitySchemes: {
        // Define o método de autenticação como um Cookie chamado 'jwt'
        cookieAuth: { // <--- MUDANÇA: Nome do esquema para refletir a autenticação por Cookie
          type: "apiKey", // <--- Necessário para autenticação baseada em Cookie
          in: "cookie", // <--- Define que o token é buscado no Cookie
          name: "jwt", // <--- O nome do cookie que armazena o token (definido no res.cookie)
          description: 'Autenticação via Cookie HTTP-Only contendo o JWT.'
        }
      },
      // Schemas (Modelos de Dados)
      schemas: {
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'usuario@exemplo.com' },
            password: { type: 'string', example: 'senhaforte123' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  },
  // 4. Locais onde procurar os comentários JSDoc das rotas
  apis: ['./src/routes/*.js', './src/server.js'],
};

// Gera a especificação OpenAPI em formato JSON
const swaggerSpecs = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  console.log('✅ Swagger disponível em http://localhost:5000/api-docs');
}

module.exports = {swaggerDocs};