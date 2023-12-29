import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaHp7O86fnYgOWQUzBDX0R2f7TYJRDIng",
  authDomain: "mukhamadazistholib-a4dc0.firebaseapp.com",
  projectId: "mukhamadazistholib-a4dc0",
  storageBucket: "mukhamadazistholib-a4dc0.appspot.com",
  messagingSenderId: "214861471511",
  appId: "1:214861471511:web:f1efb5a366ba7b28f5e152",
  measurementId: "G-RRBGT84MY4",
  databaseURL: "https://mukhamadazistholib-a4dc0-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const database = getDatabase(app)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
