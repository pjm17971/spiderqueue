import { isFirestoreEnabled } from '../config';
import { initFirebase } from '../firebase';
import { getFirestore, doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

const LS_KEY = 'spiderqueue_profiles_v1';

export interface ProfilesRepo {
  getName(email: string): Promise<string | undefined>;
  setName(email: string, name: string): Promise<void>;
}

class LocalProfilesRepo implements ProfilesRepo {
  private read(): Record<string, string> {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  }
  private write(map: Record<string, string>) {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  }
  async getName(email: string): Promise<string | undefined> {
    const map = this.read();
    return map[email.toLowerCase()];
  }
  async setName(email: string, name: string): Promise<void> {
    const map = this.read();
    map[email.toLowerCase()] = name;
    this.write(map);
  }
}

class FirestoreProfilesRepo implements ProfilesRepo {
  private db: Firestore;
  constructor() { initFirebase(); this.db = getFirestore(); }
  async getName(email: string): Promise<string | undefined> {
    const ref = doc(this.db, 'profiles', email.toLowerCase());
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data().name as string | undefined) : undefined;
  }
  async setName(email: string, name: string): Promise<void> {
    const ref = doc(this.db, 'profiles', email.toLowerCase());
    await setDoc(ref, { email: email.toLowerCase(), name, updatedAt: new Date().toISOString() }, { merge: true });
  }
}

let repo: ProfilesRepo | null = null;
export function getProfilesRepo(): ProfilesRepo {
  if (!repo) {
    repo = isFirestoreEnabled() ? new FirestoreProfilesRepo() : new LocalProfilesRepo();
  }
  return repo;
}
