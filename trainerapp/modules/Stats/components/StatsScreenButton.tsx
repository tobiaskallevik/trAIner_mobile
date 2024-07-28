import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';


interface StatsScreenButtonProps {
    onPress: () => void;
    button2?: boolean;
};


export default function StatsScreenButton({onPress, button2}: StatsScreenButtonProps): JSX.Element {
    const buttonText1: string = "1 Rep Max";
    const buttonText2: string = "More Stats";

    // the Body Composition part of the stats
    if (button2){
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.button} onPress={onPress}>
                    <Text style={styles.text}>{buttonText1}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button]}>
                <LinearGradient
                        colors={['#9DCEFF', '#0A84FF']}
                        start={{x: 0, y: 0}}
                        end={{x: 0.5, y: 1}}
                        style={[styles.button]}
                    > 
                        <Text style={[styles.text, {color: "white"}]}>{buttonText2}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }


    // the Exercise part of the stats
    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.button]}>
                <LinearGradient
                    colors={['#9DCEFF', '#0A84FF']}
                    start={{x: 0, y: 0}}
                    end={{x: 0.5, y: 1}}
                    style={[styles.button]}
                > 
                    <Text style={[styles.text, {color: "white"}]}>{buttonText1}</Text>
                </LinearGradient>           
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text style={styles.text}>{buttonText2}</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 100,
        width: Dimensions.get("screen").width * 0.9,
        height: 70,
        elevation: 5,
    },
    text: {
        color: 'black',
        fontSize: 20,
    },
    button: {
        width: Dimensions.get("screen").width * 0.325,
        height: 50,
        borderRadius: 100,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },

});