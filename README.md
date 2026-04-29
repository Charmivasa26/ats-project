# ATS 
## Internal Applicant Tracking System

A full-stack ATS (Applicant Tracking System) built with React, Node.js (Express), and MongoDB. Supports role-based authentication, candidate pipeline management, interview scheduling, and a live dashboard.

---

## 📁 Project Structure

```
ats-project/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── candidateController.js
│   │   ├── dashboardController.js
│   │   ├── interviewController.js
│   │   ├── jobController.js
│   │   └── vendorController.js
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   └── roleMiddleware.js       # Role-based access control
│   ├── models/
│   │   ├── ActivityLog.js
│   │   ├── Candidate.js
│   │   ├── Interview.js
│   │   ├── Job.js
│   │   ├── User.js
│   │   └── Vendor.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── candidateRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── jobRoutes.js
│   │   └── vendorRoutes.js
│   ├── utils/
│   │   └── activityLogger.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   ├── components/
    │   │   ├── Layout/
    │   │   └── ProtectedRoute.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── CandidatesPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── InterviewsPage.js
    │   │   ├── JobsPage.js
    │   │   ├── LoginPage.js
    │   │   ├── PipelinePage.js
    │   │   ├── RegisterPage.js
    │   │   └── VendorsPage.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, React Router v6, Tailwind CSS         |
| State/Auth | React Context API + JWT                         |
| UI/UX      | react-hot-toast, @hello-pangea/dnd (drag & drop)|
| HTTP       | Axios                                           |
| Backend    | Node.js, Express                                |
| Auth       | JWT (jsonwebtoken), bcryptjs                    |
| Validation | express-validator                               |
| File Upload| Multer                                          |
| Database   | MongoDB, Mongoose                               |

---

## ✨ Features

- **Authentication** — Register/Login with JWT. Roles: `Admin`, `HR`, `Vendor`, `HiringManager`
- **Role-Based Access Control** — Protected routes restrict actions by user role
- **Vendors** — Add, view, and delete recruiting vendors
- **Jobs** — Create job requisitions (title, skills, budget), toggle Open/Closed status
- **Candidates** — Submit candidates linked to a job and vendor, with resume/file upload via Multer
- **Pipeline** — Drag-and-drop Kanban board to move candidates across stages: `Submitted → Interview → Selected → Rejected`
- **Interviews** — Schedule and manage interviews for candidates
- **Dashboard** — Live summary metrics and activity feed
- **Activity Log** — Tracks key actions across the system

---

## ⚙️ Prerequisites

- **Node.js** v16+ → https://nodejs.org
- **MongoDB** Community Edition → https://www.mongodb.com/try/download/community
- **npm** (bundled with Node.js)

---

## 🚀 Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/Charmivasa26/ats-project.git
cd ats-project
```

---

### Step 2: Configure Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
MONGO_URI=mongodb://localhost:27017/ats_db
PORT=5000
JWT_SECRET=your_super_secret_key_here
```

> Replace `your_super_secret_key_here` with a strong random string.  
> For cloud MongoDB, replace the `MONGO_URI` with your Atlas connection string.

---

### Step 3: Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# or
mongod --dbpath /data/db
```

---

### Step 4: Start the Backend

```bash
cd backend
npm install
npm run dev
```

Expected output:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

Backend URL: **http://localhost:5000**

---

### Step 5: Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

Frontend URL: **http://localhost:3000**

---

## 🌐 API Endpoints

All protected routes require the `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint            | Access  | Description              |
|--------|---------------------|---------|--------------------------|
| POST   | /api/auth/register  | Public  | Register a new user      |
| POST   | /api/auth/login     | Public  | Login and receive JWT    |
| GET    | /api/auth/me        | Private | Get logged-in user info  |

**Roles:** `Admin`, `HR`, `Vendor`, `HiringManager`

---

### Vendors
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| GET    | /api/vendors        | Get all vendors     |
| POST   | /api/vendors        | Add a vendor        |
| DELETE | /api/vendors/:id    | Delete a vendor     |

---

### Jobs
| Method | Endpoint                 | Description              |
|--------|--------------------------|--------------------------|
| GET    | /api/jobs                | Get all jobs             |
| POST   | /api/jobs                | Create a job             |
| PATCH  | /api/jobs/:id/status     | Toggle Open/Closed       |
| DELETE | /api/jobs/:id            | Delete a job             |

---

### Candidates
| Method | Endpoint                      | Description                   |
|--------|-------------------------------|-------------------------------|
| GET    | /api/candidates               | Get all candidates            |
| GET    | /api/candidates?jobId=xxx     | Filter candidates by job      |
| POST   | /api/candidates               | Submit a candidate (with file)|
| PATCH  | /api/candidates/:id/status    | Update pipeline status        |
| DELETE | /api/candidates/:id           | Delete a candidate            |

---

### Interviews
| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| GET    | /api/interviews       | Get all interviews        |
| POST   | /api/interviews       | Schedule an interview     |
| PATCH  | /api/interviews/:id   | Update interview details  |
| DELETE | /api/interviews/:id   | Delete an interview       |

---

### Dashboard
| Method | Endpoint         | Description                        |
|--------|------------------|------------------------------------|
| GET    | /api/dashboard   | Get summary stats and activity log |

---

## 🔐 User Roles

| Role           | Typical Permissions                              |
|----------------|--------------------------------------------------|
| Admin          | Full access — manage users, all data             |
| HR             | Manage candidates, jobs, interviews              |
| HiringManager  | View and update pipeline, interviews             |
| Vendor         | Submit candidates for assigned jobs              |

---

## 📂 File Uploads

Resumes and attachments are handled by **Multer** and stored in the `backend/uploads/` directory. Uploaded files are served statically at:

```
http://localhost:5000/uploads/<filename>
```

---

## 🧪 Running in Production

Build the React frontend:

```bash
cd frontend
npm run build
```

Then serve the `build/` folder via a static server or configure Express to serve it.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push and open a Pull Request
