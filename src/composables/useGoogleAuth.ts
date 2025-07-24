import { ref, computed } from 'vue';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, provider } from '../firebase';

const GOOGLE_USER_KEY = 'googleUser';

const googleUser = ref<any>(null);

// Load from localStorage on init
const saved = localStorage.getItem(GOOGLE_USER_KEY);
if (saved) {
  try {
    googleUser.value = JSON.parse(saved);
  } catch {}
}

const isGoogleSignedIn = computed(() => !!googleUser.value);

async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    // You can extract more info if needed
    const userInfo = {
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      uid: result.user.uid,
      providerId: result.providerId || 'google',
    };
    googleUser.value = userInfo;
    localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(userInfo));
    return userInfo;
  } catch (err) {
    throw err;
  }
}

function signOutGoogle() {
  googleUser.value = null;
  localStorage.removeItem(GOOGLE_USER_KEY);
  firebaseSignOut(auth);
}

export function useGoogleAuth() {
  return {
    googleUser,
    isGoogleSignedIn,
    signInWithGoogle,
    signOutGoogle,
  };
} 