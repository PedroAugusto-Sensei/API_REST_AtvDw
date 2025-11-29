// backend/src/routes/boards.routes.js
const router = require('express').Router();
const db = require('../utils/db');
const { body, validationResult } = require('express-validator');

// ----------------------------------------------------------------------
// GET /api/boards - Listar todos os quadros do usuário
// ----------------------------------------------------------------------
/**
 * @swagger
 * /boards:
 *  get:
 *      summary: Lista todos os quadros do usuário autenticado
 *      tags: [Boards]
 *      responses:
 *          200:
 *              description: Lista de quadros retornada com sucesso
 *          500:
 *              description: Erro no servidor
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id; // Vem do middleware de autenticação
        
        // Busca quadros onde o usuário é criador ou participante
        const [boards] = await db.execute(`
            SELECT DISTINCT b.* 
            FROM boards b
            LEFT JOIN participantes_board pb ON b.id = pb.board_id
            WHERE b.creator_id = ? OR pb.user_id = ?
            ORDER BY b.id DESC
        `, [userId, userId]);

        res.status(200).json(boards);
    } catch (error) {
        console.error('Erro ao buscar boards:', error);
        res.status(500).json({ message: 'Erro ao buscar quadros.' });
    }
});

// ----------------------------------------------------------------------
// GET /api/boards/:id - Buscar um quadro específico
// ----------------------------------------------------------------------
/**
 * @swagger
 * /boards/{id}:
 *  get:
 *      summary: Retorna um quadro específico com suas colunas e cards
 *      tags: [Boards]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: Quadro encontrado
 *          404:
 *              description: Quadro não encontrado
 *          500:
 *              description: Erro no servidor
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verifica se o usuário tem acesso ao board
        const [boards] = await db.execute(`
            SELECT b.* 
            FROM boards b
            LEFT JOIN participantes_board pb ON b.id = pb.board_id
            WHERE b.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
        `, [id, userId, userId]);

        if (boards.length === 0) {
            return res.status(404).json({ message: 'Quadro não encontrado ou sem permissão.' });
        }

        // Busca as colunas do board
        const [columns] = await db.execute(
            'SELECT * FROM columns WHERE board_id = ? ORDER BY id',
            [id]
        );

        // Busca os cards de cada coluna
        for (let column of columns) {
            const [cards] = await db.execute(
                'SELECT * FROM cards WHERE column_id = ? ORDER BY id',
                [column.id]
            );
            column.cards = cards;
        }

        const board = {
            ...boards[0],
            columns
        };

        res.status(200).json(board);
    } catch (error) {
        console.error('Erro ao buscar board:', error);
        res.status(500).json({ message: 'Erro ao buscar quadro.' });
    }
});

// ----------------------------------------------------------------------
// POST /api/boards - Criar novo quadro
// ----------------------------------------------------------------------
/**
 * @swagger
 * /boards:
 *  post:
 *      summary: Cria um novo quadro
 *      tags: [Boards]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - name
 *                      properties:
 *                          name:
 *                              type: string
 *                              example: Meu Projeto
 *      responses:
 *          201:
 *              description: Quadro criado com sucesso
 *          400:
 *              description: Erro de validação
 *          500:
 *              description: Erro no servidor
 */
router.post(
    '/',
    [
        body('name')
            .trim()
            .notEmpty().withMessage('O nome do quadro é obrigatório.')
            .isLength({ max: 50 }).withMessage('O nome deve ter no máximo 50 caracteres.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name } = req.body;
            const userId = req.user.id;

            const [result] = await db.execute(
                'INSERT INTO boards (name, creator_id) VALUES (?, ?)',
                [name, userId]
            );

            res.status(201).json({
                message: 'Quadro criado com sucesso.',
                board: {
                    id: result.insertId,
                    name,
                    creator_id: userId
                }
            });
        } catch (error) {
            console.error('Erro ao criar board:', error);
            res.status(500).json({ message: 'Erro ao criar quadro.' });
        }
    }
);

// ----------------------------------------------------------------------
// PUT /api/boards/:id - Atualizar nome do quadro
// ----------------------------------------------------------------------
/**
 * @swagger
 * /boards/{id}:
 *  put:
 *      summary: Atualiza o nome de um quadro
 *      tags: [Boards]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: integer
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *      responses:
 *          200:
 *              description: Quadro atualizado com sucesso
 *          403:
 *              description: Sem permissão
 *          404:
 *              description: Quadro não encontrado
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.id;

        // Verifica se o usuário é o criador
        const [boards] = await db.execute(
            'SELECT * FROM boards WHERE id = ? AND creator_id = ?',
            [id, userId]
        );

        if (boards.length === 0) {
            return res.status(403).json({ message: 'Apenas o criador pode editar o quadro.' });
        }

        await db.execute(
            'UPDATE boards SET name = ? WHERE id = ?',
            [name, id]
        );

        res.status(200).json({ message: 'Quadro atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar board:', error);
        res.status(500).json({ message: 'Erro ao atualizar quadro.' });
    }
});

// ----------------------------------------------------------------------
// DELETE /api/boards/:id - Deletar quadro
// ----------------------------------------------------------------------
/**
 * @swagger
 * /boards/{id}:
 *  delete:
 *      summary: Deleta um quadro e todos os seus dados relacionados
 *      tags: [Boards]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: Quadro deletado com sucesso
 *          403:
 *              description: Sem permissão
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verifica se o usuário é o criador
        const [boards] = await db.execute(
            'SELECT * FROM boards WHERE id = ? AND creator_id = ?',
            [id, userId]
        );

        if (boards.length === 0) {
            return res.status(403).json({ message: 'Apenas o criador pode deletar o quadro.' });
        }

        // Deleta cards, colunas e participantes (cascade)
        await db.execute('DELETE FROM boards WHERE id = ?', [id]);

        res.status(200).json({ message: 'Quadro deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar board:', error);
        res.status(500).json({ message: 'Erro ao deletar quadro.' });
    }
});

// ----------------------------------------------------------------------
// POST /api/boards/:id/participants - Adicionar participante ao quadro
// ----------------------------------------------------------------------
/**
 * @swagger
 * /boards/{id}/participants:
 *  post:
 *      summary: Adiciona um participante ao quadro
 *      tags: [Boards]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: integer
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *      responses:
 *          201:
 *              description: Participante adicionado
 *          404:
 *              description: Usuário não encontrado
 */
router.post('/:id/participants', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const userId = req.user.id;

        // Verifica se o usuário é o criador ou participante
        const [boards] = await db.execute(`
            SELECT b.* 
            FROM boards b
            LEFT JOIN participantes_board pb ON b.id = pb.board_id
            WHERE b.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
        `, [id, userId, userId]);

        if (boards.length === 0) {
            return res.status(403).json({ message: 'Sem permissão para adicionar participantes.' });
        }

        // Busca o usuário pelo email
        const [users] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const participantId = users[0].id;

        // Adiciona o participante (ignora se já existe)
        await db.execute(
            'INSERT IGNORE INTO participantes_board (user_id, board_id) VALUES (?, ?)',
            [participantId, id]
        );

        res.status(201).json({ message: 'Participante adicionado com sucesso.' });
    } catch (error) {
        console.error('Erro ao adicionar participante:', error);
        res.status(500).json({ message: 'Erro ao adicionar participante.' });
    }
});

module.exports = router;
