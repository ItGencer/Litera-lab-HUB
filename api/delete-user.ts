import * as admin from 'firebase-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const projectId   = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
  const databaseURL = process.env['FIREBASE_DATABASE_URL'];
  const rawKey      = process.env['FIREBASE_PRIVATE_KEY'];

  console.log('[delete-user] env check → projectId:', projectId);
  console.log('[delete-user] env check → clientEmail:', clientEmail);
  console.log('[delete-user] env check → databaseURL:', databaseURL);
  console.log('[delete-user] env check → privateKey exists:', !!rawKey);
  if (rawKey) {
    console.log('[delete-user] env check → privateKey first 40 chars:', rawKey.substring(0, 40));
    console.log('[delete-user] env check → privateKey includes literal \\n:', rawKey.includes('\\n'));
    console.log('[delete-user] env check → privateKey includes real newline:', rawKey.includes('\n'));
  }

  if (!projectId || !clientEmail || !rawKey || !databaseURL) {
    throw new Error(
      `Missing env: projectId=${!!projectId} clientEmail=${!!clientEmail} privateKey=${!!rawKey} databaseURL=${!!databaseURL}`
    );
  }

  // Vercel зберігає переноси рядка як literal \\n — розгортаємо
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey;

  console.log('[delete-user] privateKey after processing, starts with:', privateKey.substring(0, 40));

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    databaseURL,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers на випадок preflight
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uid = (req.body as any)?.uid as string | undefined;
  if (!uid) {
    return res.status(400).json({ error: 'uid is required' });
  }

  let app: admin.app.App;
  try {
    app = getAdminApp();
  } catch (err: any) {
    console.error('[delete-user] getAdminApp failed:', err.message);
    return res.status(500).json({ error: `Init error: ${err.message}` });
  }

  try {
    await app.auth().deleteUser(uid);
    console.log('[delete-user] auth deleted:', uid);
  } catch (err: any) {
    console.error('[delete-user] auth().deleteUser failed:', err.message);
    return res.status(500).json({ error: `Auth delete failed: ${err.message}` });
  }

  try {
    await app.database().ref(`Users/${uid}`).remove();
    console.log('[delete-user] db removed:', uid);
  } catch (err: any) {
    console.error('[delete-user] database remove failed:', err.message);
    return res.status(500).json({ error: `DB delete failed: ${err.message}` });
  }

  return res.status(200).json({ success: true });
}