import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACJ8DM9x5sK7pq1DzURnMqInzoVuUpRCA",
  authDomain: "komstickr.firebaseapp.com",
  databaseURL: "https://komstickr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "komstickr",
  storageBucket: "komstickr.firebasestorage.app",
  messagingSenderId: "83480527965",
  appId: "1:83480527965:web:02a98b2c6aac8152fdb9b4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);