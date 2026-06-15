import * as admin from 'firebase-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env['FIREBASE_PROJECT_ID'],
      clientEmail: process.env['FIREBASE_CLIENT_EMAIL'],
      privateKey: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env['FIREBASE_DATABASE_URL'],
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Дозволяємо POST замість DELETE (DELETE може не мати body на деяких серверах)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid } = req.body as { uid?: string };
  if (!uid) return res.status(400).json({ error: 'uid required' });

  try {
    const app = getAdminApp();
    await app.auth().deleteUser(uid);
    await app.database().ref(`Users/${uid}`).remove();
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[delete-user] Vercel handler error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}