import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
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
  apiKey: 'AIzaSyDub4MtWEFkg4GYzo7b9dVrhI-Ms5OF32I',
  authDomain: 'circularesfashioncollection.firebaseapp.com',
  projectId: 'circularesfashioncollection',
  // Usar bucket principal del proyecto para evitar errores por referencia incorrecta.
  storageBucket: 'circularesfashioncollection.appspot.com',
  messagingSenderId: '395491441213',
  appId: '1:395491441213:web:ceb09a1085e5e13cba0854'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app, "circularesfs");
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

const ensureAuthSession = async () => {
  await waitForAuthReady();
  if (auth.currentUser) return auth.currentUser;

  try {
    const credentials = await signInAnonymously(auth);
    return credentials.user;
  } catch (error) {
    console.error('No fue posible iniciar sesión anónima.', error);
    return null;
  }
};

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
  ensureAuthSession,
  ref,
  uploadBytes,
  getDownloadURL,
  waitForAuthReady
};
