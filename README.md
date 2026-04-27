# 🏙️ CivixConnect — AI-Powered Smart City Infrastructure Ecosystem

A next-generation AI-driven smart city platform that connects citizens, infrastructure workers, corporations, and city administrators to collaboratively maintain and optimize urban environments.

CivixConnect transforms traditional civic reporting into an automated, intelligent infrastructure response pipeline.

---

## 🌐 Overview
Urban infrastructure management today suffers from several systemic problems:

* ❌ **Unverified or spam-filled** citizen reports
* 🔁 **Duplicate work orders** for identical issues
* 👁 **Poor visibility** into repair progress
* 📉 **Low citizen participation** in civic duties
* ♻️ **Disconnected** recycling and waste management markets

### ✅ The CivixConnect Solution
When a citizen submits an issue (e.g., pothole, broken light, leak):
1.  📸 **AI verifies** the image.
2.  📊 **Severity** is automatically scored.
3.  📍 **Duplicate reports** are clustered geographically.
4.  🛠 **Tasks are dispatched** to workers.
5.  🪙 **Citizens earn CleanCoins** for verified contributions.

---

## ✨ System Highlights
* **Swavi AI Triage:** Automated image analysis using Gemini Vision.
* **Severity Scoring Engine:** AI assigns a 1–10 severity rating.
* **Geospatial Deduplication:** Clusters reports within a 100m radius.
* **CleanCoin Economy:** Gamified digital rewards system.
* **Live Infrastructure Radar:** Real-time tracking of workers & vehicles.
* **Circular Resource Marketplace:** Waste materials for corporate bidding.
* **Corporate Incentives:** Discount vouchers via CleanCoins.

---

## 🧩 Key Features

### 🧍 Citizen Node
*Citizens act as distributed sensors for infrastructure.*
* 📸 Smart Infrastructure Reporting
* 🗣 Community Feed & Discussions
* ♻️ Resource Marketplace
* 🎮 Gamified Rewards (XP + CleanCoins)
* 🏆 Leaderboards

### 🛠 Worker Node (Infrastructure Teams)
*Workers receive AI-prioritized repair tasks.*
* 📡 Live Task Dispatch
* 📷 Evidence-Based Resolution
* 🗺 Route Optimization
* 📍 Live Telemetry Tracking

### 🏢 Corporate / Business Node
*Businesses contribute via sustainability initiatives.*
* ♻️ Waste Procurement Marketplace
* 🎟 Voucher Deployment
* 📊 CSR Investment Tracking

### 🏛 Command Center (Admin)
*Central operations dashboard for authorities.*
* 📊 AI Triage Dashboard
* 🛠 Infrastructure Dispatch Controls
* 🗺 City Damage Heatmaps
* 📡 Worker & Repair Monitoring

> **Note:** Only verified, high-priority issues reach administrators.

---

## 🏗 Architecture

CivixConnect follows a **modular architecture**:

```text
civixconnect/
├── backend/                  # NestJS Backend
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── gemini/
│   │   ├── civic-report/
│   │   ├── cleancoin/
│   │   ├── community/
│   │   ├── marketplace/
│   │   └── notifications/
│   └── prisma/
│       └── schema.prisma
│
└── frontend/                 # Next.js 14 Frontend
    ├── src/
    │   ├── app/
    │   │   ├── auth/
    │   │   ├── dashboard/
    │   │   └── admin/
    │   ├── components/
    │   ├── lib/
    │   └── styles/
```
---

## 🧠 AI Processing Pipeline

Every civic report follows this pipeline:

**Citizen Upload**

**↓**

**Image + GPS Metadata**

**↓**

**Gemini Vision AI**

**├── Spam Detection**

**├── Object Recognition**

**└── Severity Scoring**

**↓**

**Geospatial Clustering Engine**

**↓**

**Duplicate Detection**

**↓**

**Task Dispatch to Worker Node**

👉 Only verified, high-priority issues reach administrators.


---

## 🔐 Security & Access

### Role-Based Access Control (RBAC)
| Role | Access |
| :--- | :--- |
| **CITIZEN** | Reporting, Community, Marketplace, Rewards |
| **WORKER** | Task Management, Evidence Upload, Routing |
| **BUSINESS** | Marketplace Bidding, Voucher Creation |
| **ADMIN** | Full analytics, monitoring, dispatch |

* **Auth:** JWT Authentication
* **Security:** NestJS Guards

---

## 📦 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, React, Tailwind CSS, Leaflet.js |
| **Backend** | NestJS, Prisma ORM, PostgreSQL |
| **AI** | Google Gemini Vision API, Geospatial Clustering |
| **Security** | JWT, Role-Based Guards |

---

## 📊 Future Roadmap
* 🤖 AI Damage Prediction Models
* 🚁 Drone Infrastructure Inspection
* 🌐 IoT Sensor Integration
* 📈 Predictive Maintenance Engine
* 📱 Mobile Apps (iOS / Android)
* 🔗 Blockchain-based Rewards Ledger

---

## 🌟 Conclusion
CivixConnect reimagines how cities function by turning passive infrastructure into an active, intelligent ecosystem. By combining **AI-driven decision-making**, **geospatial intelligence**, and a **gamified participation model**, it builds a real-time feedback loop where every stakeholder benefits while collectively improving the city.

>**CivixConnect is the operating system for future cities.**
---
