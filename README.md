# CIRCULARES FASHION

Aplicación web para cargar y consultar circulares en PDF usando Firebase (Auth, Firestore y Storage).

## Estructura

- `public/index.html`: listado principal de circulares.
- `public/detalle.html`: vista detalle de una circular.
- `public/admin.html`: panel para subir nuevas circulares.
- `js/firebase.js`: inicialización y utilidades de Firebase.
- `js/app.js`: carga y filtro del listado.
- `js/admin.js`: login admin y carga de documentos.
- `js/detalle.js`: lectura individual de circular.

## Configuración Firebase

Este proyecto ya está apuntando a tu proyecto de Firebase con esta configuración:

- `projectId`: `circularesfashioncollection`
- `authDomain`: `circularesfashioncollection.firebaseapp.com`
- `storageBucket`: `circularesfashioncollection.firebasestorage.app`

Si cambias de proyecto, actualiza `js/firebase.js`.

## Reglas mínimas recomendadas

Si en el index no aparecen documentos, normalmente es por reglas de Firestore.

### Firestore (lectura pública y escritura autenticada)

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /circulares/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage (descarga pública y subida autenticada)

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /circulares/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Nota importante sobre el index

Para evitar bloqueos por reglas que requieren autenticación, el index y detalle ahora intentan crear una **sesión anónima** automáticamente antes de leer Firestore.

Si aún no aparecen circulares:
1. Verifica que los documentos existan en la colección **`circulares`**.
2. Verifica que cada documento tenga al menos: `numero`, `departamento`, `fecha`, `pdfUrl`.
3. Revisa en consola del navegador si aparece `permission-denied`.

## Ejecución local

Puedes abrir con un servidor estático, por ejemplo:

```bash
python -m http.server 4173
```

Luego abre:

- `http://localhost:4173/public/index.html`
