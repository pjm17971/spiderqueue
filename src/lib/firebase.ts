import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User as FirebaseUser } from 'firebase/auth';

let firebaseAvailable = true;
let appInitialized = false;

export type AuthState = {
  user: FirebaseUser | null;
  loading: boolean;
  error?: string;
};

export function initFirebase() {
  if (appInitialized) return;
  try {
    const config: FirebaseOptions = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    } as FirebaseOptions;

    if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
      firebaseAvailable = false;
      return;
    }

    initializeApp(config);
    appInitialized = true;
  } catch (e) {
    firebaseAvailable = false;
  }
}

export function isFirebaseEnabled() {
  return firebaseAvailable;
}

export function getFirebaseAuth() {
  initFirebase();
  return getAuth();
}

export async function signInWithGooglePopup(): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export function subscribeAuthState(cb: (user: FirebaseUser | null) => void) {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, (user) => cb(user));
}
