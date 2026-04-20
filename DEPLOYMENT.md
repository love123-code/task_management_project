# TaskFlow Deployment Guide

This guide covers deploying TaskFlow on Vercel and Render.

## Prerequisites

- **Backend**: Ensure the backend is deployed and accessible via HTTPS. The frontend expects an API at the URL specified in `VITE_API_URL`.
- **MongoDB**: Backend requires a MongoDB database (can use MongoDB Atlas, Render's MongoDB, or any other hosted MongoDB).

## Environment Variables

Create a `.env` file in the `frontend` directory (or set environment variables in your hosting platform):

```
VITE_API_URL=https://your-backend-url.com
```

For local development:
```
VITE_API_URL=http://localhost:5000
```

## Deploying to Vercel

### Option 1: Deploy as Static Site (Frontend-only)

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com) and import the project
3. Configure project settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL` → Your backend URL (e.g., `https://your-backend.onrender.com`)
4. Click Deploy

### Option 2: Using vercel.json

The included `vercel.json` configures the build process:
- Installs dependencies in `frontend` folder
- Builds the frontend
- Outputs to `frontend/dist`
- Sets environment variable `VITE_API_URL` from Vercel's environment

Set the environment variable in Vercel dashboard or CLI:
```bash
vercel env add VITE_API_URL production
```

## Deploying to Render

Render supports full-stack deployments with a single `render.yaml` configuration.

### Steps:

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://render.com) and click "New +"
3. Select "Blueprints" and connect your repository
4. Render will detect `render.yaml` and set up two services:
   - **taskflow-backend** (Web Service - Node.js)
   - **taskflow-frontend** (Static Site)

### Backend Setup

The `render.yaml` expects the backend to have:
- `backend/package.json` with a `start` script
- `backend/server.js` or `backend/index.js` as the entry point
- MongoDB connection via `MONGODB_URI` environment variable

If your backend uses a different structure, update the `startCommand` in `render.yaml`.

### Database

The configuration includes a MongoDB database. You can:
- Use Render's managed MongoDB (free tier available)
- Use external MongoDB (e.g., MongoDB Atlas) - update `MONGODB_URI` in render.yaml

### Manual Service Setup (Alternative)

If you prefer to set up services manually:

#### Backend Service:
- Type: Web Service
- Build Command: `cd backend && npm install`
- Start Command: `cd backend && npm start`
- Environment Variables:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `MONGODB_URI` → your MongoDB connection string
  - `JWT_SECRET` → a secure random string
  - `CORS_ORIGIN` → frontend URL (e.g., `https://taskflow-frontend.onrender.com`)

#### Frontend Static Site:
- Type: Static Site
- Build Command: `cd frontend && npm install && npm run build`
- Publish Directory: `frontend/dist`
- Environment Variables:
  - `VITE_API_URL` → backend URL (e.g., `https://taskflow-backend.onrender.com`)

## Docker Deployment

A `Dockerfile` is provided for containerized deployment (e.g., on AWS ECS, Google Cloud Run, or self-hosted):

```bash
docker build -t taskflow-frontend .
docker run -p 80:80 taskflow-frontend
```

To use with Docker, set the `VITE_API_URL` build argument or use a multi-stage setup that includes backend.

## Notes

- **SPA Routing**: The configuration includes rewrites for React Router to work correctly.
- **CORS**: Ensure your backend allows requests from the frontend domain.
- **WebSocket**: Socket.io connections should point to the backend URL directly (handled automatically via `VITE_API_URL`).
- **Build Verification**: Test locally: `cd frontend && npm run build` and serve the `dist` folder to verify the build works.

## Troubleshooting

- **404 on refresh**: Ensure SPA rewrite rules are in place (handled by vercel.json and nginx.conf).
- **API calls failing**: Verify `VITE_API_URL` is correctly set in production environment.
- **Socket connection errors**: Check that backend WebSocket server is running and CORS allows the frontend origin.
- **Build fails**: Ensure Node.js version is 18+ and all dependencies are in `package.json`.
