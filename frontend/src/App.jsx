import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Timeline from './pages/Timeline'
import Operatore from './pages/Emergenze/Operatore'
import Centrale from './pages/Emergenze/Centrale'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/timeline" element={<PrivateRoute><Timeline /></PrivateRoute>} />
        <Route path="/emergenze/operatore" element={<PrivateRoute><Operatore /></PrivateRoute>} />
        <Route path="/emergenze/centrale" element={<PrivateRoute><Centrale /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
