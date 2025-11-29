import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            // Login bem-sucedido
            console.log("Login realizado:", response.data);
            
            // Redireciona para a home
            navigate('/home');
        } catch (err) {
            console.error("Erro no login:", err);
            setError(err.response?.data?.message || "Erro ao fazer login. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-container">
                    {error && (
                        <div style={{ 
                            padding: '10px', 
                            backgroundColor: '#ffebee', 
                            color: '#c62828', 
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}>
                            {error}
                        </div>
                    )}

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
                            placeholder="Digite sua senha"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <p style={{ marginTop: '20px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                        Ainda não tem conta? <a href="/cadastro" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>Cadastre-se</a>
                    </p>

                    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '8px', fontSize: '13px' }}>
                        <strong>Usuários de teste:</strong><br />
                        pedro@email.com | senha123<br />
                        gustavo@email.com | senha123<br />
                        natalia@email.com | senha123
                    </div>
                </div>
            </form>
        </div>
    )
}

export default LoginPage;