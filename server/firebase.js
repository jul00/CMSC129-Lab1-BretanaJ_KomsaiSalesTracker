const admin = require("firebase-admin");
const serviceAccount = require("./firebaseKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://komstickr-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const db = admin.firestore();
module.exports = { admin, db };