// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA3wSOhQpvy9yDpb0cZXLidft2dNL-4LQ8",
    authDomain: "event-hub-29d5a.firebaseapp.com",
    projectId: "event-hub-29d5a",
    storageBucket: "event-hub-29d5a.appspot.com",
    messagingSenderId: "403196717477",
    appId: "1:403196717477:web:bf2f17aca70f8e7c52e04c"
};

// Initialize Firebase
let app;
if (getApps().length == 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps();
}

const auth = getAuth();

export { auth };
