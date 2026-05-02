import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAXSgYhpWa3KilyMDRp36d5Y_FLEce56CI",
    authDomain: "portfolio-6c69f.firebaseapp.com",
    projectId: "portfolio-6c69f",
    storageBucket: "portfolio-6c69f.firebasestorage.app",
    messagingSenderId: "159490695084",
    appId: "1:159490695084:web:8624416d556e26d5ca2409",
    measurementId: "G-310GTV1KR3"
};

// Next.js fast-refresh safe initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
let auth;
if (typeof window !== "undefined") {
    auth = getAuth(app);
}

export { app, db, auth, storage };
