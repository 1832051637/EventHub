// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID } from '@env';


// The app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA3wSOhQpvy9yDpb0cZXLidft2dNL-4LQ8",
    authDomain: "event-hub-29d5a.firebaseapp.com",
    projectId: "event-hub-29d5a",
    storageBucket: "event-hub-29d5a.appspot.com",
    messagingSenderId: "403196717477",
    appId: "1:403196717477:web:bf2f17aca70f8e7c52e04c"
};

// Initialize Firebase (using firebase v.9.0+ syntax)
let app;
if (getApps().length == 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps();
}

// Get auth, database, and storage
const auth = getAuth();
const db = getFirestore();
const storage = getStorage()

export { auth, db, storage };
