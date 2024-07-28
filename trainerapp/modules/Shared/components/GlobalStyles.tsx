import {StyleSheet, StatusBar, Dimensions} from 'react-native';
import { DefaultTheme } from '@react-navigation/native';

// Incorrect in SharedStyles.ts
export const globalStyles = StyleSheet.create({
    container: {
        backgroundColor: '#1c1c1e',
        flex: 1,
        alignItems: 'center',
        paddingTop: (StatusBar.currentHeight || 0) + 10,
    },
    text: {
        color: 'white',
    },
    largeText: {
        color: 'white',
        fontSize: 18,
    },
    headerText: {
        color: 'white',
        fontSize: 24,
    },
    mediumText: {
        color: 'white',
        fontSize: 16,
    },

});
