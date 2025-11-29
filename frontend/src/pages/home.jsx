import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import api from "../services/api";

function HomePage() {
    const [boards, setBoards] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");
    const [userName, setUserName] = useState("Usuário");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadUserData();
        loadBoards();
    }, []);

    const loadUserData = async () => {
        try {
            const response = await api.get('/auth/me');
            setUserName(response.data.username);
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            // Se não estiver autenticado, redireciona para login
            navigate('/login');
        }
    };

    const loadBoards = async () => {
        try {
            setLoading(true);
            const response = await api.get('/boards');
            setBoards(response.data);
        } catch (error) {
            console.error('Erro ao buscar boards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        
        if (!newBoardName.trim()) {
            alert("Por favor, digite um nome para o quadro!");
            return;
        }

        try {
            const response = await api.post('/boards', {
                name: newBoardName
            });

            // Adiciona o novo board à lista
            setBoards([...boards, response.data.board]);
            setNewBoardName("");
            setShowCreateModal(false);
            
            alert("Quadro criado com sucesso!");
        } catch (error) {
            console.error('Erro ao criar board:', error);
            alert(error.response?.data?.message || "Erro ao criar quadro.");
        }
    };

    const handleDeleteBoard = async (boardId) => {
        if (window.confirm("Tem certeza que deseja excluir este quadro?")) {
            try {
                await api.delete(`/boards/${boardId}`);
                setBoards(boards.filter(board => board.id !== boardId));
                alert("Quadro deletado com sucesso!");
            } catch (error) {
                console.error('Erro ao deletar board:', error);
                alert(error.response?.data?.message || "Erro ao deletar quadro.");
            }
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            navigate('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    if (loading) {
        return (
            <div className="home-container">
                <div className="home-header">
                    <h1>Carregando...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="home-header">
                <div>
                    <h1>Meus Quadros</h1>
                    <p className="welcome-text">Olá, {userName}! 👋</p>
                </div>
                <button 
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        background: '#ff4757',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Sair
                </button>
            </div>

            <div className="boards-grid">
                {boards.map(board => (
                    <div key={board.id} className="board-card">
                        <div className="board-card-content">
                            <h3>{board.name}</h3>
                            <div className="board-actions">
                                <button 
                                    className="btn-open"
                                    onClick={() => navigate(`/board/${board.id}`)}
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