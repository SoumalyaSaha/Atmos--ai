import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Clock, Users, Leaf, ChevronRight, Star, Filter } from 'lucide-react'
import api from '../utils/api'

const categories = ['All', 'Transport', 'Energy', 'Food', 'Waste', 'Water', 'Shopping']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']

export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeDifficulty, setActiveDifficulty] = useState('All')
  const [joinedChallenges, setJoinedChallenges] = useState(new Set())

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/challenges')
      setChallenges(res.data.challenges || [])
    } catch (error) {
      console.error('Error fetching challenges:', error)
      // Fallback data
      setChallenges([
        {
          id: '1',
          title: 'Zero Plastic Week',
          description: 'Avoid all single-use plastics for 7 days. Use reusable bags, bottles, and containers.',
          category: 'Waste',
          difficulty: 'Medium',
          duration: '7 days',
          ecoPoints: 500,
          co2Reduction: '2.5 kg',
          participants: 1247,
          icon: '🥤'
        },
        {
          id: '2',
          title: 'Green Commuter',
          description: 'Use only public transport, cycling, or walking for 14 days.',
          category: 'Transport',
          difficulty: 'Hard',
          duration: '14 days',
          ecoPoints: 800,
          co2Reduction: '8.2 kg',
          participants: 892,
          icon: '🚲'
        },
        {
          id: '3',
          title: 'Meatless Mondays',
          description: 'Go vegetarian every Monday for a month.',
          category: 'Food',
          difficulty: 'Easy',
          duration: '30 days',
          ecoPoints: 300,
          co2Reduction: '4.1 kg',
          participants: 2156,
          icon: '🥗'
        },
        {
          id: '4',
          title: 'Energy Saver',
          description: 'Reduce home energy usage by 20% through smart habits.',
          category: 'Energy',
          difficulty: 'Medium',
          duration: '21 days',
          ecoPoints: 600,
          co2Reduction: '12.5 kg',
          participants: 678,
          icon: '⚡'
        },
        {
          id: '5',
          title: 'Water Warrior',
          description: 'Limit showers to 5 minutes and fix any leaks.',
          category: 'Water',
          difficulty: 'Easy',
          duration: '14 days',
          ecoPoints: 250,
          co2Reduction: '1.8 kg',
          participants: 1834,
          icon: '💧'
        },
        {
          id: '6',
          title: 'Sustainable Shopper',
          description: 'Buy only second-hand or sustainable brands for a month.',
          category: 'Shopping',
          difficulty: 'Hard',
          duration: '30 days',
          ecoPoints: 1000,
          co2Reduction: '15.3 kg',
          participants: 445,
          icon: '🛍️'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredChallenges = challenges.filter(c => {
    const catMatch = activeCategory === 'All' || c.category === activeCategory
    const diffMatch = activeDifficulty === 'All' || c.difficulty === activeDifficulty
    return catMatch && diffMatch
  })

  const toggleJoin = (id) => {
    setJoinedChallenges(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Easy': return 'bg-atmos-900/50 text-atmos-400 border-atmos-800/50'
      case 'Medium': return 'bg-amber-900/50 text-amber-400 border-amber-800/50'
      case 'Hard': return 'bg-red-900/50 text-red-400 border-red-800/50'
      default: return 'bg-gray-800 text-gray-400'
    }
  }

  const getCategoryColor = (cat) => {
    const colors = {
      'Transport': 'text-ocean-400',
      'Energy': 'text-amber-400',
      'Food': 'text-green-400',
      'Waste': 'text-purple-400',
      'Water': 'text-cyan-400',
      'Shopping': 'text-pink-400'
    }
    return colors[cat] || 'text-gray-400'
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white">Sustainability Challenges</h2>
        <p className="text-gray-400 mt-1">Join challenges, earn points, and reduce your carbon footprint</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Filters</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-atmos-600 text-white'
                  : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {difficulties.map(diff => (
            <button
              key={diff}
              onClick={() => setActiveDifficulty(diff)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeDifficulty === diff
                  ? 'bg-ocean-600 text-white'
                  : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Challenges Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredChallenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="glass-card p-5 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{challenge.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{challenge.title}</h3>
                  <span className={`text-xs font-medium ${getCategoryColor(challenge.category)}`}>
                    {challenge.category}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-4 leading-relaxed">{challenge.description}</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-gray-800/40 rounded-xl">
                <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">{challenge.duration}</p>
              </div>
              <div className="text-center p-2 bg-gray-800/40 rounded-xl">
                <Users className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">{challenge.participants?.toLocaleString()}</p>
              </div>
              <div className="text-center p-2 bg-gray-800/40 rounded-xl">
                <Leaf className="w-4 h-4 text-atmos-500 mx-auto mb-1" />
                <p className="text-xs text-atmos-400">{challenge.co2Reduction}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-amber-400">{challenge.ecoPoints} pts</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleJoin(challenge.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  joinedChallenges.has(challenge.id)
                    ? 'bg-atmos-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {joinedChallenges.has(challenge.id) ? 'Joined ✓' : 'Join Challenge'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
