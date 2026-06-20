import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Leaf, 
  Flame, 
  TrendingDown, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Car,
  Home,
  Utensils,
  ShoppingBag,
  Trash2,
  AlertCircle,
  Calculator
} from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { AppContext } from '../App'
import api from '../utils/api'

ChartJS.register(ArcElement, Title, Tooltip, Legend)

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export default function Dashboard() {
  const { user, setUser } = useContext(AppContext)
  const navigate = useNavigate()
  const [footprint, setFootprint] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Guard: Redirect if not onboarded
  useEffect(() => {
    if (!user?.onboardingComplete) {
      navigate('/onboarding')
    }
  }, [user, navigate])

  // Fetch real data
  useEffect(() => {
    if (user?.onboardingComplete) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch real carbon footprint
      const footprintRes = await api.get('/carbon/footprint')
      if (footprintRes.data?.success) {
        setFootprint(footprintRes.data.carbonFootprint)
      }

      // Fetch AI insights
      const insightsRes = await api.post('/ai/insights', {
        userData: {
          carbonFootprint: footprintRes.data?.carbonFootprint,
          weeklyEmissions: user?.carbonHistory?.slice(-7) || []
        }
      })
      if (insightsRes.data?.success) {
        setInsights(insightsRes.data.data)
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Build stats from real data
  const statsCards = footprint ? [
    { 
      title: 'Total CO₂', 
      value: `${footprint.total} kg`, 
      change: 'This month',
      trend: 'neutral',
      icon: Flame, 
      color: 'from-red-500/20 to-orange-500/20',
      iconColor: 'text-orange-400'
    },
    { 
      title: 'Transport', 
      value: `${footprint.mobility} kg`, 
      change: footprint.mobility > 50 ? 'High' : 'Low',
      trend: footprint.mobility > 50 ? 'up' : 'down',
      icon: Car, 
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400'
    },
    { 
      title: 'Home Energy', 
      value: `${footprint.homeEnergy} kg`, 
      change: 'Monthly',
      trend: 'neutral',
      icon: Home, 
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400'
    },
    { 
      title: 'Diet', 
      value: `${footprint.diet} kg`, 
      change: 'Monthly',
      trend: 'neutral',
      icon: Utensils, 
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-400'
    },
  ] : []

  // Real doughnut chart data
  const doughnutData = footprint ? {
    labels: ['Transport', 'Home Energy', 'Diet', 'Shopping', 'Waste'],
    datasets: [{
      data: [
        footprint.mobility,
        footprint.homeEnergy,
        footprint.diet,
        footprint.shopping,
        footprint.waste
      ],
      backgroundColor: [
        '#3b82f6', // blue
        '#f59e0b', // amber
        '#10b981', // green
        '#ec4899', // pink
        '#8b5cf6', // purple
      ],
      borderColor: '#111827',
      borderWidth: 3,
    }]
  } : null

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          padding: 15,
          usePointStyle: true,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} kg CO₂`
        }
      }
    },
    cutout: '65%'
  }

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Calculator className="w-10 h-10 text-slate-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No Data Yet</h3>
      <p className="text-gray-400 max-w-sm mb-6">
        Complete the calculator to see your real carbon footprint breakdown
      </p>
      <button
        onClick={() => navigate('/calculator')}
        className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
      >
        Go to Calculator
      </button>
    </motion.div>
  )

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

  // Not onboarded
  if (!user?.onboardingComplete) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Good Evening, {user?.name || 'Eco Warrior'}!
          </h2>
          <p className="text-gray-400 mt-1">
            {footprint?.total > 0 
              ? 'Your real carbon footprint is tracked below' 
              : 'Complete the calculator to start tracking'}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-900/30 rounded-full border border-emerald-800/30">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">
            Streak: {user?.streak || 0} days
          </span>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Stats Grid - Real Data */}
      {footprint?.total > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                {...fadeIn}
                transition={{ ...fadeIn.transition, delay: index * 0.1 }}
                className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === 'up' ? 'text-red-400' : stat.trend === 'down' ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : stat.trend === 'down' ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : null}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Charts + Breakdown */}
      {footprint?.total > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Carbon Breakdown Chart */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.3 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <h3 className="text-lg font-semibold text-white mb-1">Carbon Breakdown</h3>
            <p className="text-sm text-gray-500 mb-6">By sector (kg CO₂/month)</p>
            <div className="h-64">
              {doughnutData && <Doughnut data={doughnutData} options={doughnutOptions} />}
            </div>
          </motion.div>

          {/* Sector Details */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.4 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Sector Details</h3>
            <div className="space-y-4">
              {[
                { label: 'Transport', value: footprint.mobility, icon: Car, color: 'bg-blue-500', textColor: 'text-blue-400' },
                { label: 'Home Energy', value: footprint.homeEnergy, icon: Home, color: 'bg-amber-500', textColor: 'text-amber-400' },
                { label: 'Diet', value: footprint.diet, icon: Utensils, color: 'bg-green-500', textColor: 'text-green-400' },
                { label: 'Shopping', value: footprint.shopping, icon: ShoppingBag, color: 'bg-pink-500', textColor: 'text-pink-400' },
                { label: 'Waste', value: footprint.waste, icon: Trash2, color: 'bg-purple-500', textColor: 'text-purple-400' },
              ].map((item) => {
                const Icon = item.icon
                const percentage = footprint.total > 0 
                  ? ((item.value / footprint.total) * 100).toFixed(1) 
                  : 0
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.color} bg-opacity-20`}>
                      <Icon className={`w-4 h-4 ${item.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{item.label}</span>
                        <span className="text-sm font-medium text-white">{item.value} kg</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{percentage}%</span>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Monthly Footprint</span>
                <span className="text-2xl font-bold text-white">{footprint.total} <span className="text-sm text-gray-500">kg CO₂</span></span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Insights */}
      {insights && footprint?.total > 0 && (
        <motion.div
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.5 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Insights</h3>
              <p className="text-sm text-gray-500">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed mb-4">{insights.summary}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {insights.keyInsights?.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2" />
                <p className="text-sm text-gray-300">{insight}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Recommended Actions</h4>
            {insights.actionItems?.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    action.difficulty === 'Easy' ? 'bg-emerald-900/50 text-emerald-400' :
                    action.difficulty === 'Medium' ? 'bg-amber-900/50 text-amber-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {action.difficulty[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.impact}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400">{action.co2Saved}</p>
                  <p className="text-xs text-gray-600">CO₂ saved</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        {...fadeIn}
        transition={{ ...fadeIn.transition, delay: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Calculator, label: 'Update Data', desc: 'Recalculate footprint', action: () => navigate('/calculator') },
          { icon: TrendingDown, label: 'Reduce Emissions', desc: 'View savings tips', action: () => navigate('/challenges') },
          { icon: Award, label: 'Challenges', desc: 'Earn eco points', action: () => navigate('/challenges') },
          { icon: Leaf, label: 'AI Chat', desc: 'Ask Atmos Assistant', action: () => navigate('/chat') },
        ].map((action) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={action.action}
              className="bg-slate-800 rounded-xl p-4 text-left border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <Icon className="w-6 h-6 text-emerald-400 mb-3" />
              <p className="text-sm font-medium text-white">{action.label}</p>
              <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
              }
