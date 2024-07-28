import { StyleSheet, View} from 'react-native';
import {NavigationProp } from "@react-navigation/native";
import React, { useState, useEffect } from 'react';
import LargeBtn from "../../Shared/components/LargeBtn";
import {BackHeader} from "../../Shared/components/Headers";
import {globalStyles} from "../../Shared/components/GlobalStyles";


// Navigation screen for creating a new workout
// -1 is used as a flag to indicate that the workout is new. This will change the behavior of the WorkoutEdit screen
export default function NewWorkoutMenuScreen ({ navigation }: { navigation: NavigationProp<any>; }) : JSX.Element {


    return (
        <View style={globalStyles.container}>
            <BackHeader title={"Go Back"} navigation={navigation} />
            <View style={styles.container}>
                <LargeBtn text={"Create custom workout"} icon={"weight-lifter"}  onPress={() => navigation.navigate('WorkoutEdit', { workoutId: -1})} />
                <View style={{height: 40}} />
                <LargeBtn text={"Create workout with AI"} icon={"atom"} onPress={() => navigation.navigate('GenerationMenu')} />
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1e',
        alignItems: 'center',
        justifyContent: 'center',
    }
});