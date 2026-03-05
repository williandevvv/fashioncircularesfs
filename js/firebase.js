import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  limit,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'REEMPLAZAR_API_KEY',
  authDomain: 'REEMPLAZAR_AUTH_DOMAIN',
  projectId: 'REEMPLAZAR_PROJECT_ID',
  storageBucket: 'REEMPLAZAR_STORAGE_BUCKET',
  messagingSenderId: 'REEMPLAZAR_MESSAGING_SENDER_ID',
  appId: 'REEMPLAZAR_APP_ID'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let authInitialized = false;
const authReadyPromise = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, () => {
    if (!authInitialized) {
      authInitialized = true;
      resolve();
    }
    unsubscribe();
  });
});

const waitForAuthReady = () => authReadyPromise;

export {
  auth,
  db,
  storage,
  collection,
  addDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  limit,
  serverTimestamp,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  ref,
  uploadBytes,
  getDownloadURL,
  waitForAuthReady
};
