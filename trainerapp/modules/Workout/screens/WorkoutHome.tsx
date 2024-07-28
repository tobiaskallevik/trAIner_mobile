import {Button, StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity, FlatList, Image} from 'react-native';
import {NavigationProp, useFocusEffect } from "@react-navigation/native";
import * as SQLite from 'expo-sqlite';
import React, {useState, useEffect, useContext} from 'react';
import { globalStyles } from '../../Shared/components/GlobalStyles';
import { NavigationContainer, useIsFocused, DefaultTheme  } from '@react-navigation/native';
import PlusBtn from "../../Shared/components/PlusBtn";
import { workoutType, workoutExerciseType } from "../../Shared/components/Types";
import { getWorkouts, printDatabase } from "../../Shared/utils/DbQueries";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AppStateContext from "../../Shared/utils/AppStateContext";


// The home screen for the workout
export default function WorkoutHomeScreen({ navigation }: { navigation: NavigationProp<any>; }) : JSX.Element {
    const [workouts, setWorkouts] = useState<workoutType[]>([]);
    const {isDatabaseSynced, setDatabaseSynced } = useContext(AppStateContext);
    const isFocused = useIsFocused();

    // Get the workouts from the database when the screen is focused
    useEffect(() => {
        console.log("Synced? ", isDatabaseSynced)
        if (isFocused || isDatabaseSynced) {
            printDatabase();
            getWorkouts((workoutsFromDb: workoutType[]) => {
                setWorkouts(workoutsFromDb);
                console.log(workoutsFromDb)
            });
            if (isDatabaseSynced) {
                setDatabaseSynced(false); // Reset isDatabaseSynced to false
            }
        }
    }, [isFocused, isDatabaseSynced]);




    // Render the workout items
    const renderItem = ({ item }: { item: workoutType }) => (
        // Render a square for each workout
        <TouchableOpacity
            key={item.workoutId}
            style={styles.workoutSquare}
            onPress={() => navigation.navigate('WorkoutEdit', { workoutId: item.workoutId })}
        >
            <Text style={styles.workoutText}>{item.workoutName}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={globalStyles.container}>
            <View style={{ flexDirection: 'column'}}>
                {workouts.length > 0 ? (
                    <FlatList
                        data={workouts}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.workoutId.toString()}
                        contentContainerStyle={{paddingBottom: 100}}
                    />
                ) : (
                    <View style={{alignItems: 'center'}}>
                        <Text style={globalStyles.largeText}>No workouts</Text>
                        <Text style={globalStyles.mediumText}>Press the + button to add a workout</Text>
                        <Image style={styles.img} source={require('../../../assets/images/cablePushdown.png')} />
                    </View>
                )}
            </View>
            <PlusBtn onPress={() => navigation.navigate('NewWorkoutMenu')}/>
        </View>
    );
}

const styles = StyleSheet.create({
    workoutSquare: {
        backgroundColor: '#3C3C3E',
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').height * 0.1,
        margin: 10,
        borderRadius: 8,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        textAlignVertical: 'center',
        elevation: 5,
        shadowColor: 'black',
        borderWidth: 0.75,
        borderColor: 'white',
    },
    workoutText: {
        color: 'white',
        fontSize: 24,
        textAlign: 'center',
    },
    img: {
        position: 'absolute',
        alignSelf: 'flex-end',
        marginTop: Dimensions.get('window').height * 0.13,
        width: Dimensions.get('window').width * 0.7,
        resizeMode: 'contain',
    }
});