import {
  auth,
  db,
  storage,
  collection,
  addDoc,
  serverTimestamp,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  ref,
  uploadBytes,
  getDownloadURL,
  waitForAuthReady
} from './firebase.js';

const ADMIN_EMAIL = 'admin@circulares.fs';

const loginSection = document.getElementById('loginSection');
const panelSection = document.getElementById('panelSection');
const loginForm = document.getElementById('loginForm');
const uploadForm = document.getElementById('uploadForm');
const logoutBtn = document.getElementById('logoutBtn');
const authStatus = document.getElementById('authStatus');
const uploadStatus = document.getElementById('uploadStatus');

const setPanelVisibility = (isAdmin) => {
  loginSection.classList.toggle('hidden', isAdmin);
  panelSection.classList.toggle('hidden', !isAdmin);
};

const setAuthStatus = (message, isError = false) => {
  authStatus.textContent = message;
  authStatus.classList.toggle('error', isError);
};

const setUploadStatus = (message, isError = false) => {
  uploadStatus.textContent = message;
  uploadStatus.classList.toggle('error', isError);
};

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    setAuthStatus('Sesión iniciada correctamente.');
    loginForm.reset();
  } catch (error) {
    console.error(error);
    setAuthStatus('No fue posible iniciar sesión.', true);
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  setAuthStatus('Sesión cerrada.');
});

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setUploadStatus('Subiendo circular...');

  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    setUploadStatus('Acceso denegado. Solo el admin puede subir circulares.', true);
    return;
  }

  try {
    const formData = new FormData(uploadForm);
    const file = formData.get('pdf');

    if (!(file instanceof File) || !file.size) {
      setUploadStatus('Debes seleccionar un PDF válido.', true);
      return;
    }

    const fileRef = ref(storage, `circulares/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    const pdfUrl = await getDownloadURL(fileRef);

    await addDoc(collection(db, 'circulares'), {
      codigo: formData.get('codigo')?.toString().trim(),
      numero: formData.get('numero')?.toString().trim(),
      departamento: formData.get('departamento')?.toString().trim(),
      descripcion: formData.get('descripcion')?.toString().trim(),
      fecha: formData.get('fecha')?.toString(),
      pdfUrl,
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid
    });

    uploadForm.reset();
    setUploadStatus('Circular guardada correctamente.');
  } catch (error) {
    console.error(error);
    setUploadStatus('Error al subir la circular.', true);
  }
});

const bootstrap = async () => {
  await waitForAuthReady();

  onAuthStateChanged(auth, (user) => {
    const isAdmin = Boolean(user && user.email === ADMIN_EMAIL);
    setPanelVisibility(isAdmin);

    if (!user) {
      setAuthStatus('Inicia sesión para acceder al panel.');
    } else if (!isAdmin) {
      setAuthStatus('Usuario autenticado sin permisos de administrador.', true);
    } else {
      setAuthStatus(`Panel habilitado para ${user.email}.`);
    }
  });
};

bootstrap();
