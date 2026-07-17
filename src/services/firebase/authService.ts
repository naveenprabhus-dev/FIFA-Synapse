/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  signInWithPopup, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './init';
import { UserRole, UserProfile } from '../../types/user';

export class FirebaseAuthService {
  private static STORAGE_KEY = 'fifa_synapse_user_session';

  /**
   * Helper to sync user profile into local storage for speed and fallback read.
   */
  private static syncLocalSession(profile: UserProfile | null) {
    if (profile) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Fetch a user profile from Firestore or construct a default one if missing.
   */
  public static async getUserProfile(uid: string, fallbackEmail: string, fallbackName?: string): Promise<UserProfile> {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid,
        email: data.email || fallbackEmail,
        displayName: data.displayName || fallbackName || 'Anonymous Operator',
        role: (data.role as UserRole) || UserRole.FAN,
        createdAt: data.createdAt || new Date().toISOString(),
      };
    }

    // Default to FAN role if no document found in Firestore
    const defaultProfile: UserProfile = {
      uid,
      email: fallbackEmail,
      displayName: fallbackName || 'FIFA Fan Operator',
      role: UserRole.FAN,
      createdAt: new Date().toISOString(),
    };

    // Save default profile in Firestore
    await setDoc(userDocRef, defaultProfile);
    return defaultProfile;
  }

  /**
   * Register a new user with Email, Password and an initial role.
   */
  public static async registerWithEmail(email: string, password: string, displayName: string, role: UserRole): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update Firebase Auth AuthProfile
    await updateProfile(firebaseUser, { displayName });

    const userProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || email,
      displayName: displayName,
      role: role,
      createdAt: new Date().toISOString(),
    };

    // Store in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
    this.syncLocalSession(userProfile);

    // Optional: send email verification asynchronously
    try {
      await sendEmailVerification(firebaseUser);
    } catch (e) {
      console.warn('Could not dispatch initial email verification link:', e);
    }

    return userProfile;
  }

  /**
   * Sign in using Email and Password.
   */
  public static async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const profile = await this.getUserProfile(firebaseUser.uid, firebaseUser.email || email, firebaseUser.displayName || undefined);
    this.syncLocalSession(profile);
    return profile;
  }

  /**
   * Sign in or Register using Google Sign-In.
   */
  public static async loginWithGoogle(): Promise<UserProfile> {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = userCredential.user;

    const profile = await this.getUserProfile(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || undefined);
    this.syncLocalSession(profile);
    return profile;
  }

  /**
   * Update the user profile role in Firestore.
   */
  public static async updateUserRole(uid: string, role: UserRole): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { role, updatedAt: new Date().toISOString() });

    // Update active local session if matches
    const local = this.getCurrentSession();
    if (local && local.uid === uid) {
      local.role = role;
      this.syncLocalSession(local);
    }
  }

  /**
   * Dispatch a Password Reset link.
   */
  public static async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Dispatch an Email Verification link to the current authenticated user.
   */
  public static async verifyEmail(): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await sendEmailVerification(firebaseUser);
    } else {
      throw new Error('No active user found to verify.');
    }
  }

  /**
   * Sign out current session completely.
   */
  public static async logout(): Promise<void> {
    await signOut(auth);
    this.syncLocalSession(null);
  }

  /**
   * Synchronously fetch cached local session profile.
   */
  public static getCurrentSession(): UserProfile | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }

  /**
   * Trigger explicit session ID token refresh.
   */
  public static async refreshToken(): Promise<string | null> {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return firebaseUser.getIdToken(true);
    }
    return null;
  }
}
