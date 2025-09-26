# QCSv1 Project Management Guide

This document is the central quick-reference guide for the **Quote Calculator System (QCS) v1**, a standalone web application for creating and managing client quotes.  
It contains key information about the local setup, code repository, and cloud services.

For the complete project architecture and business logic, please see the full **Rate Builder Specification Document**.

---

## 1. Core Project Links & Locations

- **Local Development Folder:** `C:\QCSv1`  
- **GitHub Repository:** [QCSv1 Repo](https://github.com/twgallo13/QCSv1)  
- **Live Application URL:** [qcsv1-a4dc8.web.app](https://qcsv1-a4dc8.web.app)

---

## 2. GitHub & Codespaces Workflow

This project is best managed using a **GitHub Codespace** to ensure a consistent and stable development environment.

### Starting a Session

1. Navigate to the GitHub repository.  
2. Click the green `<> Code` button.  
3. Select the **Codespaces** tab and click **Create codespace on main**.  

### Key Commands (from Codespace terminal at project root)

```bash
# Install all dependencies
npm install

# Start the frontend (web) app for development
npm run dev --workspace=apps/web

# Start the backend (api) app for development
npm run start:dev --workspace=apps/api

# Run all automated tests
npm test
3. Environment Variables & Secrets
For local development, the backend API requires environment variables.

Create a file named .env inside the apps/api directory. Add the necessary Firebase configuration so the backend can connect securely.

Example apps/api/.env file:

env
Copy code
FIREBASE_PROJECT_ID="qcsv1-a4dc8"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
4. Firebase Configuration & Services
This project uses Firebase for backend infrastructure: authentication, database, and hosting.

Project ID: qcsv1-a4dc8

Hosting Site: qcsv1-a4dc8.web.app

Firebase Configuration (for frontend)
This configuration object is used in the frontend (apps/web) to connect to Firebase services.

javascript
Copy code
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvahc2gJGmI08oxc5h6YOreeA1Rzgi_w4",
  authDomain: "qcsv1-a4dc8.firebaseapp.com",
  projectId: "qcsv1-a4dc8",
  storageBucket: "qcsv1-a4dc8.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "589820284889",
  appId: "1:589820284889:web:a7565495787f95c07b53c8"
};
Firebase Services Used
Authentication: Manages user sign-in (single admin role).

Firestore: NoSQL database for quotes, rate cards, and audit logs.

Hosting: Hosts the live Next.js frontend application.

Cloud Storage: Stores user-uploaded assets (e.g., company logos).

5. Deployment
The project has separate deployment processes for the frontend and backend.

Deploy the Frontend (Firebase Hosting)
bash
Copy code
# Install the Firebase CLI in Codespace
npm install -g firebase-tools

# Log in to Firebase
firebase login

# Deploy the web app from root
firebase deploy --only hosting
Deploy the Backend (Google Cloud Run)
Build the Docker image for the API.

Push the image to Google Artifact Registry.

Deploy the image to a new Google Cloud Run service.

pgsql
Copy code

✅ Fixed spacing around all headings & lists.  
✅ File now ends with a single trailing newline.
