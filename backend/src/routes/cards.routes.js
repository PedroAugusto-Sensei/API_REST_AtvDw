// backend/src/routes/cards.routes.js
const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const {
    getCardById,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    addCardParticipant,
    getColumnById,
    hasAccessToBoard
} = require('../data/mock-data');

// ----------------------------------------------------------------------
// POST /api/cards - Criar novo card
// ----------------------------------------------------------------------
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

            const column = getColumnById(column_id);
            if (!column) {
                return res.status(404).json({ message: 'Coluna não encontrada.' });
            }

            if (!hasAccessToBoard(userId, column.board_id)) {
                return res.status(403).json({ message: 'Sem permissão para adicionar cards nesta coluna.' });
            }

            const newCard = createCard({
                title,
                content: content || null,
                column_id
            });

            res.status(201).json({
                message: 'Card criado com sucesso.',
                card: newCard
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
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id;
        const cardId = parseInt(id);

        const card = getCardById(cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card não encontrado.' });
        }

        const column = getColumnById(card.column_id);
        if (!hasAccessToBoard(userId, column.board_id)) {
            return res.status(403).json({ message: 'Sem permissão para editar este card.' });
        }

        updateCard(cardId, { title, content: content || null });
        res.status(200).json({ message: 'Card atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar card:', error);
        res.status(500).json({ message: 'Erro ao atualizar card.' });
    }
});

// ----------------------------------------------------------------------
// PUT /api/cards/:id/move - Mover card para outra coluna
// ----------------------------------------------------------------------
router.put('/:id/move', async (req, res) => {
    try {
        const { id } = req.params;
        const { column_id } = req.body;
        const userId = req.user.id;
        const cardId = parseInt(id);

        const card = getCardById(cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card não encontrado.' });
        }

        const currentColumn = getColumnById(card.column_id);
        const targetColumn = getColumnById(column_id);

        if (!targetColumn) {
            return res.status(404).json({ message: 'Coluna de destino não encontrada.' });
        }

        // Verifica se ambas as colunas pertencem a boards que o usuário tem acesso
        if (!hasAccessToBoard(userId, currentColumn.board_id) || 
            !hasAccessToBoard(userId, targetColumn.board_id)) {
            return res.status(403).json({ message: 'Sem permissão para mover este card.' });
        }

        moveCard(cardId, column_id);
        res.status(200).json({ message: 'Card movido com sucesso.' });
    } catch (error) {
        console.error('Erro ao mover card:', error);
        res.status(500).json({ message: 'Erro ao mover card.' });
    }
});

// ----------------------------------------------------------------------
// DELETE /api/cards/:id - Deletar card
// ----------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const cardId = parseInt(id);

        const card = getCardById(cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card não encontrado.' });
        }

        const column = getColumnById(card.column_id);
        if (!hasAccessToBoard(userId, column.board_id)) {
            return res.status(403).json({ message: 'Sem permissão para deletar este card.' });
        }

        deleteCard(cardId);
        res.status(200).json({ message: 'Card deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar card:', error);
        res.status(500).json({ message: 'Erro ao deletar card.' });
    }
});

// ----------------------------------------------------------------------
// POST /api/cards/:id/participants - Adicionar participante ao card
// ----------------------------------------------------------------------
router.post('/:id/participants', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        const userId = req.user.id;
        const cardId = parseInt(id);

        const card = getCardById(cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card não encontrado.' });
        }

        const column = getColumnById(card.column_id);
        if (!hasAccessToBoard(userId, column.board_id)) {
            return res.status(403).json({ message: 'Sem permissão.' });
        }

        addCardParticipant(user_id, cardId);
        res.status(201).json({ message: 'Participante adicionado ao card.' });
    } catch (error) {
        console.error('Erro ao adicionar participante:', error);
        res.status(500).json({ message: 'Erro ao adicionar participante.' });
    }
});

module.exports = router;