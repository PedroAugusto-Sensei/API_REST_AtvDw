import { useState } from "react";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aqui você pode adicionar a lógica de autenticação
        console.log("Email:", email);
        console.log("Password:", password);
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-container">
                    <div>
                        <label>Email:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@email.com"
                        />
                    </div>

                    <div>
                        <label>Senha:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha"
                        />
                    </div>

                    <button type="submit">Entrar</button>

                    <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                        Ainda não possui uma conta? <a href="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>Faça cadastro</a>
                    </p>
                </div>
            </form>
        </div>
    )
}

export default LoginPage;