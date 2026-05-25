const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

module.exports = async (req, res) => {
  // Дозволяємо тільки DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: 'uid required' });

  try {
    // 1. Видаляємо з Firebase Authentication
    await admin.auth().deleteUser(uid);

    // 2. Видаляємо з Realtime Database (ВЕЛИКА U — як у сервісі!)
    await admin.database().ref(`Users/${uid}`).remove();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ error: err.message });
  }
};