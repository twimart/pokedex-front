import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import PokemonList from './pages/PokemonList'
import PokemonDetail from './pages/PokemonDetail'
import PokemonForm from './pages/PokemonForm'
import TypeList from './pages/TypeList'
import TypeForm from './pages/TypeForm'
import PrivateRoute from './auth/PrivateRoute'

const queryClient = new QueryClient()

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = window.localStorage.getItem('pokedex-theme')
    return savedTheme === 'dark' ? 'dark' : 'light'
  })
  const [, forceAuthRefresh] = useState(0)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('pokedex-theme', theme)
  }, [theme])

  useEffect(() => {
    const syncAuth = () => forceAuthRefresh(value => value + 1)
    syncAuth()
    const interval = window.setInterval(syncAuth, 500)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar theme={theme} onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} />
        <div className="container">
          <div className="page-shell">
            <Routes>
              <Route path="/" element={<Navigate to="/pokemons" />} />
              <Route path="/pokemons" element={<PokemonList />} />
              <Route path="/pokemons/new" element={<PrivateRoute><PokemonForm /></PrivateRoute>} />
              <Route path="/pokemons/:id" element={<PokemonDetail />} />
              <Route path="/pokemons/:id/edit" element={<PrivateRoute><PokemonForm /></PrivateRoute>} />
              <Route path="/types" element={<TypeList />} />
              <Route path="/types/new" element={<PrivateRoute><TypeForm /></PrivateRoute>} />
              <Route path="/types/:id/edit" element={<PrivateRoute><TypeForm /></PrivateRoute>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
