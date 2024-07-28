import { TouchableOpacity, Image} from 'react-native';
import { auth } from '../utils/firebase'; // Make sure this exports the Firebase Auth instance
import React, {useContext} from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import {syncDatabase} from "../utils/DbQueries";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppStateContext from "../utils/AppStateContext";

// to use inapp browser
WebBrowser.maybeCompleteAuthSession();

// just a temporary replacement for the Google login functionality
export default function GoogleLoginButton() {
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '',
    })
    const { setDatabaseSynced } = useContext(AppStateContext);

    // This gets the response from the Google login and signs in the user with Firebase
    React.useEffect(() => {
        if (response?.type === 'success') {
            console.log("google");

            // retrieve response
            const { authentication } = response;

            // create a new Google credential
            const credential = GoogleAuthProvider.credential(
                authentication?.idToken,
                authentication?.accessToken
            );
            
            // sign in with credential
            signInWithCredential(auth, credential).then(r => {

                const id = r.user.uid;
                console.log("id", id);
                syncDatabase(id).then(() => {
                    console.log("synced");
                    setDatabaseSynced(true);
                }).catch((error: any) => {
                    console.log(error);
                });

            });

        }
    }, [response]);

    return (
        <TouchableOpacity onPress={() => promptAsync()}>
            <Image source={require('../../../assets/google.png')} style={{width: 50, height: 50, marginHorizontal: 20}} />
        </TouchableOpacity>
    );
}