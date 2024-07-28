import {Button, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NavigationProp, useIsFocused} from "@react-navigation/native";
import { globalStyles } from '../../Shared/components/GlobalStyles';
import {getLoggedWorkouts, getWorkouts} from "../../Shared/utils/DbQueries";
import React, {useEffect, useState} from "react";
import { loggedWorkoutType } from "../../Shared/components/Types";
import PlusBtn from "../../Shared/components/PlusBtn";
import LoadingScreen from "../../Shared/components/LoadingScreen";
import FloatingResumeBtn from "../components/FloatingResumeBtn";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LogHomeScreen({ navigation }: { navigation: NavigationProp<any>; }) : JSX.Element {


    const [loggedWorkouts, setLoggedWorkouts] = useState<loggedWorkoutType[]>([]);
    const isFocused = useIsFocused();

    // Get the logged workouts from the database when the screen is focused
    useEffect(() => {
        if (isFocused) {
            getLoggedWorkouts((workoutsFromDb: loggedWorkoutType[]) => {
                setLoggedWorkouts(workoutsFromDb);
            });

            // Logs the content of async storage
            AsyncStorage.getAllKeys().then(keys => {
                AsyncStorage.multiGet(keys).then(data => {
                    console.log(data);
                });
            });
        }
    }, [isFocused]);


    // Render the logged workout items
    const renderItem = ({ item }: { item: loggedWorkoutType }) => {
        // Convert the start and end time of the workout to Date objects
        const startTime = new Date(item.startTime);
        const endTime = new Date(item.endTime);
        // Calculate the duration of the workout in minutes
        const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
        console.log(item)
        return (
            <TouchableOpacity
                key={item.workoutId}
                style={styles.workoutSquare}
                onPress={() => navigation.navigate('LoggedWorkout', { workout: item, isExistingWorkout: true})}
            >
                <Text style={globalStyles.headerText}>{item.workoutName}</Text>

                {/*Date of workout*/}
                <Text style={globalStyles.mediumText}>{startTime.toLocaleDateString('en-NO', {month: 'short', day: 'numeric'})}</Text>
                {/*Total time of workout*/}
                <Text style={globalStyles.mediumText}>{Math.round(duration)} min</Text>
            </TouchableOpacity>
        );
    };



    return (
        <View style={globalStyles.container}>
            <View style={{ flexDirection: 'column'}}>
                {/*Uses a flatlist to display the rendered items sorted from newest to oldest*/}
                {loggedWorkouts.length > 0 ? (
                    <FlatList
                        data={loggedWorkouts.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.loggedWorkoutId.toString()}
                    />
                ) : (
                    <View style={{alignItems: 'center'}}>
                        <Text style={globalStyles.largeText}>You have no logged workouts</Text>
                        <Text style={globalStyles.mediumText}>When you log a workout it will appear here</Text>
                        <Image style={styles.img} source={require('../../../assets/images/holdingDumbbell.png')} />
                    </View>
                )}
            </View>
            <FloatingResumeBtn navigation={navigation}/>
        </View>
    );

}

const styles = StyleSheet.create({
    workoutSquare: {
        backgroundColor: '#3C3C3E',
        width: Dimensions.get('window').width * 0.9,
        margin: 10,
        padding: 10,
        borderRadius: 8,
        textAlign: 'left',
        elevation: 5,
        shadowColor: 'black',
        borderWidth: 0.75,
        borderColor: 'white',
    },
    img: {
        marginLeft: Dimensions.get('window').width * 0.1,
        marginTop: Dimensions.get('window').height * 0.1,
        width: Dimensions.get('window').width * 0.7,
        resizeMode: 'contain',
    }

});
