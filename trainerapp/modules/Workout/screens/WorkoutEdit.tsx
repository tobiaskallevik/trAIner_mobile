/* This is the workout screen.
*  The user can add exercises to the workout and change the sets of each exercise.
*  The user can also delete an exercise from the workout.
*  The user can also view the gif of each exercise.
*  The user can save the workout and go back to the workout home screen.
*  The user can also start a workout from this screen.
*/


import {NavigationProp, useIsFocused, useRoute} from "@react-navigation/native";
import {globalStyles} from "../../Shared/components/GlobalStyles";
import {
    View, Text, Dimensions, StyleSheet, TextInput, Alert,
    TouchableOpacity, TouchableWithoutFeedback, Keyboard, FlatList, StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState} from 'react';
import { workoutType, workoutExerciseType, exerciseType } from "../../Shared/components/Types";
import PlusBtn from "../../Shared/components/PlusBtn";

import {
    deleteWorkout,
    getWorkout,
    getWorkoutExercises,
    updateWorkoutName,
    updateWorkoutExercises,
    createWorkout,
    getExercisesNotInWorkout,
    copyWorkout
} from "../../Shared/utils/DbQueries";

import GifModal from "../../Shared/components/GifModal";
import PopUpMenuModal from "../../Shared/components/PopUpMenuModal";
import ExerciseListModal from "../components/ExerciseListModal";
import ExerciseReorderModal from "../components/ExerciseReorderModal";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {checkKeyboardVisibility} from "../../Shared/utils/KeyboardHook";
import {ckeckInternet} from "../../Shared/utils/checkForInternett";
import exerciseListModal from "../components/ExerciseListModal";

// Workout edit screen
export default function WorkoutEditScreen({ navigation }: { navigation: NavigationProp<any>; }) : JSX.Element {
    // Routing constants
    const route = useRoute();
    const { workoutId } = route.params as { workoutId: number };

    // State constants
    const [workout, setWorkout] = useState<workoutType | null>(null);
    const [exercises, setExercises] = useState<workoutExerciseType[]>([]);
    const [exerciseIds, setExerciseIds] = useState<number[]>([]);
    const [exercisesNotInWorkout, setExercisesNotInWorkout] = useState<exerciseType[]>([]);
    const isFocused = useIsFocused(); // Check if the screen is focused

    // Modal constants
    const [gifModalVisible, setGifModalVisible] = useState(false);
    const [menuModalVisible, setMenuModalVisible] = useState(false);
    const [exerciseListModalVisible, setExerciseListModalVisible] = useState(false);
    const [currentGif, setCurrentGif] = useState('');
    const [exerciseReorderModalVisible, setExerciseReorderModalVisible] = useState(false);
    const [exerciseWasReordered, setExerciseWasReordered] = useState(false);

    // Checks keyboard visibility
    const isKeyboardVisible = checkKeyboardVisibility();

    const Online = ckeckInternet();

    // Get the workout and exercises from the database if the workout isn't new "aka workoutId !== -1"
    useEffect(() => {

        console.log(workout);
        // If the workout is not new, get the workout and exercises from the database
        if (isFocused && workoutId !== -1) {
            getWorkout(workoutId, (workoutFromDb: workoutType) => {
                setWorkout(workoutFromDb);
                console.log(workoutFromDb);
            });
            getWorkoutExercises(workoutId, (exercisesFromDb: workoutExerciseType[]) => {
                setExercises(exercisesFromDb);
                console.log(exercisesFromDb);
            });
        }

        // If the workout is new, set the workout to an empty object and the exercises to an empty array
        else if (workoutId === -1) {
            setWorkout({ workoutId: -1, workoutName: '' });
            setExercises([]);
            console.log("New workout");
        }

    }, [isFocused]);

    // Sets the exerciseIds to an array of the exerciseIds in the workout.
    // Needed to check if an exercise is already in the workout, so it doesn't get added twice
    useEffect(() => {
        const ids = exercises.map(exercise => exercise.exerciseId);
        setExerciseIds(ids);
    }, [exercises]);

    // Reorders the exercises in the workout to align with the isOrder attribute
    useEffect(() => {
        if (exerciseWasReordered) {
            const sortedExercises = [...exercises].sort((a, b) => a.isOrder - b.isOrder);
            console.log("Reordering exercises", sortedExercises)
            setExercises(sortedExercises);

            // Reset exerciseWasReordered to false after sorting
            setExerciseWasReordered(false);
        }
    }, [exercises, exerciseWasReordered]);


    // Save the edited workout
    const handleSave = async () => {
        // For existing workout
        if (workout && exercises.length > 0 && workoutId !== -1) {
            await updateWorkoutName(workout.workoutId, workout.workoutName);
            await updateWorkoutExercises(workout.workoutId, exercises);

            navigation.goBack();
        }

        // For new workout
        else if (workoutId === -1 && workout) {
            console.log("Creating new workout")
            createWorkout(workout.workoutName)
                .then(insertId => {
                    console.log(`Workout created with ID: ${insertId}`);
                    updateWorkoutExercises(insertId, exercises);
                })
                .catch(error => console.error(`Failed to create workout: ${error.message}`));

            navigation.navigate('WorkoutHome');
        }
    };


    // Delete the workout
    const handleDelete = () => {
        setMenuModalVisible(false)

        if (workout) {
            // Ask the user if they are sure they want to delete the workout
            Alert.alert(
                'Delete Workout',
                'Are you sure you want to delete this workout?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'OK',
                        // If the user presses OK, delete the workout and go back to the previous screen
                        onPress: async () => {
                            await deleteWorkout(workout.workoutId);
                            navigation.goBack();
                        },
                    },
                ],
                { cancelable: false },
            );
        }
    };

    // Copy the workout and go back to the workout home screen
    const handleCopy = () => {
        setMenuModalVisible(false)
        console.log("Copying workout with ID: ", workout?.workoutId);
        if (workout && workout.workoutId !== -1) {
            copyWorkout(workout.workoutId)
                .then(insertId => {
                    console.log(`Workout copied with ID: ${insertId}`);
                    navigation.navigate('WorkoutHome');
                })
                .catch(error => console.error(`Failed to copy workout: ${error.message}`));
        }
    };

    // Deletes an exercise from the array of exercises. This will not delete the exercise from the database until the user saves the workout
    const handleDeleteExercise = ( exerciseId: number) => {
        setExercises((prevExercises) => {
            return prevExercises.filter((exercise) => exercise.exerciseId !== exerciseId);
        });
    };

    // Change the sets of an exercise
    const handleSetChange = (text: string, index: number) => {
        setExercises((prevExercises) => {
            const newExercises = [...prevExercises];
            const newSets = Number(text);

            // we only want to update the sets if the input is a number, and make sure the number is not negative (due to pasting)
            if (!isNaN(newSets)) {
                newExercises[index].sets = Math.max(0, newSets);
            }

            return newExercises;
        });
    };

    // Opens the modal to add a new exercise
    const handleNewExerciseModal = () => {
        getExercisesNotInWorkout(exerciseIds, (exercisesFromDb: exerciseType[]) => {
            setExercisesNotInWorkout(exercisesFromDb);
        });
        setExerciseListModalVisible(true);
    }

    // Adds an exercise to the workout chosen from the modal
    const handleAddExercise = (exerciseId: number) => {
        // Get the exercises not in the workout to update what the modal shows after an exercise is added
        getExercisesNotInWorkout(exerciseIds, (exercisesFromDb: exerciseType[]) => {
            setExercisesNotInWorkout(exercisesFromDb);
        });

        // Add the exercise to the workout object
        setExercises((prevExercises) => {
            const newExercises = [...prevExercises];
            const newExercise = exercisesNotInWorkout.find(exercise => exercise.exerciseId === exerciseId);
            if (newExercise) {

                // even though the list should only show exercises not in the workout, the list is slow to update (atleast on emulator)
                // this check is to make sure the exercise is not already in the workout
                const foundExercise = newExercises.find(exercise => exercise.exerciseId === newExercise.exerciseId);
                if (!foundExercise) {
                    newExercises.push({
                        exerciseId: newExercise.exerciseId,
                        workoutId: workoutId,
                        exerciseName: newExercise.exerciseName,
                        sets: 1,
                        isOrder: newExercises.length + 1,
                        gifFileName: newExercise.gifFileName });
                }
            }
            return newExercises;
        });
    }

    // Updates the order of the exercises in the workout
    const handleReorderExercises = (newExercises: workoutExerciseType[]) => {
        setExercises(newExercises);
        setExerciseWasReordered(true);
    }


    // Start a workout.
    // If there is already a workout in progress, ask the user if they want to resume it or start a new one.
    // If the user chooses to start a new workout, the workout that is currently logged will be overwritten.
    const handleStartWorkout = () => {

        setMenuModalVisible(false)
        // Gets the current date and time
        const date = new Date();
        const startTime = date.toISOString();

        // Check if the user already has a workout in progress
        // If they do, ask if they want to resume the workout or start a new one

        AsyncStorage.getItem('@workoutState').then(r => {
            if (r) {
                Alert.alert('Resume Workout', 'You already have a workout in progress. Do you want to resume it?',
                    [
                        {
                            text: 'Start New',
                            onPress: () => { // If the user wants to start a new workout, navigate to the logged workout screen with the workoutId, name and startTime as parameters
                                navigation.navigate('Log', {
                                    screen: 'LoggedWorkout',
                                    params: {
                                        workout: {
                                            workoutId: workoutId,
                                            workoutName: workout?.workoutName,
                                            startTime: startTime },
                                        isExistingWorkout: false
                                    }
                                });
                            }
                        }, {},
                        {
                            text: 'Resume',
                            onPress: () => {
                                // If the user wants to resume the workout, get the saved workout state from async storage and navigate to the logged workout screen
                                AsyncStorage.getItem('@workoutState')
                                    .then(savedState => {
                                        if (savedState !== null) {

                                            const savedWorkout = JSON.parse(savedState);
                                            navigation.navigate('LoggedWorkout', {
                                                workout: savedWorkout,
                                                isExistingWorkout: false,
                                                isResumedLog: true
                                            });
                                        }
                                    });
                            }
                        }
                    ],
                    { cancelable: true },
                );
            } else {
                // If the user doesn't have a workout in progress, navigate to the logged workout screen with the workoutId, name and startTime as parameters
                navigation.navigate('Log', {
                    screen: 'LoggedWorkout',
                    params: {
                        workout: {
                            workoutId: workoutId,
                            workoutName: workout?.workoutName,
                            startTime: startTime },
                        isExistingWorkout: false
                    }
                });
            }
        })
    };


    // Show the gif
    const showGif = (gifFileName: string) => {
        if (!Online) {
            Alert.alert("You dont have internet", "Please check your internet connection and retry :).");
            return;
        }
        setCurrentGif(gifFileName);
        setGifModalVisible(true);
    };

    const handleBack = () => {
        navigation.navigate('WorkoutHome');
    }



    // Render the exercises in the workout
    const renderItem = ({ item, index }: { item: workoutExerciseType; index: number }) => (
        <View key={item.exerciseId} style={styles.exerciseItem}>
            <Text style={{...globalStyles.largeText, marginRight: 24}}>{item.exerciseName}</Text>
            {/*Allows users to change the sets in a given exercise*/}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.sets}>
                    <Text style={globalStyles.text}> Sets: </Text>
                    <TextInput
                        maxLength={2}
                        style={styles.setsInput}
                        keyboardType="numeric"
                        value={item?.sets.toString()}
                        blurOnSubmit={true}
                        onChangeText={(text) => handleSetChange(text, index)}

                    />
                </View>
            </TouchableWithoutFeedback>
            <Icon style={styles.info} name="information-outline" size={20} onPress={() => showGif(item.gifFileName)}/>
            <Icon style={styles.deleteExercise} name="delete" size={20} onPress={() => handleDeleteExercise(item.exerciseId)}/>
        </View>
    );


    return (
        <>
        <View style={styles.contentContainer}>

            <View style={styles.header}>

                <TouchableOpacity onPress={handleBack} style={styles.backArrow}>
                    <Icon name="arrow-left" color="white" size={30}/>
                    {/*Menu button for bottom popup menu*/}
                    <TouchableOpacity style={styles.menuDots} onPress={(()=>setMenuModalVisible(true))}>
                        <Icon name="dots-vertical" size={30} color="white" />
                    </TouchableOpacity>
                </TouchableOpacity>

                <Text style={globalStyles.headerText}>
                    {workoutId === -1 ? 'New Workout' : workout?.workoutName}
                </Text>

            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Workout Name</Text>
                <TextInput
                    style={styles.input}
                    maxLength={20}
                    blurOnSubmit={true}
                    value={workout?.workoutName}
                    placeholder="Enter workout name"
                    onChangeText={(text) => setWorkout((prevWorkout) => prevWorkout ? { ...prevWorkout, workoutName: text } : null)}
                />

            </View>
                {/*Exercise list*/}
            <View style={styles.exerciseContainer}>
                <FlatList
                    data={exercises}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.exerciseId.toString()}
                    contentContainerStyle={{paddingBottom: 350, paddingTop: 15,}}
                />
            </View>

            {/*Save and add exercise buttons*/}
            {isKeyboardVisible ? null : (
                <>
                    <PlusBtn icon="check" buttonStyle={{left:25}} gradient={{ colors: ['#00FF3F', '#00C732'] }} onPress={handleSave} />
                    <PlusBtn onPress={handleNewExerciseModal} />
                </>
            )}


            {/*Modals*/}
            <GifModal modalVisible={gifModalVisible} setModalVisible={setGifModalVisible} currentGif={currentGif} />
            <ExerciseReorderModal onExerciseReorder={handleReorderExercises} exercises={exercises} modalVisible={exerciseReorderModalVisible} setModalVisible={setExerciseReorderModalVisible}/>
            <ExerciseListModal onExerciseAdd = {handleAddExercise} exercises={exercisesNotInWorkout} modalVisible={exerciseListModalVisible} setModalVisible={setExerciseListModalVisible}/>

            <PopUpMenuModal modalVisible={menuModalVisible} setModalVisible={setMenuModalVisible}>
                <TouchableOpacity onPress={handleStartWorkout} style={{flexDirection: "row"}}>
                    <Icon color={"#0A84FF"} name="play" size={23} />
                    <View style={{width: 20}}/>
                    <Text style={{...globalStyles.mediumText, paddingTop: 2, color: "#0A84FF"}}>Start Workout</Text>
                </TouchableOpacity>
                <View style={{height: 14}}/>
                <TouchableOpacity
                    onPress={() => {
                        setExerciseReorderModalVisible(true);
                        setMenuModalVisible(false);
                    }}
                    style={{flexDirection: "row"}}>
                    <Icon color={"white"} name="sort" size={23} />
                    <View style={{width: 20}}/>
                    <Text style={{...globalStyles.mediumText, paddingTop: 2}}>Sort Exercises</Text>
                </TouchableOpacity>
                <View style={{height: 14}}/>
                <TouchableOpacity onPress={handleCopy} style={{flexDirection: "row"}}>
                    <Icon color={"white"} name="content-copy" size={23} />
                    <View style={{width: 20}}/>
                    <Text style={{...globalStyles.mediumText, paddingTop: 2}}>Copy Workout</Text>
                </TouchableOpacity>
                <View style={{height: 14}}/>
                <TouchableOpacity onPress={handleDelete} style={{flexDirection: "row"}}>
                    <Icon color={"#FF0A0A"} name="delete" size={23}/>
                    <View style={{width: 20}}/>
                    <Text style={{...globalStyles.mediumText, paddingTop: 2, color: "#FF0A0A"}}>Delete Workout</Text>
                </TouchableOpacity>
            </PopUpMenuModal>
        </View>
        </>


    );
}

const styles = StyleSheet.create({
    contentContainer: {
        backgroundColor: '#1c1c1e',
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    header: {
        width: '100%',
        padding: 15,
        backgroundColor: '#2c2c2e',
        alignItems: 'center',
        paddingTop: (StatusBar.currentHeight || 0) + 5,
        maxHeight: Dimensions.get('window').height * 0.4,
        elevation: 5,
        borderBottomWidth: 0.5,
    },
    inputContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        shadowColor: 'black',
        elevation: 50,
        paddingTop: 15,
    },
    label: {
        color: '#ddd',
        fontSize: 14,
        margin: -8,
        marginRight: 170,
        backgroundColor: '#1c1c1e',
        paddingRight: 10,
        paddingLeft: 10,
        zIndex: 2,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#ddd',
        padding: 10,
        fontSize: 18,
        borderRadius: 6,
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').height * 0.06,
        zIndex: 1,
        color: 'white',
    },
    setsInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        width: 30,
        height: 22,
        color: 'white',
        textAlign: 'center',
    },
    exerciseContainer: {},

    exerciseItem: {
        backgroundColor: '#3C3C3E',
        width: Dimensions.get('window').width * 0.9,
        margin: 8,
        borderRadius: 8,
        textAlign: 'left',
        elevation: 5,
        shadowColor: 'black',
        padding: 4,
        paddingLeft: 10,
        color: 'white',
        borderColor: 'white',
        borderWidth: 0.75,
    },
    sets: {
        flexDirection: 'row',
        paddingTop: 2,
        paddingBottom: 6,
    },
    info: {
        position: 'absolute',
        alignItems: 'flex-end',
        right: 2,
        top: 2,
        color: '#0A84FF',
    },
    deleteExercise: {
        position: 'absolute',
        alignItems: 'flex-end',
        right: 2,
        bottom: 2,
        color: '#FF0A0A',
    },
    backArrow: {
        position: 'absolute',
        top: (StatusBar.currentHeight || 0) +5,
        left: 14,
        alignItems: 'flex-end',
    },
    menuDots: {
        position: 'absolute',
        top: 0,
        left: Dimensions.get('window').width * 0.86,
    },
});