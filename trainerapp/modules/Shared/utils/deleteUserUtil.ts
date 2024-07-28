// Import statements
import { getAuth, signOut, User } from "firebase/auth";
import { getFirestore, collection, getDocs, deleteDoc, doc, DocumentReference, Firestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { app } from './firebase';

// Initialize all the used Firebase services
const auth = getAuth();
const db: Firestore = getFirestore();
const functions: Functions = getFunctions(app, 'europe-west1');

interface DeleteUserResponse {
    message: string;
}

// Function to delete all the subcollections inside firestore database
async function deleteAllSub(userReference: DocumentReference): Promise<void> {
    const subcollections: string[] = ['Workout', 'LoggedWorkout', 'WorkoutExercise', 'LoggedWorkoutExercise'];
    for (const subcollection of subcollections) {
        const subcollectionReference = collection(userReference.firestore, userReference.path, subcollection);
        const snapshot = await getDocs(subcollectionReference);
        snapshot.docs.forEach(async (document) => {
            await deleteDoc(document.ref);
        });
    }
}

// Function to delete the current user from Firestore and Authentication
export const deleteTheUser = async (): Promise<void> => {
    const user: User | null = auth.currentUser;
    if (user) {
        const userReference: DocumentReference = doc(db, 'users', user.uid);
        const deleteUserAccount = httpsCallable<{}, DeleteUserResponse>(functions, 'deleteUserAccount');
        try {
            // Delete Firestore subcollections and user document
            await deleteAllSub(userReference);
            console.log("Subcollections deleted");
            await deleteDoc(userReference);
            console.log("User document deleted");

            // Call cloud function to delete user authentication
            const result = await deleteUserAccount();
            console.log(result.data.message);

            // Sign out user and clear AsyncStorage
            await signOut(auth);
            try {
                await ReactNativeAsyncStorage.clear();
                console.log("AsyncStorage cleared successfully");
            } catch (error) {
                console.error("Failed to clear AsyncStorage:", error);
            }
            console.log("User signed out and AsyncStorage cleared");
        } catch (error) {
            console.error("Error during user deletion:", error);
        }
    } else {
        console.log("No user logged in");
    }
};
