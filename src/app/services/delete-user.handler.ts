import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

// ── Ліниво ініціалізуємо — тільки коли прийшов перший запит ──────────
function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!; // вже ініціалізовано — повертаємо
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env['FIREBASE_PROJECT_ID'],
      clientEmail: process.env['FIREBASE_CLIENT_EMAIL'],
      privateKey: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env['FIREBASE_DATABASE_URL'],
  });
}

export async function deleteUserHandler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { uid } = req.body as { uid?: string };

  if (!uid) {
    res.status(400).json({ error: 'uid required' });
    return;
  }

  try {
    const adminApp = getAdminApp(); // ← ініціалізація тут, env вже завантажені

    await adminApp.auth().deleteUser(uid);
    await adminApp.database().ref(`Users/${uid}`).remove();

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[deleteUserHandler] error:', err);
    res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
}