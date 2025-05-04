const admin = require('firebase-admin');
const serviceAccount = require('./secrets/serviceAccountKey.json'); // ajusta la ruta según corresponda

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://calculadora-electricistas.firebaseio.com' // este URL es opcional si usás solo Firestore
});

module.exports = admin;
