import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { 
  Leaf, 
  Footprints, 
  Flame, 
  Droplets, 
  TrendingDown, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Bike,
  Bus,
  Car
} from 'lucide-react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { AppContext } from '../App'
import api from '../utils/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const statsCards = [
  { 
    title: 'CO₂ Emissions', 
    value: '12.4 kg', 
    change: '-8%', 
    trend: 'down',
    icon: Flame, 
    color: 'from-red-500/20 to-orange-500/20',
    iconColor: 'text-orange-400'
  },
  { 
    title: 'Steps Today', 
    value: '8,432', 
    change: '+12%', 
    trend: 'up',
    icon: Footprints, 
    color: 'from-atmos-500/20 to-emerald-500/20',
    iconColor: 'text-atmos-400'
  },
  { 
    title: 'Eco Score', 
    value: '78/100', 
    change: '+5', 
    trend: 'up',
    icon: Leaf, 
    color: 'from-ocean-500/20 to-blue-500/20',
    iconColor: 'text-ocean-400'
  },
  { 
    title: 'Water Saved', 
    value: '45 L', 
    change: '+3%', 
    trend: 'up',
    icon: Droplets, 
    color: 'from-cyan-500/20 to-sky-500/20',
    iconColor: 'text-cyan-400'
  },
]

export default function Dashboard() {
  const { ecoPoints } = useContext(AppContext)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [healthData, setHealthData] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch mock health data
      const healthRes = await api.get('/health/mock-data')
      setHealthData(healthRes.data.data)

      // Fetch AI insights
      const insightsRes = await api.post('/ai/insights', {
        userData: {
          weeklySteps: [8432, 10245, 6789, 11200, 9500, 12000, 8900],
          transportModes: { walking: 12.5, cycling: 8.3, public: 25, car: 15.2 },
          weeklyEmissions: [14.2, 13.8, 15.1, 12.9, 13.5, 11.8, 12.4]
        }
      })
      setInsights(insightsRes.data.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const lineChartData = {
    labels: healthData?.dates || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Steps',
        data: healthData?.steps || [8432, 10245, 6789, 11200, 9500, 12000, 8900],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#064e3b',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Goal',
        data: [10000, 10000, 10000, 10000, 10000, 10000, 10000],
        borderColor: '#374151',
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
      }
    ]
  }

  const lineChartOptions = {
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
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(55, 65, 81, 0.3)' },
        ticks: { color: '#6b7280' }
      },
      y: {
        grid: { color: 'rgba(55, 65, 81, 0.3)' },
        ticks: { color: '#6b7280' }
      }
    }
  }

  const doughnutData = {
    labels: ['Walking', 'Cycling', 'Public Transport', 'Car'],
    datasets: [{
      data: [12.5, 8.3, 25, 15.2],
      backgroundColor: [
        '#10b981',
        '#0ea5e9',
        '#f59e0b',
        '#ef4444'
      ],
      borderColor: '#111827',
      borderWidth: 3,
    }]
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          padding: 20,
          usePointStyle: true,
        }
      }
    },
    cutout: '70%'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-atmos-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Good Evening, Eco Warrior!</h2>
          <p className="text-gray-400 mt-1">Here's your sustainability snapshot for today</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-atmos-900/30 rounded-full border border-atmos-800/30">
          <Activity className="w-4 h-4 text-atmos-400" />
          <span className="text-sm text-atmos-400 font-medium">Streak: 12 days</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              {...fadeIn}
              transition={{ ...fadeIn.transition, delay: index * 0.1 }}
              className="glass-card p-5 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-atmos-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Steps Chart */}
        <motion.div
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.4 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
              <p className="text-sm text-gray-500">Steps walked this week</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-atmos-500" />
              <span className="text-xs text-gray-400">Steps</span>
              <span className="w-3 h-3 rounded-full bg-gray-700 ml-2" />
              <span className="text-xs text-gray-400">Goal</span>
            </div>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </motion.div>

        {/* Transport Breakdown */}
        <motion.div
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Transport Mode</h3>
          <p className="text-sm text-gray-500 mb-6">Distance breakdown (km)</p>
          <div className="h-48">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="mt-4 space-y-2">
            {[
              { icon: Footprints, label: 'Walking', value: '12.5 km', color: 'text-atmos-400' },
              { icon: Bike, label: 'Cycling', value: '8.3 km', color: 'text-ocean-400' },
              { icon: Bus, label: 'Public', value: '25.0 km', color: 'text-amber-400' },
              { icon: Car, label: 'Car', value: '15.2 km', color: 'text-red-400' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-gray-400">{item.label}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      {insights && (
        <motion.div
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-atmos-500 to-ocean-500 flex items-center justify-center">
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
              <div key={i} className="flex items-start gap-2 p-3 bg-gray-800/40 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-atmos-400 mt-2" />
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
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    action.difficulty === 'Easy' ? 'bg-atmos-900/50 text-atmos-400' :
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
                  <p className="text-sm font-semibold text-atmos-400">{action.co2Saved}</p>
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
        transition={{ ...fadeIn.transition, delay: 0.7 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Award, label: 'Daily Challenge', desc: 'Log 10,000 steps', points: '+50 pts' },
          { icon: TrendingDown, label: 'Reduce Emissions', desc: 'Take public transit', points: '+30 pts' },
          { icon: Droplets, label: 'Save Water', desc: '5-min shower today', points: '+20 pts' },
          { icon: Leaf, label: 'Plant Tree', desc: 'Offset 10kg CO₂', points: '+100 pts' },
        ].map((action, i) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="glass-card p-4 text-left card-hover"
            >
              <Icon className="w-6 h-6 text-atmos-400 mb-3" />
              <p className="text-sm font-medium text-white">{action.label}</p>
              <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
              <p className="text-xs text-atmos-400 mt-2 font-medium">{action.points}</p>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
