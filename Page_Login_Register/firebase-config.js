// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfgU__EN29eRiNB61bMGEPuuE5fbO43tA",
  authDomain: "magnet-9defc.firebaseapp.com",
  databaseURL: "https://magnet-9defc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "magnet-9defc",
  storageBucket: "magnet-9defc.firebasestorage.app",
  messagingSenderId: "449932305849",
  appId: "1:449932305849:web:e073f823b48550bb390268",
  measurementId: "G-YX9627KG64"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();