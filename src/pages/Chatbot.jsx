import { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Leaf, 
  Loader2, 
  Sparkles,
  Lock,
  TrendingDown,
  Car,
  Home,
  Utensils,
  ShoppingBag,
  Trash2
} from 'lucide-react'
import { AppContext } from '../App'
import api from '../utils/api'

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

const CARBON_BENCHMARKS = {
  india: {
    byAgeGroup: {
      '13-17': 140,
      '18-24': 180,
      '25-34': 220,
      '35-44': 260,
      '45-54': 280,
      '55+': 240
    }
  }
}

export default function Chatbot() {
  const { user } = useContext(AppContext)
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Welcome message with personalized context
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = buildWelcomeMessage()
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMsg,
        timestamp: new Date().toISOString()
      }])
    }
  }, [user])

  const buildWelcomeMessage = () => {
    if (!user?.onboardingComplete) {
      return `Hi! I'm Atmos Assistant, your carbon footprint advisor. To give you personalized advice, please complete the calculator first. I can then analyze your emissions and suggest ways to reduce them!`
    }

    const fp = user.carbonFootprint
    const ageGroup = user.ageGroup || '25-34'
    const indiaAvg = CARBON_BENCHMARKS.india.byAgeGroup[ageGroup] || 220
    const total = fp?.total || 0
    const diff = total - indiaAvg

    let contextMsg = `Hi ${user.name || 'Eco Warrior'}! I'm Atmos Assistant. `

    if (diff <= 0) {
      contextMsg += `Great news! Your carbon footprint (${total} kg/month) is below the India average for your age group (${indiaAvg} kg). `
    } else {
      contextMsg += `I see your carbon footprint is ${total} kg/month, which is ${diff} kg above the India average for your age group (${indiaAvg} kg). `
    }

    // Identify highest emission sector
    const sectors = [
      { name: 'Transport', value: fp?.mobility || 0, icon: '🚗' },
      { name: 'Home Energy', value: fp?.homeEnergy || 0, icon: '⚡' },
      { name: 'Diet', value: fp?.diet || 0, icon: '🥗' },
      { name: 'Shopping', value: fp?.shopping || 0, icon: '🛒' },
      { name: 'Waste', value: fp?.waste || 0, icon: '🗑️' }
    ]
    const highestSector = sectors.reduce((max, s) => s.value > max.value ? s : max, sectors[0])

    contextMsg += `Your highest emission comes from ${highestSector.icon} ${highestSector.name} (${highestSector.value} kg). Ask me how to reduce it!`

    return contextMsg
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Build context-aware prompt
      const contextPrompt = buildContextPrompt(userMessage.content)
      
      const res = await api.post('/api/ai/chat', {
        message: contextPrompt,
        chatHistory: [...chatHistory, { role: 'user', content: userMessage.content }]
      })

      if (res.data?.success) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, assistantMessage])
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: userMessage.content },
          { role: 'assistant', content: res.data.reply }
        ])
      } else {
        throw new Error('API returned success: false')
      }
    } catch (err) {
      console.error('Chat error:', err)
      
      // Fallback response with real data
      const fallbackReply = generateFallbackResponse(userMessage.content)
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const buildContextPrompt = (userInput) => {
    if (!user?.onboardingComplete) {
      return userInput
    }

    const fp = user.carbonFootprint
    const ageGroup = user.ageGroup || '25-34'
    const indiaAvg = CARBON_BENCHMARKS.india.byAgeGroup[ageGroup] || 220

    const context = `
USER CONTEXT:
- Name: ${user.name || 'User'}
- Age Group: ${ageGroup}
- Monthly Carbon Footprint: ${fp?.total || 0} kg CO₂
- India Average for Age Group: ${indiaAvg} kg CO₂
- Breakdown:
  * Transport: ${fp?.mobility || 0} kg
  * Home Energy: ${fp?.homeEnergy || 0} kg
  * Diet: ${fp?.diet || 0} kg
  * Shopping: ${fp?.shopping || 0} kg
  * Waste: ${fp?.waste || 0} kg

USER QUESTION: ${userInput}

Please provide personalized advice based on their specific carbon footprint data. Be encouraging and actionable.
`
    return context
  }

  const generateFallbackResponse = (question) => {
    const lowerQ = question.toLowerCase()
    const fp = user?.carbonFootprint

    if (!fp) {
      return "I'd love to help, but I need your carbon footprint data first. Please complete the calculator!"
    }

    // Transport advice
    if (lowerQ.includes('transport') || lowerQ.includes('car') || lowerQ.includes('commute')) {
      if (fp.mobility > 50) {
        return `Your transport emissions (${fp.mobility} kg) are quite high. Try these:\n\n1. Switch to public transport 2 days/week → Save ~20 kg\n2. Carpool with colleagues → Save ~15 kg\n3. Try cycling for short trips → Save money + fitness!\n\nWould you like specific bus/metro routes for your area?`
      } else {
        return `Great job! Your transport emissions (${fp.mobility} kg) are low. Keep using ${user?.manualData?.transport?.vehicleType || 'your current mode'}!`
      }
    }

    // Home energy advice
    if (lowerQ.includes('home') || lowerQ.includes('electricity') || lowerQ.includes('energy')) {
      return `Your home energy is ${fp.homeEnergy} kg/month. Quick wins:\n\n1. Switch to LED bulbs → Save ~5 kg\n2. Unplug devices when not used → Save ~3 kg\n3. Use fan instead of AC → Save ~10 kg\n4. Consider rooftop solar → Save 50%+ long term!`
    }

    // Diet advice
    if (lowerQ.includes('diet') || lowerQ.includes('food') || lowerQ.includes('meat') || lowerQ.includes('vegetarian')) {
      if (user?.manualData?.diet?.dietType?.includes('meat')) {
        return `Your diet contributes ${fp.diet} kg. Try Meatless Mondays → Save ~8 kg/month. Even reducing meat from daily to 3x/week saves 20+ kg!`
      } else {
        return `Amazing! Your ${user?.manualData?.diet?.dietType || 'plant-based'} diet is eco-friendly at ${fp.diet} kg. Try reducing food waste to save even more!`
      }
    }

    // Shopping advice
    if (lowerQ.includes('shop') || lowerQ.includes('buy') || lowerQ.includes('clothes')) {
      return `Shopping adds ${fp.shopping} kg. Tips:\n\n1. Buy second-hand → Save 50% emissions\n2. Repair instead of replace\n3. Choose quality over quantity\n4. Try the "30 wears" rule for clothes!`
    }

    // General reduction
    if (lowerQ.includes('reduce') || lowerQ.includes('lower') || lowerQ.includes('save') || lowerQ.includes('less')) {
      const total = fp.total
      const ageGroup = user?.ageGroup || '25-34'
      const indiaAvg = CARBON_BENCHMARKS.india.byAgeGroup[ageGroup] || 220
      
      if (total > indiaAvg) {
        const diff = total - indiaAvg
        return `You're ${diff} kg above average. Here's your personalized plan:\n\n🎯 Top 3 Actions:\n1. Reduce transport by 20% → Save ${(fp.mobility * 0.2).toFixed(1)} kg\n2. Lower home energy by 15% → Save ${(fp.homeEnergy * 0.15).toFixed(1)} kg\n3. Cut shopping by 25% → Save ${(fp.shopping * 0.25).toFixed(1)} kg\n\nTotal potential savings: ${(diff * 0.8).toFixed(1)} kg/month!`
      } else {
        return `You're already doing great! To reduce further:\n\n1. Join challenges to earn points\n2. Try the savings calculator\n3. Share tips with friends!`
      }
    }

    // Default
    return `I can help with specific advice about transport, home energy, diet, shopping, or waste. Your current footprint is ${fp.total} kg/month. What would you like to focus on?`
  }

  const quickQuestions = user?.onboardingComplete ? [
    { icon: Car, label: 'Reduce Transport', question: 'How do I reduce my transport emissions?' },
    { icon: Home, label: 'Save Energy', question: 'How can I lower my home energy usage?' },
    { icon: Utensils, label: 'Diet Tips', question: 'How to make my diet more eco-friendly?' },
    { icon: ShoppingBag, label: 'Shop Smart', question: 'How to reduce shopping emissions?' },
    { icon: Trash2, label: 'Less Waste', question: 'How to reduce waste emissions?' },
    { icon: TrendingDown, label: 'Reduce Total', question: 'How do I reduce my total carbon footprint?' },
  ] : [
    { icon: Sparkles, label: 'Get Started', question: 'How do I calculate my carbon footprint?' },
    { icon: Leaf, label: 'Why Track?', question: 'Why should I track my carbon footprint?' },
    { icon: TrendingDown, label: 'India Average', question: 'What is the average carbon footprint in India?' },
  ]

  // Empty state if not onboarded
  if (!user?.onboardingComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Lock className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Complete Setup First</h3>
        <p className="text-gray-400 max-w-sm mb-6">
          Finish the calculator so I can give you personalized carbon footprint advice
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

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      {/* Chat Header */}
      <motion.div
        {...fadeIn}
        className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 mb-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Atmos Assistant</h3>
          <p className="text-xs text-gray-400">
            {user?.onboardingComplete 
              ? `Knows your footprint: ${user.carbonFootprint?.total || 0} kg/month`
              : 'Your carbon advisor'
            }
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400">Online</span>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-br from-emerald-500 to-cyan-500'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                  : 'bg-slate-800 border border-slate-700 text-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                <p className="text-[10px] text-gray-500 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
        {quickQuestions.map((q, i) => {
          const Icon = q.icon
          return (
            <button
              key={i}
              onClick={() => {
                setInput(q.question)
                // Auto-send after a brief delay
                setTimeout(() => {
                  const fakeEvent = { preventDefault: () => {} }
                  sendMessage()
                }, 100)
              }}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700 hover:border-emerald-500/50 text-xs text-gray-300 whitespace-nowrap transition-all"
            >
              <Icon className="w-3 h-3 text-emerald-400" />
              {q.label}
            </button>
          )
        })}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about reducing your carbon footprint..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}
