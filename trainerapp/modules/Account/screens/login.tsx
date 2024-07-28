import React, {useContext, useState} from 'react';
import {Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {NavigationProp} from '@react-navigation/native'; // Adjust the import based on your navigation library
import {sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword} from "firebase/auth";

// created by us:
import {auth} from "../../Shared/utils/firebase";
import GoogleLoginButton from "../../Shared/components/googleLogin";
import InputField from "../components/inputField";
import LargeBtn from '../../Shared/components/LargeBtn';
import LoadingScreen from '../../Shared/components/LoadingScreen';
import LineText from '../../Shared/components/LineText';
import {cleanerError} from '../../Shared/utils/authErrors';
import {ckeckInternet} from '../../Shared/utils/checkForInternett';
import {syncDatabase} from "../../Shared/utils/DbQueries";
import RNRestart from "react-native-restart";
import AppStateContext from "../../Shared/utils/AppStateContext";
import UserAgreementModal from '../../Shared/utils/userAgreementModal'; // Adjust the import statement to use correct casing

export default function SignInScreen({ navigation }: { navigation: NavigationProp<any>; }) : JSX.Element {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const [IsLoading, setIsLoading] = React.useState(false);
    const [user, setUser] = React.useState(auth?.currentUser);

    const [userAgreementModalVisible, setUserAgreementModalVisible] = React.useState(false);

    const Online = ckeckInternet();
    const { setDatabaseSynced } = useContext(AppStateContext);

    function handleButtonClick(email: string, password: string) {
        if (!Online) {
            Alert.alert("You dont have internet", "Please check your internet connection and retry :).");
            return;
        }
        // sign out so the listener in app.tsx can get the updated user info         
        auth?.signOut();
        setIsLoading(true);
        console.log("pressed");
        signInWithEmailAndPassword(auth, email, password).then((userCredential: any) => {
            setIsLoading(false);
            if (userCredential.user && !userCredential.user.emailVerified) {
                alert("Please verify your email");
                return false;
            }
            console.log("logged in");
            console.log(userCredential.user);
            console.log(userCredential.user.uid);
            syncDatabase(userCredential.user.uid).then(() => {
                setDatabaseSynced(true);
                console.log("synced");
            }).catch((error: any) => {
                console.log(error);
            });


        }).catch((error: any) => {
            console.log(error);
            if  (error.code === "auth/invalid-credential"
                || error.code === "auth/too-many-requests"){
                Alert.alert(
                    'Wrong password',
                    'Have you forgotten your password, and would like to reset it?',
                    [
                        {
                            text: 'Try again',
                            style: 'cancel',
                        },
                        {
                            text: 'Reset password',
                            onPress: () => {
                                sendPasswordResetEmail(auth, email).then(() => {
                                    alert("Password reset email have been sent to your email");
                                }).catch((error: any) => {
                                    alert(cleanerError(error.code));
                                });
                            },
                        },
                    ],
                    { cancelable: false },
                );
            }

            // lets the user know if the credentials are wrong
            else{
                alert(cleanerError(error.code));
            }

            setIsLoading(false);
            return false;
        })
        return true;
    }




    React.useEffect(() => {
        const subscriber = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return subscriber;
    }, [user]);




    return (
        <View style={styles.container}>

            {/* Title and header of the screen */}
            <Text style={styles.header}>Hey There,</Text>
            <Text style={styles.title}>Welcome Back</Text>

            
            {/* Fields where the user can interract*/}
            <View style={styles.inputs}>

                <InputField
                placeholder="Email"
                onChangeText={setEmail}
                />

                <InputField
                placeholder="Password"
                onChangeText={setPassword}
                icon='eye-off'
                secureText={true}
                />

                {/* Text to view user agreement */}
                <TouchableOpacity onPress={() => {
                console.log("View User Agreement text pressed");
                setUserAgreementModalVisible(true);
                }}>
                <Text style={styles.policyText}>View User Agreement</Text>
                </TouchableOpacity>
            </View>


            <View style={styles.bottomContainer}>
                {/* button which signs in the user, if credentials are correct */}
                <LargeBtn
                onPress={() => {
                    handleButtonClick(email, password);
                }}
                buttonStyle={styles.button}
                icon='account-arrow-right'
                text='Login '
                />

                <LineText text="or"  lineStyle={{width: "44%"}} style={{marginTop: 30, marginBottom: 10}}/>

                <View style={styles.row}>
                    <GoogleLoginButton />

                </View>

                {/* button to switch screen to sign up screen */}
                <TouchableOpacity style={{justifyContent: 'center', alignContent: 'center'}}>
                    <Text style={styles.signupText} onPress={() => navigation.navigate("SignUp")}>Don't have an account? Sign up</Text>
                </TouchableOpacity>

                <StatusBar style="auto" />

                {/* loading screen */}
                {IsLoading ? 
                    <LoadingScreen loadingStyle={{ backgroundColor: 'rgba(28,28,30, 0.3)' }}/>
                    :
                    null
                }

                {/* makes it possible for the user to resend the email verification */}
                {user && !user.emailVerified ? 
                <TouchableOpacity style={styles.hiddenText} onPress={() => {
                    sendEmailVerification(user).then(() => {
                        console.log("email verification sent");
                        alert("Email verification sent. Please check your email and verify before continuing.");
                    }).catch((error: any) => {
                        alert(cleanerError(error.code));
                    });
                }}> 
                    <Text style={{color: "white", paddingTop: 20}}> Resend email verification </Text>
                </TouchableOpacity> : null }
            </View>
            <UserAgreementModal
                modalVisible={userAgreementModalVisible}
                setModalVisible={setUserAgreementModalVisible}
                agreementText={`TrAIer User Agreement\n1. Account Creation:\nYou may create an account within the App to utilize its functions.\n\n2. Content Generation:\nYou can generate content using the functions provided within the App.\n\n3. Content Management:\nYou have the right to delete your content within the App.\n\n4. Backups:\nYou may make backups of your content and information stored within the App.\n\n5. Data Deletion:\nYou can delete all of your information stored within the App.\n\n6. User Data:\nThe content saved within the App includes your email, name, token, and user-generated content.\n\n7. In-App Purchases:\nThere are no in-app purchases available within the App.\n\n8. Ownership:\nYour own content and trademarks remain your exclusive property.\n\n9. Feedback and Suggestions:\nBy providing feedback and suggestions, you agree that we may use this feedback without compensation or credits given.\n\n10. Promotions, Contests, Sweepstakes:\nWe do not plan to offer promotions, contests, or sweepstakes within the App.\n\n11. Contact Us:\nFor any questions regarding these Terms & Conditions, you may contact us via email at ikt205project@gmail.com.\n\n12. Modifications to the Agreement:\nWe reserve the right to modify this Agreement at any time. Any modifications will be effective immediately upon posting on the App. Your continued use of the App after any modifications constitutes your acceptance of the modified Agreement.\n\n13. Termination:\nWe reserve the right to terminate or suspend your access to the App at any time, without prior notice or liability, for any reason whatsoever.\n\n14. Governing Law:\nThis Agreement shall be governed by and construed in accordance with the laws of Norway.\n\nBy using the TrAIer App, you acknowledge that you have read, understood, and agree to be bound by this Agreement. If you do not agree to these terms, please refrain from using the App.\n`}
                />
        </View>
    );
}

const styles = StyleSheet.create({
    // for whole screen
    container: {
        flex: 1,
        backgroundColor: '#1c1c1e',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    // for the "Hey There," text
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 0,
        marginTop: 40,
    },

    // for the "Welcome Back" text
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },

    // for the input fields
    inputs: {
        marginTop: 0,
    },

    // for the policy text
    policyText: {
        color: '#FFF',
        fontSize: 12,
        marginTop: 10, 
        marginLeft: 20,
    },

    // for the row of buttons (Google and Facebook)
    row: {
        flexDirection: 'row',
        marginTop: 20,
    },

    // for the "Don't have an account? Sign up" text
    signupText:{
        color: '#FFF',
        fontSize: 12,
        marginTop: 10, 
    },

    // for the button
    button: {
        position: 'relative',
        borderRadius: 35,
        height: 60,
        width: 330,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // for the hidden text
    hiddenText: {
        position: 'absolute',
        marginTop: 400,
        alignItems: 'center',
        justifyContent: 'center',
    },

    

    // for the bottom buttons
    bottomContainer: {
        position: 'absolute',
        alignItems: 'center', 
        justifyContent: 'center',
        top: Dimensions.get('window').height - 250,
    }
  });