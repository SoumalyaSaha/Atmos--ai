import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, Flame, Zap, Star, Lock, AlertCircle, BarChart3, Globe, Users, User } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { AppContext } from '../App'
import api from '../utils/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Real India & World carbon footprint data (kg CO₂ per month)
const CARBON_BENCHMARKS = {
  india: {
    nationalAverage: 158, // ~1.9 tonnes/year
    byAgeGroup: {
      '13-17': 140,  // Teens typically lower
      '18-24': 180,  // Young adults starting independent life
      '25-34': 220,  // Working professionals
      '35-44': 260,  // Families with kids
      '45-54': 280,  // Peak consumption
      '55+': 240     // Slightly reduced
    }
  },
  world: {
    average: 400 // ~4.8 tonnes/year
  }
}

export default function Leaderboard() {
  const { user, ecoPoints } = useContext(AppContext)
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showComparison, setShowComparison] = useState(true) // Toggle between leaderboard and comparison

  // Guard: Redirect if not onboarded
  useEffect(() => {
    if (!user?.onboardingComplete) {
      navigate('/onboarding')
    }
  }, [user, navigate])

  useEffect(() => {
    if (user?.onboardingComplete) {
      fetchLeaderboard()
    }
  }, [user])

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await api.get('/leaderboard')
      if (res.data?.success) {
        setLeaderboard(res.data.leaderboard || [])
      } else {
        setLeaderboard([])
      }
    } catch (err) {
      console.error('Leaderboard error:', err)
      setError('Failed to load leaderboard. Showing your data only.')
      setLeaderboard([
        {
          rank: 1,
          name: user?.name || 'You',
          avatar: '🌱',
          ecoPoints: ecoPoints || 0,
          co2Saved: user?.carbonFootprint?.total ? `${user.carbonFootprint.total} kg` : '0 kg',
          streak: user?.streak || 0,
          badges: user?.badges || ['New Leaf'],
          isUser: true,
          carbonFootprint: user?.carbonFootprint
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Get user's age group from their profile
  const getUserAgeGroup = () => {
    return user?.ageGroup || '25-34'; // Fallback if somehow missing
  }

  // Build comparison chart data
  const buildComparisonData = () => {
    const userTotal = user?.carbonFootprint?.total || 0
    const ageGroup = getUserAgeGroup()
    const indiaAgeAvg = CARBON_BENCHMARKS.india.byAgeGroup[ageGroup] || 220
    const indiaNational = CARBON_BENCHMARKS.india.nationalAverage
    const worldAvg = CARBON_BENCHMARKS.world.average

    return {
      labels: ['Me', `My Age Group\n(${ageGroup})`, 'India Average', 'World Average'],
      datasets: [
        {
          label: 'Monthly Carbon Footprint (kg CO₂)',
          data: [userTotal, indiaAgeAvg, indiaNational, worldAvg],
          backgroundColor: [
            userTotal < indiaAgeAvg ? '#10b981' : '#ef4444', // Green if better, red if worse
            '#6b7280', // Gray
            '#9ca3af', // Light gray
            '#4b5563'  // Dark gray
          ],
          borderColor: [
            userTotal < indiaAgeAvg ? '#059669' : '#dc2626',
            '#4b5563',
            '#6b7280',
            '#374151'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `${context.raw} kg CO₂/month`
        }
      },
      title: {
        display: true,
        text: 'Carbon Footprint Comparison',
        color: '#fff',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#9ca3af',
          font: { size: 11 }
        }
      },
      y: {
        grid: { color: 'rgba(55, 65, 81, 0.3)' },
        ticks: { 
          color: '#6b7280',
          callback: (value) => `${value} kg`
        },
        title: {
          display: true,
          text: 'kg CO₂ per month',
          color: '#6b7280',
          font: { size: 12 }
        }
      }
    }
  }

  // Calculate comparison message
  const getComparisonMessage = () => {
    const userTotal = user?.carbonFootprint?.total || 0
    const ageGroup = getUserAgeGroup()
    const indiaAgeAvg = CARBON_BENCHMARKS.india.byAgeGroup[ageGroup] || 220
    const diff = userTotal - indiaAgeAvg
    
    if (diff <= 0) {
      return `Great job! Your carbon footprint is ${Math.abs(diff)} kg lower than the average for your age group in India.`
    } else {
      return `Your carbon footprint is ${diff} kg higher than the average for your age group in India. Try the challenges to reduce it!`
    }
  }

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="w-5 h-5 text-amber-400" />
      case 2: return <Medal className="w-5 h-5 text-gray-300" />
      case 3: return <Medal className="w-5 h-5 text-amber-600" />
      default: return <span className="text-sm text-gray-500 font-mono w-5 text-center">{rank}</span>
    }
  }

  const getRankStyle = (rank, isUser) => {
    if (isUser) return 'bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border-emerald-500/30'
    if (rank === 1) return 'bg-gradient-to-r from-amber-900/20 to-transparent border-amber-500/20'
    if (rank === 2) return 'bg-gradient-to-r from-gray-800/30 to-transparent'
    if (rank === 3) return 'bg-gradient-to-r from-amber-900/10 to-transparent'
    return 'bg-slate-900/30'
  }

  // Empty state if not onboarded
  if (!user?.onboardingComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Complete Setup First</h3>
        <p className="text-gray-400 max-w-sm mb-6">
          Calculate your carbon footprint to see how you compare with others
        </p>
        <button
          onClick={() => navigate('/calculator')}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
        >
          Go to Calculator
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/20 rounded-full border border-amber-800/30 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-semibold">Community Leaderboard</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Top Eco Warriors</h2>
        <p className="text-gray-400 mt-1">Compare your progress and compete with others</p>
      </motion.div>

      {/* Toggle Tabs */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setShowComparison(true)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            showComparison 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Compare
        </button>
        <button
          onClick={() => setShowComparison(false)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            !showComparison 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Rankings
        </button>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <p className="text-amber-300 text-sm">{error}</p>
        </motion.div>
      )}

      {/* COMPARISON VIEW */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Comparison Message */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
            <h3 className="text-lg font-bold text-white mb-2">How You Compare</h3>
            <p className={`text-sm leading-relaxed ${(user?.carbonFootprint?.total || 0) < (CARBON_BENCHMARKS.india.byAgeGroup[getUserAgeGroup()] || 220) ? 'text-emerald-400' : 'text-amber-400'}`}>
              {getComparisonMessage()}
            </p>
          </div>

          {/* Bar Chart */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="h-72">
              <Bar data={buildComparisonData()} options={chartOptions} />
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              Average daily carbon footprint for the last 30 days
            </p>
          </div>

          {/* Benchmark Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { 
                label: 'Me', 
                value: `${user?.carbonFootprint?.total || 0} kg`, 
                icon: User, 
                color: (user?.carbonFootprint?.total || 0) < (CARBON_BENCHMARKS.india.byAgeGroup[getUserAgeGroup()] || 220) ? 'text-emerald-400' : 'text-red-400',
                bg: (user?.carbonFootprint?.total || 0) < (CARBON_BENCHMARKS.india.byAgeGroup[getUserAgeGroup()] || 220) ? 'bg-emerald-500/20' : 'bg-red-500/20'
              },
              { 
                label: `My Age Group (${getUserAgeGroup()})`, 
                value: `${CARBON_BENCHMARKS.india.byAgeGroup[getUserAgeGroup()] || 220} kg`, 
                icon: Users, 
                color: 'text-gray-400',
                bg: 'bg-gray-700/50'
              },
              { 
                label: 'India Average', 
                value: `${CARBON_BENCHMARKS.india.nationalAverage} kg`, 
                icon: Users, 
                color: 'text-gray-400',
                bg: 'bg-gray-700/50'
              },
              { 
                label: 'World Average', 
                value: `${CARBON_BENCHMARKS.world.average} kg`, 
                icon: Globe, 
                color: 'text-gray-400',
                bg: 'bg-gray-700/50'
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className={`${item.bg} rounded-xl p-4 border border-slate-700 text-center`}>
                  <Icon className={`w-5 h-5 ${item.color} mx-auto mb-2`} />
                  <p className="text-lg font-bold text-white">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                </div>
              )
            })}
          </div>

          {/* Tips Based on Comparison */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Tips to Improve</h3>
            <div className="space-y-3">
              {(user?.carbonFootprint?.total || 0) > (CARBON_BENCHMARKS.india.byAgeGroup[getUserAgeGroup()] || 220) ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <span className="text-red-400 mt-0.5">⚠️</span>
                    <div>
                      <p className="text-sm text-white font-medium">Your transport is above average</p>
                      <p className="text-xs text-gray-400">Try switching to public transport or carpooling</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <span className="text-amber-400 mt-0.5">💡</span>
                    <div>
                      <p className="text-sm text-white font-medium">Reduce home energy usage</p>
                      <p className="text-xs text-gray-400">Switch to LED bulbs and unplug devices when not in use</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <span className="text-emerald-400 mt-0.5">✅</span>
                    <div>
                      <p className="text-sm text-white font-medium">You're doing great!</p>
                      <p className="text-xs text-gray-400">Keep up the good work and inspire others</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="text-blue-400 mt-0.5">🎯</span>
                    <div>
                      <p className="text-sm text-white font-medium">Challenge yourself further</p>
                      <p className="text-xs text-gray-400">Try to reach the India national average of 158 kg/month</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* RANKINGS VIEW */}
      {!showComparison && (
        <div className="space-y-4">
          {leaderboard.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center"
            >
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-white mb-2">You're #1!</h3>
              <p className="text-gray-400 mb-4">
                You're the first user on Atmos AI. Complete challenges to earn points and stay on top.
              </p>
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{ecoPoints.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Eco Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">{user?.streak || 0}</p>
                  <p className="text-xs text-gray-500">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{user?.carbonFootprint?.total || 0} kg</p>
                  <p className="text-xs text-gray-500">CO₂ Tracked</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/challenges')}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Start Earning Points
              </button>
            </motion.div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {leaderboard.length >= 3 && (
                <div className="flex items-end justify-center gap-4 py-8">
                  {[1, 0, 2].map((actualIndex, i) => {
                    const heights = ['h-36', 'h-44', 'h-32']
                    const podiumUser = leaderboard[actualIndex]
                    if (!podiumUser) return null

                    return (
                      <motion.div
                        key={podiumUser.rank || actualIndex}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex flex-col items-center"
                      >
                        <div className="text-4xl mb-2">{podiumUser.avatar || '🌱'}</div>
                        <div className={`w-20 ${heights[i]} rounded-t-2xl flex flex-col items-center justify-end pb-4 ${
                          actualIndex === 0
                            ? 'bg-gradient-to-t from-amber-600/30 to-amber-500/10 border border-amber-500/30' 
                            : actualIndex === 1
                            ? 'bg-gradient-to-t from-gray-600/30 to-gray-500/10 border border-gray-500/30'
                            : 'bg-gradient-to-t from-amber-800/30 to-amber-700/10 border border-amber-700/30'
                        }`}>
                          <span className="text-2xl font-bold text-white">#{actualIndex + 1}</span>
                        </div>
                        <p className="text-sm font-medium text-white mt-2">{podiumUser.name}</p>
                        <p className="text-xs text-emerald-400">{(podiumUser.ecoPoints || 0).toLocaleString()} pts</p>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Full List */}
              <div className="space-y-2">
                {leaderboard.map((lbUser, index) => (
                  <motion.div
                    key={lbUser.rank || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-slate-800 rounded-xl p-4 flex items-center gap-4 border ${getRankStyle(lbUser.rank, lbUser.isUser)}`}
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(lbUser.rank || index + 1)}
                    </div>

                    <div className="text-2xl">{lbUser.avatar || '🌱'}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${lbUser.isUser ? 'text-emerald-400' : 'text-white'}`}>
                          {lbUser.name} {lbUser.isUser && '(You)'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span className="text-xs text-gray-400">{lbUser.streak || 0} days</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs text-gray-400">{lbUser.co2Saved || '0 kg'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-lg font-bold text-white">{(lbUser.ecoPoints || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-1 mt-1 justify-end">
                        {(lbUser.badges || []).slice(0, 2).map((badge, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-gray-400">
                            {badge}
                          </span>
                        ))}
                        {(lbUser.badges || []).length > 2 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-gray-400">
                            +{(lbUser.badges || []).length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
