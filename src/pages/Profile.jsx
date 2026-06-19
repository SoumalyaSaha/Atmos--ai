import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Award, 
  Settings, 
  Bell, 
  Moon, 
  LogOut, 
  ChevronRight,
  Shield,
  Leaf,
  TrendingUp,
  Calendar,
  Zap
} from 'lucide-react'
import { AppContext } from '../App'
import api from '../utils/api'

export default function Profile() {
  const { user, setUser, ecoPoints } = useContext(AppContext)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
const [settings, setSettings] = useState({
  notifications: true,
  weeklyReports: true,
  challengeReminders: true,
  darkMode: true,
});
  const toggleSetting = (key) => {
  setSettings(prev => ({
    ...prev,
    [key]: !prev[key]
  }));
};
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile')
      setProfile(res.data.profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

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
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center"
      >
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-atmos-500 to-ocean-500 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-atmos-900/30">
            {user?.picture ? (
              <img src={user.picture} alt="avatar" className="w-24 h-24 rounded-full" />
            ) : (
              profile?.avatar || '🌱'
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-atmos-500 rounded-full flex items-center justify-center border-4 border-gray-900">
            <Leaf className="w-4 h-4 text-white" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mt-4">{profile?.name || 'Eco Warrior'}</h2>
        <p className="text-gray-400 text-sm">{profile?.email || 'user@atmos.ai'}</p>
        <p className="text-xs text-gray-600 mt-1">Member since {profile?.joinDate || '2026'}</p>

        <div className="flex justify-center gap-4 mt-4">
          <div className="text-center px-4 py-2 bg-gray-800/40 rounded-xl">
            <p className="text-lg font-bold text-atmos-400">{profile?.currentStreak || 12}</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </div>
          <div className="text-center px-4 py-2 bg-gray-800/40 rounded-xl">
            <p className="text-lg font-bold text-ocean-400">{profile?.totalCo2Saved || '98 kg'}</p>
            <p className="text-xs text-gray-500">CO₂ Saved</p>
          </div>
          <div className="text-center px-4 py-2 bg-gray-800/40 rounded-xl">
            <p className="text-lg font-bold text-amber-400">{profile?.badges?.length || 3}</p>
            <p className="text-xs text-gray-500">Badges</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-atmos-600 text-white'
                  : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-atmos-900/50 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-atmos-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Eco Points</p>
                    <p className="text-xl font-bold text-white">{ecoPoints.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-atmos-500 to-atmos-400 h-2 rounded-full" style={{ width: '72%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-2">Level 7 • 2,800 to Level 8</p>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-ocean-900/50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-ocean-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Weekly Progress</p>
                    <p className="text-xl font-bold text-white">+15%</p>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {[40, 55, 45, 70, 60, 85, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-ocean-500/30 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="glass-card p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { icon: Award, title: 'Earned Savings Star', desc: 'Saved 50kg CO₂ total', time: '2 days ago', color: 'text-amber-400' },
                  { icon: Calendar, title: '7-Day Streak', desc: 'Logged activities for 7 days straight', time: '5 days ago', color: 'text-atmos-400' },
                  { icon: Leaf, title: 'Joined Zero Plastic Week', desc: 'Started sustainability challenge', time: '1 week ago', color: 'text-green-400' },
                  { icon: Shield, title: 'Account Verified', desc: 'Email verification completed', time: '2 weeks ago', color: 'text-ocean-400' },
                ].map((activity, i) => {
                  const Icon = activity.icon
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.desc}</p>
                      </div>
                      <span className="text-xs text-gray-600">{activity.time}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profile?.badges?.map((badge, i) => (
              <motion.div
                key={badge.id || i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 text-center card-hover"
              >
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h4 className="text-sm font-semibold text-white">{badge.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                <p className="text-xs text-gray-600 mt-2">{badge.earned}</p>
              </motion.div>
            )) || (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No badges yet. Start completing challenges!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            {[
              { icon: Bell, label: 'Push Notifications', desc: 'Get notified about challenges and achievements', key: 'notifications' },
              { icon: Calendar, label: 'Weekly Reports', desc: 'Receive weekly carbon footprint summary', key: 'weeklyReports' },
              { icon: Zap, label: 'Challenge Reminders', desc: 'Daily reminders for active challenges', key: 'challengeReminders' },
              { icon: Moon, label: 'Dark Mode', desc: 'Always use dark theme', key: 'darkMode' },
            ].map((setting) => {
              const Icon = setting.icon
              return (
                <div 
  key={setting.key} 
  onClick={() => toggleSetting(setting.key)}
  className="glass-card p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{setting.label}</p>
                      <p className="text-xs text-gray-500">{setting.desc}</p>
                    </div>
                  </div>
                 <div 
  className={`relative w-12 h-6 rounded-full transition-colors ${
    settings[setting.key] ? 'bg-atmos-600' : 'bg-gray-600'
  }`}
>
  <div 
    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
      settings[setting.key] ? 'translate-x-6' : 'translate-x-1'
    }`}
  />
</div>
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              )
            })}

            <button
              onClick={() => {
    localStorage.clear();
    window.location.href = '/';
  }}
              className="w-full glass-card p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-900/20 transition-colors"
>
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
