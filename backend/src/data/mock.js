// src/data/mock-data.js
// Simulação de banco de dados em memória

// Usuários mockados
let users = [
    {
        id: 1,
        username: "Pedro Augusto",
        email: "pedro@email.com",
        password: "$2b$10$LiyqCoavh1L5Ezj9okWiUeEftZScf7KUYmG0dNk/Tdgp4BEkaQ12e" // senha123
    },
    {
        id: 2,
        username: "Gustavo Ritter",
        email: "gustavo@email.com",
        password: "$2b$10$LiyqCoavh1L5Ezj9okWiUeEftZScf7KUYmG0dNk/Tdgp4BEkaQ12e" // senha123
    },
    {
        id: 3,
        username: "Natália Putti",
        email: "natalia@email.com",
        password: "$2b$10$LiyqCoavh1L5Ezj9okWiUeEftZScf7KUYmG0dNk/Tdgp4BEkaQ12e" // senha123
    }
];

// Boards mockados
let boards = [
    { id: 1, name: "Projeto Organizer", creator_id: 1 },
    { id: 2, name: "Estudos", creator_id: 1 },
    { id: 3, name: "Trabalho", creator_id: 2 },
    { id: 4, name: "Pessoal", creator_id: 3 }
];

// Colunas mockadas
let columns = [
    { id: 1, name: "A fazer", board_id: 1 },
    { id: 2, name: "Em andamento", board_id: 1 },
    { id: 3, name: "Concluído", board_id: 1 },
    { id: 4, name: "Backlog", board_id: 2 },
    { id: 5, name: "Em progresso", board_id: 2 },
    { id: 6, name: "Tarefas", board_id: 3 },
    { id: 7, name: "Ideias", board_id: 4 }
];

// Cards mockados
let cards = [
    { id: 1, title: "Criar página de login", content: "Implementar autenticação", column_id: 1 },
    { id: 2, title: "Design do header", content: "Criar componente de navegação", column_id: 1 },
    { id: 3, title: "Integrar API", content: "Conectar frontend com backend", column_id: 2 },
    { id: 4, title: "Testes unitários", content: "Escrever testes para componentes", column_id: 2 },
    { id: 5, title: "Deploy", content: "Publicar aplicação", column_id: 3 },
    { id: 6, title: "Estudar React", content: "Revisar hooks e context", column_id: 4 },
    { id: 7, title: "Reunião cliente", content: "Apresentar protótipo", column_id: 6 }
];

// Participantes dos boards
let boardParticipants = [
    { user_id: 2, board_id: 1 }, // Gustavo participa do Projeto Organizer
    { user_id: 3, board_id: 1 }, // Natália participa do Projeto Organizer
    { user_id: 1, board_id: 3 }  // Pedro participa do Trabalho
];

// Participantes dos cards
let cardParticipants = [
    { user_id: 1, card_id: 1 },
    { user_id: 2, card_id: 1 },
    { user_id: 1, card_id: 3 }
];

// Contadores para IDs
let nextUserId = 4;
let nextBoardId = 5;
let nextColumnId = 8;
let nextCardId = 8;

// ============================================
// FUNÇÕES DE USUÁRIOS
// ============================================

const getUsers = () => users;

const getUserById = (id) => users.find(u => u.id === id);

const getUserByEmail = (email) => users.find(u => u.email === email);

const createUser = (userData) => {
    const newUser = {
        id: nextUserId++,
        ...userData
    };
    users.push(newUser);
    return newUser;
};

// ============================================
// FUNÇÕES DE BOARDS
// ============================================

const getBoardsByUserId = (userId) => {
    // Retorna boards onde o usuário é criador ou participante
    const userBoards = boards.filter(b => b.creator_id === userId);
    const participantBoards = boardParticipants
        .filter(bp => bp.user_id === userId)
        .map(bp => boards.find(b => b.id === bp.board_id))
        .filter(b => b !== undefined);
    
    return [...userBoards, ...participantBoards];
};

const getBoardById = (boardId) => boards.find(b => b.id === boardId);

const createBoard = (boardData) => {
    const newBoard = {
        id: nextBoardId++,
        ...boardData
    };
    boards.push(newBoard);
    return newBoard;
};

const updateBoard = (boardId, boardData) => {
    const index = boards.findIndex(b => b.id === boardId);
    if (index !== -1) {
        boards[index] = { ...boards[index], ...boardData };
        return boards[index];
    }
    return null;
};

const deleteBoard = (boardId) => {
    // Remove o board
    boards = boards.filter(b => b.id !== boardId);
    
    // Remove colunas associadas
    const boardColumns = columns.filter(c => c.board_id === boardId);
    boardColumns.forEach(col => deleteColumn(col.id));
    
    // Remove participantes do board
    boardParticipants = boardParticipants.filter(bp => bp.board_id !== boardId);
    
    return true;
};

const hasAccessToBoard = (userId, boardId) => {
    const board = getBoardById(boardId);
    if (!board) return false;
    
    // Verifica se é criador
    if (board.creator_id === userId) return true;
    
    // Verifica se é participante
    return boardParticipants.some(bp => bp.user_id === userId && bp.board_id === boardId);
};

const addBoardParticipant = (userId, boardId) => {
    // Verifica se já não é participante
    const exists = boardParticipants.some(bp => bp.user_id === userId && bp.board_id === boardId);
    if (!exists) {
        boardParticipants.push({ user_id: userId, board_id: boardId });
    }
    return true;
};

// ============================================
// FUNÇÕES DE COLUNAS
// ============================================

const getColumnsByBoardId = (boardId) => {
    return columns.filter(c => c.board_id === boardId);
};

const getColumnById = (columnId) => columns.find(c => c.id === columnId);

const createColumn = (columnData) => {
    const newColumn = {
        id: nextColumnId++,
        ...columnData
    };
    columns.push(newColumn);
    return newColumn;
};

const updateColumn = (columnId, columnData) => {
    const index = columns.findIndex(c => c.id === columnId);
    if (index !== -1) {
        columns[index] = { ...columns[index], ...columnData };
        return columns[index];
    }
    return null;
};

const deleteColumn = (columnId) => {
    // Remove a coluna
    columns = columns.filter(c => c.id !== columnId);
    
    // Remove cards associados
    const columnCards = cards.filter(card => card.column_id === columnId);
    columnCards.forEach(card => deleteCard(card.id));
    
    return true;
};

// ============================================
// FUNÇÕES DE CARDS
// ============================================

const getCardsByColumnId = (columnId) => {
    return cards.filter(c => c.column_id === columnId);
};

const getCardById = (cardId) => cards.find(c => c.id === cardId);

const createCard = (cardData) => {
    const newCard = {
        id: nextCardId++,
        ...cardData
    };
    cards.push(newCard);
    return newCard;
};

const updateCard = (cardId, cardData) => {
    const index = cards.findIndex(c => c.id === cardId);
    if (index !== -1) {
        cards[index] = { ...cards[index], ...cardData };
        return cards[index];
    }
    return null;
};

const deleteCard = (cardId) => {
    cards = cards.filter(c => c.id !== cardId);
    cardParticipants = cardParticipants.filter(cp => cp.card_id !== cardId);
    return true;
};

const moveCard = (cardId, newColumnId) => {
    return updateCard(cardId, { column_id: newColumnId });
};

const addCardParticipant = (userId, cardId) => {
    const exists = cardParticipants.some(cp => cp.user_id === userId && cp.card_id === cardId);
    if (!exists) {
        cardParticipants.push({ user_id: userId, card_id: cardId });
    }
    return true;
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Users
    getUsers,
    getUserById,
    getUserByEmail,
    createUser,
    
    // Boards
    getBoardsByUserId,
    getBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    hasAccessToBoard,
    addBoardParticipant,
    
    // Columns
    getColumnsByBoardId,
    getColumnById,
    createColumn,
    updateColumn,
    deleteColumn,
    
    // Cards
    getCardsByColumnId,
    getCardById,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    addCardParticipant
};

