/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../../config/firebase.config';

// Safe lazy-initialization or single-instance check
function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(FIREBASE_CONFIG);
}

export const app = getFirebaseApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with custom database ID from config to target our dedicated DB instance
export const db = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId || '(default)');
