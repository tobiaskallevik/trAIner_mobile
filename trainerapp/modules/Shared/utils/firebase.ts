// Import the functions you need from the SDKs you need
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp} from "firebase/app";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Add your Firebase project configuration here
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};


// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = initializeAuth(app,
    // so the user doesn't need to login every time they open the app:
    { persistence: getReactNativePersistence(ReactNativeAsyncStorage) }     // using AsyncStorage in order to persist between sessions 
);

// Initialize Firebase Analytics
// const analytics = getAnalytics(app);

const firestore = getFirestore(app);
const functions = getFunctions(app);

export { 
    app,
    auth, 
    functions, 
    firestore, 
};