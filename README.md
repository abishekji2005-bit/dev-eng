# Micro-Mentorship & Code Review Marketplace

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%20%2F%20React-blue.svg)](#)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20%2F%20PostgreSQL-green.svg)](#)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-purple.svg)](#)
[![AI Integration](https://img.shields.io/badge/AI-Groq%20%2F%20Llama%203.3-orange.svg)](#)

An internal peer-to-peer collaboration platform designed to eliminate code review bottlenecks, foster cross-team knowledge sharing, and streamline developer onboarding. By bridging developers requesting assistance with engineers ready to mentor, this marketplace makes engineering support visible and trackable.

A full-stack internal collaboration platform that enables developers to request mentorship or code reviews while allowing engineers to browse, claim, and resolve requests efficiently.

The platform is designed to improve:

Cross-team knowledge sharing
Engineering collaboration
Developer onboarding
Review turnaround time
Internal mentorship workflows

Built with modern scalable architecture using React, Express.js, Supabase, Clerk Authentication, and AI-powered workflows.

🚀 Features
Core Features
Create mentorship requests
Create code review requests
Technology tag filtering
Claim/open workflow system
Progress timeline tracking
Threaded discussions/comments
Role-based onboarding
Developer & Engineer dashboards
Authentication & protected APIs
🤖 AI Features
✨ AI Tag Suggestions

Automatically generates relevant technology tags from the request title and description.

🔍 AI Semantic Search

Users can search naturally like:

“Need help with PostgreSQL optimization”

The AI extracts relevant technologies and returns matching requests.

💬 AI Assistant

Persistent AI chat assistant powered by Groq + Llama 3.3.

🏗️ Tech Stack
Layer	Technology
Frontend	React 18 + Vite
Styling	Tailwind CSS
Backend	Node.js + Express.js
Database	Supabase PostgreSQL
Authentication	Clerk
AI Layer	Groq API (Llama 3.3)
Hosting	Vercel + Render
Routing	React Router v6
📂 Project Structure
micro-mentorship/
│
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── supabase.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── schema.sql
├── README.md
└── .gitignore
⚙️ System Architecture
🗄️ Database Design
Main Tables
profiles
requests
claims
tags
request_tags
comments
progress_updates
🔐 Authentication Flow
Clerk manages authentication
JWT tokens are sent to backend APIs
Express middleware verifies tokens
Protected routes require valid sessions
📡 API Endpoints
Profile Routes
GET    /api/profile
PUT    /api/profile
POST   /api/profile/sync
Request Routes
GET     /api/requests
POST    /api/requests
PUT     /api/requests/:id
DELETE  /api/requests/:id
Collaboration Routes
POST   /api/requests/:id/claim
POST   /api/requests/:id/comments
POST   /api/requests/:id/progress
PATCH  /api/requests/:id/status
AI Routes
POST   /api/ai/suggest-tags
POST   /api/ai/search-tags
POST   /api/ai/chat
🛠️ Installation
1. Clone Repository
git clone https://github.com/your-username/micro-mentorship.git

cd micro-mentorship
🧩 Backend Setup
cd backend

npm install

Create .env

PORT=3001

FRONTEND_URL=http://localhost:5173

SUPABASE_URL=your_supabase_url

SUPABASE_SERVICE_KEY=your_service_key

SUPABASE_ANON_KEY=your_anon_key

CLERK_SECRET_KEY=your_clerk_secret_key

GROQ_API_KEY=your_groq_api_key

Run backend:

npm run dev
🎨 Frontend Setup
cd frontend

npm install

Create .env

VITE_API_URL=http://localhost:3001

VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Run frontend:

npm run dev
🗃️ Supabase Setup
Create a new Supabase project
Open SQL Editor
Paste contents of schema.sql
Run the query
Tables & policies will be created automatically
🧠 AI Workflow
AI Suggest Tags

Input:

{
  "title": "Need help optimizing queries",
  "description": "PostgreSQL sequential scans issue"
}

Output:

[
  "PostgreSQL",
  "Performance",
  "Database"
]
👨‍💻 User Roles
Developer
Create requests
Add descriptions
Track progress
Collaborate with engineers
Engineer
Browse requests
Claim tasks
Provide mentorship
Update progress timeline
🎯 UI Highlights
Dark modern engineering theme
Responsive layouts
Clean dashboard workflows
Minimal low-density design
Fast navigation
🚀 Deployment
Frontend Deployment

Deploy using:

Vercel
Netlify

Build directory:

frontend/
Backend Deployment

Deploy using:

Render
Railway
Heroku
🔒 Security
Clerk JWT verification
Protected API middleware
Row Level Security (Supabase)
Input validation & sanitization
📈 Scalability
Modular architecture
Separated frontend/backend
Indexed PostgreSQL tables
AI abstraction layer
Ready for real-time extensions
🔮 Future Improvements
GitHub PR integrations
Real-time collaboration
AI skill matching
Notification system
WebSocket support
Advanced analytics dashboard
🤝 Contributing
# Fork repository

# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "Add amazing feature"

# Push branch
git push origin feature/amazing-feature

Open a Pull Request 🚀

🧠 Prompt Engineering & Development Process

This project was built using advanced AI-assisted development workflows leveraging both Claude AI and ChatGPT for architecture planning, backend generation, UI structuring, debugging, API workflow design, and AI integration strategies.

Development Prompts Used
Claude Conversation Reference
ChatGPT Conversation Reference
AI-Assisted Development Areas

The prompts were used to accelerate and optimize:

Full-stack application architecture
REST API generation
Supabase schema design
Clerk authentication integration
AI-powered semantic search
Tag extraction workflows
Frontend component structuring
Tailwind UI optimization
Express middleware setup
Production-ready folder organization
Security and scalability planning
Deployment workflows
Prompt Engineering Strategy

The application was developed using:

Chain-of-Thought (CoT) prompting
System-design prompting
Role-based prompting
Iterative refinement prompting
Context-aware debugging workflows
Architecture-first planning prompts
AI Models & Platforms
Platform	Usage
Claude AI	System design, backend architecture, optimization
ChatGPT	UI workflows, debugging, README generation, AI integrations
Development Philosophy

Rather than using AI purely for code generation, the project followed an engineering-oriented workflow where AI was used as:

A system architect
A debugging assistant
A technical documentation generator
A rapid prototyping collaborator
A scalability advisor

This enabled faster iteration cycles while maintaining modular architecture and production-ready code quality.

👨‍💻 Author

Developed by Abishek S

⭐ Support

If you like this project:

Star the repository
Fork the project
Contribute improvements

