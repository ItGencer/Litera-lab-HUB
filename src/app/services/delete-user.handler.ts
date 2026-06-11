import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

// Явно вказуємо шлях до .env від кореня проекту
const dotenvResult = dotenv.config({ path: resolve(process.cwd(), '.env') });

// Дебаг — побачиш у терміналі які змінні завантажились
if (dotenvResult.error) {
  console.error('[dotenv] ❌ Помилка завантаження .env:', dotenvResult.error.message);
} else {
  console.log('[dotenv] ✅ Завантажено змінні:', Object.keys(dotenvResult.parsed ?? {}));
}

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const projectId = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
  const privateKey = process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n');
  const databaseURL = process.env['FIREBASE_DATABASE_URL'];

  // Дебаг — побачиш чи є значення
  console.log('[getAdminApp] projectId:', projectId);
  console.log('[getAdminApp] clientEmail:', clientEmail);
  console.log('[getAdminApp] privateKey exists:', !!privateKey);
  console.log('[getAdminApp] databaseURL:', databaseURL);

  if (!projectId || !clientEmail || !privateKey || !databaseURL) {
    throw new Error(`Відсутні env-змінні. Перевір .env файл у корені проекту (${process.cwd()})`);
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    databaseURL,
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
    const adminApp = getAdminApp();
    await adminApp.auth().deleteUser(uid);
    await adminApp.database().ref(`Users/${uid}`).remove();
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[deleteUserHandler] error:', err.message);
    res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
}