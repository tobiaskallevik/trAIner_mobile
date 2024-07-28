import {NavigationProp} from "@react-navigation/native";
import {StyleSheet, Text, View, Alert, Dimensions} from "react-native";
import { globalStyles } from '../../Shared/components/GlobalStyles';
import { backupDatabase } from '../../Shared/utils/backupUtil';
import { auth } from '../../Shared/utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncDatabase } from '../../Shared/utils/DbQueries';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import {deleteTheUser} from "../../Shared/utils/deleteUserUtil";
import {ckeckInternet} from '../../Shared/utils/checkForInternett'; // for checking the internet
import LoadingScreen from "../../Shared/components/LoadingScreen";
import { clearDatabase} from "../../Shared/utils/DbQueries";
import {signOutWithBackup} from "../utils/signOutWithBackup";
import {clearAsyncStorage} from "../../Shared/utils/clearAsyncStorage";

export default function SettingsHomeScreen({ navigation }: { navigation: NavigationProp<any>; }): JSX.Element {
    const Online = ckeckInternet(); // for checking the internet
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // loading state
    // the state hook will manage the user
    const [userId, setUserId] = useState<string | null>(null); // stores the user id
    // storeUserId will store the user id in async
    const storeUserId = async (userId: string) => {
        console.log('Storing user ID:', userId);
        try {
            await AsyncStorage.setItem('userId', userId); // stores the user id in async
            console.log('User ID stored successfully;', userId);
        } catch (error) {
            console.error("Failed to store user ID:", error);
        }
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setUserId(user.uid);
            storeUserId(user.uid); // Store the user ID in AsyncStorage
            console.log('currentUser from firebase auth is: ', user.uid);
        }
    }, []);

    // handleBackupButton will handle the backup button
    const handleBackupButton = async () => {
        // // for checking the internet
        if (!Online) {
            Alert.alert("You dont have internet", "Please check your internet connection and retry :).");
            return;
        }
        setIsGenerating(true);
        console.log('User ID:', userId);
        // using the userId from async storeage
        if (userId) {
            try {
                await backupDatabase(userId); // call the backup function
                console.log('Backup initiated for user:', userId);
                Alert.alert('Backup Successful');
            } catch (error) {
                console.error('Backup failed:', error);
            }  finally {
                setIsGenerating(false);
            }
        }
    };

    // handleSyncPress handles the sync button
    const handleSyncPress = async () => {
        if (!Online) {
            Alert.alert("You dont have internet", "Please check your internet connection and retry :).");
            return;
        }
        setIsGenerating(true);
        // using the userId from async storeage
        if (userId) {
            try {
                await syncDatabase(userId); // call the sync function
                Alert.alert('Sync Successful');
            } catch (error) {
                console.error('Sync failed:', error);
            } finally {
                setIsGenerating(false);
            }
        }
    };
    const handleUserDeletion = async () => {
        if (!Online) {
            Alert.alert("You dont have internet", "Please check your internet connection and retry :).");
            return;
        }
        setIsGenerating(true);
        // using the userId from async storage, this means the local userId is deleted.
        if (userId) {
            try {
                // Shows the confirmation dialog
                const isConfirmed = await showConfirmationDialog();

                if (isConfirmed) {
                    // If user confirms, proceed with deletion
                    await clearDatabase();
                    await clearAsyncStorage();
                    await deleteTheUser();
                    Alert.alert('You have successfully deleted your account');
                } else {
                    console.log('User canceled the deletion.');
                }
            } catch (error) {
                console.error('Deletion:', error);
            } finally {
                setIsGenerating(false);
            }
        }
    };

    // A confirmation dialog will pop up to prevent users from accidentaly deleting their account. The input provided by the user will delete the account, or cancel the deletion proccess
    const showConfirmationDialog = () => {
        return new Promise((resolve) => {
            // Alert function from the firebase tools
            Alert.alert(
                'Confirmation',
                'Are you sure you want to delete your account? This action cannot be undone.',
                [
                    {
                        text: 'Cancel',
                        onPress: () => resolve(false),
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        onPress: () => resolve(true),
                    },
                ],
                { cancelable: false }
            );
        });
    };

    return (
        <View style={[globalStyles.container, styles.container]}>
            <TouchableOpacity style={styles.button} onPress={handleBackupButton}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={24} color="black" style={styles.iconLeft} />
                <View style={styles.textContainer}>
                    <Text style={styles.buttonText}>Backup Data</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="black" style={styles.iconRight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSyncPress}>
                <MaterialCommunityIcons name="sync" size={24} color="black" style={styles.iconLeft} />
                <View style={styles.textContainer}>
                    <Text style={styles.buttonText}>Sync Data</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="black" style={styles.iconRight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleUserDeletion}>
                <MaterialCommunityIcons name="delete" size={24} color="black" style={styles.iconLeft} />
                <View style={styles.textContainer}>
                    <Text style={styles.buttonText}>Delete Account</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="black" style={styles.iconRight} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={()=>signOutWithBackup(userId, Online, setIsLoading)}>
                {/* <MaterialCommunityIcons name="logout" size={24} color="black" style={styles.iconLeft} /> */}
                <View style={styles.textContainer}>
                    <Text style={[styles.buttonText, {color: 'red'}]}>Sign out</Text>
                </View>
                <MaterialCommunityIcons name="logout" size={24} color="red" />
            </TouchableOpacity>
            {isLoading && <LoadingScreen />}
            {isGenerating && <LoadingScreen loadingStyle={{height: Dimensions.get('window').height}}/>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1e',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 100,
    },
    // the style for the with button, we might move it to a compoment for easy reuse
    button: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginVertical: 10,
        alignSelf: 'center',
        width: '90%',
        elevation: 5,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        shadowRadius: 3,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
    },
    iconLeft: {
        marginRight: 10,
    },
    iconRight: {
        color: 'gray'
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
});