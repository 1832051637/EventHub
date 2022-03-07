// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID } from '@env';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: `${API_KEY}`,
    authDomain: `${AUTH_DOMAIN}`,
    projectId: `${PROJECT_ID}`,
    storageBucket: `${STORAGE_BUCKET}`,
    messagingSenderId: `${MESSAGING_SENDER_ID}`,
    appId: `${APP_ID}`
};

// Initialize Firebase (using firebase v.9.0+ syntax)
let app;
if (getApps().length == 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps();
}

const auth = getAuth();
const db = getFirestore();
const storage = getStorage()

export { auth, db, storage };
