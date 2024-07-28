import {NavigationProp} from "@react-navigation/native";
import {View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Alert} from "react-native";
import {globalStyles} from "../../Shared/components/GlobalStyles";
import {BackHeader} from "../../Shared/components/Headers";
import {LinearGradient} from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import React, {useState} from "react";
import {Picker} from "@react-native-picker/picker";
import LargeBtn from "../../Shared/components/LargeBtn";
import OpenAI from "../utils/OpenAI";
import FindGeneratedInDB from "../utils/FindGeneratedInDB";
import LoadingScreen from "../../Shared/components/LoadingScreen";

import {ckeckInternet} from '../../Shared/utils/checkForInternett';
import {checkKeyboardVisibility} from "../../Shared/utils/KeyboardHook"; // for checking the internet

export default function GenerationMenuScreen({ navigation }: { navigation: NavigationProp<any>; }) : JSX.Element {

    const [selectedType, setSelectedType] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [selectedGear, setSelectedGear] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const Online = ckeckInternet(); // for checking the internet



    // Cleanup function
    React.useEffect(() => {
        return () => {
            setSelectedType('');
            setSelectedDifficulty('');
            setSelectedGear('');
            setIsGenerating(false);
        };
    }, []);

    const handleGenerateWorkout = () => {
        // // for checking the internet
        if (!Online) {
            Alert.alert("You dont have internet", "Please check your internet connection and retry :).");
            return;
        }
        // Check if all fields are filled
        if (selectedType === "" || selectedDifficulty === "" || selectedGear === "") {
            Alert.alert("Please fill out all fields");
            return;
        } else {
            setIsGenerating(true);
        }


        // Calls the OpenAI function to generate a workout
        OpenAI(selectedType, selectedDifficulty, selectedGear)
            .then((generatedWorkout) => {
                console.log("OpenAI call successful: ", generatedWorkout);

                // If the API call was successful, try to find the exercises in the database
                FindGeneratedInDB(generatedWorkout)
                    .then((exercises) => {
                        console.log("Found these exercises in the DB: ",exercises);
                        setIsGenerating(false);
                        // Navigate to the GeneratedWorkout screen with the exercises
                        navigation.navigate('GeneratedWorkout', exercises);
                    })
                    .catch((error) => {
                        console.error(`Error calling FindGeneratedInDB: ${error}`);
                        setIsGenerating(false);
                    });

            }, (error) => {
                console.error(`Error calling OpenAI: ${error}`);
                setIsGenerating(false);
            });




        console.log("Generating workout...");
    }

    return (
        <View style={globalStyles.container}>
            <BackHeader title="Back" navigation={navigation}/>
            <View style={styles.headerTextContainer}>
                <Image source={require('../../../assets/images/aiGradient.png')} style={styles.ai}/>
                <Text style={styles.headerText}>Trainer</Text>
                <Icon name={"atom"} size={55} color={"white"} style={{marginTop:6}}/>
            </View>
            <View style={styles.pickerContainer}>
                <Icon name={"dumbbell"} size={25} style={{...styles.icons, transform: [{rotate: '-45deg'}]}}/>
                <Picker
                    selectedValue={selectedType}
                    style={styles.picker}
                    onValueChange={(itemValue, itemIndex) =>
                        setSelectedType(itemValue)
                    }>
                    <Picker.Item label={"Workout type"} value="" />
                    <Picker.Item label="Push" value="push" />
                    <Picker.Item label="Pull" value="pull" />
                    <Picker.Item label="Legs" value="legs" />
                    <Picker.Item label="Chest" value="chest" />
                    <Picker.Item label="Arms" value="arms" />
                    <Picker.Item label="Shoulders" value="shoulders" />
                    <Picker.Item label="Upper Body" value="upper body" />
                    <Picker.Item label="Full body" value="full body" />

                </Picker>
            </View>

            <View style={styles.pickerContainer}>
                <Icon name={"arrow-up-down"} size={25} style={styles.icons}/>
                <Picker
                    selectedValue={selectedDifficulty}
                    style={styles.picker}
                    onValueChange={(itemValue, itemIndex) =>
                        setSelectedDifficulty(itemValue)
                    }>
                    <Picker.Item label="Difficulty" value="" />
                    <Picker.Item label="Beginner" value="beginner" />
                    <Picker.Item label="Intermediate" value="intermediate" />
                    <Picker.Item label="Experienced" value="experienced" />
                </Picker>
            </View>


            <View style={styles.pickerContainer}>
                <Icon name={"nut"} size={25} style={styles.icons}/>
                <Picker
                    selectedValue={selectedGear}
                    style={styles.picker}
                    onValueChange={(itemValue, itemIndex) =>
                        setSelectedGear(itemValue)
                    }>
                    <Picker.Item label="Equipment" value="" />
                    <Picker.Item label="Gym" value="true" />
                    <Picker.Item label="Home" value="false" />
                </Picker>
            </View>

            <View style={styles.btnStyle}>
                <LargeBtn text='Generate Workout'
                          onPress={() => {
                              handleGenerateWorkout();
                          }}
                          buttonStyle={{height: Dimensions.get('window').height * 0.08}}
                />
            </View>


            {/*If isGenerating is true, show the loading screen*/}
            {isGenerating && <LoadingScreen loadingStyle={{height: Dimensions.get('window').height}}/>}


        </View>

    );



}

const styles = StyleSheet.create({
    headerTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    headerText: {
        color: 'white',
        fontSize: 50,
        fontWeight: 'bold',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 1,

    },
    ai: {
        width: 60,
        height: 45,
        resizeMode: 'contain',
        position: 'relative',
    },
    pickerContainer: {
        marginTop: 30,
        backgroundColor: 'white',
        borderRadius: 20,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').height * 0.065,
        flexDirection: 'row',
        alignItems: 'center',
    },
    picker: {
        width: Dimensions.get('window').width * 0.7,
        height: Dimensions.get('window').height * 0.06,
    },
    btnStyle: {
        position: 'absolute',
        bottom: 30,
    },
    icons: {
        marginLeft: 10,
    }

});

