import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./board.css";

function BoardPage() {
    const { id } = useParams();
    const [boardName, setBoardName] = useState("Meu Quadro");
    const [columns, setColumns] = useState([]);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");
    const [showAddCard, setShowAddCard] = useState({});
    const [newCardData, setNewCardData] = useState({ title: "", content: "" });
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    // Simulação de dados - substituir por chamada real à API
    useEffect(() => {
        // const response = await axios.get(`http://localhost:3000/api/boards/${id}`)
        // setBoardName(response.data.name)
        // const columnsData = await axios.get(`http://localhost:3000/api/boards/${id}/columns`)
        // setColumns(columnsData.data)
        
        // Dados mockados para exemplo
        const mockColumns = [
            {
                id: 1,
                name: "A fazer",
                board_id: id,
                cards: [
                    { id: 1, title: "Tarefa 1", content: "Descrição da tarefa 1", column_id: 1 },
                    { id: 2, title: "Tarefa 2", content: "Descrição da tarefa 2", column_id: 1 }
                ]
            },
            {
                id: 2,
                name: "Em andamento",
                board_id: id,
                cards: [
                    { id: 3, title: "Tarefa 3", content: "Descrição da tarefa 3", column_id: 2 }
                ]
            }
        ];
        setColumns(mockColumns);
    }, [id]);

    const handleAddColumn = (e) => {
        e.preventDefault();
        if (!newColumnName.trim()) return;

        // await axios.post(`http://localhost:3000/api/columns`, { name: newColumnName, board_id: id })
        const newColumn = {
            id: columns.length + 1,
            name: newColumnName,
            board_id: id,
            cards: []
        };

        setColumns([...columns, newColumn]);
        setNewColumnName("");
        setShowAddColumn(false);
    };

    const handleAddCard = (columnId) => {
        if (!newCardData.title.trim()) return;

        // await axios.post(`http://localhost:3000/api/cards`, { ...newCardData, column_id: columnId })
        const newCard = {
            id: Date.now(),
            title: newCardData.title,
            content: newCardData.content,
            column_id: columnId
        };

        setColumns(columns.map(col => {
            if (col.id === columnId) {
                return { ...col, cards: [...col.cards, newCard] };
            }
            return col;
        }));

        setNewCardData({ title: "", content: "" });
        setShowAddCard({ ...showAddCard, [columnId]: false });
    };

    const handleDeleteColumn = (columnId) => {
        if (window.confirm("Tem certeza que deseja excluir esta coluna e todos os seus cards?")) {
            // await axios.delete(`http://localhost:3000/api/columns/${columnId}`)
            setColumns(columns.filter(col => col.id !== columnId));
        }
    };

    const handleDeleteCard = (columnId, cardId) => {
        // await axios.delete(`http://localhost:3000/api/cards/${cardId}`)
        setColumns(columns.map(col => {
            if (col.id === columnId) {
                return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
            }
            return col;
        }));
    };

    const handleInvite = (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        // await axios.post(`http://localhost:3000/api/boards/${id}/participants`, { email: inviteEmail })
        alert(`Convite enviado para ${inviteEmail}!`);
        setInviteEmail("");
        setShowInviteModal(false);
    };

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
                    <button className="btn-back" onClick={() => window.location.href = '/home'}>
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
                                {column.cards.map(card => (
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