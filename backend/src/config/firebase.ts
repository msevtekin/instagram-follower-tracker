import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// In production, use environment variables or a service account key file
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // For development/testing, initialize with default credentials
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
    });
  }
}

export const firebaseAdmin = admin;
export const db = admin.firestore();
export const auth = admin.auth();
