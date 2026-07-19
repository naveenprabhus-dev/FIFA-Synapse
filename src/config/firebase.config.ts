/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const safeEnv = ((typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}) as Record<string, string>;

export const FIREBASE_CONFIG = {
  apiKey: safeEnv.VITE_FIREBASE_API_KEY || 'AIzaSyDPRJPFUwqiNB9P5WZYjBMRjb_4aApDt7s',
  authDomain: safeEnv.VITE_FIREBASE_AUTH_DOMAIN || 'regal-center-494708-a3.firebaseapp.com',
  projectId: safeEnv.VITE_FIREBASE_PROJECT_ID || 'regal-center-494708-a3',
  storageBucket: safeEnv.VITE_FIREBASE_STORAGE_BUCKET || 'regal-center-494708-a3.firebasestorage.app',
  messagingSenderId: safeEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '1032370174942',
  appId: safeEnv.VITE_FIREBASE_APP_ID || '1:1032370174942:web:c50d4fd51e17c86986fb4f',
  firestoreDatabaseId: 'ai-studio-fifasynapse-81738ab7-9aa6-4850-8001-1518fb28978b',
};
