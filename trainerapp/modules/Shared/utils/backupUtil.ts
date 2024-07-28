import {makeBackup} from './firestoreService';
import * as SQLite from "expo-sqlite";
import {getDataFromAppDb} from '../../Shared/utils/DbQueries';

// the diffrent types/interfaces from the database
export interface Workout {
    workoutId: number;
    workoutName: string;
}

export interface Exercise {
    exerciseId: number;
    exerciseName: string;
    muscleGroup: string;
    requiresGym: number;
    gifFileName: string;
}

export interface WorkoutExercise {
    workoutId: number;
    exerciseId: number;
    sets: number;
    isOrder: number;
}

export interface LoggedWorkoutExercise {
    loggedWorkoutId: number;
    workoutId: number;
    exerciseId: number;
    sets: number;
    isOrder: number;
    reps?: number; //optional
    weight?: number; //optional
    minutes?: number; //optional
}
export interface LoggedWorkout {
    loggedWorkoutId: number;
    workoutId: number;
    date: string;
    startTime: string;
    endTime?: string; //optional
}

// backupDatabase will backup the database to firestore
export const backupDatabase = async (userId: string): Promise<void> => {
    // No need to add exersice
    const tables = [
        'Workout',
        'WorkoutExercise',
        'LoggedWorkout',
        'LoggedWorkoutExercise',
    ];
    try {
        // iterates through every table, then makes the backup
        for (const tableName of tables) {
            const data = await getDataFromAppDb(tableName); // gets the data from app.db
            await makeBackup(userId, tableName, data); //makes the backup to firestore
        }
        console.log('The backup was sucsessful"');
    } catch (error) {
        // logs error if backup is failing
        console.error('Error:', error);
    }
};

