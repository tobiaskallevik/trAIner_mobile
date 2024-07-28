import { Dimensions, FlatList, Keyboard, StatusBar, StyleSheet, Text,
        TextInput, TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import {NavigationProp, useFocusEffect, useIsFocused, useRoute} from "@react-navigation/native";
import { globalStyles } from '../../Shared/components/GlobalStyles';
import {
    createLoggedWorkout, createLoggedWorkoutExercise, deleteLoggedWorkout,
    getExercisesToLog,
    getLoggedWorkoutExercises,
    updateLoggedWorkoutExercise
} from "../../Shared/utils/DbQueries";
import React, {useEffect, useState} from "react";
import {loggedWorkoutExerciseType, loggedWorkoutType} from "../../Shared/components/Types";
import { Alert, BackHandler } from 'react-native';
import GifModal from "../../Shared/components/GifModal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PlusBtn from "../../Shared/components/PlusBtn";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PopUpMenuModal from "../../Shared/components/PopUpMenuModal";
import {checkKeyboardVisibility} from "../../Shared/utils/KeyboardHook";
import {ckeckInternet} from "../../Shared/utils/checkForInternett";


export default function LoggedWorkoutScreen({ navigation }: { navigation: NavigationProp<any>; }) : JSX.Element {
    const Online = ckeckInternet(); // for checking the internet
    // Get the workout and isExistingWorkout from the route params
    const route = useRoute();
    const { workout, isExistingWorkout, isResumedLog } = route.params as
        { workout: loggedWorkoutType | { workoutId: number; workoutName: string; startTime: string; }; isExistingWorkout: boolean; isResumedLog?: boolean; };

    // Convert the start and end time of the workout to Date objects
    const startTime = new Date(workout.startTime);
    const endTime = isExistingWorkout ? new Date((workout as loggedWorkoutType).endTime) : null;

    // Holds info on the exercises in the log
    const [loggedWorkoutExercises, setLoggedWorkoutExercises] = useState<loggedWorkoutExerciseType[]>([]);

    // Check if the screen is focused
    const isFocused = useIsFocused();

    // Controls modal states
    const [currentGif, setCurrentGif] = useState('');
    const [gifModalVisible, setGifModalVisible] = useState(false);
    const [menuModalVisible, setMenuModalVisible] = useState(false);

    // Checks keyboard visibility
    const isKeyboardVisible = checkKeyboardVisibility();

    // Gets the logged workouts from the database when the screen is focused
    // If the workout is an existing workout, we get the logged workout exercises from the DB.
    // If the workout is a new workout, we get the exercises to log from the DB.
    // If the workout is a resumed workout, we load the saved state from async storage.
    useEffect(() => {
        if (isFocused && isExistingWorkout) {
            getLoggedWorkoutExercises((workout as loggedWorkoutType).loggedWorkoutId, (workoutsFromDb: loggedWorkoutExerciseType[]) => {
                setLoggedWorkoutExercises(workoutsFromDb);
            });
            console.log("Existing logged workout")
            console.log("Name: " + (workout as loggedWorkoutType).workoutName)
        }
        else if (isFocused && !isExistingWorkout) {
            console.log("No logged workout id")

            if (!isResumedLog) {
                getExercisesToLog(workout.workoutId, (workoutsFromDb: loggedWorkoutExerciseType[]) => {
                    setLoggedWorkoutExercises(workoutsFromDb);
                    console.log(loggedWorkoutExercises)
                });
            } else if (isResumedLog) {
                AsyncStorage.getItem('@logState')
                    .then(savedState => {
                        if (savedState !== null) {
                            setLoggedWorkoutExercises(JSON.parse(savedState));
                        }
                    });
            }
        }

    }, [isFocused]);

    // When the screen looses focus, save the state of the workout.
    // This is done to prevent the user from loosing their progress if they navigate away from the screen.
    // The state is saved in async storage so that it can be loaded again when the user returns to the screen.
    useFocusEffect(
        React.useCallback(() => {
            const saveState = async () => {

                    console.log("Saving state")
                    await AsyncStorage.setItem('@workoutState', JSON.stringify(workout));
                    await AsyncStorage.setItem('@logState', JSON.stringify(loggedWorkoutExercises));
            };

            if (!isExistingWorkout) {
                saveState().then(() => console.log("State saved"));
            }
            return () => {
            };
        }, [loggedWorkoutExercises, workout, isExistingWorkout])
    )


    // Navigation handling
    const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
            navigation.navigate('LogHome');
            return true;
        }
    );
    const handleBack = () => {
        navigation.navigate('LogHome');
    }

    // Show the gif
    const showGif = (gifFileName: string) => {
        // // for checking the internet
        if (!Online) {
            Alert.alert("You dont have internet", "Please check your internet connection and retry :).");
            return;
        }
        setCurrentGif(gifFileName);
        setGifModalVisible(true);
    };

    // Saves the logged workout
    // If the workout is an existing workout, we update the logged workout exercises in the DB.
    // If the workout is a new workout, we create a new logged workout and logged workout exercises in the DB.
    // Lastly, we remove the saved state from async storage
    const handleSave = async () => {
        // Check if all fields are filled in
        let allFieldsFilled = loggedWorkoutExercises.every((exercise) => {
            return exercise.muscleGroup === 'Cardio' ? exercise.minutes : (exercise.reps && exercise.weight);
        });

        if (!allFieldsFilled) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            // If the logged workout already exists, update it using the DB query
            if (isExistingWorkout) {
                for (let exercise of loggedWorkoutExercises) {
                    await updateLoggedWorkoutExercise(exercise);
                }
            } else { // If the workout is not saved, create a new logged workout and logged workout exercises using the DB query
                const loggedWorkoutId = await createLoggedWorkout(workout.workoutId, workout.startTime);
                for (let exercise of loggedWorkoutExercises) {
                    exercise.loggedWorkoutId = loggedWorkoutId;
                    await createLoggedWorkoutExercise(exercise);
                }

                // Remove the saved state from async storage
                await AsyncStorage.removeItem('@workoutState');
                await AsyncStorage.removeItem('@logState');
            }

            navigation.navigate('LogHome');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while saving the workout');
        }
    };


    // Deletes a logged workout
    // A user will be asked for confirmation before the workout is deleted.
    // If they want to delete the workout, we find out if the workout is saved to the DB or not.
    // If the workout is saved, we delete it using the DB query.
    // If the workout is not saved, we remove the saved state from async storage.
    const handleDelete = async () => {

        // Ask the user for confirmation
        Alert.alert(
            'Delete Workout',
            'Are you sure you want to delete this workout?',
            [
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteWorkout()
                },{},
                {
                    text: 'Cancel',
                    style: 'cancel',

                }
            ], { cancelable: true },
        );

        // Function for deleting the workout
        const deleteWorkout = async () => {
            try {
                // If the logged workout already exists, delete it using the DB query
                if (isExistingWorkout){
                    await deleteLoggedWorkout((workout as loggedWorkoutType).loggedWorkoutId);
                    navigation.navigate('LogHome');
                }

                // If the workout is not saved, remove the saved state from async storage
                else if (!isExistingWorkout) {
                    await AsyncStorage.removeItem('@workoutState');
                    await AsyncStorage.removeItem('@logState');
                    navigation.navigate('LogHome');
                }

            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'An error occurred while deleting the workout');
            }
        }

        // Close the menu modal
        setMenuModalVisible(false);
    }




    // Render the logged workout items
    const renderItem = ({ item, index }: { item: loggedWorkoutExerciseType, index: number }) => {
        console.log("Render item")
        console.log(item)
        return (
            <View
                key={item.exerciseId}
                style={styles.workoutSquare}
            >
                <View style={styles.exerciseInfo}>
                    <Text style={globalStyles.largeText}>{item.exerciseName}</Text>
                    <Text style={globalStyles.text}>{item.sets} sets</Text>
                </View>

                {/*Input to change weight, reps and minutes*/}
                {item.muscleGroup === 'Cardio' ? (
                    <View style={{...styles.inputFieldsContainer, justifyContent: "flex-end"}}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View style={{alignItems: "center"}}>
                                <Text style={globalStyles.text}> Minutes </Text>
                                <TextInput
                                    style={styles.inputFields}
                                    maxLength={3}
                                    keyboardType="numeric"
                                    placeholder={item.previousMinutes ? item.previousMinutes.toString() : '0'}
                                    value={item && item.minutes ? item.minutes.toString() : ''}
                                    onChangeText={(text) => {
                                        let newExercises = [...loggedWorkoutExercises];
                                        newExercises[index].minutes = Math.max(0, Number(text));
                                        setLoggedWorkoutExercises(newExercises);
                                    }}
                                    blurOnSubmit={true}

                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                ) : (
                    <View style={styles.inputFieldsContainer}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View style={{alignItems: "center"}}>
                                <Text style={globalStyles.text}> Reps </Text>
                                <TextInput
                                    style={styles.inputFields}
                                    maxLength={3}
                                    keyboardType="numeric"
                                    placeholder={item.previousReps ? item.previousReps.toString() : '0'}
                                    value={item && item.reps ? item.reps.toString() : ''}
                                    onChangeText={(text) => {
                                        let newExercises = [...loggedWorkoutExercises];
                                        newExercises[index].reps = Math.max(0, Number(text));
                                        setLoggedWorkoutExercises(newExercises);
                                    }}
                                    blurOnSubmit={true}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View style={{alignItems: "center"}}>
                                <Text style={globalStyles.text}> KG </Text>
                                <TextInput
                                    style={styles.inputFields}
                                    maxLength={3}
                                    keyboardType="numeric"
                                    placeholder={item.previousWeight ? item.previousWeight.toString() : '0'}
                                    value={item && item.weight ? item.weight.toString() : ''}
                                    onChangeText={(text) => {
                                        let newExercises = [...loggedWorkoutExercises];
                                        newExercises[index].weight = Math.max(0, Number(text));
                                        setLoggedWorkoutExercises(newExercises);
                                    }}
                                    blurOnSubmit={true}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                )}
                <Icon style={styles.info} name="information-outline" size={20} onPress={() => showGif(item.gifFileName)}/>
            </View>
        );
    };


    // Return the screen
    return (
        <View style={styles.container}>
            {/*Header*/}
            <View style={styles.logHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.backArrow}>
                    <Icon name="arrow-left" color="white" size={30}/>
                    {/*Menu button for bottom popup menu*/}
                    <TouchableOpacity style={styles.menuDots} onPress={(()=>setMenuModalVisible(true))}>
                        <Icon name="dots-vertical" size={30} color="white" />
                    </TouchableOpacity>
                </TouchableOpacity>
                <Text style={globalStyles.headerText}>
                    {workout.workoutName} {startTime.toLocaleDateString('en-NO', {month: 'short', day: 'numeric'})}
                </Text>
                <Text style={globalStyles.largeText}>Started: {startTime.toLocaleTimeString("en-NO",{hour12: false, hour:"2-digit", minute: '2-digit'})}</Text>
                {endTime !== null ? (
                    <Text style={globalStyles.largeText}>Ended: {endTime.toLocaleTimeString("en-NO",{hour12: false, hour:"2-digit", minute: '2-digit'})}</Text>
                ) : (<></>)}
            </View>

            {/*Flatlist to show exercises*/}
            <View style={{ flexDirection: 'column'}}>
                <FlatList
                    data={loggedWorkoutExercises}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.exerciseId.toString()}
                    contentContainerStyle={{paddingBottom: 350}}
                />
            </View>

            {/*Btn for saving, modal for showing gif and modal for showing menu*/}

            {isKeyboardVisible ? null : (
                <>
                    <PlusBtn icon="check" gradient={{ colors: ['#00FF3F', '#00C732'] }} onPress={handleSave}/>
                </>
            )}

            <GifModal modalVisible={gifModalVisible} setModalVisible={setGifModalVisible} currentGif={currentGif} />

            <PopUpMenuModal modalVisible={menuModalVisible} setModalVisible={setMenuModalVisible}>
                <TouchableOpacity onPress={handleDelete} style={{flexDirection: "row"}}>
                    <Icon color={"#FF0A0A"} name="delete" size={23}/>
                    <View style={{width: 20}}/>
                    <Text style={{...globalStyles.mediumText, paddingTop: 2, color: "#FF0A0A"}}>Delete Workout</Text>
                </TouchableOpacity>
            </PopUpMenuModal>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1c1c1e',
        flex: 1,
        alignItems: 'center',
    },
    logHeader: {
        width: '100%',
        padding: 10,
        backgroundColor: '#2c2c2e',
        alignItems: 'center',
        paddingTop: (StatusBar.currentHeight || 0) +5,
        maxHeight: Dimensions.get('window').height * 0.4,
        elevation: 5,
        borderBottomWidth: 0.5,
    },
    backArrow: {
        position: 'absolute',
        top: (StatusBar.currentHeight || 0) +5,
        left: 14,
        alignItems: 'flex-end',

    },
    workoutSquare: {
        backgroundColor: '#3C3C3E',
        width: Dimensions.get('window').width * 0.9,
        margin: 10,
        padding: 10,
        borderRadius: 8,
        elevation: 5,
        shadowColor: 'black',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: 'white',
        borderWidth: 0.75,
    },
    img: {
        marginLeft: Dimensions.get('window').width * 0.15,
        marginTop: Dimensions.get('window').height * 0.1,
        width: Dimensions.get('window').width * 0.7,
        resizeMode: 'contain',
    },
    exerciseInfo: {
        flexDirection: 'column',
        maxWidth: '65%',
    },
    inputFieldsContainer: {
        flexDirection: 'row',
        width: '30%',
        justifyContent: 'space-between',
        marginRight: 10,
    },
    inputFields: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        width: 50,
        color: 'white',
        textAlign: 'center',
        backgroundColor: '#3C3C3E',

    },
    info: {
        position: 'absolute',
        alignItems: 'flex-end',
        right: 2,
        top: 2,
        color: '#0A84FF',
    },
    menuDots: {
        position: 'absolute',
        top: 0,
        left: Dimensions.get('window').width * 0.86,
    },

});