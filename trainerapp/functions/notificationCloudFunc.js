const functions = require('firebase-functions');
const { Expo } = require('expo-server-sdk');
const admin = require('firebase-admin');
// the sdk is used to send push notification

let expo = new Expo(); // initialize a new expo instanze

// cloud function to send notification
exports.SendNotification = functions.region('europe-west1').pubsub.schedule('every 24 hours').onRun(async (context) => {
        // the functions runs every 24 hours
        let notificationMessages = [];
        // Gets all the auth users from Firebase Authentication
        try {
            const listedUsers = await admin.auth().listUsers();
            const users = listedUsers.users;

            // Setting the time intervall to 48 hours, meaning if the user has not signed in in 48 hours, the user will get a notification
            const timeIntervall = new Date();
            timeIntervall.setHours(timeIntervall.getHours() - 48);

            for (const user of users) {
                const lastestSignIn = new Date(user.metadata.lastSignInTime); // as a date object
                if (lastestSignIn < timeIntervall) {
                    // The user data from firestore
                    const userDocument = await admin.firestore().collection('users').doc(user.uid).get();
                    const userInfo = userDocument.data();

                    // checks if the token is correct
                    if (userInfo && userInfo.expoPushToken && Expo.isExpoPushToken(userInfo.expoPushToken)) {
                       // what the notification contains
                        notificationMessages.push({
                            to: userInfo.expoPushToken,
                            sound: 'default',
                            body: 'Hey! time to hit the gym again!',
                        });
                    }
                }
            }

            // using chunks because expo can only handle a few notification at a time
            let chunks = expo.chunkPushNotifications(notificationMessages);
            for (let chunk of chunks) {
                try {
                    await expo.sendPushNotificationsAsync(chunk);
                } catch (error) {
                    console.error('cant send notification', error);
                }
            }
        } catch (error) {
            console.error('problem with user:', error);
        }

        return null;
    });



