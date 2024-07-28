import {NavigationProp, useFocusEffect, useIsFocused} from "@react-navigation/native";
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {LinearGradient} from "expo-linear-gradient";
import {workoutType} from "../../Shared/components/Types";



export default function FloatingResumeBtn({ navigation }: { navigation: NavigationProp<any>; }) : JSX.Element {

    const [hasSavedWorkout, setHasSavedWorkout] = useState(false);
    const isFocused = useIsFocused();
    
    // Check if there is a saved workout state in async storage
    useEffect(() => {
        if (isFocused) {
            console.log("Checking for saved workout")
            AsyncStorage.getItem('@workoutState')
                .then(savedState => {
                    if (savedState !== null) {
                        setHasSavedWorkout(true);

                    } else {
                        setHasSavedWorkout(false);
                    }
                    console.log(savedState);
                });

        }
    }, [isFocused]);

    // Load the saved workout state and navigate to the workout logging screen
    const handlePress = () => {
        AsyncStorage.getItem('@workoutState')
            .then(savedState => {
                if (savedState !== null) {
                    // Parse the saved state
                    const savedWorkout = JSON.parse(savedState);

                    // Pass the saved state as parameters when navigating
                    navigation.navigate('LoggedWorkout', {
                        workout: savedWorkout,
                        isExistingWorkout: false,
                        isResumedLog: true
                    });
                }
            });
    };


    return (
        <View>
            {hasSavedWorkout && (
                <LinearGradient
                    colors={['#9DCEFF', '#0A84FF']}
                    start={{x: 0, y: 0}}
                    end={{x: 0.5, y: 1}}
                    style={styles.floatingButton}
                >
                    <TouchableOpacity  onPress={handlePress}>
                        <Text style={styles.buttonText}>Resume Workout</Text>
                    </TouchableOpacity>
                </LinearGradient>
            )}
        </View>
    );

};



const styles = StyleSheet.create({
    floatingButton: {

        bottom: 60,
        padding: 10,
        borderRadius: 30,
        backgroundColor: 'blue',
    },
    buttonText: {
        color: 'white',
    },
});

