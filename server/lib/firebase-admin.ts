import admin from 'firebase-admin';

// Inicializar Firebase Admin
// NOTA: Para crear usuarios desde el backend, necesitas configurar las credenciales de Firebase Admin
// Por ahora, retornamos un objeto mock para que la aplicación no falle
// El usuario deberá crear usuarios manualmente desde Firebase Console

const mockAuth = {
  verifyIdToken: async (token: string) => {
    throw new Error('Firebase Admin no configurado. Crea usuarios manualmente desde Firebase Console.');
  },
  createUser: async (userData: any) => {
    throw new Error('Firebase Admin no configurado. Crea usuarios manualmente desde Firebase Console.');
  },
};

export const auth = mockAuth as any;
export const firestore = null as any;

export default admin;
