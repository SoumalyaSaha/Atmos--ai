import { useState, useContext, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Trophy, 
  Calculator, 
  MessageCircle, 
  User, 
  Menu, 
  Leaf,
  Bell,
  Zap,
  LogOut,
  ChevronRight,
  Pencil,
  Lock
} from 'lucide-react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { AppContext } from '../App'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', requiresOnboarding: true },
  { path: '/challenges', icon: Trophy, label: 'Challenges', requiresOnboarding: true },
  { path: '/calculator', icon: Calculator, label: 'Calculator', requiresOnboarding: false },
  { path: '/leaderboard', icon: Zap, label: 'Leaderboard', requiresOnboarding: true },
  { path: '/chat', icon: MessageCircle, label: 'Atmos AI', requiresOnboarding: false },
  { path: '/profile', icon: User, label: 'Profile', requiresOnboarding: false },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { ecoPoints, user, setUser } = useContext(AppContext)

  useEffect(() => {
    if (!user?.onboardingComplete) {
      const currentPath = location.pathname
      const allowedPaths = ['/calculator', '/chat', '/profile']
      if (!allowedPaths.includes(currentPath)) {
        navigate('/calculator')
      }
    }
  }, [user, location, navigate])

  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(user?.displayName || user?.name || '')

  const handleNameUpdate = () => {
    const nameToSave = newName.trim() || user?.name || 'Eco Warrior'
    const updatedUser = { ...user, displayName: nameToSave }
    if (setUser) setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setIsEditingName(false)
  }

  const handleCancel = () => {
    setNewName(user?.displayName || user?.name || '')
    setIsEditingName(false)
  }

  const handleLogout = () => {
    if (setUser) setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('ecoPoints')
    navigate('/')
  }

  const notifications = [
    { id: 1, title: 'New Challenge!', message: 'Zero Plastic Week starts tomorrow', time: '2m ago', unread: true },
    { id: 2, title: 'Badge Earned!', message: 'You earned Savings Star', time: '1h ago', unread: true },
    { id: 3, title: 'Weekly Report', message: 'Your emissions dropped 15%', time: '3h ago', unread: false },
  ]

  const isLocked = (item) => {
    return item.requiresOnboarding && !user?.onboardingComplete
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Atmos AI</h1>
              <p className="text-[10px] text-gray-500 tracking-wider uppercase">Carbon Tracker</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            const locked = isLocked(item)

            if (locked) {
              return (
                <div
                  key={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                  title="Complete calculator to unlock"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                  <Lock className="w-3 h-3 ml-auto" />
                </div>
              )
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-emerald-500 dark:text-emerald-400" />}
              </Link>
            )
          })}
        </nav>

        {!user?.onboardingComplete && (
          <div className="mx-4 mb-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">⚠️ Setup Required</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Complete the calculator to unlock all features</p>
            <Link
              to="/calculator"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Go to Calculator <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        <div className="p-4">
          <div className="bg-gray-200/60 dark:bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-gray-300/50 dark:border-slate-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Eco Points</span>
              <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{ecoPoints.toLocaleString()}</p>
            <div className="w-full bg-gray-300 dark:bg-gray-800 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (ecoPoints / 10000) * 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {user?.onboardingComplete ? 'Keep tracking to earn more' : 'Complete calculator to start earning'}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-lg overflow-hidden">
              {user?.picture ? (
                <img src={user.picture} alt="avatar" className="w-10 h-10 rounded-full" />
              ) : (
                '🌱'
              )}
            </div>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameUpdate()
                      if (e.key === 'Escape') handleCancel()
                    }}
                    className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:outline-none w-28"
                    placeholder="Name"
                    autoFocus
                  />
                  <button 
                    onClick={handleNameUpdate}
                    className="text-emerald-600 dark:text-emerald-400 text-xs hover:text-emerald-500 dark:hover:text-emerald-300 px-1"
                  >
                    ✓
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="text-gray-500 dark:text-gray-400 text-xs hover:text-gray-400 dark:hover:text-gray-300 px-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.displayName || user?.name || 'Eco Warrior'}
                  </p>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-400 dark:text-gray-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shrink-0"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                {user?.email || 'user@atmos.ai'}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-white dark:bg-gray-950">
        <header className="shrink-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-gray-200/30 dark:border-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-gray-400 dark:bg-gray-600'}`} />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-full border border-emerald-200/50 dark:border-emerald-800/30">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{ecoPoints.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full p-4 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
