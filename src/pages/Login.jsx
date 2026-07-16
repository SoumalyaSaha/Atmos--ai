import { GoogleLogin } from '@react-oauth/google';
import { useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Leaf } from 'lucide-react';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=JetBrains+Mono:wght@500&display=swap');

.atmos-root { font-family: 'Manrope', system-ui, sans-serif; }
.atmos-root *, .atmos-root *::before, .atmos-root *::after { box-sizing: border-box; }

.atmos-root .grain::after {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 100;
  opacity: 0.06; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.atmos-root .aurora { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
.atmos-root .aurora::before, .atmos-root .aurora::after {
  content: ""; position: absolute; border-radius: 50%;
  filter: blur(120px); opacity: 0.35; animation: atmos-drift 22s ease-in-out infinite;
}
.atmos-root .aurora::before {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #34d399 0%, transparent 70%);
  top: -10%; left: -10%;
}
.atmos-root .aurora::after {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #67e8f9 0%, transparent 70%);
  bottom: -15%; right: -10%; animation-delay: -11s;
}
@keyframes atmos-drift {
  0%, 100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(60px, -40px) scale(1.15); }
}

.atmos-root .stars {
  position: absolute; inset: 0;
  background-image:
    radial-gradient(1px 1px at 20% 30%, white, transparent),
    radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.7), transparent),
    radial-gradient(2px 2px at 80% 10%, white, transparent),
    radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 90% 50%, white, transparent),
    radial-gradient(1px 1px at 10% 60%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1.5px 1.5px at 45% 15%, white, transparent),
    radial-gradient(1px 1px at 75% 35%, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 15% 45%, white, transparent),
    radial-gradient(2px 2px at 55% 90%, rgba(255,255,255,0.5), transparent);
  opacity: 0.8; animation: atmos-twinkle 4s ease-in-out infinite;
}
@keyframes atmos-twinkle { 0%,100% { opacity: 0.8; } 50% { opacity: 0.4; } }

.atmos-root .scene { perspective: 1400px; perspective-origin: 50% 50%; }
.atmos-root .earth {
  position: relative; transform-style: preserve-3d;
  animation: atmos-spin 32s linear infinite; border-radius: 50%;
}
.atmos-root .earth-sphere {
  position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #5eead4 0%, #10b981 18%, #047857 45%, #064e3b 75%, #022c22 100%);
  box-shadow:
    inset -40px -50px 80px rgba(0,0,0,0.65),
    inset 30px 25px 60px rgba(94, 234, 212, 0.2),
    0 0 80px rgba(52, 211, 153, 0.35),
    0 0 160px rgba(103, 232, 249, 0.18);
}
.atmos-root .earth-continents {
  position: absolute; inset: 0; border-radius: 50%;
  background:
    radial-gradient(ellipse 38px 28px at 28% 35%, rgba(20, 83, 45, 0.85) 40%, transparent 70%),
    radial-gradient(ellipse 52px 30px at 65% 32%, rgba(20, 83, 45, 0.8) 40%, transparent 70%),
    radial-gradient(ellipse 28px 22px at 45% 55%, rgba(22, 101, 52, 0.9) 40%, transparent 70%),
    radial-gradient(ellipse 36px 26px at 72% 68%, rgba(20, 83, 45, 0.85) 40%, transparent 70%),
    radial-gradient(ellipse 22px 18px at 25% 72%, rgba(22, 101, 52, 0.8) 40%, transparent 70%);
  mix-blend-mode: multiply;
}
.atmos-root .earth-atmos {
  position: absolute; inset: -8%; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, transparent 55%, rgba(94, 234, 212, 0.35) 62%, transparent 72%);
  filter: blur(8px); animation: atmos-pulse-glow 4s ease-in-out infinite;
}
@keyframes atmos-pulse-glow {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.04); }
}
@keyframes atmos-spin {
  from { transform: rotateY(0deg) rotateX(12deg); }
  to { transform: rotateY(360deg) rotateX(12deg); }
}

.atmos-root .orbit {
  position: absolute; border: 1px dashed rgba(94, 234, 212, 0.25);
  border-radius: 50%; top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotateX(70deg);
}
.atmos-root .orbit-2 {
  border-color: rgba(103, 232, 249, 0.18);
  transform: translate(-50%, -50%) rotateX(70deg) rotateZ(45deg);
}
.atmos-root .orbit-dot {
  position: absolute; top: 50%; left: 50%; width: 12px; height: 12px;
  background: #5eead4; border-radius: 50%;
  box-shadow: 0 0 20px #5eead4, 0 0 40px rgba(94, 234, 212, 0.5);
  animation: atmos-orbit-path 18s linear infinite;
}
.atmos-root .orbit-dot-2 {
  background: #67e8f9;
  box-shadow: 0 0 20px #67e8f9, 0 0 40px rgba(103, 232, 249, 0.5);
  animation: atmos-orbit-path-2 24s linear infinite; animation-delay: -8s;
}
.atmos-root .orbit-dot-3 {
  background: #fcd34d;
  box-shadow: 0 0 16px #fcd34d, 0 0 32px rgba(252, 211, 77, 0.4);
  animation: atmos-orbit-path 28s linear infinite reverse; animation-delay: -14s;
}
@keyframes atmos-orbit-path {
  from { transform: translate(-50%, -50%) rotate(0deg) translateX(380px) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg) translateX(380px) rotate(-360deg); }
}
@keyframes atmos-orbit-path-2 {
  from { transform: translate(-50%, -50%) rotate(0deg) translateX(450px) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg) translateX(450px) rotate(-360deg); }
}

.atmos-root .leaf-float {
  position: absolute; color: #5eead4; opacity: 0.5;
  filter: drop-shadow(0 0 12px rgba(94, 234, 212, 0.4));
}

.atmos-root .glass {
  background: linear-gradient(135deg, rgba(94, 234, 212, 0.06) 0%, rgba(8, 17, 29, 0.6) 100%);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(94, 234, 212, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.atmos-root .gradient-text {
  background: linear-gradient(135deg, #5eead4 0%, #67e8f9 50%, #fcd34d 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; color: transparent;
}
.atmos-root .font-display { font-family: 'Cormorant Garamond', serif; }
.atmos-root .font-mono-acc { font-family: 'JetBrains Mono', monospace; }

.atmos-root .pulse-ring {
  position: absolute; inset: 0; border: 2px solid #5eead4;
  border-radius: inherit; animation: atmos-pulse-ring 3s ease-out infinite;
}
@keyframes atmos-pulse-ring {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}

.atmos-root .ping {
  position: absolute; inset: 0; border-radius: 9999px;
  background: #34d399; opacity: 0.75;
  animation: atmos-ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
}
@keyframes atmos-ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
`;

const FloatingLeaf = ({ delay, x, y, size = 22, duration = 14 }) => (
  <motion.div
    className="leaf-float"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{ y: [0, -34, 0], x: [0, 16, 0], rotate: [0, 180, 360] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    <Leaf size={size} strokeWidth={1.5} />
  </motion.div>
);

const Earth3D = () => (
  <div className="scene" style={{ position: "relative" }}>
    <div style={{ position: "relative", width: 320, height: 320 }}>
      <div className="earth" style={{ width: 320, height: 320 }}>
        <div className="earth-sphere" />
        <div className="earth-continents" />
      </div>
      <div className="earth-atmos" />
      <div className="orbit" style={{ width: 440, height: 440 }} />
      <div className="orbit orbit-2" style={{ width: 520, height: 520 }} />
      <div className="orbit-dot" />
      <div className="orbit-dot orbit-dot-2" />
      <div className="orbit-dot orbit-dot-3" />
    </div>
  </div>
);

const features = [
  { icon: '🌍', label: "Track CO₂", color: "#34d399" },
  { icon: '🏆', label: "Challenges", color: "#fcd34d" },
  { icon: '⭐', label: "Eco-points", color: "#67e8f9" },
  { icon: '📊', label: "AI Insights", color: "#6ee7b7" },
];

export default function Login() {
  const { setUser, setEcoPoints } = useContext(AppContext);
  const navigate = useNavigate();
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-300, 300], [10, -10]), { stiffness: 80, damping: 20 });
  const ry = useSpring(useTransform(mx, [-300, 300], [-10, 10]), { stiffness: 80, damping: 20 });

  const handleMouse = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  };

  useEffect(() => {
    document.title = "Atmos AI — Track your carbon shadow";
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send Google's sealed token UNOPENED — the backend verifies it with
      // Google directly and only trusts what comes back from that check.
      const res = await api.post('/api/auth/login', {
        credential: credentialResponse.credential,
      });

      if (res.data.success) {
        const backendUser = res.data.user;
        const correctUserId = backendUser.userId;

        if (!correctUserId) {
          throw new Error('Missing userId from backend');
        }
        if (!res.data.token) {
          throw new Error('Missing session token from backend');
        }

        const fullUser = {
          ...backendUser,
          userId: correctUserId,
          picture: backendUser.avatar,
        };

        setUser(fullUser);
        setEcoPoints(backendUser.ecoPoints || 0);

        localStorage.setItem('userId', correctUserId);
        localStorage.setItem('user', JSON.stringify(fullUser));
        // Our own signed session token — NOT the raw Google credential.
        localStorage.setItem('token', res.data.token);

        const isExistingUser = backendUser.onboardingComplete === true && 
                               backendUser.carbonFootprint?.lastCalculated;

        if (isExistingUser) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        throw new Error('Login failed on backend');
      }
    } catch (error) {
      console.error('[LOGIN] Error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    alert('Google sign-in failed. Please try again.');
  };

  return (
    <>
      <style>{STYLES}</style>
      <div
        ref={ref}
        onMouseMove={handleMouse}
        className="atmos-root grain"
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          overflow: "hidden",
          background: "#050a12",
          color: "#e6f4ec",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div className="stars" />
        <div className="aurora" />

        <FloatingLeaf delay={0} x={8} y={18} size={26} duration={16} />
        <FloatingLeaf delay={2} x={90} y={24} size={20} duration={12} />
        <FloatingLeaf delay={4} x={10} y={78} size={22} duration={18} />
        <FloatingLeaf delay={1.5} x={92} y={82} size={24} duration={15} />
        <FloatingLeaf delay={3} x={50} y={8} size={18} duration={20} />

        <motion.div
          style={{
            rotateX: rx, rotateY: ry,
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <Earth3D />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420 }}
        >
          <div className="glass" style={{ borderRadius: 24, padding: "28px 24px", textAlign: "center" }}>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 140 }}
              style={{ position: "relative", display: "inline-flex", marginBottom: 16 }}
            >
              <div
                style={{
                  position: "relative", width: 64, height: 64, borderRadius: 18,
                  background: "linear-gradient(135deg, #6ee7b7, #34d399, #67e8f9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Leaf size={32} color="#050a12" strokeWidth={2.2} />
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 18,
                  background: "#34d399", filter: "blur(28px)", opacity: 0.5, zIndex: -1,
                }} />
                <div className="pulse-ring" style={{ borderRadius: 18 }} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16,
                padding: "4px 14px", borderRadius: 999,
                background: "rgba(52, 211, 153, 0.1)",
                boxShadow: "inset 0 0 0 1px rgba(52, 211, 153, 0.2)",
              }}
            >
              <span style={{ position: "relative", display: "inline-flex", width: 6, height: 6 }}>
                <span className="ping" />
                <span style={{ position: "relative", width: 6, height: 6, borderRadius: 999, background: "#34d399" }} />
              </span>
              <span className="font-mono-acc" style={{
                fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#6ee7b7",
              }}>
                Live · climate intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{
                fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800,
                letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 0.95,
              }}
            >
              Atmos<span className="font-display gradient-text" style={{ fontStyle: "italic", fontWeight: 500 }}> AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{
                fontSize: 14, color: "#94a3b8", maxWidth: 320, margin: "0 auto 20px",
                lineHeight: 1.5,
              }}
            >
              Track your carbon footprint, earn eco-points, and make a real difference for the planet.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20,
              }}
            >
              {features.map(({ icon, label, color }, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: 10,
                    borderRadius: 12, background: "rgba(15, 23, 42, 0.5)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${color}55`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "inset 0 0 0 1px rgba(255,255,255,0.05)"}
                >
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span style={{ fontSize: 12, color: "#cbd5e1", textAlign: "left" }}>{label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="pill"
                logo_alignment="center"
              />
            </motion.div>

            <p style={{ marginTop: 14, fontSize: 11, color: "#64748b" }}>
              By signing in, you agree to track your carbon footprint responsibly.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="font-mono-acc"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 16, fontSize: 10, color: "#475569",
              letterSpacing: "0.2em", textTransform: "uppercase",
            }}
          >
            <span>✨</span>
            Powered by climate intelligence
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
