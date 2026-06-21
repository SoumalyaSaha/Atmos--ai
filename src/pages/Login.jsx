import { GoogleLogin } from '@react-oauth/google';
import { useContext } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

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
      
      // Store in localStorage for API calls
      localStorage.setItem('userId', googleId);
      localStorage.setItem('token', googleId);
      
      // Register/login with backend
      try {
        const res = await api.post('/auth/login', {
          userId: googleId,
          name: userData.name,
          email: userData.email,
          avatar: userData.picture
        });
        
        if (res.data?.success) {
          const backendUser = res.data.user;
          
          // [FIXED] Check if returning user has completed onboarding using backend data
          const isReturningUser = backendUser.onboardingComplete === true && 
                                  backendUser.carbonFootprint?.lastCalculated != null;
          
          // Merge Google data with backend data
          const mergedUser = { 
            ...userData, 
            ...backendUser,
            userId: googleId,
          };
          
          setUser(mergedUser);
          setEcoPoints(backendUser.ecoPoints || 0);
          localStorage.setItem('user', JSON.stringify(mergedUser));
          
          // [FIXED] Smart navigation based on actual backend user status
          if (isReturningUser) {
            console.log('[LOGIN] Returning user → Dashboard');
            navigate('/dashboard');
          } else {
            console.log('[LOGIN] New user → Onboarding');
            navigate('/onboarding');
          }
          
        } else {
          // Backend error but login succeeded locally
          setUser(userData);
          setEcoPoints(0);
          navigate('/onboarding');
        }
      } catch (apiErr) {
        console.error('Backend login error:', apiErr);
        // Allow local login even if backend fails
        setUser(userData);
        setEcoPoints(0);
        navigate('/onboarding');
      }
      
    } catch (err) {
      console.error('Google decode error:', err);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center">
          <span className="text-3xl">🌱</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Atmos AI</h1>
        <p className="text-gray-400">Sign in to track your carbon footprint</p>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log('Login Failed')}
        />
      </div>
    </div>
  );
}
