import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./board.css";
import api from "../services/api";

function BoardPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [boardName, setBoardName] = useState("");
    const [columns, setColumns] = useState([]);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");
    const [showAddCard, setShowAddCard] = useState({});
    const [newCardData, setNewCardData] = useState({ title: "", content: "" });
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBoard();
    }, [id]);

    const loadBoard = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/boards/${id}`);
            setBoardName(response.data.name);
            setColumns(response.data.columns || []);
        } catch (error) {
            console.error('Erro ao buscar board:', error);
            alert(error.response?.data?.message || "Erro ao carregar quadro.");
            navigate('/home');
        } finally {
            setLoading(false);
        }
    };

    const handleAddColumn = async (e) => {
        e.preventDefault();
        if (!newColumnName.trim()) return;

        try {
            const response = await api.post('/columns', {
                name: newColumnName,
                board_id: parseInt(id)
            });

            setColumns([...columns, { ...response.data.column, cards: [] }]);
            setNewColumnName("");
            setShowAddColumn(false);
        } catch (error) {
            console.error('Erro ao criar coluna:', error);
            alert(error.response?.data?.message || "Erro ao criar coluna.");
        }
    };

    const handleAddCard = async (columnId) => {
        if (!newCardData.title.trim()) return;

        try {
            const response = await api.post('/cards', {
                title: newCardData.title,
                content: newCardData.content,
                column_id: columnId
            });

            setColumns(columns.map(col => {
                if (col.id === columnId) {
                    return { ...col, cards: [...col.cards, response.data.card] };
                }
                return col;
            }));

            setNewCardData({ title: "", content: "" });
            setShowAddCard({ ...showAddCard, [columnId]: false });
        } catch (error) {
            console.error('Erro ao criar card:', error);
            alert(error.response?.data?.message || "Erro ao criar card.");
        }
    };

    const handleDeleteColumn = async (columnId) => {
        if (window.confirm("Tem certeza que deseja excluir esta coluna e todos os seus cards?")) {
            try {
                await api.delete(`/columns/${columnId}`);
                setColumns(columns.filter(col => col.id !== columnId));
            } catch (error) {
                console.error('Erro ao deletar coluna:', error);
                alert(error.response?.data?.message || "Erro ao deletar coluna.");
            }
        }
    };

    const handleDeleteCard = async (columnId, cardId) => {
        try {
            await api.delete(`/cards/${cardId}`);
            setColumns(columns.map(col => {
                if (col.id === columnId) {
                    return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
                }
                return col;
            }));
        } catch (error) {
            console.error('Erro ao deletar card:', error);
            alert(error.response?.data?.message || "Erro ao deletar card.");
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        try {
            await api.post(`/boards/${id}/participants`, {
                email: inviteEmail
            });
            
            alert(`Convite enviado para ${inviteEmail}!`);
            setInviteEmail("");
            setShowInviteModal(false);
        } catch (error) {
            console.error('Erro ao convidar:', error);
            alert(error.response?.data?.message || "Erro ao enviar convite.");
        }
    };

    if (loading) {
        return (
            <div className="board-page">
                <div className="board-header">
                    <h1>Carregando...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="board-page">
            <div className="board-header">
                <div className="board-info">
                    <h1 className="board-title">{boardName}</h1>
                </div>
                <div className="board-actions">
                    <button className="btn-invite" onClick={() => setShowInviteModal(true)}>
                        👥 Convidar pessoas
                    </button>
                    <button className="btn-back" onClick={() => navigate('/home')}>
                        ← Voltar
                    </button>
                </div>
            </div>

            <div className="board-content">
                <div className="columns-container">
                    {columns.map(column => (
                        <div key={column.id} className="column">
                            <div className="column-header">
                                <h3>{column.name}</h3>
                                <button 
                                    className="btn-delete-column"
                                    onClick={() => handleDeleteColumn(column.id)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="cards-list">
                                {column.cards && column.cards.map(card => (
                                    <div key={card.id} className="card">
                                        <div className="card-header">
                                            <h4>{card.title}</h4>
                                            <button 
                                                className="btn-delete-card"
                                                onClick={() => handleDeleteCard(column.id, card.id)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {card.content && <p>{card.content}</p>}
                                    </div>
                                ))}
                            </div>

                            {showAddCard[column.id] ? (
                                <div className="add-card-form">
                                    <input
                                        type="text"
                                        placeholder="Título do card"
                                        value={newCardData.title}
                                        onChange={(e) => setNewCardData({ ...newCardData, title: e.target.value })}
                                        autoFocus
                                    />
                                    <textarea
                                        placeholder="Descrição (opcional)"
                                        value={newCardData.content}
                                        onChange={(e) => setNewCardData({ ...newCardData, content: e.target.value })}
                                    />
                                    <div className="form-buttons">
                                        <button 
                                            className="btn-add"
                                            onClick={() => handleAddCard(column.id)}
                                        >
                                            Adicionar
                                        </button>
                                        <button 
                                            className="btn-cancel"
                                            onClick={() => {
                                                setShowAddCard({ ...showAddCard, [column.id]: false });
                                                setNewCardData({ title: "", content: "" });
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    className="btn-add-card"
                                    onClick={() => setShowAddCard({ ...showAddCard, [column.id]: true })}
                                >
                                    + Adicionar card
                                </button>
                            )}
                        </div>
                    ))}

                    {showAddColumn ? (
                        <div className="column add-column-form">
                            <input
                                type="text"
                                placeholder="Nome da coluna"
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                autoFocus
                            />
                            <div className="form-buttons">
                                <button className="btn-add" onClick={handleAddColumn}>
                                    Adicionar
                                </button>
                                <button 
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowAddColumn(false);
                                        setNewColumnName("");
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            className="btn-add-column"
                            onClick={() => setShowAddColumn(true)}
                        >
                            + Adicionar coluna
                        </button>
                    )}
                </div>
            </div>

            {showInviteModal && (
                <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Convidar pessoas</h2>
                        <form onSubmit={handleInvite}>
                            <input
                                type="email"
                                placeholder="Email da pessoa"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                            />
                            <div className="modal-buttons">
                                <button type="submit" className="btn-confirm">Enviar convite</button>
                                <button 
                                    type="button" 
                                    className="btn-cancel"
                                    onClick={() => setShowInviteModal(false)}
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

export default BoardPage;