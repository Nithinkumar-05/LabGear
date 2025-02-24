// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrOWNM2XnhgrkFvJjU8toNVp46DLzAyrE",
  authDomain: "labgear-2979e.firebaseapp.com",
  projectId: "labgear-2979e",
  storageBucket: "labgear-2979e.firebasestorage.app",
  messagingSenderId: "680397875552",
  appId: "1:680397875552:web:48819c06f3927a40b7d605"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const usersRef = collection(db, 'users');
export const componentsRef = collection(db, 'components');
export const requestsRef = collection(db, 'Requests');
export const labsRef = collection(db,"labs");
export const approvedRequestsRef = collection(db, 'approvedRequests');