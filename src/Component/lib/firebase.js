import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDcYUbxbSOLj7PzgRgzq1xjDhV4NN_iG6E",
  authDomain: "reactchat-17143.firebaseapp.com",
  projectId: "reactchat-17143",
  storageBucket: "reactchat-17143.appspot.com",
  messagingSenderId: "348281805527",
  appId: "1:348281805527:web:8ba8eead02c2d455abee92"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
