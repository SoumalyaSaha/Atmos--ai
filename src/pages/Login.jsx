import { GoogleLogin } from '@react-oauth/google';
import { useContext } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { setUser } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center">
          <span className="text-3xl">🌱</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Atmos AI</h1>
        <p className="text-gray-400">Sign in to track your carbon footprint</p>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            // Decode the JWT token to get user info
            const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
            
            const userData = {
              name: decoded.name || 'Eco Warrior',
              email: decoded.email || 'user@atmos.ai',
              picture: decoded.picture || null,
              googleId: decoded.sub,
              // Add editable display name (initially same as Google name)
              displayName: decoded.name || 'Eco Warrior',
              
              // ============================================
              // NEW: Age fields for personalized calculations
              // ============================================
              age: null,
              ageGroup: null,
              
              // ============================================
              // NEW: Onboarding tracking flag
              // ============================================
              // false = user hasn't completed data setup yet
              // true = user has either allowed Health Connect or entered manual data
              onboardingComplete: false,
              
              // NEW: Track which data source user chose
              // 'health_connect' | 'manual' | null
              dataSource: null,
              
              // NEW: Store raw health data (only if permission granted)
              healthData: {
                steps: 0,
                distance: 0, // in meters
                caloriesBurned: 0,
                lastSynced: null
              },
              
              // NEW: Store manual entry data (if user denies Health Connect)
              manualData: {
                transport: null,      // { primaryMode, vehicleType, kmPerDay }
                homeEnergy: null,     // { electricityKwh, gasUsage, householdSize }
                diet: null,           // { dietType, mealsPerDay, foodWaste }
                shopping: null,       // { monthlySpend, preference }
                waste: null           // { householdSize, bagsPerWeek }
              },
              
              // NEW: Calculated carbon footprint (all sectors)
              // Initialized to 0.00 - NO FAKE DATA
              carbonFootprint: {
                mobility: 0.00,
                homeEnergy: 0.00,
                diet: 0.00,
                shopping: 0.00,
                waste: 0.00,
                total: 0.00,
                lastCalculated: null
              }
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // ============================================
            // CHANGED: Redirect to onboarding instead of dashboard
            // ============================================
            // User CANNOT access dashboard until onboarding is complete
            navigate('/onboarding');
          }}
          onError={() => console.log('Login Failed')}
        />
      </div>
    </div>
  );
}
