import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Challenges from './pages/Challenges'
import Calculator from './pages/Calculator'
import Leaderboard from './pages/Leaderboard'
import Chatbot from './pages/Chatbot'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import api from './utils/api'

export const AppContext = createContext()

export const EMISSION_FACTORS = {
  transport: {
    walking: 0, cycling: 0, bus: 0.089, train: 0.041, metro: 0.035,
    car_petrol: 0.21, car_diesel: 0.17, car_cng: 0.16,
    bike_petrol: 0.10, auto_rickshaw: 0.12, flight: 0.255
  },
  homeEnergy: {
    electricity: 0.71, lpg: 2.98, naturalGas: 2.1, biogas: 0.05
  },
  diet: {
    vegan: 1.5, vegetarian: 2.0, eggetarian: 2.3,
    meat_occasional: 2.8, meat_regular: 3.3, meat_heavy: 4.5
  },
  shopping: {
    clothing: 0.015, electronics: 0.05, furniture: 0.03,
    groceries: 0.008, other: 0.02
  },
  waste: {
    landfill: 0.5, recycled: 0.05, composted: 0.02
  }
}

export const calculateCarbonFootprint = (manualData, healthData = null) => {
  const result = {
    mobility: 0.00, homeEnergy: 0.00, diet: 0.00,
    shopping: 0.00, waste: 0.00, total: 0.00,
    lastCalculated: new Date().toISOString()
  }

  if (!manualData && !healthData) return result
  if (manualData?.transport) {
    const { primaryMode, kmPerDay, vehicleType } = manualData.transport
    const factor = EMISSION_FACTORS.transport[vehicleType || primaryMode] || 0
    result.mobility = parseFloat((kmPerDay * 30 * factor).toFixed(2))
  }

  if (manualData?.homeEnergy) {
    const { electricityKwh, gasUsage, gasType, householdSize } = manualData.homeEnergy
    const electricityEmission = (electricityKwh || 0) * EMISSION_FACTORS.homeEnergy.electricity
    const gasEmission = (gasUsage || 0) * (EMISSION_FACTORS.homeEnergy[gasType] || EMISSION_FACTORS.homeEnergy.lpg)
    result.homeEnergy = parseFloat(((electricityEmission + gasEmission) / (householdSize || 1)).toFixed(2))
  }
  if (manualData?.diet) {
    const { dietType } = manualData.diet
    const dailyFactor = EMISSION_FACTORS.diet[dietType] || EMISSION_FACTORS.diet.vegetarian
    result.diet = parseFloat((dailyFactor * 30).toFixed(2))
  }

  if (manualData?.shopping) {
    const { monthlySpend, category } = manualData.shopping
    const factor = EMISSION_FACTORS.shopping[category] || EMISSION_FACTORS.shopping.other
    result.shopping = parseFloat((monthlySpend * factor).toFixed(2))
  }

  if (manualData?.waste) {
    const { bagsPerWeek, householdSize, disposalMethod } = manualData.waste
    const monthlyWasteKg = (bagsPerWeek || 0) * 5 * 4
    const factor = EMISSION_FACTORS.waste[disposalMethod] || EMISSION_FACTORS.waste.landfill
    result.waste = parseFloat(((monthlyWasteKg / (householdSize || 1)) * factor).toFixed(2))
  }
  result.total = parseFloat((
    result.mobility + result.homeEnergy + result.diet + 
    result.shopping + result.waste
  ).toFixed(2))

  return result
}

export const hasCompletedOnboarding = (user) => {
  return user?.onboardingComplete === true && 
         user?.carbonFootprint?.lastCalculated !== null &&
         user?.age !== null
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure userId is restored from localStorage if missing
        if (!parsed.userId) {
          const storedUserId = localStorage.getItem('userId')
          if (storedUserId) parsed.userId = storedUserId
        }
        if (parsed && !parsed.hasOwnProperty('onboardingComplete')) {
          parsed.onboardingComplete = false
          parsed.manualData = null
          parsed.carbonFootprint = {
            mobility: 0.00, homeEnergy: 0.00, diet: 0.00,
            shopping: 0.00, waste: 0.00, total: 0.00, lastCalculated: null
          }
        }
        if (parsed && !parsed.hasOwnProperty('age')) {
          parsed.age = null
          parsed.ageGroup = null
          parsed.onboardingComplete = false
        }
        return parsed
      } catch (e) {
        console.error('Failed to parse saved user:', e)
        return null
      }
    }
    return null
  })
  const [ecoPoints, setEcoPoints] = useState(() => {
    const saved = localStorage.getItem('ecoPoints')
    return saved ? parseInt(saved) : 0
  })

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  const [notifications, setNotifications] = useState([])

  // On app startup: validate session with backend if userId exists
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (userId && user) {
      api.get('/user/profile')
        .then(res => {
          if (res.data?.success) {
            const fresh = res.data.profile
            setUser(prev => ({ ...prev, ...fresh }))
            setEcoPoints(fresh.ecoPoints || 0)
            localStorage.setItem('user', JSON.stringify({ ...user, ...fresh }))
          }
        })
              .catch(err => console.error('Session refresh failed:', err))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('ecoPoints', ecoPoints.toString())
  }, [ecoPoints])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [user])
  return (
    <AppContext.Provider value={{ 
      user, 
      setUser, 
      ecoPoints, 
      setEcoPoints, 
      notifications, 
      setNotifications,
      darkMode,
      setDarkMode,
      calculateCarbonFootprint,
      EMISSION_FACTORS
    }}>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              hasCompletedOnboarding(user) ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/onboarding" />
              )
            ) : (
              <Login />
            )
          } 
        />
                <Route 
          path="/onboarding" 
          element={
            user ? (
              hasCompletedOnboarding(user) ? (
                <Navigate to="/dashboard" />
              ) : (
                <Onboarding />
              )
            ) : (
              <Navigate to="/" />
            )
          } 
        />

        <Route element={user ? <Layout /> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route 
          path="*" 
          element={
            user ? (
              hasCompletedOnboarding(user) ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/onboarding" />
              )
            ) : (
              <Navigate to="/" />
            )
          } 
        />
      </Routes>
    </AppContext.Provider>
  )
}

export default App
