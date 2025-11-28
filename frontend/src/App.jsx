import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import CadastroPage from './pages/register';
import BoardPage from './pages/board';

function App() {
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
        <Route path='/board/:id' element={<BoardPage />} />
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