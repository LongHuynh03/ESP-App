import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBkj_mP_BK91MZ-dQjoWF0lhueXVcquEU0",
  authDomain: "esp32-fire-ae12a.firebaseapp.com",
  databaseURL: "https://esp32-fire-ae12a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "esp32-fire-ae12a",
  storageBucket: "esp32-fire-ae12a.firebasestorage.app",
  messagingSenderId: "239884422541",
  appId: "1:239884422541:web:d08124bc6d5f3afb7f01c4",
  measurementId: "G-99XR3J96ZR"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
