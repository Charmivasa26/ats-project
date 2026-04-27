# ATS - Mekanism Technologies
## Internal Applicant Tracking System

A simple CRUD-based ATS built with React, Node.js (Express), and MongoDB.

---

## 📁 Folder Structure

```
ats-project/
├── backend/
│   ├── controllers/
│   │   ├── vendorController.js
│   │   ├── jobController.js
│   │   └── candidateController.js
│   ├── models/
│   │   ├── Vendor.js
│   │   ├── Job.js
│   │   └── Candidate.js
│   ├── routes/
│   │   ├── vendorRoutes.js
│   │   ├── jobRoutes.js
│   │   └── candidateRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── VendorsPage.js
    │   │   ├── JobsPage.js
    │   │   └── CandidatesPage.js
    │   ├── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure you have these installed:
- **Node.js** (v16 or above) → https://nodejs.org
- **MongoDB** (Community Edition) → https://www.mongodb.com/try/download/community
- **npm** (comes with Node.js)

---

## 🚀 Setup Instructions

### Step 1: Start MongoDB

#### On Windows:
```bash
net start MongoDB
```
#### On Mac/Linux:
```bash
mongod --dbpath /data/db
```
Or if using MongoDB as a service:
```bash
sudo systemctl start mongod
```

---

### Step 2: Setup Backend

Open a terminal and run:

```bash
# Go to backend folder
cd ats-project/backend

# Install dependencies
npm install

# Start the backend server
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

The backend runs at: **http://localhost:5000**

---

### Step 3: Setup Frontend

Open a **new terminal** and run:

```bash
# Go to frontend folder
cd ats-project/frontend

# Install dependencies
npm install

# Start the React app
npm start
```

The frontend opens at: **http://localhost:3000**

---

## 🌐 API Endpoints

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vendors | Get all vendors |
| POST | /api/vendors | Add a vendor |
| DELETE | /api/vendors/:id | Delete a vendor |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | Get all jobs |
| POST | /api/jobs | Create a job |
| PATCH | /api/jobs/:id/status | Toggle Open/Closed |
| DELETE | /api/jobs/:id | Delete a job |

### Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/candidates | Get all candidates |
| GET | /api/candidates?jobId=xxx | Filter by job |
| POST | /api/candidates | Submit a candidate |
| PATCH | /api/candidates/:id/status | Update status |
| DELETE | /api/candidates/:id | Delete candidate |

---

## 📋 Features

- **Vendors Page** — Add vendors (name, company, email), view and delete them
- **Jobs Page** — Create job requisitions (title, skills, budget), toggle Open/Closed
- **Candidates Page** — Submit candidates linked to a job and vendor, update pipeline status (Submitted → Interview → Selected → Rejected), filter by job

---

## 🗄️ Environment Variables (backend/.env)

```
MONGO_URI=mongodb://localhost:27017/ats_db
PORT=5000
```

You can change the MongoDB URI if using MongoDB Atlas (cloud).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6 |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Styling | Plain CSS (no libraries) |
