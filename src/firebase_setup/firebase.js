// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnUUMRepawWkAwbr_e4ynLqTXLCgKmT-M",
  authDomain: "amigoconnect-2023.firebaseapp.com",
  databaseURL: "https://amigoconnect-2023-default-rtdb.firebaseio.com",
  projectId: "amigoconnect-2023",
  storageBucket: "amigoconnect-2023.appspot.com",
  messagingSenderId: "393838735651",
  appId: "1:393838735651:web:f291237ea1b039cd745c96",
  measurementId: "G-ZFE7E9L61P"
};

// Initialize Firebase
export const FirebaseApp = initializeApp(firebaseConfig);
