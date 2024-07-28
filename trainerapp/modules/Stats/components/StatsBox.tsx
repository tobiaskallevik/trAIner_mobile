import React from 'react';
import { Text, View, Dimensions } from 'react-native';
import { globalStyles } from '../../Shared/components/GlobalStyles';


interface StatsBoxProps {
    headerText: string;
    subText: string;
    subSubText?: string;
};

export default function StatsBox({ headerText, subText, subSubText}: StatsBoxProps) : JSX.Element {

    return (
        <View style={styles.workoutSquare} >
        <Text style={globalStyles.headerText}>{headerText}</Text>
        <Text style={globalStyles.mediumText}>{subText}</Text>
        {subSubText ? <Text style={globalStyles.mediumText}>{subSubText}</Text> : null}
        </View>
    );
};

const styles = {
    button: {
        flexDirection: 'column',
        borderRadius: 20,
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').height * 0.1,
        elevation: 1.5,
        shadowColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',

    },
    text: {
        color: 'white',
        fontSize: 24,
    },
    workoutSquare: {
        backgroundColor: '#3C3C3E',
        width: Dimensions.get('window').width * 0.9,
        margin: 10,
        padding: 10,
        borderRadius: 8,
        textAlign: 'left',
        elevation: 5,
        shadowColor: 'black',
        borderColor: 'white',
        borderWidth: 0.75,
    },
};