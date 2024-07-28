import LargeBtn from "../../Shared/components/LargeBtn";
import {NavigationProp, useRoute} from "@react-navigation/native";
import {
    View,
    Text,
    FlatList,
    TextInput,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
    Keyboard, Alert
} from "react-native";
import {workoutExerciseType, workoutType} from "../../Shared/components/Types";
import React, {useEffect} from "react";
import {globalStyles} from "../../Shared/components/GlobalStyles";
import GifModal from "../../Shared/components/GifModal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Headers, {BackHeader} from "../../Shared/components/Headers";
import PlusBtn from "../../Shared/components/PlusBtn";
import {createWorkout, updateWorkoutExercises} from "../../Shared/utils/DbQueries";
import {checkKeyboardVisibility} from "../../Shared/utils/KeyboardHook";
import {ckeckInternet} from "../../Shared/utils/checkForInternett";


export default function GeneratedWorkoutScreen({ navigation }: { navigation: NavigationProp<any>; }) : JSX.Element {

    // Gets the exercises from the route
    const route = useRoute();
    const exercises = route.params as workoutExerciseType[];

    // Holds the name of the workout
    const [workoutName, setWorkoutName] = React.useState('');

    // States for the gif modal
    const [gifModalVisible, setGifModalVisible] = React.useState(false);
    const [currentGif, setCurrentGif] = React.useState('');

    // Checks for keyboard visibility
    const isKeyboardVisible = checkKeyboardVisibility();

    const Online = ckeckInternet();

    // Cleanup states when the component is unmounted
    useEffect(() => {
        return () => {
            // Cleanup states here
            setWorkoutName('');
            setGifModalVisible(false);
            setCurrentGif('');
        };
    }, []);

    // Show the gif
    const showGif = (gifFileName: string) => {
        if (!Online) {
            Alert.alert("You dont have internet", "Please check your internet connection and retry :).");
            return;
        }
        setCurrentGif(gifFileName);
        setGifModalVisible(true);
    };

    // Save the workout
    const handleSave = () => {
        // Checks if the workout name is empty
        if (workoutName === '') {
            alert('Please enter a workout name');
            return;
        }

        // Creates a new workout in the database
        console.log("Creating new workout")
        createWorkout(workoutName)
            .then(insertId => {
                console.log(`Workout created with ID: ${insertId}`);
                updateWorkoutExercises(insertId, exercises)
                    .then(() => {
                        console.log('Exercises updated');
                        navigation.navigate('WorkoutHome');
                    })

            })
            .catch(error => console.error(`Failed to create workout: ${error.message}`));


        console.log('Saving workout...');
    };

    // Renders the exercises
    const renderItem = ({ item, index }: { item: workoutExerciseType; index: number }) => (

        <View key={item.exerciseId} style={styles.exerciseItem}>
            <Text style={{...globalStyles.largeText, marginRight: 24}}>{item.exerciseName}</Text>
            <Text style={globalStyles.mediumText}>{item.sets} sets</Text>
            <Icon style={styles.info} name="information-outline" size={20} onPress={() => showGif(item.gifFileName)}/>
        </View>

    );


    return (
        <View style={globalStyles.container}>
            <BackHeader title="Back" navigation={navigation} />
            <View style={styles.header}>
                {/*Text input for name*/}
                <View style={styles.inputContainer}  >
                    <Text style={styles.label}>Workout Name</Text>
                    <TextInput
                        style={styles.input}
                        maxLength={20}
                        blurOnSubmit={true}
                        value={workoutName}
                        placeholder="Enter workout name"
                        placeholderTextColor="#999"
                        onChangeText={(text) => setWorkoutName(text)}
                    />
                </View>
            </View>


            <View style={styles.exerciseContainer}>
                <FlatList
                    data={exercises}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.exerciseId.toString()}
                    contentContainerStyle={{paddingBottom: 350}}
                />
            </View>


            {isKeyboardVisible ? null : (
                <PlusBtn icon="check" gradient={{ colors: ['#00FF3F', '#00C732'] }} onPress={handleSave} />
            )}

            <GifModal modalVisible={gifModalVisible} setModalVisible={setGifModalVisible} currentGif={currentGif} />

        </View>

    );
}


const styles = StyleSheet.create({
    header: {
        paddingTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        shadowColor: 'black',
        elevation: 50,
    },
    label: {
        color: 'white',
        fontSize: 16,
        margin: -10,
        marginRight: 150,
        backgroundColor: '#1c1c1e',
        paddingRight: 10,
        paddingLeft: 10,
        zIndex: 2,
    },
    input: {
        borderWidth: 1.5,
        borderColor: 'white',
        padding: 10,
        fontSize: 18,
        borderRadius: 6,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').height * 0.08,
        zIndex: 1,
        color: 'white',
    },
    info: {
        position: 'absolute',
        alignItems: 'flex-end',
        right: 2,
        top: 2,
        color: '#0A84FF',
    },
    exerciseItem: {
        backgroundColor: '#3C3C3E',
        width: Dimensions.get('window').width * 0.8,
        margin: 8,
        borderRadius: 8,
        textAlign: 'left',
        elevation: 5,
        shadowColor: 'black',
        padding: 2,
        paddingLeft: 10,
        color: 'white',
    },
    exerciseContainer: {
        paddingTop: 10,
    },
});

