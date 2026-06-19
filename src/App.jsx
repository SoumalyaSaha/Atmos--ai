import { Routes, Route } from 'react-router-dom'
import { useState, createContext } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Challenges from './pages/Challenges'
import Calculator from './pages/Calculator'
import Leaderboard from './pages/Leaderboard'
import Chatbot from './pages/Chatbot'
import Profile from './pages/Profile'

export const AppContext = createContext()

function App() {
  const [user, setUser] = useState(null)
  const [ecoPoints, setEcoPoints] = useState(7200)
  const [notifications, setNotifications] = useState([])

  return (
    <AppContext.Provider value={{ user, setUser, ecoPoints, setEcoPoints, notifications, setNotifications }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </AppContext.Provider>
  )
}

export default App
