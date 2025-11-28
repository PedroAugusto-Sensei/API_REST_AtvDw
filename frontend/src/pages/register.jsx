import { useState } from "react";

function RegisterPage() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validação básica
        if (password !== confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }
        
        if (password.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres!");
            return;
        }
        
        // Aqui você pode adicionar a lógica de cadastro
        console.log("Nome:", nome);
        console.log("Email:", email);
        console.log("Password:", password);
        
        alert("Cadastro realizado com sucesso!");
    };

    return (
        <div>
            <h2>Cadastro</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-container">
                    <div>
                        <label>Nome completo:</label>
                        <input 
                            type="text" 
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Digite seu nome completo"
                            required
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
                        />
                    </div>

                    <button type="submit">Cadastrar</button>
                    
                    <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                        Já tem uma conta? <a href="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>Faça login</a>
                    </p>
                </div>
            </form>
        </div>
    )
}

export default RegisterPage;