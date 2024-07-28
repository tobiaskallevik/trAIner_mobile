import {backupDatabase} from "../../Shared/utils/backupUtil";
import {auth} from "../../Shared/utils/firebase";
import {Alert} from "react-native";
import {clearDatabase} from "../../Shared/utils/DbQueries";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {clearAsyncStorage} from "../../Shared/utils/clearAsyncStorage";

/*
* This sign out util is used to sign out users and backup their data before signing out.
* A connection check is done before signing out to ensure that the user has internet connection.
* If the user has internet connection, the backup will be done before signing out.
* If the user does not have internet connection, the user will have the option of signing out without backup.
* A backup is needed to ensure that the user's data is not lost when the user signs out.
* We need to delete a users data when they sign out to ensure that the data is not stored on the device.
* */
const signOutWithBackup =  async (userId: any, Online: boolean, setIsLoading: any) => {
    // If the user isn't connected to the internet, they user will be asked if they want to sign out without backup.
    if (userId && !Online) {
        Alert.alert(
            'Confirmation',
            'You dont have an internet connection. Are you sure you want to sign out without backing up your data?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {},
                {
                    text: 'Continue without backup',
                    onPress: async () => {
                        try {
                            // Signs the user out, clears the database and async storage
                            await auth.signOut();
                            await clearDatabase();
                            await clearAsyncStorage();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to sign out');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    } else if (userId){
        try {
            // Signs the user out, backs up the database, clears the database and async storage
            // Uses the setIsLoading to show a loading spinner while the user is being signed out as it may take some time.
            setIsLoading(true);
            await backupDatabase(userId);
            await auth.signOut();
            await clearDatabase();
            await clearAsyncStorage();
            console.log('User signed out');
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
        } finally {
            setIsLoading(false);
        }
    }
}

export {signOutWithBackup};