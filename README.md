🏙️ CivixConnect — AI-Powered Smart City Infrastructure Ecosystem








A next-generation AI-driven smart city platform that connects citizens, infrastructure workers, corporations, and city administrators to collaboratively maintain and optimize urban environments.

CivixConnect transforms traditional civic reporting into an automated, intelligent infrastructure response pipeline using:

AI Visual Triage (Gemini AI)

Geospatial clustering for duplicate prevention

Gamified civic engagement via CleanCoin

Real-time infrastructure tracking

Corporate sustainability incentives

The system converts fragmented infrastructure complaints into a coordinated digital city maintenance network.

🚀 Table of Contents

🌐 Overview

✨ System Highlights

🧩 Key Features

🏗 Architecture

🧠 AI Processing Pipeline

🔐 Role-Based Access Control

🗄 Database Models

📦 Tech Stack

📂 Project Structure

🛠 Installation Guide

▶ Running the Project Locally

🌍 API Endpoints Overview

⚙ Environment Variables

📊 Future Roadmap

🤝 Contributing

📜 License

🌐 Overview

Urban infrastructure management today suffers from several systemic problems:

• Unverified or spam-filled citizen reports
• Duplicate work orders for identical issues
• Poor visibility into repair progress
• Low citizen participation in civic duties
• Disconnected recycling and waste management markets

CivixConnect solves these challenges using AI-driven automation and gamified participation.

When a citizen submits an issue (pothole, broken light, leak):

1️⃣ AI verifies the image
2️⃣ Severity is automatically scored
3️⃣ Duplicate reports are clustered geographically
4️⃣ Tasks are dispatched to workers
5️⃣ Citizens earn CleanCoins for verified contributions

This creates a self-reinforcing civic ecosystem where citizens, workers, corporations, and administrators collaborate through one platform.

✨ System Highlights

✔ Swavi AI Triage
Automated image analysis using Gemini Vision to detect infrastructure anomalies.

✔ Severity Scoring Engine
AI assigns a 1–10 severity rating based on visual damage indicators.

✔ Geospatial Deduplication
AI clusters reports within 100m radius to prevent duplicate repair tickets.

✔ CleanCoin Civic Economy
Gamified digital rewards for verified reports and civic actions.

✔ Live Infrastructure Radar
Track city maintenance vehicles and worker dispatch in real time.

✔ Circular Resource Marketplace
Waste materials can be listed for corporate bidding and recycling procurement.

✔ Corporate Incentive System
Businesses deploy discount vouchers redeemable via CleanCoins.

🧩 Key Features
🧍 Citizen Node

Citizens act as distributed sensors for city infrastructure.

Features:

• Smart Infrastructure Reporting
Upload geotagged photos of infrastructure issues.

• CivixConnect Community Feed
Share updates, vote on polls, and interact with local civic discussions.

• Resource Marketplace
List recyclable materials for corporate procurement.

• Gamified Rewards System
Earn XP + CleanCoins for valid reports.

• Leaderboard System
Top contributors receive recognition and incentives.

🛠 Worker Node (Infrastructure Teams)

Workers receive AI-prioritized repair tasks.

Capabilities:

• Live Task Dispatch
Nearby workers receive AI-prioritized tickets.

• Evidence-Based Resolution
Workers upload post-repair images for verification.

• Route Optimization
Tasks assigned based on geospatial proximity.

• Live Telemetry
Active worker locations displayed on city command radar.

🏢 Corporate / Business Node

Corporations participate through sustainability and CSR engagement.

Capabilities:

• Waste Procurement Marketplace
Bid on recyclable material listings.

• Voucher Deployment
Issue discount vouchers redeemable through CleanCoins.

• CSR Investment Tracking
Allocate funds toward city initiatives.

🏛 Command Center (Admin)

The central operations dashboard for city authorities.

Features:

• AI Triage Dashboard
Sort issues by severity score, location, and status.

• Infrastructure Dispatch Controls
Assign tasks directly to maintenance teams.

• City Damage Heatmaps
Geospatial analytics highlighting infrastructure stress zones.

• Network Monitoring
Track worker locations and ongoing repairs.

🏗 Architecture

CivixConnect follows a modular monorepo architecture.

civixconnect/
│
├── backend/                     # NestJS Backend
│   ├── src/
│   │   ├── auth/                # Authentication & JWT
│   │   ├── users/               # User management
│   │   ├── gemini/              # AI vision processing
│   │   ├── civic-report/        # Infrastructure reporting
│   │   ├── cleancoin/           # Rewards & token economy
│   │   ├── community/           # Social hub & posts
│   │   ├── marketplace/         # Waste listing & bidding
│   │   └── notifications/       # Real-time alerts
│   │
│   └── prisma/
│       └── schema.prisma
│
└── frontend/                    # Next.js 14 Frontend
    ├── src/
    │   ├── app/
    │   │   ├── auth/
    │   │   ├── dashboard/
    │   │   └── admin/
    │   │
    │   ├── components/
    │   ├── lib/
    │   └── styles/
🧠 AI Processing Pipeline

Every civic report goes through an AI verification pipeline.

Citizen Upload
      │
      ▼
Image + GPS Metadata
      │
      ▼
Gemini Vision AI
      │
      ├── Spam Detection
      ├── Object Recognition
      └── Damage Severity Scoring
      │
      ▼
Geospatial Clustering Engine
      │
      ▼
Duplicate Detection
      │
      ▼
Task Dispatch to Worker Node

AI ensures that administrators only see verified, high-priority issues.

🔐 Role-Based Access Control
Role	Access
CITIZEN	AI Reporting, Community Feed, Marketplace, Rewards
WORKER	Task Management, Evidence Upload, Routing
BUSINESS	Marketplace Bidding, Voucher Creation
ADMIN	Full system analytics and dispatch

RBAC is enforced through JWT authentication and NestJS guards.

🗄 Database Models

Core Prisma entities:

User
CivicReport
CommunityPost
WasteListing
WasteBid
CleanCoinTransaction
Voucher
Notification
WorkerTelemetry

Database: PostgreSQL

ORM: Prisma

📦 Tech Stack
Frontend

Next.js 14

React

Tailwind CSS

Leaflet.js (Maps)

Backend

NestJS

Prisma ORM

PostgreSQL

AI & Intelligence

Google Gemini Vision API

Geospatial clustering algorithms

Authentication

JWT

Role-based access guards

📂 Project Structure
backend/
  src/
    modules/
    controllers/
    services/
    dto/
    guards/

frontend/
  src/
    app/
    components/
    hooks/
    lib/
🛠 Installation Guide
Prerequisites

Ensure the following are installed:

Node.js 18+

PostgreSQL

npm or yarn

Google Gemini API Key

▶ Running the Project Locally
1️⃣ Backend Setup
cd backend

npm install

cp .env.example .env

Configure .env:

DATABASE_URL=postgresql://user:password@localhost:5432/civixconnect
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=supersecret

Run migrations:

npx prisma migrate dev --name init

Start server:

npm run start:dev
2️⃣ Frontend Setup
cd frontend

npm install

cp .env.example .env.local

npm run dev
🌍 Running Services
Service	URL
Backend API	http://localhost:3000

Frontend App	http://localhost:3001

Prisma Studio	http://localhost:5555
🌍 API Endpoints Overview
Authentication
POST /auth/login
POST /auth/register
GET  /users/me
Civic Reporting
POST /civic-report
GET  /civic-report
POST /civic-report/:id/admin/working
Community
POST /community/post
GET  /community/feed
Marketplace
GET  /marketplace/listings
POST /marketplace/list
POST /marketplace/bid
CleanCoin Economy
GET  /cleancoin/balance
POST /cleancoin/vouchers/:id/claim
⚙ Environment Variables

Example .env

DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
PORT=3000
📊 Future Roadmap

Planned features for upcoming releases:

• AI Damage Prediction Models
• Drone Infrastructure Inspection Integration
• IoT Sensor Integration
• Predictive Maintenance Engine
• Mobile Apps (iOS / Android)
• Blockchain-based civic rewards ledger

🤝 Contributing

Contributions are welcome.

Fork the repository

Create a feature branch

git checkout -b feature/amazing-feature

Commit your changes

git commit -m "Add amazing feature"

Push to branch

git push origin feature/amazing-feature

Open a Pull Request

📜 License

Distributed under the MIT License.

See LICENSE for more information.

💡 CivixConnect represents a new paradigm for collaborative city governance — where citizens, infrastructure systems, and AI work together to build smarter, cleaner urban environments.
