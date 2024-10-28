// firebaseAdmin.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

const firestoreAdmin = admin.firestore();

console.log('Firestore Admin initialized');
// console.log('Firestore Admin:', process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'));

export { firestoreAdmin };
