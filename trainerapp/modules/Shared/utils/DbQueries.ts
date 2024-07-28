// This commonly used queries
import * as SQLite from 'expo-sqlite';
import {SQLError, SQLTransaction} from "expo-sqlite";
import {
    workoutType,
    workoutExerciseType,
    exerciseType,
    loggedWorkoutType,
    mostFrequentExerciseType,
    loggedWorkoutExerciseType,
    loggedExerciseloggedWorkoutType
} from "../components/Types";
import {collection, doc, getDocs} from "firebase/firestore";
import {firestore} from "./firebase";
import {LoggedWorkoutExercise} from "./backupUtil";


const db = SQLite.openDatabase('app.db');


// Define the types
type Workout = workoutType;
type Exercise = exerciseType;
type WorkoutExercise = workoutExerciseType;
type LoggedWorkout = loggedWorkoutType;
type LoggedWorkoutExerciseType = loggedWorkoutExerciseType;
type LoggedExerciseloggedWorkoutType = loggedExerciseloggedWorkoutType;
type MostFrequentExerciseType = mostFrequentExerciseType;

// Print the entire total number of rows in each table
export const printDatabase = (): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                'select count(*) as workoutCount from workout',
                [],
                (_, { rows: { _array } }) => {
                    console.log("workoutCount", _array);
                }
            );
            tx.executeSql(
                'select count(*) as workoutExerciseCount from workoutExercise',
                [],
                (_, { rows: { _array } }) => {
                    console.log("workoutExerciseCount", _array);
                }
            );
            tx.executeSql(
                'select count(*) as loggedWorkoutCount from loggedWorkout',
                [],
                (_, { rows: { _array } }) => {
                    console.log("loggedWorkoutCount", _array);
                }
            );
            tx.executeSql(
                'select count(*) as loggedWorkoutExerciseCount from loggedWorkoutExercise',
                [],
                (_, { rows: { _array } }) => {
                    console.log("loggedWorkoutExerciseCount", _array);
                }
            );
        },
    );

}

// Gets all the workouts
export const getWorkouts = (successCallback: (workout: Workout[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                'select * from workout',
                [],
                (_, { rows: { _array } }) => {
                    successCallback(_array as Workout[]);
                    console.log("getWorkouts returned", _array);
                }
            );
        },
    );
};

// Get workout with a specific id
export const getWorkout = (workoutId: number, successCallback: (workout: Workout) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `select * from workout where workoutId=${workoutId}`,
                [],
                (_, { rows: { _array } }) => {
                    successCallback(_array[0] as Workout);
                    console.log("getWorkout returned", _array[0]);
                }
            );
        },
    );
};

// Updates the name of a workout
export const updateWorkoutName = async (workoutId: number, newName: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        db.transaction(
            (tx: SQLTransaction) => {
                tx.executeSql(`update workout set workoutName=? where workoutId=${workoutId}`, [newName]);
                console.log("updateWorkoutName updated", newName);
            },
            (error: SQLError) => reject(error),
            () => resolve()
        );
    });
};

// Updates the exercises in a workout
// By using a combination of delete and insert we can reuse the same function for both updating, creating and deleting exercises
export const updateWorkoutExercises = async (workoutId: number, exercises: WorkoutExercise[]): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        db.transaction(
            (tx: SQLTransaction) => {
                tx.executeSql(`delete from workoutExercise where workoutId=${workoutId}`);
                exercises.forEach((exercise, index) => {
                    tx.executeSql(
                        `insert into workoutExercise (workoutId, exerciseId, Sets, isOrder) values (?, ?, ?, ?)`,
                        [workoutId, exercise.exerciseId, exercise.sets, index+1]
                    );
                });
                console.log("updateWorkoutExercises updated", exercises);
            },
            (error: SQLError) => reject(error),
            () => resolve()
        );
    });
};

// Deletes a workout and its corresponding entries in workoutExercise
export const deleteWorkout = async (workoutId: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        db.transaction(
            (tx: SQLTransaction) => {
                tx.executeSql(`delete from workout where workoutId=${workoutId}`);
                tx.executeSql(`delete from workoutExercise where workoutId=${workoutId}`);
                console.log("deleteWorkout deleted", workoutId);
            },
            (error: SQLError) => reject(error),
            () => resolve()
        );
    });
};

// Gets the exercises in a workout
export const getWorkoutExercises = (workoutId: number, successCallback: (exercises: WorkoutExercise[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `SELECT workout.workoutId, exercise.exerciseId, exercise.exerciseName, workoutExercise.Sets, workoutExercise.isOrder, exercise.gifFileName
                             FROM workoutExercise, exercise, workout
                             WHERE workout.workoutId = ${workoutId}
                             AND workoutExercise.workoutId = workout.workoutId
                             AND workoutExercise.exerciseId = exercise.exerciseId
                             ORDER BY workoutExercise.isOrder;`,
                [],
                (_, { rows: { _array } }) => {
                    successCallback(_array as WorkoutExercise[]);
                    console.log("getWorkoutExercises returned", _array);
                }
            );
        },
    );
};

// Creates a new workout
export const createWorkout = async (workoutName: string): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        db.transaction(
            (tx: SQLTransaction) => {
                tx.executeSql(
                    `insert into workout (workoutName) values (?)`,
                    [workoutName],
                    (_, { insertId }) => {
                        if (insertId !== undefined) {
                            resolve(insertId);
                            console.log("Workout created", insertId);
                        } else {
                            reject(new Error("InsertId is undefined"));
                        }
                    }
                );
            },
            (error: SQLError) => reject(error)
        );
    });
};

// Delete an exercise from a workout
export const deleteExerciseFromWorkout = async (workoutId: number, exerciseId: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        db.transaction(
            (tx: SQLTransaction) => {
                tx.executeSql(
                    `delete from workoutExercise where workoutId=${workoutId} and exerciseId=${exerciseId}`
                );
                console.log("Deleted", exerciseId, " from ", workoutId);
            },
            (error: SQLError) => reject(error),
            () => resolve()
        );
    });
};

// Get exercise where the Ids are not equal to the ones in the existingIds array
export const getExercisesNotInWorkout = (existingIds: number[], successCallback: (exercises: Exercise[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `SELECT * FROM exercise WHERE exerciseId NOT IN (${existingIds.join(",")})`,
                [],
                (_, { rows: { _array } }) => {
                    successCallback(_array as Exercise[]);
                    console.log("getExercisesNotInWorkout returned", _array);
                }
            );
        },
    );
};

// Creates a copy of a workout and workoutExercise given a workoutId.
// Adds a suffix to the workout name if the name already exists
// Increments the suffix if it already exists
export const copyWorkout = async (workoutId: number): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        db.transaction(
            (tx: SQLTransaction) => {
                tx.executeSql(
                    `SELECT workoutName FROM workout WHERE workoutId = ?`,
                    [workoutId],
                    (_, { rows: { _array } }) => {
                        if (_array.length > 0) {
                            let workoutName = _array[0].workoutName;
                            let match = workoutName.match(/\((\d+)\)$/);
                            let suffix = match ? parseInt(match[1]) + 1 : 1;
                            workoutName = workoutName.replace(/\(\d+\)$/, '') + `(${suffix})`;

                            tx.executeSql(
                                `INSERT INTO workout (workoutName) VALUES (?)`,
                                [workoutName],
                                (_, { insertId }) => {
                                    if (insertId !== undefined) {
                                        tx.executeSql(
                                            `INSERT INTO workoutExercise (workoutId, exerciseId, Sets, isOrder)
                                             SELECT ?, exerciseId, Sets, isOrder FROM workoutExercise WHERE workoutId = ?`,
                                            [insertId, workoutId],
                                            () => {
                                                resolve(insertId);
                                                console.log("Copied workout", insertId);
                                            }
                                        );
                                    } else {
                                        reject(new Error("InsertId is undefined"));
                                    }
                                }
                            );
                        } else {
                            reject(new Error("Workout not found"));
                        }
                    }
                );
            },
            (error: SQLError) => reject(error)
        );
    });
};

// Gets all logged workouts from the database
// Also gets the name of the workout from the workout table
export const getLoggedWorkouts = (successCallback: (workouts: LoggedWorkout[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                'SELECT loggedWorkout.*, workout.workoutName FROM loggedWorkout JOIN workout ON loggedWorkout.workoutId = workout.workoutId',
                [],
                (_, { rows: { _array } }) => {
                    successCallback(_array as LoggedWorkout[]);
                    console.log("getLoggedWorkouts returned", _array);
                }
            );
        },
    );
};

// Gets all logged workouts from the database ordered by data
export const getLoggedWorkoutsInDateOrder = (successCallback: (workouts: LoggedWorkout[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                'SELECT loggedWorkout.*, workout.workoutName FROM loggedWorkout JOIN workout ON loggedWorkout.workoutId = workout.workoutId ORDER BY loggedWorkout.startTime',
                [],
                (_, { rows: { _array } }) => {
                    successCallback(_array as LoggedWorkout[]);
                    console.log("getLoggedWorkoutsInDateOrder returned", _array);
                }
            );
        },
    );
};

// Gets all the loggedWorkoutExercises for a loggedWorkout
export const getLoggedWorkoutExercises = (loggedWorkoutId: number, successCallback: (exercises: LoggedWorkoutExerciseType[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `SELECT loggedWorkoutExercise.*, exercise.gifFileName, exercise.exerciseName, exercise.muscleGroup
                 FROM loggedWorkoutExercise JOIN exercise ON loggedWorkoutExercise.exerciseId = exercise.exerciseId
                 WHERE loggedWorkoutId = ?
                 ORDER BY loggedWorkoutExercise.isOrder`,
                [loggedWorkoutId],
                (_, { rows: { _array } }) => {
                    successCallback(_array as LoggedWorkoutExerciseType[]);
                    console.log("getLoggedWorkoutExercises returned", _array);
                }
            );
        },
    );
};


// Gets the names, ids and musclegroups of all logged exercises that are not cardio (for one rep max)
export const getAllLoggedExerciseNamesNonCardio = (successCallback: (exercises: exerciseType[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `SELECT DISTINCT exercise.exerciseId, exercise.exerciseName, exercise.muscleGroup
                 FROM loggedWorkoutExercise 
                 JOIN exercise ON loggedWorkoutExercise.exerciseId = exercise.exerciseId
                 WHERE exercise.muscleGroup != 'Cardio'
                 ORDER BY exercise.exerciseName`,
                [],
                (_, { rows: { _array } }) => {
                    successCallback(_array as exerciseType[]);
                    console.log("getAllLoggedExerciseNamesNonCardio returned", _array);
                }
            );
        },
    );
};


// Gets all the data for all logged info for one specific exercise
export const getAllLoggedWorcoutExercisesNonCardio = (exerciseid: number, successCallback: (exercises: LoggedExerciseloggedWorkoutType[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `SELECT loggedWorkoutExercise.*, loggedWorkout.startTime, loggedWorkout.endTime
                FROM loggedWorkoutExercise 
                JOIN exercise ON loggedWorkoutExercise.exerciseId = exercise.exerciseId    
                JOIN loggedWorkout ON loggedWorkoutExercise.loggedWorkoutId = loggedWorkout.loggedWorkoutId
                WHERE exercise.exerciseId = ?
                ORDER BY loggedWorkout.endTime`,
                [exerciseid],
                (_, { rows: { _array } }) => {
                    successCallback(_array as LoggedExerciseloggedWorkoutType[]);
                    console.log("getAllLoggedWorcoutExercisesNonCardio returned", _array);
                }
            );
        },
    );
};


// Gets total number of workouts logged by user
export const getTotalLoggedWorkouts = (successCallback: (exercises: number) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `SELECT COUNT(loggedWorkoutid) as WorkoutCount
                FROM loggedWorkout`,
                [],
                (_, { rows: { _array } }) => {
                    successCallback(_array[0]?.WorkoutCount as number);
                    console.log("getTotalLoggedWorkouts returned", _array[0]?.WorkoutCount);
                }
            );
        },
    );
};

// Gets logged workouts based on month and year
export const getLoggedWorkoutsByDate = (date: string, successCallback: (workouts: LoggedWorkout[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `SELECT loggedWorkout.* 
                FROM loggedWorkout 
                WHERE startTime LIKE ?`,
                [date],
                (_, { rows: { _array } }) => {
                    successCallback(_array as LoggedWorkout[]);
                    console.log("getLoggedWorkoutsByDate returned", _array);
                }
            );
        },
    );
};


// Gets the exercise that is logged the most
export const getMostFrequentlyLoggedExercisesByDate = (date: string, successCallback: (exercises: MostFrequentExerciseType[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `SELECT COUNT(loggedWorkoutExercise.exerciseId) AS exerciseCount, exercise.exerciseName, exercise.muscleGroup
                FROM loggedWorkoutExercise 
                JOIN exercise ON loggedWorkoutExercise.exerciseId = exercise.exerciseId
                JOIN loggedWorkout ON loggedWorkoutExercise.loggedWorkoutId = loggedWorkout.loggedWorkoutId
                WHERE loggedWorkout.startTime LIKE ?                
                GROUP BY loggedWorkoutExercise.exerciseId
                ORDER BY exerciseCount DESC
                LIMIT 1
                `,
                [date],
                (_, { rows: { _array } }) => {
                    successCallback(_array as MostFrequentExerciseType[]);
                    console.log("getMostFrequentlyLoggedExercisesByDate returned", _array);
                }
            );
        },
    );
};


// get the most frequently logged muscle group by date
export const getMostFrequentlyMuscleGroupByDate = (date: string, successCallback: (exercises: MostFrequentExerciseType[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `SELECT COUNT(*) AS exerciseCount, exercise.muscleGroup
                FROM loggedWorkoutExercise 
                JOIN exercise ON loggedWorkoutExercise.exerciseId = exercise.exerciseId
                JOIN loggedWorkout ON loggedWorkoutExercise.loggedWorkoutId = loggedWorkout.loggedWorkoutId
                WHERE loggedWorkout.startTime LIKE ?
                GROUP BY exercise.muscleGroup
                ORDER BY exerciseCount DESC
                LIMIT 1                
                `,
                [date],
                (_, { rows: { _array } }) => {
                    successCallback(_array as MostFrequentExerciseType[]);
                    console.log("getMostFrequentlyMuscleGroupByDate returned", _array);
                }
            );
        },
    );
};




// Updates the reps and weight of a modified loggedWorkoutExercise
export const updateLoggedWorkoutExercise = async (loggedWorkoutExercise: LoggedWorkoutExerciseType): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        db.transaction(
            (tx: SQLTransaction) => {
                tx.executeSql(
                    `UPDATE loggedWorkoutExercise SET reps=?, weight=?, minutes=? WHERE loggedWorkoutId=? AND exerciseId=?`,
                    [loggedWorkoutExercise.reps || null, loggedWorkoutExercise.weight || null, loggedWorkoutExercise.minutes || null, loggedWorkoutExercise.loggedWorkoutId, loggedWorkoutExercise.exerciseId]
                );
                console.log("updateLoggedWorkoutExercise updated", loggedWorkoutExercise);
            },
            (error: SQLError) => reject(error),
            () => resolve()
        );
    });
};

// Get exercises that will be logged in a workout
// This is used when a new log is created.
// Also gets the previous reps, weight and minutes from the last logged workout if it exists
export const getExercisesToLog = (workoutId: number, successCallback: (exercises: LoggedWorkoutExerciseType[]) => void): void => {
    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                `SELECT workoutExercise.workoutId, workoutExercise.exerciseId, exercise.exerciseName, exercise.gifFileName, exercise.muscleGroup,
                            workoutExercise.sets, workoutExercise.isOrder, 
                            (SELECT reps FROM loggedWorkoutExercise WHERE workoutId = workoutExercise.workoutId AND exerciseId = workoutExercise.exerciseId ORDER BY loggedWorkoutId DESC LIMIT 1) AS previousReps,
                            (SELECT weight FROM loggedWorkoutExercise WHERE workoutId = workoutExercise.workoutId AND exerciseId = workoutExercise.exerciseId ORDER BY loggedWorkoutId DESC LIMIT 1) AS previousWeight,
                            (SELECT minutes FROM loggedWorkoutExercise WHERE workoutId = workoutExercise.workoutId AND exerciseId = workoutExercise.exerciseId ORDER BY loggedWorkoutId DESC LIMIT 1) AS previousMinutes
                            FROM workoutExercise 
                            JOIN exercise ON workoutExercise.exerciseId = exercise.exerciseId
                            WHERE workoutExercise.workoutId = ?
                            ORDER BY workoutExercise.isOrder;`
                ,
                [workoutId, workoutId],
                (_, { rows: { _array } }) => {
                    const exercises = _array.map(item => ({
                        ...item,
                        reps: item.reps || 0,
                        weight: item.weight || 0,
                        minutes: item.minutes || 0,

                    }));
                    successCallback(exercises as LoggedWorkoutExerciseType[]);
                    console.log("getExercisesToLog returned", exercises);
                }
            );
        },
    );
};


// Creates a new logged workout
export const createLoggedWorkout = async (workoutId: number, startTime: string): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        db.transaction(
            (tx: SQLTransaction) => {
                tx.executeSql(
                    `insert into loggedWorkout (workoutId, startTime, endTime) values (?, ?, ?)`,
                    [workoutId, startTime, new Date().toISOString()],
                    (_, { insertId }) => {
                        if (insertId !== undefined) {
                            resolve(insertId);
                            console.log("Logged workout created", insertId);
                        } else {
                            reject(new Error("InsertId is undefined"));
                        }
                    }
                );
            },
            (error: SQLError) => reject(error)
        );
    });
};

// Creates a new logged workout exercise
export const createLoggedWorkoutExercise = async (loggedWorkoutExercise: LoggedWorkoutExerciseType): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        db.transaction(
            (tx: SQLTransaction) => {
                tx.executeSql(
                    `INSERT INTO loggedWorkoutExercise (loggedWorkoutId, exerciseId, workoutId, sets, reps, weight, minutes, isOrder)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [loggedWorkoutExercise.loggedWorkoutId, loggedWorkoutExercise.exerciseId, loggedWorkoutExercise.workoutId, loggedWorkoutExercise.sets,
                          loggedWorkoutExercise.reps || null, loggedWorkoutExercise.weight || null, loggedWorkoutExercise.minutes || null, loggedWorkoutExercise.isOrder]
                );
                console.log("updateLoggedWorkoutExercise updated", loggedWorkoutExercise);
            },
            (error: SQLError) => reject(error),
            () => resolve()
        );
    });
};

// Deletes a logged workout and its corresponding entries in loggedWorkoutExercise
export const deleteLoggedWorkout = async (loggedWorkoutId: number): Promise<void> => {
    console.log("Deleting logged workout", loggedWorkoutId)
    return new Promise<void>((resolve, reject) => {
        db.transaction(

            (tx: SQLTransaction) => {
                tx.executeSql(`delete from loggedWorkout where loggedWorkoutId=${loggedWorkoutId}`);
                tx.executeSql(`delete from loggedWorkoutExercise where loggedWorkoutId=${loggedWorkoutId}`);
                console.log("deleteLoggedWorkout deleted", loggedWorkoutId);
            },
            (error: SQLError) => reject(error),
            () => resolve()
        );
    });
};

// Finds an exercise in the database that matches the exerciseName
// Returns a single workoutExerciseType with the workout id left blank
// This function is expected to fail if the exerciseName is not found
// It can therefore call the successCallback with a null value
export const findMatchingExercises = (exerciseName: string, successCallback: (exercise: exerciseType | null) => void): void => {
    // Removes "-" and creates singular and plural versions of the exercise name
    exerciseName = exerciseName.replace("-", " ");
    let singular = exerciseName;
    let plural = exerciseName;

    if (exerciseName.endsWith("s")) {
        singular = exerciseName.slice(0, -1);
    } else {
        plural = exerciseName + "s";
    }

    db.transaction(
        (tx: SQLTransaction) => {
            tx.executeSql(
                // Tries to find an exact match in the database using the different versions of the exercise name
                `SELECT * FROM exercise WHERE UPPER(exerciseName) = ? OR UPPER(exerciseName) = ? OR UPPER(exerciseName) = ? LIMIT 1`,
                [exerciseName.toUpperCase(), singular.toUpperCase(), plural.toUpperCase()],
                (_, { rows: { _array } }) => {
                    if (_array.length > 0) {
                        successCallback(_array[0] as exerciseType);
                        console.log("findMatchingExercises returned", _array[0]);
                    } else {

                        // If no exact match is found in the database, try to find a match using LIKE
                        tx.executeSql(
                            `SELECT * FROM exercise WHERE UPPER(exerciseName) LIKE ? OR UPPER(exerciseName) LIKE ? OR UPPER(exerciseName) LIKE ? LIMIT 1`,
                            [`%${exerciseName.toUpperCase()}%`, `%${singular.toUpperCase()}%`, `%${plural.toUpperCase()}%`],
                            (_, { rows: { _array } }) => {
                                if (_array.length > 0) {
                                    successCallback(_array[0] as exerciseType);
                                    console.log("findMatchingExercises returned", _array[0]);
                                } else {
                                    successCallback(null);
                                }
                            }
                        );
                    }
                }
            );
        },
    );
};

// getDataFromAppDb will get the data of a table from app.db
export const getDataFromAppDb = async (tableName: string): Promise<any[]> => {
    // gets a promise that will resolve with app.db data
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                // gets every data from a table
                `SELECT * FROM ${tableName};`,
                [],
                (_, result) => {
                    console.log(`Data from ${tableName}:`, result.rows._array); // just for debugging
                    resolve(result.rows._array); // resolve the promise with the data
                },
                (_, error) => {
                    console.error(`Error reading from ${tableName}:`, error); // just for debugging
                    reject(error); // reject the promise if there is an error
                    return false;
                }
            );
        });
    });
};


// Clears all the tables in the database except for the exercise table
export const clearDatabase = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        db.transaction(
            (tx: SQLTransaction) => {
                tx.executeSql(`delete from workout`);
                tx.executeSql(`delete from workoutExercise`);
                tx.executeSql(`delete from loggedWorkout`);
                tx.executeSql(`delete from loggedWorkoutExercise`);
                console.log("Database cleared");
            },
            (error: SQLError) => reject(error),
            () => resolve()
        );
    });
};

import {
    Workout as WorkoutTable,
    WorkoutExercise as WorkoutExerciseTable,
    LoggedWorkout as LoggedWorkoutTable,
    LoggedWorkoutExercise as LoggedWorkoutExerciseTable
} from './backupUtil';


// Syncs the database with the data from the server
export const syncDatabase = async (userId: string): Promise<void> => {
    const userReference = doc(firestore, 'users', userId);
    const workoutReference = collection(userReference, 'Workout');
    const workoutExerciseReference = collection(userReference, 'WorkoutExercise');
    const loggedWorkoutReference = collection(userReference, 'LoggedWorkout');
    const loggedWorkoutExerciseReference = collection(userReference, 'LoggedWorkoutExercise');
    //const exerciseReference = collection(userReference, 'Exercise');
    // This will fetch the documents for each collection
    const workoutFetched = await getDocs(workoutReference);
    const workoutExerciseFetched = await getDocs(workoutExerciseReference);
    const loggedWorkoutFetched = await getDocs(loggedWorkoutReference);
    const loggedWorkoutExerciseFetched = await getDocs(loggedWorkoutExerciseReference);
    //const exerciseFetched = await getDocs(exerciseReference);
    // this will map the documents to our app.db structure
    const workouts: WorkoutTable[] = workoutFetched.docs.map(doc => {
        const data = doc.data();
        return {
            workoutId: parseInt(doc.id),
            workoutName: data.workoutName
        };
    });
    const workoutExercises: WorkoutExerciseTable[] = workoutExerciseFetched.docs.map(doc => {
        const data = doc.data();
        return {
            workoutId: parseInt(data.workoutId),
            exerciseId: parseInt(data.exerciseId),
            sets: data.sets,
            isOrder: data.isOrder
        };
    });
    const loggedWorkouts: LoggedWorkoutTable[] = loggedWorkoutFetched.docs.map(doc => ({
        loggedWorkoutId: parseInt(doc.id),
        workoutId: parseInt(doc.data().workoutId),
        date: doc.data().date,
        startTime: doc.data().startTime,
        endTime: doc.data().endTime || null
    }));
    const loggedWorkoutExercises: LoggedWorkoutExerciseTable[] = loggedWorkoutExerciseFetched.docs.map(doc => ({
        loggedWorkoutId: parseInt(doc.id.split('_')[0]),
        workoutId: parseInt(doc.data().workoutId),
        exerciseId: parseInt(doc.data().exerciseId),
        sets: doc.data().sets,
        isOrder: doc.data().isOrder,
        reps: doc.data().reps || null,
        weight: doc.data().weight || null,
        minutes: doc.data().minutes || null
    }));


    console.log('Fetched workout data:', workouts);
    console.log('Fetched workoutExercise data:', workoutExercises);
    console.log('Fetched loggedWorkout data:', loggedWorkouts);
    console.log('Fetched loggedWorkoutExercise data:', loggedWorkoutExercises);
    //console.log('Fetched exercise data:', exercises);

    // This will replace or insert the data into the app.db
    db.transaction(tx => {
        // Replace or insert the workouts tables
        const workoutInsertQuery = `INSERT OR REPLACE INTO workout (workoutId, workoutName) VALUES (?, ?);`;
        workouts.forEach(workout => {
            tx.executeSql(workoutInsertQuery, [workout.workoutId, workout.workoutName]);
        });
        // Replace or insert the workoutsExersice tables
        const workoutExerciseInsertQuery = `INSERT OR REPLACE INTO workoutExercise (workoutId, exerciseId, sets, isOrder) VALUES (?, ?, ?, ?);`;
        workoutExercises.forEach(workoutExercise => {
            tx.executeSql(workoutExerciseInsertQuery, [workoutExercise.workoutId, workoutExercise.exerciseId, workoutExercise.sets, workoutExercise.isOrder]);
        });
        // Replace or insert the loggedWorkouts tables
        const loggedWorkoutInsertQuery = `INSERT OR REPLACE INTO loggedWorkout (loggedWorkoutId, workoutId, startTime, endTime) VALUES (?, ?, ?, ?);`;
        loggedWorkouts.forEach(loggedWorkout => {
            tx.executeSql(loggedWorkoutInsertQuery, [loggedWorkout.loggedWorkoutId, loggedWorkout.workoutId, loggedWorkout.startTime, loggedWorkout.endTime || null]);
        });
        // Replace or insert the loggedWorkoutExersice tables
        const loggedWorkoutExerciseInsertQuery = `INSERT OR REPLACE INTO loggedWorkoutExercise (loggedWorkoutId, workoutId, exerciseId, sets, isOrder, reps, weight, minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
        loggedWorkoutExercises.forEach(loggedWorkoutExercise => {
            tx.executeSql(loggedWorkoutExerciseInsertQuery, [
                loggedWorkoutExercise.loggedWorkoutId,
                loggedWorkoutExercise.workoutId,
                loggedWorkoutExercise.exerciseId,
                loggedWorkoutExercise.sets,
                loggedWorkoutExercise.isOrder,
                loggedWorkoutExercise.reps || null,
                loggedWorkoutExercise.weight || null,
                loggedWorkoutExercise.minutes || null
            ]);
        });

    });
}








