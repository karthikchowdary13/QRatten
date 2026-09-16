<h1 align="center">🛡️ QRatten</h1>

<p align="center">
  <em>Presence Verified. Future Defined.</em>
</p>

---

## 🌟 Overview

QRatten is a cloud-based QR attendance management platform designed for educational institutions.

It replaces outdated paper registers and unreliable attendance portals with a secure, real-time, offline-capable attendance system built for real classroom environments.

---

## 🎯 Why QRatten Exists

Traditional attendance systems suffer from major limitations:

* Teachers waste valuable class time calling roll
* Students exploit static QR codes through screenshots
* Legacy attendance portals are outdated and unreliable
* Most systems fail when internet connectivity drops

QRatten addresses these issues through a modern attendance architecture built for reliability, security, and usability.

---

## ⚡ Core Features

### 🔄 Dynamic Rotating QR Attendance

Teachers generate live QR codes for attendance sessions.
QR codes rotate every **30 seconds** to prevent sharing and misuse.

---

### 🛡 Anti-Proxy Protection

Each attendance token is:

* Single-use
* Time-limited
* Device validated
* Redis cache verified

---

### 📡 Offline-First Synchronization

Attendance scans made without internet are:

* Stored locally
* Queued automatically
* Synced when connectivity returns

---

### 👥 Multi-Role Platform

Dedicated dashboards for:

* **Students** – Attendance stats, shortage alerts, streak tracking
* **Teachers** – Live attendance feed, QR generation
* **Admins** – Reports, analytics, and user management

---

## 🏗 System Architecture

```text id="cf3luu"
Student Device
    ↓ Scan QR
Frontend (Next.js)
    ↓ API Request
Backend (FastAPI)
    ↓ Token Validation
Redis Cache
    ↓ Attendance Storage
PostgreSQL Database
```

---

## 🛠 Tech Stack

### Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* Zustand
* TanStack Query
* Recharts
* qrcode.react
* react-qr-scanner

---

### Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Redis
* JWT Authentication
* Passlib / bcrypt
* Uvicorn

---

### Deployment

* Vercel — Frontend Hosting
* Render — Backend API Hosting

---

## 📂 Project Structure

```bash id="m7lb25"
QRatten/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── store/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   └── utils/
```

---

## 🔐 Environment Variables

QRatten uses environment-based configuration for:

* Database connectivity
* Redis caching
* JWT authentication
* AWS deployment credentials
* Frontend API integration

Create the required environment files in the backend and frontend directories based on your local or deployment setup.

---

## 👨‍🎓 User Roles

### Student

* Scan QR for attendance
* Track attendance percentage
* View shortage alerts
* Monitor attendance streaks

---

### Teacher

* Start attendance sessions
* Generate rotating QR codes
* Monitor live attendance feed
* Track absentee patterns

---

### Admin

* Manage users
* View institution-wide reports
* Analyze attendance data
* Monitor suspicious activity

---

## 🌐 Live Demo
* **Frontend Application:** https://qrattenapp.vercel.app
* **Backend API:** https://qratten-backend.onrender.com
* **API Documentation:** https://qratten-backend.onrender.com/docs

---

## 🔮 Planned Roadmap

* Parent Portal
* Employee Attendance Module
* Native Mobile Application
* Predictive Attendance Analytics
* Face Verification Layer

---

## 👨‍💻 About

Built by **Karthik Ethamukkala**

QRatten began as a college project and evolved into a production-style engineering project focused on solving real attendance management problems in educational institutions.

---

## ⭐ Support

If you found this project interesting:

* Star the repository
* Fork it
* Share feedback or suggestions

---

<p align="center">
  <strong>QRatten — Presence Verified. Future Defined.</strong>
</p>

