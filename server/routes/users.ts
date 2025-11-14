import { Router } from 'express';
import { auth } from '../lib/firebase-admin';

const router = Router();

// Endpoint para crear nuevos usuarios (solo admin)
router.post('/create', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que el usuario autenticado sea el admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Solo el admin puede crear usuarios
    if (decodedToken.email !== 'hsesupergas@gmail.com') {
      return res.status(403).json({ message: 'No tienes permisos para crear usuarios' });
    }

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ message: 'El correo electrónico no es válido' });
    }
    
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
});

export default router;
