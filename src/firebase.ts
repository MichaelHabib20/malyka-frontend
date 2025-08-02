// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAFcP_z8dcq2vXfNhzfusuvw8oMCJMIzhM',
  authDomain: 'malika-7ceaa.firebaseapp.com',
  projectId: 'malika-7ceaa',
  storageBucket: 'malika-7ceaa.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdef1234567890'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
