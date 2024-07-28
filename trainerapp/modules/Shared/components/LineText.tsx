import React from "react";
import { View, Text, StyleSheet } from "react-native";


interface LineTextProps {
    text: string;
    lineStyle?: any;
    textStyle?: any;
    style?: any;
}


export default function LineText({text, textStyle, lineStyle, style}: LineTextProps): JSX.Element {
    return (
        <View style={[styles.whole, style]}>
            <View style={[styles.lines, lineStyle]}>
            </View>
            
            <View style={styles.middle}>
                <Text style={[styles.text, textStyle]}>{text}</Text>
            </View>
            
            <View style={[styles.lines, lineStyle]}>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    whole: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lines: {
        width: '50%',
        borderBlockColor: 'white',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    middle: {
        alignItems: 'center',
    },
    text: {
        color: 'white',
        textAlign: 'center',
        marginHorizontal: 10,
    }

});