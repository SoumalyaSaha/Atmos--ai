<div align="center">

# 🌱 Atmos AI

### *Your Personal AI-Powered Carbon Footprint Tracker*

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://atmos-aicarbon.vercel.app)
[![React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

**🌐 [Live Demo → https://atmos-aicarbon.vercel.app](https://atmos-aicarbon.vercel.app/)**

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📸 App Preview

<div align="center">

| 🏠 Landing UI | 📊 Comparison Dashboard | 🎯 Sustainability Challenges | 🏆 Community Rankings |
|:---:|:---:|:---:|:---:|
| <img src="IMG-20260623-WA0004.jpg" width="220" /> | <img src="Screenshot_2026-06-23-14-31-44-40_99c04817c0de5652397fc8b56c3b3817.jpg" width="220" /> | <img src="Screenshot_2026-06-23-14-32-14-54_99c04817c0de5652397fc8b56c3b3817.jpg" width="220" /> | <img src="Screenshot_2026-06-23-14-31-50-05_99c04817c0de5652397fc8b56c3b3817.jpg" width="220" /> |

</div>

---

## ✨ Core Technical Innovations

### ⚡ 1. Privacy-First, Edge-Computing Architecture
Instead of routing processing loops continuously to high-latency cloud servers, Atmos AI features an **offline-first local execution model**.
* **Instant Calibration:** The on-device engine instantly handles footprint calculations based on India's official national baseline emission factors.
* **Green Computing:** Minimizing continuous server-side calculations significantly reduces the digital carbon overhead of the app itself.
* **Data Security:** Core user behavioral telemetry data stays fully encrypted at the edge until explicitly synced with the remote cloud database.

### 🧠 2. Multi-LLM Hybrid Routing & Intelligent Caching
The application backend is built to overcome standard production limits regarding heavy AI usage and operating costs:
* **Dynamic API Rotation:** Features a custom load-balancing array that intelligently cycles requests across **4 Gemini API keys** and **3 Groq API keys** concurrently to ensure continuous availability and fault tolerance.
* **MongoDB Caching Layer:** Repetitive or standard environmental analysis queries are instantly caught and served by a high-efficiency MongoDB lookup layer, bypassing external API delays and cutting overhead by up to 60%.

### 🎮 3. Algorithmic Engagement, Streak Mechanics & Live Progress Tracking
Atmos AI abandons boring, static logs for an active, automated behavioral correction loop:
* **Dynamic Difficulty Adjustment (DDA):** As the platform notes a sustained drop in a user's carbon footprint, a backend algorithm automatically scales up the depth and complexity of daily tasks to maintain optimal user engagement.
* **Granular Progress Tracking & Analytics:** Features real-time state machine tracking for task status updates (`Available`, `In Progress`, `Completed`). It computes active check-ins, rendering visual progress bars and exact completion percentages on the frontend to provide immediate psychological validation.
* **3-Day Streak Unlock State:** A core programmatic state-management system gatekeeps premier progression rewards, explicitly engineered to optimize Daily Active Users (DAU) and establish recurring habits.

---

## 🚀 Key Functional Features

### 🔐 Seamless Authentication
- **Google OAuth 2.0** integrated with secure JWT token handshakes.
- Returning users bypass onboarding configurations completely, loading state-cached dashboard metrics instantly.

### 📊 Samsung Health-Inspired Comparison Dashboard
- **Peer-Group Analytics:** Clear comparison modules highlighting individual metrics against regional age groups, national baselines, and global averages.
- **Native UI Design:** Formatted to mirror the intuitive, high-engagement layout mechanics found across premium healthcare platforms like **Samsung Health**.

### 🎯 Gamified Challenge Execution Engine
- **Categorized Progression Loops:** Dynamic daily objectives organized across targeted impact fields—*Transport*, *Energy*, *Food*, *Waste*, *Water*, and *Shopping*.
- **Quantitative Reward Tracking:** Displays exact potential carbon savings per task (e.g., `300g CO2e per year/kg`) alongside interactive point triggers that dynamically increment profile levels and unlock community leaderboard progression.

### 🤖 AI Insights & Conversational Assistant
- Contextual summaries compiled instantly by **Gemini 2.5 Flash** reading user footprint data directly.
- Quick-action interactive prompt chips allow simple, one-tap strategy inquiries.

---

## 🔮 Roadmap: Native Samsung Ecosystem Integration

Atmos AI’s backend layers are uniquely architected to natively interface with the broader Samsung ecosystem:

1. **Samsung Health SDK Integration:** Direct ingestion of passive background step-counts, running telemetry, and active workout logs via the **Samsung Galaxy Watch** series to dynamically update transportation offsets without requiring any manual entry.
2. **SmartThings IoT Smart Home Sync:** Native hookup to the **Samsung SmartThings** framework to monitor real-time energy profiles of linked smart appliances (HVAC, smart washing machines, refrigerators), serving up immediate AI-driven power-efficiency configurations.

---

## 🏗️ System Architecture

### Authentication Flow


```

┌─────────────────┐
│  Google Sign In  │
│  (same account) │
└────────┬────────┘
│
▼
┌─────────────────┐
│  JWT decoded    │
│  googleId = "123"│

└────────┬────────┘
│
▼
┌─────────────────────────┐
│  POST /api/auth/login   │
│  body: { googleId: "123" } │
└────────┬────────────────┘
│
▼
┌─────────────────────────────┐
│  User.findOne({ googleId: "123" }) │
│  → FOUND in MongoDB!         │
└────────┬────────────────────┘
│
▼
┌─────────────────────────────┐
│  existingUser = true          │
│  isNewUser = false            │
│  Returns onboardingComplete: true │
│  Returns carbonFootprint data   │
│  Returns activeChallenges     │
└────────┬────────────────────┘
│
▼
┌─────────────────────────────┐
│  Login.jsx receives response │
│  isExistingUser = true        │
│  navigate('/dashboard')       │  ← SKIPS ONBOARDING
└─────────────────────────────┘

```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database / Cache** | MongoDB (Mongoose ODM) |
| **Authentication** | Google OAuth 2.0 + JWT |
| **AI Processing Engine** | Hybrid Array (Gemini 2.5 Flash + Groq API) |
| **Visual Analytics** | Chart.js |
| **Deployments** | Vercel (Client App) + Railway (Backend Microservice) |

---

## ⚙️ Getting Started & Local Installation

### Prerequisites
* **Node.js** `>= 18.0.0` installed locally
* **npm** (Node Package Manager)
* A local **MongoDB** instance or a cloud **MongoDB Atlas** database URI connection

### Step 1: Clone & Dependency Installation

```bash
# Clone the repository
git clone [https://github.com/yourusername/atmos-ai.git](https://github.com/yourusername/atmos-ai.git)
cd atmos-ai

# Navigate into client and run npm installation
cd client
npm install

# Navigate into server and run npm installation
cd ../server
npm install

```

### Step 2: Environment Setup

Create an `.env` config file in both your `/client` and `/server` root directories:

**Client Variables (`client/.env`)**

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_API_URL=http://localhost:5000/api

```

**Server Variables (`server/.env`)**

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GEMINI_API_KEY=your_gemini_api_key_primary
# Backend automatically triggers load-balancing arrays across standard rotation routes

```

### Step 3: Running Environments Locally

Open two matching terminals from your repository root directory:

**Terminal A (Start Backend Engine):**

```bash
cd server
npm run dev

```

**Terminal B (Start Frontend Interface):**

```bash
cd client
npm run dev

```

The local environment routing will automatically orchestrate and present the client module on `http://localhost:5173`.

---

## 📁 Project Structure

```
atmos-ai/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/           # Dashboard widgets & charts
│   │   │   ├── Leaderboard/         # Comparison & ranking UI
│   │   │   ├── AIChat/              # Atmos Assistant chat interface
│   │   │   ├── Profile/             # User profile, challenges, settings
│   │   │   ├── Onboarding/          # Age input & welcome flow
│   │   │   ├── Navigation/          # Sidebar & bottom nav
│   │   │   └── common/              # Reusable UI components
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state & Google OAuth
│   │   │   └── ThemeContext.jsx     # Dark/light mode management
│   │   ├── hooks/
│   │   │   ├── useCarbonData.js     # Fetch & manage footprint data
│   │   │   ├── useChallenges.js     # Challenge progress & streaks
│   │   │   └── useAIChat.js         # Gemini API integration
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Google Sign-In handler
│   │   │   ├── Dashboard.jsx        # Main dashboard view
│   │   │   ├── Leaderboard.jsx      # Community comparisons
│   │   │   ├── AIChat.jsx           # AI assistant page
│   │   │   ├── Profile.jsx          # Profile & settings
│   │   │   └── Onboarding.jsx       # First-time user flow
│   │   └── utils/
│   │       └── api.js               # Axios instance & API helpers
│   └── public/
│
├── server/                          # Node.js Backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Login, JWT, user lookup
│   │   ├── carbonController.js      # Footprint CRUD & calculations
│   │   ├── challengeController.js   # Challenge generation & tracking
│   │   ├── leaderboardController.js # Aggregated stats & rankings
│   │   └── aiController.js          # Gemini API proxy & prompts
│   ├── models/
│   │   ├── User.js                  # User schema (googleId, profile)
│   │   ├── CarbonFootprint.js       # Emission data schema
│   │   ├── Challenge.js             # Challenge schema & progress
│   │   └── ActivityLog.js           # Streak & activity tracking
│   ├── routes/
│   │   ├── auth.js
│   │   ├── carbon.js
│   │   ├── challenges.js
│   │   ├── leaderboard.js
│   │   └── ai.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   └── errorHandler.js
│   └── utils/
│   │   └── geminiPrompts.js         # AI prompt templates
│
└── README.md

```

---

## 🌐 API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Google OAuth login/registration |
| `GET` | `/api/auth/me` | Get current user profile |

### Carbon Footprint

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/carbon` | Get user's carbon data |
| `POST` | `/api/carbon/calculate` | Submit new footprint calculation |
| `GET` | `/api/carbon/breakdown` | Get sector-wise breakdown |

### Challenges & Streaks

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/challenges` | Get active challenges |
| `POST` | `/api/challenges/checkin` | Check in to a challenge |
| `GET` | `/api/challenges/streak` | Get current streak info |

### Leaderboard & Analytics

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/leaderboard/compare` | Compare with age group/country/world baselines |
| `GET` | `/api/leaderboard/rankings` | Get global community rankings |

### AI Core Microservice

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/ai/chat` | Send transaction prompt to Atmos Assistant |
| `GET` | `/api/ai/insights` | Run aggregated analysis engine over user profile |

---

## 🙏 Acknowledgments

* [Google Gemini](https://deepmind.google/technologies/gemini/) for the AI engine
* [Chart.js](https://www.chartjs.org/) for beautiful data visualization
* [Framer Motion](https://www.framer.com/motion/) for smooth animations
* [Lucide](https://lucide.dev/) for crisp, modern icons
* [Vercel](https://vercel.com/) for seamless deployment
* [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database hosting

---

### 🌍 *Every small action counts. Track it. Reduce it. Offset it.*

**[🌐 Live Demo](https://atmos-aicarbon.vercel.app/)** · **[⬆ Back to Top](https://www.google.com/search?q=%23-atmos-ai)**
