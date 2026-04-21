# ECHO: Life Orchestrator 🧠⚡️

**ECHO** is a high-performance personal operating system designed to align your daily tasks with your cognitive energy levels. Unlike static task managers, ECHO uses predictive logic and AI-driven behavioral insights to optimize your focus windows and drive meaningful momentum.

---

## 🚀 Key Features

### 1. **Predictive Energy Matching**
Every task you create is tagged with an energy intensity (Low, Medium, High). ECHO's AI engine analyzes your behavioral history to predict your peak performance windows and suggests the right task at the right time.

### 2. **Intelligence Interface (Momentum Actions)**
Stuck in a rut? Use the **Intelligence Interface** to describe your current state. ECHO will synthesize a "Momentum Action"—a tiny, frictionless step designed to break inertia and get you back into a flow state.

### 3. **High-Fidelity Task Hub**
A categorized, prioritized registry for your intents. 
- **Categorization**: Organize by Work, Personal, Research, and more.
- **Priority Logic**: Direct visual cues for high-stakes tasks.
- **Cloud Sync**: Real-time persistence powered by Firebase.

### 4. **Biometric Energy Tracking**
Visualizes your observed cognitive curve based on task completion patterns and energy logs, helping you understand when you are truly most productive.

### 5. **Elite SaaS UX**
- **Collapsible Sidebar**: Modern navigation for a distraction-free environment.
- **Daily Momentum**: Real-time progress tracking to visualize your consistency.
- **Secure Architecture**: Thematic dark-mode widgets for security audits and identity protection.

---

## 🛠 Tech Stack

- **Frontend**: React 18+, Vite, Tailwind CSS
- **Animations**: Framer Motion
- **Backend / DB**: Firebase Firestore
- **Authentication**: Firebase Google Auth
- **AI Engine**: Google Gemini (via `@google/genai`)
- **Icons**: Lucide React

---

## ⚙️ Setup & Configuration

### Environment Variables
Configure the following variables in your local `.env` file (see `.env.example` for templates):

- `GEMINI_API_KEY`: Required for predictive insights and momentum actions.
- `APP_URL`: The hosted URL of your ECHO instance.

### Firebase Integration
ECHO requires a Firebase project for data synchronization. The application looks for configuration in:
- `firebase-applet-config.json`
- `firebase-blueprint.json` (Database schema IR)

---

## 📖 User Manual

1. **Synchronize Identity**: Log in via Google to create your secure cloud vault.
2. **Commit Intents**: Use the Task Hub to define tasks, assigning them an **Energy** level and **Priority**.
3. **Check the Dashboard**: View your AI-generated behavioral nudges and energy curve.
4. **Follow the Highlight**: Tasks highlighted as "AI Recommendation" are those best suited for your current energy window.
5. **Calibrate**: Use the Intelligence Interface whenever you feel your momentum dipping.

---

## 🛡 Security & Privacy
ECHO is built with data isolation in mind. Your biometric orchestrations and task history are stored in a dedicated Firestore shard, accessible only via authenticated multi-factor authorization.

---

*“ECHO isn't just about doing more; it's about doing what matters at the right time.”*
