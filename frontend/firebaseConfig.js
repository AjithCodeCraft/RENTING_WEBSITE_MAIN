// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,sendEmailVerification } from "firebase/auth";// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAihvpMjjiwUtWpsr5OP0YhoI96sujJNEo",
  authDomain: "rentinghostels.firebaseapp.com",
  projectId: "rentinghostels",
  storageBucket: "rentinghostels.firebasestorage.app",
  messagingSenderId: "532462069429",
  appId: "1:532462069429:web:f33bf7419766a54d6c40fc",
  measurementId: "G-9R5HQLB3P2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { auth,sendEmailVerification }