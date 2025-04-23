//---------------FIREBASE INTIALIZATION----------------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD73BuWes-GBY57d73M7Tsy7zw7YWGXaXE",
  authDomain: "fees-tracker-28ddb.firebaseapp.com",
  projectId: "fees-tracker-28ddb",
  storageBucket: "fees-tracker-28ddb.firebasestorage.app",
  messagingSenderId: "51807962573",
  appId: "1:51807962573:web:1139d3a2ba996099b6f084"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)


/////--------FIREBASE INIT DONE------------------------//////////