import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function RegisterPage() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        // Validação básica
        if (password !== confirmPassword) {
            setError("As senhas não coincidem!");
            return;
        }
        
        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres!");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/register', {
                username: nome,
                email,
                password
            });

            console.log("Cadastro realizado:", response.data);
            alert("Cadastro realizado com sucesso! Faça login para continuar.");
            
            // Redireciona para o login
            navigate('/login');
        } catch (err) {
            console.error("Erro no cadastro:", err);
            
            // Exibe erros de validação do backend
            if (err.response?.data?.errors) {
                const errorMessages = err.response.data.errors.map(e => e.msg).join('\n');
                setError(errorMessages);
            } else {
                setError(err.response?.data?.message || "Erro ao realizar cadastro. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Cadastro</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-container">
                    {error && (
                        <div style={{ 
                            padding: '10px', 
                            backgroundColor: '#ffebee', 
                            color: '#c62828', 
                            borderRadius: '8px',
                            marginBottom: '15px',
                            whiteSpace: 'pre-line'
                        }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label>Nome completo:</label>
                        <input 
                            type="text" 
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Digite seu nome completo"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label>Email:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label>Senha:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label>Confirmar senha:</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Digite a senha novamente"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                    
                    <p style={{ marginTop: '20px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                        Já tem uma conta? <a href="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>Faça login</a>
                    </p>
                </div>
            </form>
        </div>
    )
}

export default RegisterPage;