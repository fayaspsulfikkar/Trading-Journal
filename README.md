# 📈 Pro Trading Journal

![Trading Journal Banner](https://img.shields.io/badge/Status-Active-success.svg) ![License](https://img.shields.io/badge/License-MIT-blue.svg) ![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-Backend-green.svg?logo=nodedotjs) 

A comprehensive, full-stack trading journal web application engineered for forex traders, specifically optimized for tracking **The 5%ers** prop firm evaluation metrics.

## ✨ Features

- **Automated Rule Enforcement**: Hardcoded logic for strict risk validation (1:2 R:R minimum) and daily trade limits (Max 3 trades/day).
- **Simulated AI Coach**: Real-time feedback engine that grades your trades (A through D) based on entry logic, risk management, and emotional state—using dynamic mock analysis (or customizable OpenAI integration).
- **Real-Time Risk Management**: Dashboard visualizes a `$5,000 EURUSD` simulated account balance, with dynamic progress rings tracking your Phase 1 profit target (`$400`) and Daily Loss Limit (`$250`).
- **Safety Banners**: Implements multi-tier visual warnings (Yellow caution, Red Stop) to prevent account blowouts and overtrading.
- **Advanced Analytics**: Visual performance charting via `recharts` for tracking win rates, profit factors, and historical balance trajectories.
- **Daily Reflection Journal**: Pre-market and post-market text capturing module to index psychological states and macroeconomic biases.

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)**
- **Tailwind CSS v4** (Dark Theme First & Mobile Responsive)
- **Lucide Icons**
- **Recharts** (Interactive charting)

### Backend
- **Node.js + Express**
- **SQLite3** (Lightweight, robust persistent storage)
- **CORS & Dotenv**

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fayaspsulfikkar/Trading-Journal.git
   cd Trading-Journal
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   # The SQLite database will automatically initialize on the first run
   node server.js
   ```
   *The backend will run on `http://localhost:3001`.*

3. **Setup the Frontend:**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

## 🧠 OpenAI Integration (Optional)
The backend `ai_service.js` is built to seamlessly integrate with real ChatGPT feedback APIs. To unlock this:
1. Create a `.env` file inside the `/backend` directory.
2. Add your key: `OPENAI_API_KEY=your_key_here`
3. Restart the backend server. The app will automatically switch from simulated logic to advanced LLM-graded coaching.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
