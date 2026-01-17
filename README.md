# CupidFlow - Setup Guide & Documentation

## 🚀 Project Overview
CupidFlow is a verified matrimonial and dating PWA for Sri Lanka, featuring strict NIC verification and manual payments.

## 🛠 Tech Stack
- **Frontend**: React (Vite), TypeScript, TailwindCSS
- **Backend/DB**: Firebase Authentication, Firestore
- **Storage**: Cloudinary
- **State Management**: Zustand

## 🔑 Application Secrets & Configuration

### 1. Firebase Setup (Client)
The application connects to Firebase project `cupidflow-syntax`.
Configuration is hardcoded in `src/lib/firebase.ts` (safe for public client apps usually, but can be moved to env vars).

**Required for Deployment**:
- You must create a **Service Account** in Firebase Console.
- Go to **Project Settings > Service accounts > Generage new private key**.
- The JSON file contains your credentials.

### 2. Cloudinary Setup
- **Cloud Name**: `dfchtnulo`
- **Presets**:
    - `cupidflow_public`: For profile photos.
    - `cupidflow_verification`: For private NIC/Selfie uploads.
- **Guide**:
    1. Go to [Cloudinary Settings > Upload](https://console.cloudinary.com/settings/upload).
    2. Under **Upload presets**, click **Add upload preset**.
    3. Name: `cupidflow_public`. Mode: **Unsigned**. Folder: `profiles` (optional).
    4. Save.
    5. Repeat for `cupidflow_verification`. Mode: **Unsigned**. Folder: `verification_requests` (optional).

### 3. GitHub Actions (Auto-Deployment)
To enable auto-deployment to Firebase Hosting:

1. Go to your GitHub Repository > **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret**.
3. Name: `FIREBASE_SERVICE_ACCOUNT_CUPIDFLOW_SYNTAX`
4. Value: Paste the **entire content** of the Firebase Service Account JSON file you downloaded earlier.
5. Save.

Now, every push to `main` will deploy to `https://cupidflow-syntax.web.app`.

## 📦 Local Development

### 1. Installation
```bash
npm install
```

### 2. Run Dev Server
```bash
npm run dev
```

## 🚀 Deployment

Manual deployment (if needed):
```bash
npm run build
npx firebase-tools deploy
```

## 📜 First Time Git Setup
Run these commands to push this code to your GitHub repo:

```bash
git init
git add .
git commit -m "Initial commit: Scaffold CupidFlow V1"
git branch -M main
git remote add origin https://github.com/Sandun-S/CupidFlow.git
git push -u origin main
```
