import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Calculator, ArrowRight, Calendar } from 'lucide-react';
import { AppContext } from '../App';

export default function Onboarding() {
  const { user, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Welcome, 2: Age Input
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState('');

  // If already onboarded, go to dashboard
  useEffect(() => {
    if (user?.onboardingComplete && user?.carbonFootprint?.lastCalculated) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAgeSubmit = () => {
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
      setAgeError('Please enter a valid age between 13 and 100');
      return;
    }

    // Save age to user
    const updatedUser = {
      ...user,
      age: ageNum,
      ageGroup: getAgeGroup(ageNum)
    };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAgeError('');
    setStep(2); // Move to calculator intro
  };

  const getAgeGroup = (age) => {
    if (age < 18) return '13-17';
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    return '55+';
  };

  const getAgeGroupLabel = (age) => {
    const group = getAgeGroup(age);
    const labels = {
      '13-17': 'Teen (13-17)',
      '18-24': 'Young Adult (18-24)',
      '25-34': 'Adult (25-34)',
      '35-44': 'Middle Age (35-44)',
      '45-54': 'Senior Adult (45-54)',
      '55+': 'Senior (55+)'
    };
    return labels[group] || group;
  };

  // Step 1: Welcome + Age Input
  const renderWelcome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 max-w-md w-full"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <Leaf className="w-12 h-12 text-white" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to Atmos AI!
        </h1>
        <p className="text-gray-400 leading-relaxed">
          To calculate your real carbon footprint and compare with your age group, we need to know your age.
        </p>
      </div>

      {/* Age Input */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-left space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <label className="text-white font-medium">What's your age?</label>
        </div>
        
        <input
          type="number"
          value={age}
          onChange={(e) => {
            setAge(e.target.value);
            setAgeError('');
          }}
          placeholder="e.g., 25"
          min="13"
          max="100"
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors text-center text-lg"
          onKeyDown={(e) => e.key === 'Enter' && handleAgeSubmit()}
        />
        
        {ageError && (
          <p className="text-red-400 text-sm text-center">{ageError}</p>
        )}

        {age && !ageError && parseInt(age) >= 13 && parseInt(age) <= 100 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-emerald-400 text-sm text-center"
          >
            Age Group: {getAgeGroupLabel(parseInt(age))}
          </motion.p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAgeSubmit}
        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <p className="text-gray-600 text-xs">
        Your age is used only for comparison purposes and is not shared
      </p>
    </motion.div>
  );

  // Step 2: Calculator Intro
  const renderCalculatorIntro = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 max-w-md w-full"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <Calculator className="w-12 h-12 text-white" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Almost There!
        </h1>
        <p className="text-gray-400 leading-relaxed">
          Now let's calculate your carbon footprint. You'll compare with <span className="text-emerald-400 font-medium">{getAgeGroupLabel(user?.age)}</span> in India.
        </p>
      </div>

      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-left">
        <p className="text-gray-300 text-sm font-medium mb-4">You'll enter:</p>
        <ul className="space-y-3">
          {[
            { icon: '🚗', text: 'Transportation habits (mode, distance)' },
            { icon: '⚡', text: 'Home energy usage (electricity, gas)' },
            { icon: '🥗', text: 'Diet type and preferences' },
            { icon: '🛒', text: 'Monthly shopping patterns' },
            { icon: '🗑️', text: 'Waste generation habits' },
          ].map((item, i) => (
            <motion.li 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 text-gray-400 text-sm"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/calculator')}
        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
      >
        <Calculator className="w-5 h-5" />
        Start Calculator
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      {step === 1 && renderWelcome()}
      {step === 2 && renderCalculatorIntro()}
    </div>
  );
}
