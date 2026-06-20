import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calculator as CalculatorIcon, Car, Home, Utensils, 
  ShoppingBag, Trash2, ArrowRight, TreePine, 
  AlertCircle, CheckCircle2 
} from 'lucide-react'
import { AppContext } from '../App'
import api from '../utils/api'

const categories = [
  { id: 'transport', icon: Car, label: 'Transport', color: 'from-blue-500 to-cyan-500' },
  { id: 'homeEnergy', icon: Home, label: 'Home Energy', color: 'from-amber-500 to-orange-500' },
  { id: 'diet', icon: Utensils, label: 'Diet', color: 'from-green-500 to-emerald-500' },
  { id: 'shopping', icon: ShoppingBag, label: 'Shopping', color: 'from-pink-500 to-rose-500' },
  { id: 'waste', icon: Trash2, label: 'Waste', color: 'from-purple-500 to-violet-500' },
]

const questions = {
  transport: [
    { 
      id: 'vehicleType', 
      question: 'Primary transport mode?', 
      options: [
        { value: 'car_petrol', label: 'Car (Petrol)' },
        { value: 'car_diesel', label: 'Car (Diesel)' },
        { value: 'car_cng', label: 'Car (CNG)' },
        { value: 'bike_petrol', label: 'Bike/Scooter' },
        { value: 'bus', label: 'Bus' },
        { value: 'metro', label: 'Metro/Train' },
        { value: 'auto_rickshaw', label: 'Auto Rickshaw' },
        { value: 'walking', label: 'Walking/Cycling' },
      ]
    },
    { 
      id: 'kmPerDay', 
      question: 'Daily travel distance (km)?', 
      type: 'number', 
      placeholder: 'e.g., 15' 
    },
  ],
  homeEnergy: [
    { 
      id: 'electricityKwh', 
      question: 'Monthly electricity (kWh)?', 
      type: 'number', 
      placeholder: 'e.g., 200' 
    },
    { 
      id: 'gasType', 
      question: 'Cooking fuel type?', 
      options: [
        { value: 'lpg', label: 'LPG Cylinder' },
        { value: 'naturalGas', label: 'Piped Natural Gas' },
        { value: 'biogas', label: 'Biogas' },
        { value: 'electricity', label: 'Electricity Only' },
      ]
    },
    { 
      id: 'gasUsage', 
      question: 'Monthly gas usage (kg or m³)?', 
      type: 'number', 
      placeholder: 'e.g., 14 (1 LPG cylinder ≈ 14kg)' 
    },
    { 
      id: 'householdSize', 
      question: 'People in household?', 
      type: 'number', 
      placeholder: 'e.g., 4' 
    },
  ],
  diet: [
    { 
      id: 'dietType', 
      question: 'Your diet type?', 
      options: [
        { value: 'meat_heavy', label: 'Meat Daily' },
        { value: 'meat_regular', label: 'Meat 4-5x/week' },
        { value: 'meat_occasional', label: 'Meat 1-2x/week' },
        { value: 'eggetarian', label: 'Eggetarian' },
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
      ]
    },
  ],
  shopping: [
    { 
      id: 'category', 
      question: 'Primary shopping category?', 
      options: [
        { value: 'clothing', label: 'Clothing & Fashion' },
        { value: 'electronics', label: 'Electronics & Gadgets' },
        { value: 'furniture', label: 'Furniture & Home' },
        { value: 'groceries', label: 'Groceries & Food' },
        { value: 'other', label: 'Mixed/Other' },
      ]
    },
    { 
      id: 'monthlySpend', 
      question: 'Monthly spending (₹)?', 
      type: 'number', 
      placeholder: 'e.g., 5000' 
    },
  ],
  waste: [
    { 
      id: 'bagsPerWeek', 
      question: 'Garbage bags per week?', 
      type: 'number', 
      placeholder: 'e.g., 2' 
    },
    { 
      id: 'disposalMethod', 
      question: 'Primary disposal method?', 
      options: [
        { value: 'landfill', label: 'Landfill (Municipal)' },
        { value: 'recycled', label: 'Mostly Recycled' },
        { value: 'composted', label: 'Composted + Recycled' },
      ]
    },
    { 
      id: 'householdSize_waste', 
      question: 'People in household?', 
      type: 'number', 
      placeholder: 'e.g., 4' 
    },
  ],
}

export default function Calculator() {
  const { user, setUser } = useContext(AppContext)
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('transport')
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    setError(null)
  }

  const buildManualData = () => {
    return {
      transport: {
        vehicleType: answers.vehicleType,
        kmPerDay: parseFloat(answers.kmPerDay) || 0
      },
      homeEnergy: {
        electricityKwh: parseFloat(answers.electricityKwh) || 0,
        gasType: answers.gasType,
        gasUsage: parseFloat(answers.gasUsage) || 0,
        householdSize: parseInt(answers.householdSize) || 1
      },
      diet: {
        dietType: answers.dietType
      },
      shopping: {
        category: answers.category,
        monthlySpend: parseFloat(answers.monthlySpend) || 0
      },
      waste: {
        bagsPerWeek: parseFloat(answers.bagsPerWeek) || 0,
        disposalMethod: answers.disposalMethod,
        householdSize: parseInt(answers.householdSize_waste) || parseInt(answers.householdSize) || 1
      }
    }
  }

  const calculate = async () => {
    // Prevent double-submit
    if (loading || saved) return

    // Validation
    const required = ['vehicleType', 'kmPerDay', 'electricityKwh', 'gasType', 'dietType', 'category', 'monthlySpend', 'bagsPerWeek', 'disposalMethod']
    const missing = required.filter(id => !answers[id])
    
    if (missing.length > 0) {
      setError(`Please answer all questions. Missing: ${missing.length} fields`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const manualData = buildManualData()
      const res = await api.post('/api/carbon/manual', { manualData })
      
      // Handle backend returning success: false
      if (!res.data?.success) {
        setError(res.data?.message || 'Calculation failed. Please try again.')
        return
      }
      
      setResult(res.data.carbonFootprint)
      setSaved(true)
      
      // Update user context
      const updatedUser = {
        ...user,
        onboardingComplete: true,
        dataSource: 'manual',
        manualData,
        carbonFootprint: res.data.carbonFootprint
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
      
    } catch (err) {
      console.error('Calculation error:', err)
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to calculate. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const totalQuestions = Object.values(questions).flat().length
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / totalQuestions) * 100

  const isCategoryComplete = (catId) => {
    const catQuestions = questions[catId]
    return catQuestions.every(q => answers[q.id])
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white">Carbon Footprint Calculator</h2>
        <p className="text-gray-400 mt-1">
          {user?.onboardingComplete 
            ? 'Update your lifestyle data for accurate tracking' 
            : 'Enter your lifestyle details to calculate your real carbon footprint'}
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Completion</span>
          <span className="text-sm text-emerald-400 font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">{answeredCount} of {totalQuestions} questions answered</p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-300 text-sm font-medium">Carbon footprint calculated!</p>
              <p className="text-emerald-400/70 text-xs">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          const complete = isCategoryComplete(cat.id)
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                  : complete
                    ? 'bg-slate-800/60 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/60 text-gray-400 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
              {complete && !isActive && <span className="text-emerald-400">✓</span>}
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
              className="bg-slate-800 rounded-xl p-5 border border-slate-700"
            >
              <h3 className="text-white font-medium mb-3">{q.question}</h3>

              {q.type === 'number' ? (
                <input
                  type="number"
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(q.id, opt.value)}
                      className={`p-3 rounded-xl text-sm transition-all text-left ${
                        answers[q.id] === opt.value
                          ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900/50 border border-slate-700 text-gray-400 hover:bg-slate-700/50'
                      }`}
                    >
                      {opt.label}
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
        disabled={loading || saved}
        className={`w-full flex items-center justify-center gap-2 py-4 text-lg font-semibold rounded-xl transition-all ${
          saved
            ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
            : loading
              ? 'bg-slate-700 text-gray-400 cursor-wait'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
        }`}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        ) : saved ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Saved! Redirecting...
          </>
        ) : (
          <>
            <CalculatorIcon className="w-5 h-5" />
            Calculate My Carbon Footprint
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>

      {/* Results Preview */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
              <h3 className="text-xl font-bold text-white mb-4">Your Monthly Carbon Footprint</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <TreePine className="w-8 h-8 text-emerald-400" />
                <span className="text-5xl font-bold text-white">{result.total}</span>
                <span className="text-xl text-gray-400">kg CO₂</span>
              </div>
              <p className="text-gray-400 text-sm">per month</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Transport', value: result.mobility, icon: Car, color: 'text-blue-400' },
                { label: 'Home Energy', value: result.homeEnergy, icon: Home, color: 'text-amber-400' },
                { label: 'Diet', value: result.diet, icon: Utensils, color: 'text-green-400' },
                { label: 'Shopping', value: result.shopping, icon: ShoppingBag, color: 'text-pink-400' },
                { label: 'Waste', value: result.waste, icon: Trash2, color: 'text-purple-400' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-gray-400 text-xs">{item.label}</span>
                  </div>
                  <p className="text-xl font-bold text-white">{item.value} <span className="text-xs text-gray-500">kg</span></p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
         }
