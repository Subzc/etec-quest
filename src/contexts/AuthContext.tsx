"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase/client";
import type { UserProfile } from "@/types/models";

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (params: {
    displayName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function emptyStats() {
  return {
    totalStudyMinutes: 0,
    totalSessions: 0,
    subjectsCompleted: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    accuracyRate: 0,
    lessonsCompleted: 0,
    bossesDefeated: 0,
  };
}

async function ensureUserProfile(user: User, provider: "google" | "password", displayNameOverride?: string, usernameOverride?: string) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;

const nowISO = new Date().toISOString();
  const profile: UserProfile = {
    uid: user.uid,
    displayName: displayNameOverride ?? user.displayName ?? "Aventureiro",
    username: usernameOverride ?? user.uid.slice(0, 8),
    email: user.email ?? "",
    ...(user.photoURL ? { photoURL: user.photoURL } : {}),
    authProvider: provider,
    createdAt: nowISO,
    updatedAt: nowISO,
    level: 1,
    currentXP: 0,
    totalXP: 0,
    title: "Aventureiro",
    stats: emptyStats(),
    streak: { current: 0, longest: 0, lastStudyDate: null },
    role: "student",
  };

  await setDoc(ref, { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          // Usuário autenticado mas sem perfil no Firestore (ex.: a escrita
          // falhou no cadastro por regra de segurança). Cria agora.
          const provider = user.providerData[0]?.providerId === "google.com" ? "google" : "password";
          const p = await ensureUserProfile(user, provider);
          setProfile(p);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const p = await ensureUserProfile(cred.user, "google");
    setProfile(p);
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (params: {
    displayName: string;
    username: string;
    email: string;
    password: string;
  }) => {
    const cred = await createUserWithEmailAndPassword(auth, params.email, params.password);
    await updateProfile(cred.user, { displayName: params.displayName });
    const p = await ensureUserProfile(cred.user, "password", params.displayName, params.username);
    setProfile(p);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
