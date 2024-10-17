// Import the necessary functions from the Firebase SDK
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

console.log('Firebase initialized 0');
// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCAyMGV4PI0WZxetmwETe4FSPS70R72EdU",
  authDomain: "homeplace-dashboard.firebaseapp.com",
  projectId: "homeplace-dashboard",
  storageBucket: "homeplace-dashboard.appspot.com",
  messagingSenderId: "360689540801",
  appId: "1:360689540801:web:862a365164625794e6fe40"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
console.log('Firebase initialized 1');

// Initialize Firestore
const firestore = getFirestore(app);
console.log('Firestore initialized');

export { firestore };