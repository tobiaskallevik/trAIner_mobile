import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image} from 'react-native';
import { NavigationProp } from '@react-navigation/native'; // for navigation type
import LargeBtn from '../../Shared/components/LargeBtn';
import {StatusBar} from "expo-status-bar";



export default function WelcomeScreen({ navigation }: { navigation: NavigationProp<any>; }) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.content}>
                <Image source={require('../../../assets/logo.png')} style={styles.title} resizeMode='contain' />
                <Text style={styles.subtitle}>A better you</Text>
                <View style={styles.footer}>
                    <LargeBtn text='Get Started' onPress={() => navigation.navigate("SignIn")} buttonStyle={styles.button} /> 
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // for background color
    container: {
        flex: 1,
        backgroundColor: '#1c1c1e', // Assuming a black background
        alignItems: 'center',
        justifyContent: 'center',
    },

    // for content alignment
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -150,  
    },

    // to move the button down
    footer: {
        width: '100%', // Full width
        alignItems: 'center',
        position: 'absolute',
        bottom: -330,
    },

    // for TrAIer logo
    title: {
        height: 100,
    },

    // for subtitle "A better you"
    subtitle: {
        color: '#FFF', 
        fontSize: 18,
        marginBottom: 24, 
    },

    button: {
        position: 'relative',
        borderRadius: 35,
        height: 60,
        width: 330,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
