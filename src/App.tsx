import { Route, Routes } from 'react-router-dom'
import Hub from './pages/Hub'
import GamePage from './pages/GamePage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/:game" element={<GamePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  )
}
