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
import { normalizeText } from './search.js';

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

const getDetailedErrorMessage = (error, fallbackMessage) => {
  const code = error?.code || 'desconocido';
  const storageUnauthorizedCodes = ['storage/unauthorized', 'storage/forbidden'];

  if (storageUnauthorizedCodes.includes(code)) {
    return 'Sin permisos para subir PDF a Storage. Revisa reglas de Storage y sesión admin.';
  }

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Credenciales inválidas. Verifica correo y contraseña.';
  }

  if (code === 'permission-denied') {
    return 'Sin permisos para escribir en Firestore. Revisa reglas de Firestore.';
  }

  return `${fallbackMessage} (${code})`;
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
    console.error('[ADMIN][LOGIN]', error);
    setAuthStatus(getDetailedErrorMessage(error, 'No fue posible iniciar sesión.'), true);
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  setAuthStatus('Sesión cerrada.');
});

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setUploadStatus('Validando sesión y preparando carga...');

  const currentUser = auth.currentUser;
  if (!currentUser) {
    setUploadStatus('No hay sesión activa. Inicia sesión como administrador.', true);
    return;
  }

  if (currentUser.email !== ADMIN_EMAIL) {
    setUploadStatus('Acceso denegado. Solo el admin puede subir circulares.', true);
    return;
  }

  const formData = new FormData(uploadForm);
  const file = formData.get('pdf');

  if (!(file instanceof File) || !file.size) {
    setUploadStatus('Debes seleccionar un PDF válido.', true);
    return;
  }

  if (file.type && file.type !== 'application/pdf') {
    setUploadStatus('El archivo debe ser un PDF.', true);
    return;
  }

  const codigo = formData.get('codigo')?.toString().trim() || '';
  const numero = formData.get('numero')?.toString().trim() || '';
  const departamento = formData.get('departamento')?.toString().trim() || '';
  const descripcion = formData.get('descripcion')?.toString().trim() || '';
  const fecha = formData.get('fecha')?.toString().trim() || '';

  try {
    // 1) Subir PDF primero. Si falla, NO se guarda nada en Firestore.
    setUploadStatus('Subiendo PDF a Storage...');
    const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    const storagePath = `circulares/${Date.now()}-${sanitizedFileName || 'documento.pdf'}`;
    const fileRef = ref(storage, storagePath);

    await uploadBytes(fileRef, file, {
      contentType: 'application/pdf',
      customMetadata: {
        uploadedBy: currentUser.uid,
        originalName: file.name
      }
    });

    const pdfUrl = await getDownloadURL(fileRef);

    // 2) Guardar metadatos en Firestore con campos normalizados para búsqueda.
    setUploadStatus('Guardando metadatos en Firestore...');
    await addDoc(collection(db, 'circulares'), {
      codigo,
      numero,
      departamento,
      descripcion,
      fecha,
      codigoNormalizado: normalizeText(codigo),
      numeroNormalizado: normalizeText(numero),
      pdfUrl,
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid
    });

    uploadForm.reset();
    setUploadStatus('Circular guardada correctamente ✅');
  } catch (error) {
    console.error('[ADMIN][UPLOAD]', error);
    setUploadStatus(getDetailedErrorMessage(error, 'Error al subir/guardar la circular.'), true);
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
