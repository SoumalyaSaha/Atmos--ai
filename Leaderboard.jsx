import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, Flame, Zap, Star, TrendingUp } from 'lucide-react'
import api from '../utils/api'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('weekly')

  useEffect(() => {
    fetchLeaderboard()
  }, [timeFilter])

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard')
      setLeaderboard(res.data.leaderboard || [])
    } catch (error) {
      setLeaderboard([
        { rank: 1, name: 'Sarah Chen', avatar: '👩‍🔬', ecoPoints: 12500, co2Saved: '245 kg', streak: 45, badges: ['Eco Warrior', 'Zero Waste', 'Green Commuter'] },
        { rank: 2, name: 'Marcus Johnson', avatar: '👨‍🌾', ecoPoints: 11200, co2Saved: '198 kg', streak: 32, badges: ['Tree Hugger', 'Solar Champion'] },
        { rank: 3, name: 'Aisha Patel', avatar: '👩‍💻', ecoPoints: 10800, co2Saved: '185 kg', streak: 28, badges: ['Eco Warrior'] },
        { rank: 4, name: "Liam O'Brien", avatar: '👨‍🔧', ecoPoints: 9500, co2Saved: '162 kg', streak: 21, badges: ['Green Commuter'] },
        { rank: 5, name: 'Yuki Tanaka', avatar: '👩‍🎨', ecoPoints: 8900, co2Saved: '145 kg', streak: 18, badges: ['Zero Waste'] },
        { rank: 6, name: 'You', avatar: '🌱', ecoPoints: 7200, co2Saved: '98 kg', streak: 12, badges: ['New Leaf'], isUser: true }
      ])
    } finally {
      setLoading(false)
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
    if (isUser) return 'bg-gradient-to-r from-atmos-900/40 to-ocean-900/40 border-atmos-500/30'
    if (rank === 1) return 'bg-gradient-to-r from-amber-900/20 to-transparent border-amber-500/20'
    if (rank === 2) return 'bg-gradient-to-r from-gray-800/30 to-transparent'
    if (rank === 3) return 'bg-gradient-to-r from-amber-900/10 to-transparent'
    return 'bg-gray-900/30'
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
        <p className="text-gray-400 mt-1">See who's leading the charge for a greener planet</p>
      </motion.div>

      {/* Time Filter */}
      <div className="flex justify-center gap-2">
        {['daily', 'weekly', 'monthly', 'all-time'].map(filter => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              timeFilter === filter
                ? 'bg-atmos-600 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {filter.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 py-8">
        {leaderboard.slice(0, 3).map((user, i) => {
          const heights = ['h-32', 'h-44', 'h-36']
          const positions = [2, 1, 3]
          const actualIndex = positions[i] - 1
          const podiumUser = leaderboard[actualIndex]

          return (
            <motion.div
              key={podiumUser.rank}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl mb-2">{podiumUser.avatar}</div>
              <div className={`w-20 ${heights[i]} rounded-t-2xl flex flex-col items-center justify-end pb-4 ${
                podiumUser.rank === 1 
                  ? 'bg-gradient-to-t from-amber-600/30 to-amber-500/10 border border-amber-500/30' 
                  : podiumUser.rank === 2
                  ? 'bg-gradient-to-t from-gray-600/30 to-gray-500/10 border border-gray-500/30'
                  : 'bg-gradient-to-t from-amber-800/30 to-amber-700/10 border border-amber-700/30'
              }`}>
                <span className="text-2xl font-bold text-white">#{podiumUser.rank}</span>
              </div>
              <p className="text-sm font-medium text-white mt-2">{podiumUser.name}</p>
              <p className="text-xs text-atmos-400">{podiumUser.ecoPoints.toLocaleString()} pts</p>
            </motion.div>
          )
        })}
      </div>

      {/* Full List */}
      <div className="space-y-2">
        {leaderboard.map((user, index) => (
          <motion.div
            key={user.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card p-4 flex items-center gap-4 ${getRankStyle(user.rank, user.isUser)} border`}
          >
            <div className="w-8 flex justify-center">
              {getRankIcon(user.rank)}
            </div>

            <div className="text-2xl">{user.avatar}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-medium truncate ${user.isUser ? 'text-atmos-400' : 'text-white'}`}>
                  {user.name} {user.isUser && '(You)'}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-gray-400">{user.streak} days</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-atmos-400" />
                  <span className="text-xs text-gray-400">{user.co2Saved}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-lg font-bold text-white">{user.ecoPoints.toLocaleString()}</span>
              </div>
              <div className="flex gap-1 mt-1 justify-end">
                {user.badges.slice(0, 2).map((badge, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
                    {badge}
                  </span>
                ))}
                {user.badges.length > 2 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
                    +{user.badges.length - 2}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
