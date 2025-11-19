import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// import HomePage from './pages/home';
// import LoginPage from './pages/login';
// import CadastroPage from './pages/register';

function App() {

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Organizer</title>
      </head>
      <body>
        <header className='Header'>
          <BrowserRouter>
            <nav className='navegador'>
              <ul>
                <ul>
                  <Link to="/home">Home</Link>
                </ul>
                <ul>
                  <Link to="/login">Login</Link>
                </ul>
                <ul>
                  <Link to="/cadastro">Cadastro</Link>
                </ul>
              </ul>
            </nav>

            <Routes>
              {/* <Route path='/home' element={<HomePage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/cadastro' element={<CadastroPage />} /> */}
            </Routes>
          </BrowserRouter>
        </header>

        <main>
          <h1>Seja bem vindo ao Organizer</h1>
          <h3>Quadro para organização de projetos.</h3>
        </main>

        <footer>
          <p>Pedro Augusto, Gustavo Ritter, Natália Putti Martins</p>
        </footer>

        <img src="../src/assets/cards.png" alt="Organizer Cards icon" />
      </body>
    </html>
  )
}

export default App;