import { GoogleLogin } from '@react-oauth/google';
import { useContext } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function Login() {
  const { setUser, setEcoPoints } = useContext(AppContext);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      
      const googleId = decoded.sub;
      const userData = {
        name: decoded.name || 'Eco Warrior',
        email: decoded.email || 'user@atmos.ai',
        picture: decoded.picture || null,
        googleId: googleId,
      };

      const res = await api.post('/api/auth/login', userData);
      
      if (res.data.success) {
        const backendUser = res.data.user;
        
        const fullUser = {
          ...userData,
          ...backendUser,
          name: backendUser.name || userData.name,
          email: backendUser.email || userData.email,
          picture: backendUser.avatar || userData.picture,
        };

        setUser(fullUser);
        setEcoPoints(backendUser.ecoPoints || 0);
        localStorage.setItem('user', JSON.stringify(fullUser));
        localStorage.setItem('token', credentialResponse.credential);

        const isExistingUser = backendUser.onboardingComplete === true && 
                               backendUser.carbonFootprint?.lastCalculated;

        if (isExistingUser) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      navigate('/onboarding');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Leaf className="w-14 h-14 text-white" />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Atmos AI
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Track your carbon footprint, earn eco points, and make a real difference for the planet.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            { icon: '🌍', text: 'Track CO₂ emissions' },
            { icon: '🏆', text: 'Complete challenges' },
            { icon: '⭐', text: 'Earn eco points' },
            { icon: '📊', text: 'AI-powered insights' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
            >
              <span className="text-lg mr-2">{item.icon}</span>
              <span className="text-gray-300 text-sm">{item.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            size="large"
            text="signin_with"
            shape="pill"
            logo_alignment="center"
          />
        </div>

        <p className="text-gray-600 text-xs">
          By signing in, you agree to track your carbon footprint responsibly
        </p>
      </motion.div>
    </div>
  );
}
