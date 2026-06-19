import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Challenges from './pages/Challenges'
import Calculator from './pages/Calculator'
import Leaderboard from './pages/Leaderboard'
import Chatbot from './pages/Chatbot'
import Profile from './pages/Profile'
import Login from './pages/Login'
export const AppContext = createContext()

function App() {
  const [user, setUser] = useState(() => {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
})
  const [ecoPoints, setEcoPoints] = useState(7200)
  const [notifications, setNotifications] = useState([])

  return (
    
  <AppContext.Provider value={{ user, setUser, ecoPoints, setEcoPoints, notifications, setNotifications }}>
    <Routes>
      {/* Public route - Login */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      
      {/* Protected routes - only accessible when logged in */}
      <Route element={user ? <Layout /> : <Navigate to="/" />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </AppContext.Provider>
)
}

export default App
