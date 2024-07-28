import React from 'react';
import {View, ActivityIndicator, StyleSheet, Dimensions} from 'react-native';

interface LoadingScreenProps {
    loadingStyle?: any;
}

const LoadingScreen = ({loadingStyle}: LoadingScreenProps) => {
    return (
        <View style={[styles.container, loadingStyle]}>
            <ActivityIndicator size="large" color="#0A84FF" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1c1c1e',
        height: Dimensions.get('window').height,
        width: '100%',
    },
});

export default LoadingScreen;
