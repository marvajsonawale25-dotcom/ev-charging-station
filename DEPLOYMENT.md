# EV Charging Station Deployment Guide

This guide describes how to run the project locally and how to deploy both the **React + Vite Frontend (on Vercel)** and the **Spring Boot Backend (on any cloud container/Java platform)** with a **Cloud PostgreSQL Database**.

---

## 1. System Architecture in Production

```text
  [ User Browser ]
         │
         ▼ (HTTPS)
┌───────────────────────────────────────┐
│   Vercel Edge Network                 │
│   React + Vite SPA                    │
│   (Configured with vercel.json)       │
└───────────────────────────────────────┘
         │
         ▼ (HTTPS REST APIs / JWT Auth)
┌───────────────────────────────────────┐
│   Cloud Spring Boot Backend           │
│   (Render, Railway, Fly.io, or AWS)   │
└───────────────────────────────────────┘
         │
         ▼ (JDBC with SSL)
┌───────────────────────────────────────┐
│   Cloud PostgreSQL Database           │
│   (Supabase, Neon, Railway, RDS)      │
└───────────────────────────────────────┘
```

When your laptop is turned off, the frontend hosted on Vercel communicates directly over HTTPS with the cloud Spring Boot backend, which queries the cloud PostgreSQL database.

---

## 2. Local Development

Both the frontend and backend have sensible local defaults configured.

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL running locally on port 5432 (database: `ev_charging_db`)

### Running Backend Locally
From the project root:
```bash
cd backend
mvn clean package -DskipTests
java -jar target/ev-charging-backend-1.0.0.jar
```
The backend starts on `http://localhost:8080`.

### Running Frontend Locally
From the project root:
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`.
Local API calls are routed via `VITE_API_URL=http://localhost:8080/api` (defined in `frontend/.env.development`).

---

## 3. Environment Variables Reference

### Frontend (Vercel)
Set this single variable in **Vercel Project Settings → Environment Variables**:

| Variable | Description | Example Value |
|---|---|---|
| `VITE_API_URL` | The public base URL of your deployed cloud Spring Boot backend `/api` endpoint | `https://your-cloud-backend.com/api` |

> **Note:** Vercel automatically exposes environment variables prefixed with `VITE_` during build time.

### Cloud Backend (Spring Boot)
Set these variables in your cloud hosting provider (e.g. Render, Railway, Fly.io, Heroku):

| Variable | Required | Description | Example Value |
|---|---|---|---|
| `PORT` | Optional | Web server port (injected automatically by most cloud hosts) | `8080` |
| `DB_URL` | **Yes** | JDBC connection string to your cloud PostgreSQL database | `jdbc:postgresql://<host>:<port>/<dbname>?sslmode=require` |
| `DB_USERNAME` | **Yes** | PostgreSQL database user | `postgres` or cloud DB user |
| `DB_PASSWORD` | **Yes** | PostgreSQL database password | `<your-database-password>` |
| `JWT_SECRET` | **Yes** | Base64-encoded 256-bit secret key for signing JWTs | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
| `JWT_EXPIRATION_MS` | Optional | Token validity in milliseconds (default: 86400000 = 24 hours) | `86400000` |
| `FRONTEND_URL` | **Yes** | Public URL of your Vercel deployment for CORS allowance | `https://your-project.vercel.app` |

---

## 4. Production Deployment Steps

Follow these steps in order when you are ready to deploy:

### Step 1: Provision Cloud PostgreSQL Database
1. Create a free PostgreSQL instance on a cloud provider such as:
   - [Supabase](https://supabase.com/)
   - [Neon](https://neon.tech/)
   - [Railway](https://railway.app/)
   - [Render PostgreSQL](https://render.com/)
2. Obtain the connection details:
   - **Host, Port, Database Name, Username, and Password**
   - Format the JDBC URL: `jdbc:postgresql://<HOST>:<PORT>/<DATABASE>?sslmode=require`

### Step 2: Deploy Spring Boot Backend
1. Deploy the backend to a cloud host (Render Web Service, Railway, Docker, or AWS).
2. Configure the environment variables in your cloud provider:
   - `DB_URL`: JDBC connection URL from Step 1
   - `DB_USERNAME`: Database username
   - `DB_PASSWORD`: Database password
   - `JWT_SECRET`: Secure 256-bit key
   - `FRONTEND_URL`: Leave empty or temporarily set; update after deploying frontend in Step 3.
3. Start the service. Spring Boot will connect to PostgreSQL, Hibernate will automatically create tables (`ddl-auto=update`), and `DataInitializer` will automatically seed initial stations, users, and chargers.
4. Copy your backend's public HTTPS URL (e.g. `https://evhub-backend.onrender.com`).

### Step 3: Deploy Frontend to Vercel
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import your repository.
4. In the project setup screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - Key: `VITE_API_URL`
   - Value: `https://YOUR-BACKEND-DOMAIN.com/api` (from Step 2, e.g., `https://evhub-backend.onrender.com/api`)
6. Click **Deploy**.
7. Vercel will build the frontend and assign a URL (e.g., `https://ev-charging-hub.vercel.app`).

### Step 4: Finalize Backend CORS Origin
1. Return to your backend cloud hosting dashboard.
2. Update the `FRONTEND_URL` environment variable with your actual Vercel URL:
   ```text
   FRONTEND_URL=https://ev-charging-hub.vercel.app
   ```
3. Restart/redeploy the backend.

---

## 5. Direct URL Access & Single Page App (SPA) Routing
The file `frontend/vercel.json` contains:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This rewrite ensures that direct access, browser bookmarking, or refreshing pages such as:
- `https://your-project.vercel.app/login`
- `https://your-project.vercel.app/customer/dashboard`
- `https://your-project.vercel.app/operator/dashboard`
- `https://your-project.vercel.app/admin/dashboard`
will always serve `index.html` and allow React Router to render the appropriate page without 404 errors.
