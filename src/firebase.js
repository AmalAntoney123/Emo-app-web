import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Export the existing firebase config
export const firebaseConfig = {
    apiKey: "AIzaSyBoKiOp_RVcQVmFZ64Z-Sf_2ksoVB7nBzg",
    authDomain: "emo-ce9e9.firebaseapp.com",
    databaseURL: "https://emo-ce9e9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "emo-ce9e9",
    storageBucket: "emo-ce9e9.appspot.com",
    messagingSenderId: "945356403658",
    appId: "1:945356403658:web:a6164a8f5657a7f4d8d533"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
