import React, { useState } from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Dimensions, Alert, Modal, ScrollView} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationProp } from '@react-navigation/native'; // for navigation type
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
// created by us:
import { auth } from "../../Shared/utils/firebase";
import InputField from "../components/inputField";
import GoogleLoginButton from '../../Shared/components/googleLogin';
import FacebookLogin from '../../Shared/components/facebookLogin';
import LoadingScreen from '../../Shared/components/LoadingScreen';
import LargeBtn from '../../Shared/components/LargeBtn';
import LineText from '../../Shared/components/LineText';
import { cleanerError } from '../../Shared/utils/authErrors';
import {ckeckInternet} from "../../Shared/utils/checkForInternett";
import UserAgreementModal2 from '../../Shared/utils/userAgreementModal2'; // Adjust the import statement to use correct casing
import PasswordInputField from '../../Shared/utils/PasswordInputField';

export default function SignUpScreen({ navigation }: { navigation: NavigationProp<any>; }) { 
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    // implemented for the use in user agreement policy
    const [isChecked, setIsChecked] = useState(false); // State to track if the checkbox is checked
    const [modalVisible, setModalVisible] = useState(false); // State to manage the visibility of the modal
    const [userAgreementModalVisible, setUserAgreementModalVisible] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | undefined>(undefined); // State to hold the password error message

    // for loading screen
    const [IsLoading, setIsLoading] = React.useState(false);

    const Online = ckeckInternet();
    function checkPasswordStrength(password: string): boolean {
        // Minimum length checks
        if (password.length < 8) {
            return false;
        }
    
        // Checks for at least one special character
        const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        if (!specialCharacters.test(password)) {
            return false;
        }
    
        // Checks for at least one numerical character
        const numericalCharacters = /[0-9]/;
        if (!numericalCharacters.test(password)) {
            return false;
        }
    
        // Checks for at least one capitalized letter
        const capitalizedCharacters = /[A-Z]/;
        if (!capitalizedCharacters.test(password)) {
            return false;
        }
    
        
        return true;
    }
    function checkPasswordRequirements(password: string): string | undefined {
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
    
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return "Password must contain at least one special character";
        }
    
        if (!/\d/.test(password)) {
            return "Password must contain at least one numerical character";
        }
    
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one capitalized letter";
        }
    
        return undefined; 
    }

    function handleButtonClick(email: string, password: string) {
        if (!Online) {
            Alert.alert("You dont have internet", "Please check your internet connection and retry :).");
            return;
        }
        // Open the user agreement modal if the checkbox is not checked
        if (!isChecked) {
            setModalVisible(true);
            return;
        }
        if (password !== confirmPassword) { // Checks if passwords match
            setPasswordsMatch(false);
            return;
        }
        console.log("Button clicked. isChecked:", isChecked);
        setIsLoading(true);
    
        const isStrongPassword: boolean = checkPasswordStrength(password);
        if (!isStrongPassword) {
            setPasswordErrorMessage("Please choose a stronger password.");
            setIsLoading(false);
            return;
        }
        // create a new user with the email and password
        createUserWithEmailAndPassword(auth, email, password).then((userCredential: any) => {
            if (userCredential.user === null){
                setIsLoading(false);
                return false;
            }
    
            setIsLoading(false);
    
            // send email verification to the user
            sendEmailVerification(userCredential.user).then(() => {
                navigation.navigate("SignIn");
                console.log("email verification sent");
                alert("email verification sent"); 
    
            }).catch((error: any) => {
                alert(cleanerError(error.code));
            });
    
        }).catch((error: any) => {
            alert(cleanerError(error.code));
            setIsLoading(false);
            return false;
        })
    
        return true; 
    }
    

    return (
        
        <View style={styles.container}>

            {/* Title and header of the screen */}
            <Text style={styles.header}>Hey There,</Text>
            <Text style={styles.title}>Create an Account</Text>
        
            {/* Fields where the user can interract*/}
            <View style={styles.inputs}>

                <InputField
                placeholder="Email"
                onChangeText={setEmail}
                />
                <PasswordInputField
                    placeholder="Password"
                    onChangeText={(text) => {
                        setPassword(text);
                        setPasswordErrorMessage(checkPasswordRequirements(text)); // Check the password requirements
                    }}
                />
                <PasswordInputField
                    placeholder="Confirm Password"
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        setPasswordsMatch(true);
                    }}
                />
                {!passwordsMatch && (
                    <Text style={styles.errorText}>Passwords do not match</Text>
                )}
                {passwordErrorMessage && ( // Display password error message if exists
                    <Text style={styles.errorText}>{passwordErrorMessage}</Text>
                )}
                {/* Text to view user agreement */}
                <TouchableOpacity onPress={() => {
                console.log("View User Agreement text pressed");
                setModalVisible(true);
                }}>
                <Text style={styles.policyText}>Please read the user agreement to create an account!</Text>   
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
                icon='account-multiple-plus'
                text='Register '
                />

                <LineText text="or"  lineStyle={{width: "44%"}} style={{marginTop: 30, marginBottom: 10}}/>


                <View style={styles.row}>
                    <GoogleLoginButton />
                </View>

                {/* button to switch screen to sign up screen */}
                <TouchableOpacity style={{justifyContent: 'center', alignContent: 'center'}}>
                    <Text style={styles.signinText} onPress={() => navigation.navigate("SignIn")}>Already have an account? Login</Text>
                </TouchableOpacity>

                <StatusBar style="auto" />


                {IsLoading ? 
                    <LoadingScreen loadingStyle={{ backgroundColor: 'rgba(28,28,30, 0.3)' }}/>
                    :
                    null
                }
            </View>
                {/* Checkbox component to agree to terms */}
                <UserAgreementModal2
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    agreementText={`TrAIer User Agreement\n1. Account Creation:\nYou may create an account within the App to utilize its functions.\n\n2. Content Generation:\nYou can generate content using the functions provided within the App.\n\n3. Content Management:\nYou have the right to delete your content within the App.\n\n4. Backups:\nYou may make backups of your content and information stored within the App.\n\n5. Data Deletion:\nYou can delete all of your information stored within the App.\n\n6. User Data:\nThe content saved within the App includes your email, name, token, and user-generated content.\n\n7. In-App Purchases:\nThere are no in-app purchases available within the App.\n\n8. Ownership:\nYour own content and trademarks remain your exclusive property.\n\n9. Feedback and Suggestions:\nBy providing feedback and suggestions, you agree that we may use this feedback without compensation or credits given.\n\n10. Promotions, Contests, Sweepstakes:\nWe do not plan to offer promotions, contests, or sweepstakes within the App.\n\n11. Contact Us:\nFor any questions regarding these Terms & Conditions, you may contact us via email at ikt205project@gmail.com.\n\n12. Modifications to the Agreement:\nWe reserve the right to modify this Agreement at any time. Any modifications will be effective immediately upon posting on the App. Your continued use of the App after any modifications constitutes your acceptance of the modified Agreement.\n\n13. Termination:\nWe reserve the right to terminate or suspend your access to the App at any time, without prior notice or liability, for any reason whatsoever.\n\n14. Governing Law:\nThis Agreement shall be governed by and construed in accordance with the laws of Norway.\n\nBy using the TrAIer App, you acknowledge that you have read, understood, and agree to be bound by this Agreement. If you do not agree to these terms, please refrain from using the App.\n`}
                    onAgree={() => setIsChecked(true)}
                    onDisagree={() => setIsChecked(false)} // Add the onDisagree prop here
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

    // for the "Create an Account" text
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

    // for the buttons (google and facebook)
    row: {
        flexDirection: 'row',
        marginTop: 20,
    },

    // for the "Already have an account? Login" text
    signinText:{
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

    // for the bottom buttons
    bottomContainer: {
        position: 'absolute',
        alignItems: 'center', 
        justifyContent: 'center',
        top: Dimensions.get('window').height - 250,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 20,
    }
});