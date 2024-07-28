/* Once the AI has generated a workout, we need to find the exercises in the database.
* This function will take the generated workout and search the database for the exercises.
* Once the exercises are found, they will be returned as an array of Exercise objects.
*/

import {workoutExerciseType} from "../../Shared/components/Types";
import {findMatchingExercises} from "../../Shared/utils/DbQueries";




const FindGeneratedInDB = async (generatedWorkout: any) => {
    // Creates an empty array of exercisesType
    let exercises: workoutExerciseType[] = [];

    // Pushes the exercises from the generated workout to the exercises array
    for (let i = 0; i < generatedWorkout.exercises.length; i++) {
        exercises.push(generatedWorkout.exercises[i]);
    }


    // Creates an empty array of promises
    let promises = [];
    let foundExercises = 0;

    // Loops through the exercises and finds the matching exercises in the database
    for(let i = 0; i < exercises.length; i++) {
        let exercise = exercises[i];

        // Creates a new promise for each findMatchingExercises call
        let promise = new Promise<void>((resolve, reject) => {
            findMatchingExercises(exercise.exerciseName, (matchingExercise) => {
                // Update the exercise in the array with the matching exercise from the database
                if (matchingExercise) {
                    exercises[i].exerciseId = matchingExercise.exerciseId;
                    exercises[i].exerciseName = matchingExercise.exerciseName;
                    exercises[i].gifFileName = matchingExercise.gifFileName;
                    foundExercises++;
                }
                resolve();
            });
        });

        // Adds the promise to the array
        promises.push(promise);

        // Checks if we have successfully found the more than 7 exercises with actual data
        if (foundExercises > 7) {
            break;
        }
    }

    // Wait for all promises to resolve
    await Promise.all(promises);

    // Remove all exercises that don't have an id
    exercises = exercises.filter((exercise) => exercise.exerciseId !== undefined);

    // Set the order of the exercises
    exercises.forEach((exercise, index) => {
        exercise.isOrder = index+1;
    });

    // Removes exercises with the same exerciseId
    exercises = exercises.filter((exercise, index, self) =>
        index === self.findIndex((t) => (
            t.exerciseId === exercise.exerciseId
        ))
    );

    if (exercises.length < 3) {
        throw new Error("Not enough exercises found in the database");
    } else {
        return exercises;
    }
}

export default FindGeneratedInDB;
