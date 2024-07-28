import React from 'react';
import {TouchableOpacity, Text, StyleSheet, Dimensions, Pressable} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as SQLite from 'expo-sqlite';

interface ButtonProps {
    onPress: () => void;
    buttonStyle?: any;
    icon?: string;
    gradient?: any;
}

const PlusBtn: React.FC<ButtonProps> = ({ onPress, buttonStyle, icon, gradient }) => {
    // Icon defaults to 'plus'
    const iconName = icon || "plus";
    const gradientColor = gradient ||{ colors: ['#9DCEFF', '#0A84FF'] };

    return (
        <LinearGradient
            colors={gradientColor.colors}
            start={{x: 0, y: 0}}
            end={{x: 0.5, y: 1}}
            style={[styles.button, buttonStyle]}
        >
            <TouchableOpacity onPress={onPress} style={styles.touch}>
                <Text style={styles.text}><Icon name={iconName} size={30}/></Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 20,
        width: 50,
        height: 50,
        bottom: 20,
        right: 25,
        position: 'absolute',
        elevation: 1.5,
        shadowColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
    },
    touch: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    }
});

export default PlusBtn;
