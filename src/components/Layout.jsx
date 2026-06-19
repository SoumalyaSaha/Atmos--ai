import { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Trophy, 
  Calculator, 
  MessageCircle, 
  User, 
  Menu, 
  X, 
  Leaf,
  Bell,
  Zap,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { AppContext } from '../App'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/challenges', icon: Trophy, label: 'Challenges' },
  { path: '/calculator', icon: Calculator, label: 'Calculator' },
  { path: '/leaderboard', icon: Zap, label: 'Leaderboard' },
  { path: '/chat', icon: MessageCircle, label: 'Atmos AI' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const location = useLocation()
  const { ecoPoints, user } = useContext(AppContext)

  const notifications = [
    { id: 1, title: 'New Challenge!', message: 'Zero Plastic Week starts tomorrow', time: '2m ago', unread: true },
    { id: 2, title: 'Badge Earned!', message: 'You earned Savings Star', time: '1h ago', unread: true },
    { id: 3, title: 'Weekly Report', message: 'Your emissions dropped 15%', time: '3h ago', unread: false },
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile Sidebar Overlay */}
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

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-atmos-500 to-atmos-700 flex items-center justify-center shadow-lg shadow-atmos-900/30">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Atmos AI</h1>
              <p className="text-[10px] text-gray-500 tracking-wider uppercase">Carbon Tracker</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-atmos-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Eco Points Card */}
        <div className="p-4">
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Eco Points</span>
              <Zap className="w-4 h-4 text-atmos-400" />
            </div>
            <p className="text-2xl font-bold text-atmos-400">{ecoPoints.toLocaleString()}</p>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-atmos-500 to-atmos-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <p className="text-xs text-gray-500">Level 7 • 2,800 to next level</p>
          </div>
        </div>

        {/* User */}
        <div className="p-4 border-t border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-atmos-500 flex items-center justify-center text-lg">
              {user?.picture ? (
                <img src={user.picture} alt="avatar" className="w-10 h-10 rounded-full" />
              ) : (
                '🌱'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Eco Warrior'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@atmos.ai'}
              </p>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 glass-card overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-800/50">
                        <h3 className="font-semibold text-white">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-gray-800/30 hover:bg-gray-800/30 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-atmos-400' : 'bg-gray-600'}`} />
                              <div>
                                <p className="text-sm font-medium text-white">{notif.title}</p>
                                <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-600 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Eco Points */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-atmos-900/30 rounded-full border border-atmos-800/30">
                <Zap className="w-4 h-4 text-atmos-400" />
                <span className="text-sm font-semibold text-atmos-400">{ecoPoints.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
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
