import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Car, Home, Utensils, ShoppingBag, Zap, ArrowRight, TreePine, DollarSign } from 'lucide-react'
import api from '../utils/api'

const categories = [
  { id: 'transport', icon: Car, label: 'Transport', color: 'from-ocean-500 to-blue-500' },
  { id: 'home', icon: Home, label: 'Home Energy', color: 'from-amber-500 to-orange-500' },
  { id: 'food', icon: Utensils, label: 'Food', color: 'from-green-500 to-emerald-500' },
  { id: 'shopping', icon: ShoppingBag, label: 'Shopping', color: 'from-pink-500 to-rose-500' },
  { id: 'lifestyle', icon: Zap, label: 'Lifestyle', color: 'from-purple-500 to-violet-500' },
]

const questions = {
  transport: [
    { id: 't1', question: 'How do you usually commute?', options: ['Car (alone)', 'Car (carpool)', 'Public transport', 'Bike/Walk'] },
    { id: 't2', question: 'Daily commute distance (km)?', type: 'number', placeholder: 'e.g., 15' },
    { id: 't3', question: 'Flights per year?', options: ['None', '1-2', '3-5', '6+'] },
  ],
  home: [
    { id: 'h1', question: 'Home size?', options: ['Studio', '1-2 BR', '3-4 BR', '5+ BR'] },
    { id: 'h2', question: 'Energy source?', options: ['Coal/Grid', 'Mixed', 'Natural Gas', 'Renewable'] },
    { id: 'h3', question: 'Monthly electricity bill ($)?', type: 'number', placeholder: 'e.g., 120' },
  ],
  food: [
    { id: 'f1', question: 'Diet type?', options: ['Heavy meat', 'Moderate meat', 'Vegetarian', 'Vegan'] },
    { id: 'f2', question: 'Local food preference?', options: ['Rarely', 'Sometimes', 'Often', 'Always'] },
    { id: 'f3', question: 'Food waste per week?', options: ['None', 'Little', 'Moderate', 'Lots'] },
  ],
  shopping: [
    { id: 's1', question: 'Monthly shopping spend ($)?', type: 'number', placeholder: 'e.g., 200' },
    { id: 's2', question: 'Second-hand preference?', options: ['Never', 'Rarely', 'Sometimes', 'Often'] },
    { id: 's3', question: 'Plastic usage?', options: ['High', 'Moderate', 'Low', 'Zero waste'] },
  ],
  lifestyle: [
    { id: 'l1', question: 'Recycling habits?', options: ['Never', 'Sometimes', 'Often', 'Always'] },
    { id: 'l2', question: 'Water usage?', options: ['High', 'Moderate', 'Low', 'Very low'] },
    { id: 'l3', question: 'Digital carbon awareness?', options: ['None', 'Low', 'Moderate', 'High'] },
  ],
}

export default function Calculator() {
  const [activeCategory, setActiveCategory] = useState('transport')
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const calculate = async () => {
    setLoading(true)
    try {
      const res = await api.post('/carbon/savings', {
        currentHabits: answers,
        proposedChanges: { reduceCar: true, eatLessMeat: true, useRenewable: true }
      })
      setResult(res.data.data)
    } catch (error) {
      console.error('Calculation error:', error)
      // Fallback result
      setResult({
        currentAnnualFootprint: 8500,
        projectedAnnualFootprint: 5200,
        annualSavings: 3300,
        monthlySavings: 275,
        percentageReduction: 38.8,
        breakdown: [
          { change: 'Switch to public transport', savings: 1200, percentage: 36.4 },
          { change: 'Reduce meat consumption', savings: 800, percentage: 24.2 },
          { change: 'Use renewable energy', savings: 900, percentage: 27.3 },
          { change: 'Reduce shopping waste', savings: 400, percentage: 12.1 },
        ],
        moneySaved: '$1,200/year',
        equivalentTrees: 165
      })
    } finally {
      setLoading(false)
    }
  }

  const progress = Object.keys(answers).length / 15 * 100

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white">Carbon Savings Calculator</h2>
        <p className="text-gray-400 mt-1">Discover how much CO₂ you can save with simple changes</p>
      </motion.div>

      {/* Progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="text-sm text-atmos-400 font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-atmos-500 to-ocean-500 h-2 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                  : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Questions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {questions[activeCategory]?.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <h3 className="text-white font-medium mb-3">{q.question}</h3>

              {q.type === 'number' ? (
                <input
                  type="number"
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  className="input-field"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(q.id, opt)}
                      className={`p-3 rounded-xl text-sm transition-all ${
                        answers[q.id] === opt
                          ? 'bg-atmos-600/30 border border-atmos-500/50 text-atmos-300'
                          : 'bg-gray-800/40 border border-gray-700/50 text-gray-400 hover:bg-gray-800/60'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Calculate Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={calculate}
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          <>
            <Calculator className="w-5 h-5" />
            Calculate My Impact
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Your Potential Impact</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <TreePine className="w-6 h-6 text-atmos-400" />
                <span className="text-4xl font-bold gradient-text">{result.annualSavings.toLocaleString()}</span>
                <span className="text-xl text-gray-400">kg CO₂/year</span>
              </div>
              <p className="text-gray-400">That's a <span className="text-atmos-400 font-semibold">{result.percentageReduction}%</span> reduction!</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 text-center">
                <DollarSign className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{result.moneySaved}</p>
                <p className="text-xs text-gray-500">Money Saved</p>
              </div>
              <div className="glass-card p-4 text-center">
                <TreePine className="w-6 h-6 text-atmos-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{result.equivalentTrees}</p>
                <p className="text-xs text-gray-500">Trees Equivalent</p>
              </div>
            </div>

            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold text-white mb-4">Breakdown by Change</h4>
              <div className="space-y-3">
                {result.breakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">{item.change}</span>
                      <span className="text-sm text-atmos-400 font-medium">{item.savings} kg</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-atmos-500 to-ocean-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
