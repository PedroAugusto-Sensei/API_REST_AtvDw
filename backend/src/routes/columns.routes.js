// backend/src/routes/columns.routes.js
const router = require('express').Router();
const db = require('../utils/db');
const { body, validationResult } = require('express-validator');

// ----------------------------------------------------------------------
// POST /api/columns - Criar nova coluna
// ----------------------------------------------------------------------
/**
 * @swagger
 * /columns:
 *  post:
 *      summary: Cria uma nova coluna em um quadro
 *      tags: [Columns]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - name
 *                          - board_id
 *                      properties:
 *                          name:
 *                              type: string
 *                              example: A fazer
 *                          board_id:
 *                              type: integer
 *                              example: 1
 *      responses:
 *          201:
 *              description: Coluna criada com sucesso
 *          400:
 *              description: Erro de validação
 *          403:
 *              description: Sem permissão
 */
router.post(
    '/',
    [
        body('name')
            .trim()
            .notEmpty().withMessage('O nome da coluna é obrigatório.')
            .isLength({ max: 50 }).withMessage('O nome deve ter no máximo 50 caracteres.'),
        body('board_id')
            .isInt().withMessage('ID do quadro inválido.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, board_id } = req.body;
            const userId = req.user.id;

            // Verifica se o usuário tem acesso ao board
            const [boards] = await db.execute(`
                SELECT b.* 
                FROM boards b
                LEFT JOIN participantes_board pb ON b.id = pb.board_id
                WHERE b.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
            `, [board_id, userId, userId]);

            if (boards.length === 0) {
                return res.status(403).json({ message: 'Sem permissão para adicionar colunas neste quadro.' });
            }

            const [result] = await db.execute(
                'INSERT INTO columns (name, board_id) VALUES (?, ?)',
                [name, board_id]
            );

            res.status(201).json({
                message: 'Coluna criada com sucesso.',
                column: {
                    id: result.insertId,
                    name,
                    board_id
                }
            });
        } catch (error) {
            console.error('Erro ao criar coluna:', error);
            res.status(500).json({ message: 'Erro ao criar coluna.' });
        }
    }
);

// ----------------------------------------------------------------------
// PUT /api/columns/:id - Atualizar nome da coluna
// ----------------------------------------------------------------------
/**
 * @swagger
 * /columns/{id}:
 *  put:
 *      summary: Atualiza o nome de uma coluna
 *      tags: [Columns]
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
 *              description: Coluna atualizada
 *          403:
 *              description: Sem permissão
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.id;

        // Verifica permissão através do board
        const [columns] = await db.execute(`
            SELECT c.* 
            FROM columns c
            INNER JOIN boards b ON c.board_id = b.id
            LEFT JOIN participantes_board pb ON b.id = pb.board_id
            WHERE c.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
        `, [id, userId, userId]);

        if (columns.length === 0) {
            return res.status(403).json({ message: 'Sem permissão para editar esta coluna.' });
        }

        await db.execute(
            'UPDATE columns SET name = ? WHERE id = ?',
            [name, id]
        );

        res.status(200).json({ message: 'Coluna atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar coluna:', error);
        res.status(500).json({ message: 'Erro ao atualizar coluna.' });
    }
});

// ----------------------------------------------------------------------
// DELETE /api/columns/:id - Deletar coluna
// ----------------------------------------------------------------------
/**
 * @swagger
 * /columns/{id}:
 *  delete:
 *      summary: Deleta uma coluna e todos os seus cards
 *      tags: [Columns]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: Coluna deletada
 *          403:
 *              description: Sem permissão
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verifica permissão através do board
        const [columns] = await db.execute(`
            SELECT c.* 
            FROM columns c
            INNER JOIN boards b ON c.board_id = b.id
            LEFT JOIN participantes_board pb ON b.id = pb.board_id
            WHERE c.id = ? AND (b.creator_id = ? OR pb.user_id = ?)
        `, [id, userId, userId]);

        if (columns.length === 0) {
            return res.status(403).json({ message: 'Sem permissão para deletar esta coluna.' });
        }

        // Deleta a coluna (os cards serão deletados por CASCADE se configurado)
        await db.execute('DELETE FROM columns WHERE id = ?', [id]);

        res.status(200).json({ message: 'Coluna deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar coluna:', error);
        res.status(500).json({ message: 'Erro ao deletar coluna.' });
    }
});

module.exports = router;