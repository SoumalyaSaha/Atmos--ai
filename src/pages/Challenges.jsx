import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Clock, Users, Leaf, ChevronRight, Star, Filter, AlertCircle, Lock, CheckCircle, Flame, Target, Calendar, TrendingUp } from 'lucide-react'
import { AppContext } from '../App'
import api from '../utils/api'

const categories = ['All', 'Transport', 'Energy', 'Food', 'Waste', 'Water', 'Shopping']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']

export default function Challenges() {
  const { user, setUser, ecoPoints, setEcoPoints } = useContext(AppContext)
  const navigate = useNavigate()
  const [challenges, setChallenges] = useState([])
  const [activeChallenges, setActiveChallenges] = useState([])
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeDifficulty, setActiveDifficulty] = useState('All')
  const [error, setError] = useState(null)
  const [checkInLoading, setCheckInLoading] = useState({})
  const [startLoading, setStartLoading] = useState({})
  const [activeTab, setActiveTab] = useState('available') // 'available' | 'active' | 'completed'

  useEffect(() => {
    if (!user?.onboardingComplete) {
      navigate('/onboarding')
    }
  }, [user, navigate])

  useEffect(() => {
    if (user?.onboardingComplete) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchChallenges(),
        fetchActiveChallenges(),
        fetchCompletedChallenges()
      ])
    } catch (err) {
      console.error('Error fetching challenge data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/challenges')
      if (res.data?.success) {
        setChallenges(res.data.challenges || [])
      }
    } catch (error) {
      console.error('Error fetching challenges:', error)
      setChallenges([
        { id: 'zero_plastic', title: 'Zero Plastic Week', description: 'Avoid all single-use plastics for 7 days', category: 'Waste', difficulty: 'Medium', duration: '7 days', ecoPoints: 500, co2Reduction: '2.5', participants: 1247, icon: '🥤' },
        { id: 'green_commuter', title: 'Green Commuter', description: 'Use only public transport for 14 days', category: 'Transport', difficulty: 'Hard', duration: '14 days', ecoPoints: 800, co2Reduction: '8.2', participants: 892, icon: '🚲' },
        { id: 'meatless_mondays', title: 'Meatless Mondays', description: 'Go vegetarian every Monday', category: 'Food', difficulty: 'Easy', duration: '30 days', ecoPoints: 300, co2Reduction: '4.1', participants: 2156, icon: '🥗' },
        { id: 'energy_saver', title: 'Energy Saver', description: 'Reduce home energy by 20%', category: 'Energy', difficulty: 'Medium', duration: '21 days', ecoPoints: 600, co2Reduction: '12.5', participants: 678, icon: '⚡' },
        { id: 'water_warrior', title: 'Water Warrior', description: 'Limit showers to 5 minutes', category: 'Water', difficulty: 'Easy', duration: '14 days', ecoPoints: 250, co2Reduction: '1.8', participants: 1834, icon: '💧' },
        { id: 'sustainable_shopper', title: 'Sustainable Shopper', description: 'Buy only second-hand', category: 'Shopping', difficulty: 'Hard', duration: '30 days', ecoPoints: 1000, co2Reduction: '15.3', participants: 445, icon: '🛍️' }
      ])
    }
  }

  const fetchActiveChallenges = async () => {
    try {
      const res = await api.get('/challenges/active')
      if (res.data?.success) {
        setActiveChallenges(res.data.activeChallenges || [])
      }
    } catch (err) {
      console.error('Error fetching active challenges:', err)
    }
  }

  const fetchCompletedChallenges = async () => {
    try {
      const res = await api.get('/challenges/completed')
      if (res.data?.success) {
        setCompletedChallenges(res.data.challengesCompleted || [])
      }
    } catch (err) {
      console.error('Error fetching completed challenges:', err)
    }
  }

  const startChallenge = async (challenge) => {
    setStartLoading(prev => ({ ...prev, [challenge.id]: true }))
    try {
      const res = await api.post('/challenges/start', {
        challengeId: challenge.id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        difficulty: challenge.difficulty,
        duration: challenge.duration,
        ecoPoints: challenge.ecoPoints,
        co2Reduction: challenge.co2Reduction,
        icon: challenge.icon
      })
      if (res.data?.success) {
        setActiveChallenges(prev => [...prev, res.data.activeChallenge])
        setActiveTab('active')
      }
    } catch (err) {
      console.error('Error starting challenge:', err)
      setError(err.response?.data?.message || 'Failed to start challenge')
    } finally {
      setStartLoading(prev => ({ ...prev, [challenge.id]: false }))
    }
  }

  const checkIn = async (challengeId) => {
    setCheckInLoading(prev => ({ ...prev, [challengeId]: true }))
    try {
      const res = await api.post('/challenges/checkin', { challengeId })
      if (res.data?.success) {
        if (res.data.isComplete) {
          // Challenge completed!
          setActiveChallenges(prev => prev.filter(c => c.id !== challengeId))
          setCompletedChallenges(prev => [...prev, res.data.completedChallenge])
          setEcoPoints(res.data.ecoPoints)
          setUser(prev => ({
            ...prev,
            totalEcoPoints: res.data.ecoPoints,
            totalCo2Saved: res.data.co2Saved,
            challengesCompleted: [...(prev?.challengesCompleted || []), res.data.completedChallenge]
          }))
          setActiveTab('completed')
        } else {
          fetchActiveChallenges()
        }
      }
    } catch (err) {
      console.error('Check-in error:', err)
      setError(err.response?.data?.message || 'Check-in failed')
    } finally {
      setCheckInLoading(prev => ({ ...prev, [challengeId]: false }))
    }
  }

  const isChallengeActive = (challengeId) => activeChallenges.some(c => c.id === challengeId)
  const isChallengeCompleted = (challengeId) => completedChallenges.some(c => c.id === challengeId)

  const getChallengeProgress = (challengeId) => {
    const active = activeChallenges.find(c => c.id === challengeId)
    if (!active) return null
    return {
      daysDone: active.daysCompleted?.length || 0,
      totalDays: active.totalDays || 7,
      percentage: active.progress || Math.round(((active.daysCompleted?.length || 0) / (active.totalDays || 7)) * 100),
      canCheckIn: !active.daysCompleted?.includes(new Date().toISOString().split('T')[0])
    }
  }

  const filteredChallenges = challenges.filter(c => {
    const catMatch = activeCategory === 'All' || c.category === activeCategory
    const diffMatch = activeDifficulty === 'All' || c.difficulty === activeDifficulty
    const notActive = !isChallengeActive(c.id)
    const notCompleted = !isChallengeCompleted(c.id)
    return catMatch && diffMatch && notActive && notCompleted
  })

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Easy': return 'bg-emerald-900/50 text-emerald-400 border-emerald-800/50'
      case 'Medium': return 'bg-amber-900/50 text-amber-400 border-amber-800/50'
      case 'Hard': return 'bg-red-900/50 text-red-400 border-red-800/50'
      default: return 'bg-gray-800 text-gray-400'
    }
  }

  const getCategoryColor = (cat) => {
    const colors = {
      'Transport': 'text-blue-400',
      'Energy': 'text-amber-400',
      'Food': 'text-green-400',
      'Waste': 'text-purple-400',
      'Water': 'text-cyan-400',
      'Shopping': 'text-pink-400'
    }
    return colors[cat] || 'text-gray-400'
  }

  const renderProgressBar = (progress, color = 'bg-emerald-500') => (
    <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
      <div 
        className={`${color} h-2.5 rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(100, progress)}%` }}
      />
    </div>
  )

  if (!user?.onboardingComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Complete Setup First</h3>
        <p className="text-gray-400 max-w-sm mb-6">Calculate your carbon footprint to unlock challenges and earn eco points</p>
        <button onClick={() => navigate('/calculator')} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all">
          Go to Calculator
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white">Sustainability Challenges</h2>
        <p className="text-gray-400 mt-1">Join challenges, track daily progress, earn eco points</p>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <p className="text-amber-300 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Stats Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="text-sm text-gray-400">Your Eco Points</p>
            <p className="text-2xl font-bold text-white">{ecoPoints.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-sm text-gray-400">Active</p>
            <p className="text-xl font-bold text-amber-400">{activeChallenges.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Completed</p>
            <p className="text-xl font-bold text-emerald-400">{completedChallenges.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'available', label: 'Available', count: filteredChallenges.length },
          { id: 'active', label: 'In Progress', count: activeChallenges.length },
          { id: 'completed', label: 'Completed', count: completedChallenges.length }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}>
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-emerald-700' : 'bg-slate-700'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* AVAILABLE CHALLENGES */}
      <AnimatePresence mode="wait">
        {activeTab === 'available' && (
          <motion.div key="available" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-800/60 text-gray-400 hover:bg-slate-800'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(diff => (
                <button key={diff} onClick={() => setActiveDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeDifficulty === diff ? 'bg-blue-600 text-white' : 'bg-slate-800/60 text-gray-400 hover:bg-slate-800'
                  }`}>
                  {diff}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredChallenges.map((challenge, index) => (
                <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{challenge.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white">{challenge.title}</h3>
                        <span className={`text-xs font-medium ${getCategoryColor(challenge.category)}`}>{challenge.category}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">{challenge.description}</p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-slate-900/50 rounded-xl">
                      <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">{challenge.duration}</p>
                    </div>
                    <div className="text-center p-2 bg-slate-900/50 rounded-xl">
                      <Users className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">{challenge.participants?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-slate-900/50 rounded-xl">
                      <Leaf className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs text-emerald-400">{challenge.co2Reduction} kg</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">{challenge.ecoPoints} pts</span>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => startChallenge(challenge)}
                      disabled={startLoading[challenge.id]}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-50">
                      {startLoading[challenge.id] ? 'Starting...' : 'Start Challenge'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ACTIVE CHALLENGES */}
        {activeTab === 'active' && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {activeChallenges.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No active challenges. Start one from the Available tab!</p>
              </div>
            ) : (
              activeChallenges.map((challenge) => {
                const progress = getChallengeProgress(challenge.id)
                const daysRemaining = (challenge.totalDays || 7) - (challenge.daysCompleted?.length || 0)
                const today = new Date().toISOString().split('T')[0]
                const alreadyCheckedIn = challenge.daysCompleted?.includes(today)

                return (
                  <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 rounded-xl p-5 border border-emerald-800/30">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{challenge.icon}</span>
                        <div>
                          <h3 className="font-semibold text-white">{challenge.title}</h3>
                          <span className={`text-xs font-medium ${getCategoryColor(challenge.category)}`}>{challenge.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-emerald-400 font-medium">Day {challenge.daysCompleted?.length || 0} of {challenge.totalDays || 7}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm font-bold text-emerald-400">{progress?.percentage || 0}%</span>
                      </div>
                      {renderProgressBar(progress?.percentage || 0, 'bg-gradient-to-r from-emerald-500 to-cyan-500')}
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{challenge.daysCompleted?.length || 0} days done</span>
                        <span className="text-xs text-gray-500">{daysRemaining} days left</span>
                      </div>
                    </div>

                    {/* Day indicators */}
                    <div className="flex gap-1.5 mb-4">
                      {Array.from({ length: challenge.totalDays || 7 }).map((_, i) => {
                        const dayDate = new Date(challenge.startedAt)
                        dayDate.setDate(dayDate.getDate() + i)
                        const dayStr = dayDate.toISOString().split('T')[0]
                        const isDone = challenge.daysCompleted?.includes(dayStr)
                        const isToday = dayStr === today
                        return (
                          <div key={i} className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                            isDone ? 'bg-emerald-600 text-white' : 
                            isToday ? 'bg-amber-600/50 text-amber-400 border border-amber-500' : 
                            'bg-slate-800 text-gray-600'
                          }`}>
                            {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                          </div>
                        )
                      })}
                    </div>

                    {/* Check-in Button */}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => checkIn(challenge.id)}
                      disabled={alreadyCheckedIn || checkInLoading[challenge.id]}
                      className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                        alreadyCheckedIn 
                          ? 'bg-slate-700 text-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg'
                      }`}>
                      {checkInLoading[challenge.id] ? 'Checking in...' : 
                       alreadyCheckedIn ? '✓ Checked in today' : 'Check In Today'}
                    </motion.button>

                    {!alreadyCheckedIn && (
                      <p className="text-xs text-amber-400 mt-2 text-center flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3" />
                        Don't break your streak! Check in daily.
                      </p>
                    )}
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}

        {/* COMPLETED CHALLENGES */}
        {activeTab === 'completed' && (
          <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {completedChallenges.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No completed challenges yet. Start one and stick with it!</p>
              </div>
            ) : (
              completedChallenges.map((challenge, index) => (
                <motion.div key={challenge.id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="bg-slate-800 rounded-xl p-5 border border-emerald-800/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-900/50 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{challenge.title}</h3>
                      <p className="text-xs text-gray-400">Completed on {new Date(challenge.completedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Leaf className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">{challenge.co2Reduction} kg</span>
                      </div>
                      <p className="text-xs text-gray-500">CO₂ saved</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
