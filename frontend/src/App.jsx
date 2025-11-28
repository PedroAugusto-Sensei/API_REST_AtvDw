import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import CadastroPage from './pages/register';

function App() {
  // Exemplo para o futuro
  // function PrivateRoute({ children }) {
  //   const isAuthenticated = localStorage.getItem('token'); // ou Context
  //   return isAuthenticated ? children : <Navigate to="/login" />;
  // }

  // // Uso:
  // <Route path='/home' element={
  //   <PrivateRoute>
  //     <HomePage />
  //   </PrivateRoute>
  // } />

  return (
    <BrowserRouter>
      <header className='Header'>
        <nav className='navegador'>
          <ul>
            <li>
              <Link to="/">Welcome</Link>
            </li>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/cadastro">Cadastro</Link>
            </li>
          </ul>
        </nav>
      </header>

      <Routes>
        <Route path='/' element={
          <main>
            <h1>Seja bem vindo ao Organizer</h1>
            <h3>Quadro para organização de projetos.</h3>
            <img src="../src/assets/cards.png" alt="Organizer Cards icon" />
          </main>
        } />
        <Route path='/home' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/cadastro' element={<CadastroPage />} />
      </Routes>

      <footer>
        <p>Pedro Augusto, Gustavo Ritter, Natália Putti Martins</p>
      </footer>
    </BrowserRouter>
  )
}

export default App;