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

// ZERO API CALL - Client-side emission factors
const EMISSION_FACTORS = {
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

  // ZERO API CALL - Pure client-side calculation
  const calculateCarbonFootprint = (manualData) => {
    const result = {
      mobility: 0.00, homeEnergy: 0.00, diet: 0.00,
      shopping: 0.00, waste: 0.00, total: 0.00,
      lastCalculated: new Date().toISOString()
    }

    if (!manualData) return result

    if (manualData.transport) {
      const { vehicleType, kmPerDay } = manualData.transport
      const factor = EMISSION_FACTORS.transport[vehicleType] || 0
      result.mobility = parseFloat((kmPerDay * 30 * factor).toFixed(2))
    }

    if (manualData.homeEnergy) {
      const { electricityKwh, gasUsage, gasType, householdSize } = manualData.homeEnergy
      const electricityEmission = (electricityKwh || 0) * EMISSION_FACTORS.homeEnergy.electricity
      const gasEmission = (gasUsage || 0) * (EMISSION_FACTORS.homeEnergy[gasType] || EMISSION_FACTORS.homeEnergy.lpg)
      result.homeEnergy = parseFloat(((electricityEmission + gasEmission) / (householdSize || 1)).toFixed(2))
    }

    if (manualData.diet) {
      const { dietType } = manualData.diet
      const dailyFactor = EMISSION_FACTORS.diet[dietType] || EMISSION_FACTORS.diet.vegetarian
      result.diet = parseFloat((dailyFactor * 30).toFixed(2))
    }

    if (manualData.shopping) {
      const { monthlySpend, category } = manualData.shopping
      const factor = EMISSION_FACTORS.shopping[category] || EMISSION_FACTORS.shopping.other
      result.shopping = parseFloat((monthlySpend * factor).toFixed(2))
    }

    if (manualData.waste) {
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

  const calculate = async () => {
    if (loading || saved) return

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

      // ZERO API CALL - Calculate entirely on client
      const carbonFootprint = calculateCarbonFootprint(manualData)

      // Build dashboard cache locally
      const weeklyTrend = [carbonFootprint.total, carbonFootprint.total, carbonFootprint.total, 
                          carbonFootprint.total, carbonFootprint.total, carbonFootprint.total, carbonFootprint.total]

      const dashboardCache = {
        generatedAt: new Date().toISOString(),
        footprintAtGeneration: carbonFootprint.total,
        breakdown: [
          { category: 'Mobility', emission: carbonFootprint.mobility, icon: '🚗' },
          { category: 'Home Energy', emission: carbonFootprint.homeEnergy, icon: '⚡' },
          { category: 'Diet', emission: carbonFootprint.diet, icon: '🥗' },
          { category: 'Shopping', emission: carbonFootprint.shopping, icon: '🛒' },
          { category: 'Waste', emission: carbonFootprint.waste, icon: '🗑️' }
        ],
        recommendations: ['Great job calculating your carbon footprint! Update regularly for accurate tracking.'],
        ecoScore: Math.max(0, Math.min(100, Math.round(100 - (carbonFootprint.total / 10)))),
        weeklyTrend: weeklyTrend
      }

      // Build insights locally (basic, no AI call)
      const insights = {
        summary: `Your monthly carbon footprint is ${carbonFootprint.total} kg CO₂.`,
        keyInsights: [
          `Transport: ${carbonFootprint.mobility} kg - ${carbonFootprint.mobility > 50 ? 'High impact' : 'Good control'}`,
          `Home Energy: ${carbonFootprint.homeEnergy} kg`,
          `Diet: ${carbonFootprint.diet} kg`,
        ],
        actionItems: [
          { title: 'Reduce Transport', impact: 'Use public transport', difficulty: 'Medium', co2Saved: '~20 kg' },
          { title: 'Save Energy', impact: 'Switch to LED', difficulty: 'Easy', co2Saved: '~5 kg' },
        ],
        trendAnalysis: 'First calculation completed.',
        goalProgress: { current: carbonFootprint.total, target: Math.max(50, carbonFootprint.total * 0.7), unit: 'kg CO2e' },
        generatedAt: new Date().toISOString(),
        footprintAtGeneration: carbonFootprint.total
      }

      // SINGLE API CALL - Save everything to backend
      const savePayload = {
        manualData,
        carbonFootprint,
        onboardingComplete: true,
        dataSource: 'manual',
        dashboardCache,
        insights,
        carbonHistory: [{ date: new Date().toISOString(), netFootprint: carbonFootprint.total }],
        // Include age from user context (stored locally during onboarding)
        age: user?.age || null,
        ageGroup: user?.ageGroup || null,
      }

      const res = await api.post('/api/carbon/manual', savePayload)

      if (!res.data?.success) {
        setError(res.data?.message || 'Save failed. Please try again.')
        return
      }

      setResult(carbonFootprint)
      setSaved(true)

      // Update user context with everything
      const updatedUser = {
        ...user,
        onboardingComplete: true,
        dataSource: 'manual',
        manualData,
        carbonFootprint,
        dashboardCache,
        insights
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)

    } catch (err) {
      console.error('Calculation error:', err)
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to save. Please check your connection and try again.'
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
