import { ref, onMounted } from 'vue';
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { auth, provider } from '../firebase';

interface GoogleUser {
  name: string;
  email: string;
  image: string;
  token: string;
}

export function useGoogleAuth() {
  const isGoogleSignedIn = ref(false);
  const googleUser = ref<GoogleUser | null>(null);
  const isLoading = ref(false);

  // Cookie management
  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const removeCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  const saveUserToCookie = (user: GoogleUser) => {
    const userData = JSON.stringify(user);
    setCookie('googleUser', userData, 30);
  };

  const loadUserFromCookie = (): GoogleUser | null => {
    const userData = getCookie('googleUser');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from cookie:', error);
        removeCookie('googleUser');
        return null;
      }
    }
    return null;
  };

  const signInWithGoogle = async () => {
    try {
      isLoading.value = true;
      const result = await signInWithPopup(auth, provider);
      
      const user: GoogleUser = {
        name: result.user.displayName || '',
        email: result.user.email || '',
        image: result.user.photoURL || '',
        token: await result.user.getIdToken()
      };

      googleUser.value = user;
      isGoogleSignedIn.value = true;
      saveUserToCookie(user);
      
      return user;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    } finally {
      isLoading.value = false;
    }
  };

  const signOutGoogle = async () => {
    try {
      isLoading.value = true;
      await signOut(auth);
      googleUser.value = null;
      isGoogleSignedIn.value = false;
      removeCookie('googleUser');
    } catch (error: any) {
      console.error('Google sign-out error:', error);
      throw new Error(error.message || 'Failed to sign out from Google');
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuthState = () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData: GoogleUser = {
          name: user.displayName || '',
          email: user.email || '',
          image: user.photoURL || '',
          token: await user.getIdToken()
        };
        googleUser.value = userData;
        isGoogleSignedIn.value = true;
        saveUserToCookie(userData);
      } else {
        // Check if we have user data in cookie
        const cookieUser = loadUserFromCookie();
        if (cookieUser) {
          googleUser.value = cookieUser;
          isGoogleSignedIn.value = true;
        } else {
          googleUser.value = null;
          isGoogleSignedIn.value = false;
        }
      }
    });
  };

  onMounted(() => {
    // Load user from cookie on mount
    const cookieUser = loadUserFromCookie();
    if (cookieUser) {
      googleUser.value = cookieUser;
      isGoogleSignedIn.value = true;
    }
    
    // Set up auth state listener
    checkAuthState();
  });

  return {
    isGoogleSignedIn,
    googleUser,
    isLoading,
    signInWithGoogle,
    signOutGoogle
  };
} 