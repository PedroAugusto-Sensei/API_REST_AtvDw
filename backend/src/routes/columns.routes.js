// backend/src/routes/columns.routes.js
const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const {
    getColumnById,
    createColumn,
    updateColumn,
    deleteColumn,
    hasAccessToBoard,
    getBoardById
} = require('../data/mock-data');

// ----------------------------------------------------------------------
// POST /api/columns - Criar nova coluna
// ----------------------------------------------------------------------
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

            if (!hasAccessToBoard(userId, board_id)) {
                return res.status(403).json({ message: 'Sem permissão para adicionar colunas neste quadro.' });
            }

            const newColumn = createColumn({ name, board_id });

            res.status(201).json({
                message: 'Coluna criada com sucesso.',
                column: newColumn
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
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.id;
        const columnId = parseInt(id);

        const column = getColumnById(columnId);
        if (!column) {
            return res.status(404).json({ message: 'Coluna não encontrada.' });
        }

        if (!hasAccessToBoard(userId, column.board_id)) {
            return res.status(403).json({ message: 'Sem permissão para editar esta coluna.' });
        }

        updateColumn(columnId, { name });
        res.status(200).json({ message: 'Coluna atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar coluna:', error);
        res.status(500).json({ message: 'Erro ao atualizar coluna.' });
    }
});

// ----------------------------------------------------------------------
// DELETE /api/columns/:id - Deletar coluna
// ----------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const columnId = parseInt(id);

        const column = getColumnById(columnId);
        if (!column) {
            return res.status(404).json({ message: 'Coluna não encontrada.' });
        }

        if (!hasAccessToBoard(userId, column.board_id)) {
            return res.status(403).json({ message: 'Sem permissão para deletar esta coluna.' });
        }

        deleteColumn(columnId);
        res.status(200).json({ message: 'Coluna deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar coluna:', error);
        res.status(500).json({ message: 'Erro ao deletar coluna.' });
    }
});

module.exports = router;