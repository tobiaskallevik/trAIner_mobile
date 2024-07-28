import { collection, doc, setDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { Workout, Exercise, WorkoutExercise, LoggedWorkout, LoggedWorkoutExercise } from './backupUtil';
import AsyncStorage from '@react-native-async-storage/async-storage';

// defines the tables as types
type allTables = Workout | Exercise | WorkoutExercise | LoggedWorkout | LoggedWorkoutExercise;

// makeBackup will back up the local data for a user to firestore
export const makeBackup = async (uid: string, tableName: string, data: allTables[]) => {
    const userReference = doc(firestore, 'users', uid); // reference to the users doc in firestore
    const tableReference = collection(firestore, userReference.path, tableName); // reference to a collection inside the users doc
    // gets a promise that will resolve with app.db data
    const promises = data.map((item) => {
        let docId: string | undefined;
        // finds the document id based on the type and its id
        switch (tableName) {
            case 'Workout':
                if ('workoutId' in item) {
                    docId = item.workoutId.toString();
                }
                break;
            case 'LoggedWorkout':
                if ('loggedWorkoutId' in item) {
                    docId = item.loggedWorkoutId?.toString();
                }
                break;
            case 'WorkoutExercise':
                if ('workoutId' in item && 'exerciseId' in item) {
                    docId = `${item.workoutId}_${item.exerciseId}`;
                }
                break;
            case 'LoggedWorkoutExercise':
                if ('loggedWorkoutId' in item && 'workoutId' in item && 'exerciseId' in item) {
                    docId = `${item.loggedWorkoutId}_${item.workoutId}_${item.exerciseId}`;
                }
                break;
        }
        if (docId === undefined) { // if the doc id is not found we get an error massage, then contiue to prosess other items
            console.error(`Item missing a primary key:`, item);
            return Promise.resolve();
        }
        // itemReference is a referense to a document in the collection
        const itemReference = doc(tableReference, docId);
        return setDoc(itemReference, item);
    });
    try {
        await Promise.all(promises);
        console.log(`${tableName} backup done!.`);
    } catch (error) {
        console.error(`Error for the table: ${tableName}:`, error);
        throw error;
    }
};

// Function to update ownerId in Firebase
export async function updateOwnerIdInFirebase(): Promise<void> {
    try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
            await setDoc(doc(firestore, 'users', userId), {
                ownerId: userId
            }, { merge: true });

            console.log('OwnerId updated in Firebase');
        }
    } catch (error) {
        console.error('Unable to update ownerId in Firebase', error);
    }
}
