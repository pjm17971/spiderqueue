export function isFirestoreEnabled(): boolean {
  const flag =
    import.meta.env.VITE_USE_FIRESTORE ??
    import.meta.env.USE_FIRESTORE ??
    false;
  const enabled = flag === 'true' || flag === true;
  return (
    enabled &&
    !!import.meta.env.VITE_FIREBASE_API_KEY &&
    !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    !!import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    !!import.meta.env.VITE_FIREBASE_APP_ID
  );
}

export function requiredFirebaseEnv(): string[] {
  return [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
  ];
}
