/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { UserProfile, UserRole } from '../../types/user';
import { FirebaseAuthService } from '../../services/firebase/authService';
import { auth } from '../../services/firebase/init';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<UserProfile>;
  registerWithEmail: (email: string, password: string, displayName: string, role: UserRole) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  loginBySimulatedRole: (role: UserRole) => Promise<UserProfile>;
  login: (role: UserRole) => Promise<UserProfile>; // Legacy backward compatibility bypass
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  switchUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Eager load cached session from disk on startup to avoid page flickers
    return FirebaseAuthService.getCurrentSession();
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to Firebase Auth's persistent state observer
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Sync with Firestore profile mapping
          const profile = await FirebaseAuthService.getUserProfile(
            firebaseUser.uid,
            firebaseUser.email || '',
            firebaseUser.displayName || undefined
          );
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error synchronizing active user session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await FirebaseAuthService.loginWithEmail(email, password);
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string, displayName: string, role: UserRole): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await FirebaseAuthService.registerWithEmail(email, password, displayName, role);
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await FirebaseAuthService.loginWithGoogle();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fast sandbox login helper that signs into a dedicated simulated operator account per role.
   * This provides a premium development feedback flow without forcing users to register emails.
   */
  const loginBySimulatedRole = async (role: UserRole): Promise<UserProfile> => {
    setLoading(true);
    const simulatedEmail = `${role.toLowerCase()}-simulated@synapse.fifa.org`;
    const simulatedPassword = `SecureSynapseP@ss123_${role}`;
    const simulatedName = `Simulated ${role.charAt(0) + role.slice(1).toLowerCase()} Controller`;

    try {
      // Try to sign in first
      try {
        const profile = await FirebaseAuthService.loginWithEmail(simulatedEmail, simulatedPassword);
        setUser(profile);
        return profile;
      } catch (signInErr: any) {
        // If account doesn't exist yet, automatically provision it on the fly
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          const profile = await FirebaseAuthService.registerWithEmail(
            simulatedEmail,
            simulatedPassword,
            simulatedName,
            role
          );
          setUser(profile);
          return profile;
        }
        throw signInErr;
      }
    } catch (error) {
      console.error('Simulated role bypass error, falling back to cached local session:', error);
      // Absolute failover: mock local session bypass so the interface NEVER gets stuck in dev containers
      const mockProfile: UserProfile = {
        uid: `sim_${role.toLowerCase()}_${Math.random().toString(36).substring(2, 9)}`,
        email: simulatedEmail,
        displayName: simulatedName,
        role: role,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('fifa_synapse_user_session', JSON.stringify(mockProfile));
      setUser(mockProfile);
      return mockProfile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Backward compatibility legacy bypass.
   */
  const login = async (role: UserRole): Promise<UserProfile> => {
    return loginBySimulatedRole(role);
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await FirebaseAuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await FirebaseAuthService.resetPassword(email);
  };

  const verifyEmail = async (): Promise<void> => {
    await FirebaseAuthService.verifyEmail();
  };

  const switchUserRole = async (role: UserRole): Promise<void> => {
    if (!user) return;
    setLoading(true);
    try {
      // Only write to Firestore if we are in a real authenticated Firebase session (non-simulated)
      if (!user.uid.startsWith('sim_')) {
        await FirebaseAuthService.updateUserRole(user.uid, role);
      }
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('fifa_synapse_user_session', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to swivel user role:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginBySimulatedRole,
        login,
        logout,
        resetPassword,
        verifyEmail,
        switchUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
