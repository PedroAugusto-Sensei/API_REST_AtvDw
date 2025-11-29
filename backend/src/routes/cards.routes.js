// backend/src/routes/cards.routes.js
const router = require('express').Router();
const db = require('../utils/db');
const { body, validationResult } = require('express-validator');

// ----------------------------------------------------------------------
// POST /api/cards - Criar novo card
// ----------------------------------------------------------------------
/**
 * @swagger
 * /cards:
 *  post:
 *      summary: Cria um novo card em uma coluna
 *      tags: [Cards]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - title
 *                          - column_id
 *                      properties:
 *                          title:
 *                              type: string
 *                              example: Implementar login
 *                          content:
 *                              type: string
 *                              example: Criar tela de login com validação
 *                          column_id:
 *                              type: integer
 *                              example: 1
 *      responses:
 *          201:
 *              description: Card criado com sucesso
 *          400:
 *              description: Erro de validação
 *          403:
 *              description: Sem permissão
 */
router.post(
    '/',
    [
        body('title')
            .trim()
            .notEmpty().withMessage('O título do card é obrigatório.')
            .isLength({ max: 50 }).withMessage('O título deve ter no máximo 50 caracteres.'),
        body('content')
            .optional()
            .isLength({ max: 200 }).withMessage('O conteúdo deve ter no máximo 200 caracteres.'),
        body('column_id')
            .isInt().withMessage('ID da coluna inválido.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { title, content, column_id } = req.body;
            const userId = req.user.id;

            // Verifica se o usuário tem acesso ao board através da coluna
            const [columns] = await db.execute(`
                SELECT c.* 
                FROM columns c
                INNER JOIN boards b ON c.board_id = b.id
                LEFT JOIN participantes_board pb ON b.id = pb.board_id
                WHERE c.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
            `, [column_id, userId, userId]);

            if (columns.length === 0) {
                return res.status(403).json({ message: 'Sem permissão para adicionar cards nesta coluna.' });
            }

            const [result] = await db.execute(
                'INSERT INTO cards (title, content, column_id) VALUES (?, ?, ?)',
                [title, content || null, column_id]
            );

            res.status(201).json({
                message: 'Card criado com sucesso.',
                card: {
                    id: result.insertId,
                    title,
                    content: content || null,
                    column_id
                }
            });
        } catch (error) {
            console.error('Erro ao criar card:', error);
            res.status(500).json({ message: 'Erro ao criar card.' });
        }
    }
);

// ----------------------------------------------------------------------
// PUT /api/cards/:id - Atualizar card
// ----------------------------------------------------------------------
/**
 * @swagger
 * /cards/{id}:
 *  put:
 *      summary: Atualiza um card
 *      tags: [Cards]
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
 *                          title:
 *                              type: string
 *                          content:
 *                              type: string
 *      responses:
 *          200:
 *              description: Card atualizado
 *          403:
 *              description: Sem permissão
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id;

        // Verifica permissão através do board
        const [cards] = await db.execute(`
            SELECT ca.* 
            FROM cards ca
            INNER JOIN columns c ON ca.column_id = c.id
            INNER JOIN boards b ON c.board_id = b.id
            LEFT JOIN participantes_board pb ON b.id = pb.board_id
            WHERE ca.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
        `, [id, userId, userId]);

        if (cards.length === 0) {
            return res.status(403).json({ message: 'Sem permissão para editar este card.' });
        }

        await db.execute(
            'UPDATE cards SET title = ?, content = ? WHERE id = ?',
            [title, content || null, id]
        );

        res.status(200).json({ message: 'Card atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar card:', error);
        res.status(500).json({ message: 'Erro ao atualizar card.' });
    }
});

// ----------------------------------------------------------------------
// PUT /api/cards/:id/move - Mover card para outra coluna
// ----------------------------------------------------------------------
/**
 * @swagger
 * /cards/{id}/move:
 *  put:
 *      summary: Move um card para outra coluna
 *      tags: [Cards]
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
 *                          column_id:
 *                              type: integer
 *      responses:
 *          200:
 *              description: Card movido
 *          403:
 *              description: Sem permissão
 */
router.put('/:id/move', async (req, res) => {
    try {
        const { id } = req.params;
        const { column_id } = req.body;
        const userId = req.user.id;

        // Verifica permissão no card atual
        const [cards] = await db.execute(`
            SELECT ca.* 
            FROM cards ca
            INNER JOIN columns c ON ca.column_id = c.id
            INNER JOIN boards b ON c.board_id = b.id
            LEFT JOIN participantes_board pb ON b.id = pb.board_id
            WHERE ca.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
        `, [id, userId, userId]);

        if (cards.length === 0) {
            return res.status(403).json({ message: 'Sem permissão para mover este card.' });
        }

        // Verifica se a coluna de destino pertence ao mesmo board
        const [targetColumns] = await db.execute(`
            SELECT c.* 
            FROM columns c
            INNER JOIN boards b ON c.board_id = b.id
            LEFT JOIN participantes_board pb ON b.id = pb.board_id
            WHERE c.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
        `, [column_id, userId, userId]);

        if (targetColumns.length === 0) {
            return res.status(403).json({ message: 'Coluna de destino inválida.' });
        }

        await db.execute(
            'UPDATE cards SET column_id = ? WHERE id = ?',
            [column_id, id]
        );

        res.status(200).json({ message: 'Card movido com sucesso.' });
    } catch (error) {
        console.error('Erro ao mover card:', error);
        res.status(500).json({ message: 'Erro ao mover card.' });
    }
});

// ----------------------------------------------------------------------
// DELETE /api/cards/:id - Deletar card
// ----------------------------------------------------------------------
/**
 * @swagger
 * /cards/{id}:
 *  delete:
 *      summary: Deleta um card
 *      tags: [Cards]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: Card deletado
 *          403:
 *              description: Sem permissão
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verifica permissão através do board
        const [cards] = await db.execute(`
            SELECT ca.* 
            FROM cards ca
            INNER JOIN columns c ON ca.column_id = c.id
            INNER JOIN boards b ON c.board_id = b.id
            LEFT JOIN participantes_board pb ON b.id = pb.board_id
            WHERE ca.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
        `, [id, userId, userId]);

        if (cards.length === 0) {
            return res.status(403).json({ message: 'Sem permissão para deletar este card.' });
        }

        await db.execute('DELETE FROM cards WHERE id = ?', [id]);

        res.status(200).json({ message: 'Card deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar card:', error);
        res.status(500).json({ message: 'Erro ao deletar card.' });
    }
});

// ----------------------------------------------------------------------
// POST /api/cards/:id/participants - Adicionar participante ao card
// ----------------------------------------------------------------------
/**
 * @swagger
 * /cards/{id}/participants:
 *  post:
 *      summary: Adiciona um participante ao card
 *      tags: [Cards]
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
 *                          user_id:
 *                              type: integer
 *      responses:
 *          201:
 *              description: Participante adicionado ao card
 */
router.post('/:id/participants', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        const userId = req.user.id;

        // Verifica permissão
        const [cards] = await db.execute(`
            SELECT ca.* 
            FROM cards ca
            INNER JOIN columns c ON ca.column_id = c.id
            INNER JOIN boards b ON c.board_id = b.id
            LEFT JOIN participantes_board pb ON b.id = pb.board_id
            WHERE ca.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
        `, [id, userId, userId]);

        if (cards.length === 0) {
            return res.status(403).json({ message: 'Sem permissão.' });
        }

        await db.execute(
            'INSERT IGNORE INTO participants_card (user_id, card_id) VALUES (?, ?)',
            [user_id, id]
        );

        res.status(201).json({ message: 'Participante adicionado ao card.' });
    } catch (error) {
        console.error('Erro ao adicionar participante:', error);
        res.status(500).json({ message: 'Erro ao adicionar participante.' });
    }
});

module.exports = router;