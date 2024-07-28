import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import {auth, firestore} from '../modules/Shared/utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getPushNotification(): Promise<string | void> {
    let token: string | undefined;
    if (Constants.isDevice) { // checks if the code is running on a phone and not the emulator
        // finds the status of the permission of the notification
        const { status: oldStatus } = await Notifications.getPermissionsAsync();
        let newStatus = oldStatus;
        if (oldStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            newStatus = status;
        }
        if (newStatus !== 'granted') {
            return;
        }
        // if the permission are accepted we will get the expo push token with the build in getExpoPushTokenAsync function
        token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
        // expo notification dont work on emulator
        alert('You are running the code from the emulator, use real phone');
        return;
    }

    // This will configure the android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('pushNotifications', {
            name: 'PushNotifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
}

export function makeNotificationListeners(): void {
    // adds a listner that is running in foreground
    Notifications.addNotificationReceivedListener(Notification => {
    });
    // adds a listner for the user interaction with the notification
    Notifications.addNotificationResponseReceivedListener(notificationResponse => {
    });
}

// push the token to firebase
export async function pushTheTokenToDatabase(token: string): Promise<void> {
    try {
        // get the user id from async storage
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
            await setDoc(doc(firestore, 'users', userId), {
                expoPushToken: token,
            }, { merge: true }); // this will update the doc without writing over other data
            console.log('push token was saved in firebase');
        }
    } catch (error) {
        console.error('Cant save ownerid and docid to firebase', error);
    }
}