// firebaseConfig.js
const admin = require("firebase-admin");
const serviceAccount = require("../mtic-firebase-adminsdk.json");

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
  credential: admin.credential.cert(serviceAccount),
};

const app = admin.initializeApp(firebaseConfig);
const auth = admin.auth();
const storage = admin.storage();

module.exports = {
  app,
  auth,
  storage,
};