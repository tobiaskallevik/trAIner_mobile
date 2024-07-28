import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
    Pressable,
    View,
    TouchableWithoutFeedback,
    TouchableHighlight, Touchable, TouchableNativeFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {TouchableRipple} from "react-native-paper";


interface ButtonProps {
    onPress: () => void;
    buttonStyle?: any;
    icon?: string;
    text?: string;
}

const LargeBtn: React.FC<ButtonProps> = ({ onPress, buttonStyle, icon, text }) => {
    // Icon defaults to 'plus'
    const iconName = icon || "plus";

    return (
        <LinearGradient
            colors={['#9DCEFF', '#0A84FF']}
            start={{x: 0, y: 0}}
            end={{x: 0.5, y: 1}}
            style={[styles.button, buttonStyle]}
        >
            <TouchableOpacity onPress={onPress} style={styles.touch}>
                <Text style={styles.text}>
                    {text}
                    {icon ? <Icon name={iconName} size={30} color="white" style={{marginLeft: 10}}/> : null}
                </Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'column',
        borderRadius: 100,
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
    touch: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    }
});

export default LargeBtn;
