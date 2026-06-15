import * as admin from 'firebase-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const projectId = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
  const databaseURL = process.env['FIREBASE_DATABASE_URL'];
  const rawKey = process.env['FIREBASE_PRIVATE_KEY'];

  // Детальний лог для діагностики у Vercel Functions → Logs
  console.log('[delete-user] projectId:', projectId);
  console.log('[delete-user] clientEmail:', clientEmail);
  console.log('[delete-user] databaseURL:', databaseURL);
  console.log('[delete-user] privateKey exists:', !!rawKey);
  console.log('[delete-user] privateKey starts with:', rawKey?.substring(0, 30));

  if (!projectId || !clientEmail || !rawKey || !databaseURL) {
    throw new Error(
      `Missing env vars: projectId=${!!projectId} clientEmail=${!!clientEmail} privateKey=${!!rawKey} databaseURL=${!!databaseURL}`
    );
  }

  // Надійна обробка ключа:
  // 1) Vercel зберігає \n як literal \\n — замінюємо
  // 2) Якщо ключ у лапках — прибираємо
  const privateKey = rawKey
    .replace(/\\n/g, '\n')
    .replace(/^"|"$/g, '');

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    databaseURL,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    console.error('[delete-user] handler error:', err.message);
    // Повертаємо JSON завжди — не текст
    return res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
}