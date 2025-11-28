import { useState, useEffect } from "react";
import "./home.css";

function HomePage() {
    const [boards, setBoards] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");
    const [userName, setUserName] = useState("Usuário"); // Isso virá da autenticação

    // Simulação de dados - substituir por chamada real à API
    useEffect(() => {
        // Aqui você faria: const response = await axios.get("http://localhost:3000/api/boards")
        // Por enquanto, dados de exemplo:
        const mockBoards = [
            { id: 1, name: "Meu Projeto", creator_id: 1 },
            { id: 2, name: "Tarefas Pessoais", creator_id: 1 },
            { id: 3, name: "Estudos", creator_id: 1 }
        ];
        setBoards(mockBoards);
    }, []);

    const handleCreateBoard = (e) => {
        e.preventDefault();
        
        if (!newBoardName.trim()) {
            alert("Por favor, digite um nome para o quadro!");
            return;
        }

        // Aqui você faria a chamada à API para criar o quadro
        // const response = await axios.post("http://localhost:3000/api/boards", { name: newBoardName })
        
        const newBoard = {
            id: boards.length + 1,
            name: newBoardName,
            creator_id: 1
        };

        setBoards([...boards, newBoard]);
        setNewBoardName("");
        setShowCreateModal(false);
    };

    const handleDeleteBoard = (boardId) => {
        if (window.confirm("Tem certeza que deseja excluir este quadro?")) {
            // Aqui você faria: await axios.delete(`http://localhost:3000/api/boards/${boardId}`)
            setBoards(boards.filter(board => board.id !== boardId));
        }
    };

    return (
        <div className="home-container">
            <div className="home-header">
                <h1>Meus Quadros</h1>
                <p className="welcome-text">Olá, {userName}! 👋</p>
            </div>

            <div className="boards-grid">
                {boards.map(board => (
                    <div key={board.id} className="board-card">
                        <div className="board-card-content">
                            <h3>{board.name}</h3>
                            <div className="board-actions">
                                <button 
                                    className="btn-open"
                                    onClick={() => window.location.href = `/board/${board.id}`}
                                >
                                    Abrir
                                </button>
                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDeleteBoard(board.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="board-card board-card-create" onClick={() => setShowCreateModal(true)}>
                    <div className="create-board-content">
                        <span className="plus-icon">+</span>
                        <p>Criar novo quadro</p>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Criar Novo Quadro</h2>
                        <form onSubmit={handleCreateBoard}>
                            <input
                                type="text"
                                placeholder="Nome do quadro"
                                value={newBoardName}
                                onChange={(e) => setNewBoardName(e.target.value)}
                                autoFocus
                            />
                            <div className="modal-buttons">
                                <button type="submit" className="btn-confirm">Criar</button>
                                <button 
                                    type="button" 
                                    className="btn-cancel"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;