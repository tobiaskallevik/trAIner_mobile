import React, {useEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    Button,
    Keyboard,
    NativeModules,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {NavigationContainer, useFocusEffect} from '@react-navigation/native';
import { auth } from './modules/Shared/utils/firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import InitDatabase from "./modules/Shared/utils/Database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from "./modules/Shared/components/LoadingScreen";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    getPushNotification,
    pushTheTokenToDatabase,
    makeNotificationListeners
} from './notifications/notificationsConfig';

import { useFreeRasp } from "freerasp-react-native";
import { BackHandler } from 'react-native';

import {updateOwnerIdInFirebase} from "./modules/Shared/utils/firestoreService"

// Import the screens from the modules
import WelcomeScreen from './modules/Account/screens/welcome';
import SignInScreen from './modules/Account/screens/login';
import SignUpScreen from './modules/Account/screens/signup';
import LogHomeScreen from './modules/Log/screens/LogHome';
import WorkoutHomeScreen from './modules/Workout/screens/WorkoutHome';
import SettingsHomeScreen from './modules/Settings/screens/SettingsHome';
import StatsHomeScreen from './modules/Stats/screens/StatsHome';
import WorkoutEditScreen from "./modules/Workout/screens/WorkoutEdit";
import NewWorkoutMenuScreen from "./modules/Workout/screens/NewWorkoutMenu";
import LoggedWorkoutScreen from "./modules/Log/screens/LoggedWorkout";
import GenerationMenuScreen from "./modules/Workout/screens/GenerationMenu";
import GeneratedWorkoutScreen from "./modules/Workout/screens/GeneratedWorkout";
import {checkKeyboardVisibility} from "./modules/Shared/utils/KeyboardHook";
import AppStateContext from "./modules/Shared/utils/AppStateContext";

// Tab and Stack navigators for the app
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// just for basic login and sign up screens
// from modules/account/screens
function AuthStack() {
    return (
        <Stack.Navigator initialRouteName='Welcome' screenOptions={{headerShown: false}}>
            <Stack.Screen name="Welcome" component={WelcomeScreen}/>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    );
}


// Stack navigator for the log
function LogStack() {
    return (
        <Stack.Navigator initialRouteName='LogHome' screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LogHome" component={LogHomeScreen} />
            <Stack.Screen name="LoggedWorkout" component={LoggedWorkoutScreen} />
        </Stack.Navigator>
    );
}

// Stack navigator for the settings
function SettingsStack() {
    return (
        <Stack.Navigator initialRouteName='SettingsHome' screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingsHome" component={SettingsHomeScreen} />
        </Stack.Navigator>
    );
}

// Stack navigator for the workout
function WorkoutStack() {
    return (
        <Stack.Navigator initialRouteName='WorkoutHome' screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WorkoutHome" component={WorkoutHomeScreen} />
            <Stack.Screen name="WorkoutEdit" component={WorkoutEditScreen} />
            <Stack.Screen name="NewWorkoutMenu" component={NewWorkoutMenuScreen} />
            <Stack.Screen name="GenerationMenu" component={GenerationMenuScreen} />
            <Stack.Screen name="GeneratedWorkout" component={GeneratedWorkoutScreen} />
        </Stack.Navigator>
    );
}

// Main navigation for the app
function Tabs() {

    // Keyboard hook to check if the keyboard is visible
    const isKeyboardVisible = checkKeyboardVisibility();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#2c2c2e',
                    borderTopWidth: 0.5,
                    shadowColor: 'black',
                    shadowOpacity: 0.1,
                    shadowRadius: 50,
                    elevation: 30,
                    display: isKeyboardVisible ? 'none' : 'flex', // Hide tab bar when keyboard is visible

                },
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tab.Screen
                name="Workouts"
                component={WorkoutStack}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Icon name="dumbbell" size={size} color={color} />
                    )
                }}
            />

            <Tab.Screen
                name="Log"
                component={LogStack}
                options={({ navigation }) => ({
                    tabBarIcon: ({ focused, color, size }) => (
                        <Icon name="clipboard-clock-outline" size={size} color={color} />
                    ),
                    tabBarButton: (props) => (
                        <Pressable {...props} onPress={() => {
                            navigation.navigate('Log', { screen: 'LogHome' });
                        }}/>
                    ),
                })}
            />


            <Tab.Screen
                name="Stats"
                component={StatsHomeScreen}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Icon name="chart-line" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsStack}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Icon name="cog" size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
}


export default function App() {
    const [loggedIn, setLoggedIn] = React.useState(auth.currentUser);
    const [isDbReady, setDbReady] = useState(false);
    const [isDatabaseSynced, setDatabaseSynced] = useState(false);

    // kills the app if a threat is detected
    const displayAlert = (Warning: string) => {
        Alert.alert(
            Warning,
            'If you are not the developer of this app, please exit immediately.',
            [
                {
                    text: 'Exit',
                    onPress: () => {
                        BackHandler.exitApp();
                    },
                },
            ],
            { cancelable: false },
        );
    }

    // app configuration
    const config = {
        androidConfig: {
            packageName: 'com.ikt205g24v4.trainerapp',
            // This is a hash and is not reversible (unless quantum computers are used)
            certificateHashes: [
                'AppCertificateHere',
            ],
            supportedAlternativeStores: ['com.sec.android.app.samsungapps'],
        },
        watcherMail: 'ikt205project@gmail.com',
        isProd: !__DEV__, // this tells if the application is running in development mode (false), or if its running in production mode (true)
    };


    // reactions for detected threats
    const actions = {
        // if the app is running in a rooted device (jailbreak for iOS)
        privilegedAccess: () => {
            console.log('privilegedAccess');
            displayAlert('Privileged Access');
        },
        // if debugger is attached                              (disabled in development mode)
        debug: () => {
            console.log('debug');
            displayAlert('Debugging');
        },
        // if the app is running in an emulator                 (disabled in development mode)
        simulator: () => {
            console.log('simulator');
            displayAlert('Simulator');
        },
        // if the app is tempered with                          (disabled in development mode)
        appIntegrity: () => {
            console.log('appIntegrity');
            displayAlert('App Integrity');
        },
        // if the app is downloaded from an unofficial store    (disabled in development mode)
        unofficialStore: () => {
            console.log('unofficialStore');         
            displayAlert('Unofficial Store');
        },
        // detect hooking from Frida, Xposed, etc.
        hooks: () => {
            console.log('hooks');
            displayAlert('Hooks');
        },
        // prevent the app from being cloned
        deviceBinding: () => {
            console.log('deviceBinding');
            displayAlert('Device Binding');
        },
        // if app runs in a trusted environment (this triggers in development mode too)
        secureHardwareNotAvailable: () => {
            console.log('secureHardwareNotAvailable');
            // if config is not in production mode, return 
            if (!config.isProd) return;
                displayAlert('Secure Hardware Not Available');
        },
        // if passcode is not set or changed during runtime
        // not really that important for this app
        passcode: () => {
            console.log('passcode');
        },
    };
    useFreeRasp(config, actions);



    useEffect(() => {
        // adds an observer to the firebase auth (listener)
        const subscriber = auth.onAuthStateChanged((user) => {
            setLoggedIn(user);
        });

        // removes the listener when the component unmounts
        return subscriber;
    }, []);


    // Initialize the database when the app starts
    useEffect(() => {
        InitDatabase()
            .then(() => {
                console.log("Database initialized");
                setDbReady(true);
            })
            .catch((err) => console.error(err));
    }, []);

    //use effect for push notification and owner id field
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                if (!user.emailVerified) {
                    return;
                }
                setLoggedIn(user);
                await AsyncStorage.setItem('userId', user.uid);
                const token = await getPushNotification();
                if (token) {
                    console.log('Push token for notification is:', token);
                    await pushTheTokenToDatabase(token);
                }
                await updateOwnerIdInFirebase();
            } else {
                setLoggedIn(null);
            }
        });
        return () => unsubscribe();
    }, []);

    // for push notifications listners
    useEffect(() => {
        if (!loggedIn?.emailVerified) return;
        makeNotificationListeners();
    }, [loggedIn]);



    if (loggedIn && loggedIn.emailVerified) {

        // DB initialization is async, so display a loading screen until it's ready.
        // Not doing this can cause unexpected behavior when the app tries to access the database before it's ready
        if (!isDbReady) {
            return <LoadingScreen/>;
        }

        return (
            <View style={{ flex: 1 }}>
                <AppStateContext.Provider value={{isDatabaseSynced, setDatabaseSynced}}>
                    <NavigationContainer>
                        <Tabs />
                    </NavigationContainer>
                <StatusBar style="light" />
                </AppStateContext.Provider>
            </View>
        );
    }

    // if loggedIn is false, display the login and sign up screens
    return (
        // wraps the login and sign up screens in a navigation container
        <AppStateContext.Provider value={{isDatabaseSynced, setDatabaseSynced}}>
            <NavigationContainer>
                <AuthStack />
            </NavigationContainer>
        </AppStateContext.Provider>
    );
}

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        right: 20,
        bottom: 70,
        padding: 10,
        borderRadius: 30,
        backgroundColor: 'blue',
    },
    buttonText: {
        color: 'white',
    },
});


