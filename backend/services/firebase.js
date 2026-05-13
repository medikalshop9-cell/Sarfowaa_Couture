'use strict';
const path  = require('path');
const admin = require('firebase-admin');

let initialised = false;

function init() {
  if (initialised) return;

  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Vercel / any environment where the JSON is stored as an env var
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    // Local development — read from the JSON file
    const keyPath = path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      '../../sarfowaa-351b7-firebase-adminsdk-fbsvc-13891f47ae.json');
    serviceAccount = require(keyPath);
  }

  admin.initializeApp({
    credential:    admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'sarfowaa-351b7.firebasestorage.app',
  });
  initialised = true;
}

init();

const db      = admin.firestore();
const auth    = admin.auth();
const storage = admin.storage();

module.exports = { admin, db, auth, storage };
