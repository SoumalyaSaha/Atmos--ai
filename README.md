# Atmos AI Frontend

AI-Powered Carbon Footprint Reduction Platform - React Frontend

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Chart.js
- Lucide React Icons
- Google OAuth

## Features
- Dark futuristic UI design
- Real-time carbon footprint dashboard
- AI-powered insights (Gemini 2.5 Flash)
- Sustainability challenges
- Carbon savings calculator
- Community leaderboard
- Atmos AI Chatbot
- User profiles & badges
- Responsive mobile-first design

## Deployment on Netlify

### Step 1: Install Dependencies
```bash
cd atmos-ai-frontend
npm install
```

### Step 2: Environment Variables
Create `.env` file:
```env
VITE_API_URL=https://your-railway-app.up.railway.app
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Step 3: Build
```bash
npm run build
```

### Step 4: Deploy to Netlify
1. Push to GitHub
2. Go to [Netlify](https://netlify.com)
3. "Add new site" → "Import an existing project"
4. Select your GitHub repo
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Add environment variables in Site Settings
8. Deploy!

## Development
```bash
npm run dev
```

## Project Structure
```
src/
├── components/
│   └── Layout.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Challenges.jsx
│   ├── Calculator.jsx
│   ├── Leaderboard.jsx
│   ├── Chatbot.jsx
│   └── Profile.jsx
├── utils/
│   └── api.js
├── App.jsx
├── main.jsx
└── index.css
```
