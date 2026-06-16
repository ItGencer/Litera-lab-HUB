// api/delete-user.js
const admin = require('firebase-admin');

function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: 'https://litera-lab-hub-default-rtdb.europe-west1.firebasedatabase.app',
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'uid is required' });
    }

    const app = getAdminApp();

    await app.auth().deleteUser(uid);
    await app.database().ref(`Users/${uid}`).remove();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[delete-user] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};