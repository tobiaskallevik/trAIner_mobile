// Defines the types used in the application. There are more or less the same as the database tables
// In some cases there are some additional fields that are not in the database.
// This is because the database is normalized, but we want access to the full data in the application

export interface workoutType {
    workoutId: number;
    workoutName: string;
}

// WorkoutExerciseType. This represents a single exercise in a workout
export interface workoutExerciseType {
    exerciseId: number;
    workoutId: number;
    exerciseName: string;
    sets: number;
    isOrder: number;
    gifFileName: string;
}

// Exercise type. This represents a single exercise
export interface exerciseType {
    exerciseId: number;
    exerciseName: string;
    muscleGroup: string;
    requiresGym: boolean;
    gifFileName: string;
}

// Logged workout type. This represents a single logged workout
export interface loggedWorkoutType {
    loggedWorkoutId: number;
    workoutId: number;
    workoutName: string;
    startTime: string;
    endTime: string;
}

// Logged workout exercise type. This represents a single exercise in a logged workout
// Holds a lot of additional data compared to the database table
// This may seem redundant, but it simplifies the code and reduces the number of needed database transactions
export interface loggedWorkoutExerciseType {
    loggedWorkoutId: number;
    exerciseId: number;
    workoutId: number;
    exerciseName: string;
    sets: number;
    previousSets: number;
    reps: number;
    previousReps: number;
    weight: number;
    previousWeight: number;
    minutes: number;
    previousMinutes: number;
    isOrder: number;
    gifFileName: string;
    muscleGroup: string;
}

// used by stats screen to get all logged exercises with their dates and names
// combines info from loggedWorkoutExercise and loggedWorkout and exercise
export interface loggedExerciseloggedWorkoutType {
    loggedWorkoutId: number;
    workoutId: number;
    workoutName: string;
    startTime: string;
    endTime: string;
    exerciseId: number;
    exerciseName: string;
    sets: number;
    reps: number;
    weight: number;
    minutes: number;
    isOrder: number;
    muscleGroup: string;
}


// used by stats screen to get all most frequent exercises and their muscle groups
export interface mostFrequentExerciseType {
    exerciseName: string;
    exerciseCount: number;
    muscleGroup: string;
}