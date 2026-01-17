import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAq69sMo2hZ7lugIofJJKtykeLKQNBBXBY",
    authDomain: "cupidflow-syntax.firebaseapp.com",
    projectId: "cupidflow-syntax",
    storageBucket: "cupidflow-syntax.firebasestorage.app",
    messagingSenderId: "789240312743",
    appId: "1:789240312743:web:895967578403d6bd967c82",
    measurementId: "G-3FE6Y8F6H1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
