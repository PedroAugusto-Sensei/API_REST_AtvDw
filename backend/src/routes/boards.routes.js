// backend/src/routes/boards.routes.js
const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const {
    getBoardsByUserId,
    getBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    hasAccessToBoard,
    addBoardParticipant,
    getColumnsByBoardId,
    getCardsByColumnId,
    getUserByEmail
} = require('../data/mock-data');

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
        const userId = req.user.id;
        const boards = getBoardsByUserId(userId);
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
        const boardId = parseInt(id);

        // Verifica se o usuário tem acesso ao board
        if (!hasAccessToBoard(userId, boardId)) {
            return res.status(404).json({ message: 'Quadro não encontrado ou sem permissão.' });
        }

        const board = getBoardById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Quadro não encontrado.' });
        }

        // Busca as colunas do board
        const columns = getColumnsByBoardId(boardId);

        // Busca os cards de cada coluna
        const columnsWithCards = columns.map(column => ({
            ...column,
            cards: getCardsByColumnId(column.id)
        }));

        const boardData = {
            ...board,
            columns: columnsWithCards
        };

        res.status(200).json(boardData);
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

            const newBoard = createBoard({
                name,
                creator_id: userId
            });

            res.status(201).json({
                message: 'Quadro criado com sucesso.',
                board: newBoard
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
        const boardId = parseInt(id);

        const board = getBoardById(boardId);
        if (!board || board.creator_id !== userId) {
            return res.status(403).json({ message: 'Apenas o criador pode editar o quadro.' });
        }

        updateBoard(boardId, { name });
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
        const boardId = parseInt(id);

        const board = getBoardById(boardId);
        if (!board || board.creator_id !== userId) {
            return res.status(403).json({ message: 'Apenas o criador pode deletar o quadro.' });
        }

        deleteBoard(boardId);
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
        const boardId = parseInt(id);

        if (!hasAccessToBoard(userId, boardId)) {
            return res.status(403).json({ message: 'Sem permissão para adicionar participantes.' });
        }

        const participant = getUserByEmail(email);
        if (!participant) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        addBoardParticipant(participant.id, boardId);
        res.status(201).json({ message: 'Participante adicionado com sucesso.' });
    } catch (error) {
        console.error('Erro ao adicionar participante:', error);
        res.status(500).json({ message: 'Erro ao adicionar participante.' });
    }
});

module.exports = router;