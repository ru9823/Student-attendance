// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6WFyu8KTO8ptCnlQ2ZMYpeOaROdnLJc0",
  authDomain: "student-attendance-bd78d.firebaseapp.com",
  projectId: "student-attendance-bd78d",
  storageBucket: "student-attendance-bd78d.appspot.com",
  messagingSenderId: "620634497411",
  appId: "1:620634497411:web:8663c5a7fe29518f3196b6",
  measurementId: "G-ZZ3QWKJPV4" // optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);
