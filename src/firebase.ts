// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAFcP_z8dcq2vXfNhzfusuvw8oMCJMIzhM',
  authDomain: 'malika-7ceaa.firebaseapp.com'
//   projectId: 'malika-7ceaa'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
