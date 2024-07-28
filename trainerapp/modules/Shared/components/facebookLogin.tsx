import { TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { auth } from '../utils/firebase'; // Make sure this exports the Firebase Auth instance
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { FacebookAuthProvider, signInWithCredential } from 'firebase/auth';

// Initialize the in-app browser
WebBrowser.maybeCompleteAuthSession();

export default function FacebookLoginButton() {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: '',
  });

  // Handle the Facebook login response
  React.useEffect(() => {
    if (response?.type === 'success') {
      // Retrieve the response data
      const { authentication } = response;

      if (!authentication) {
        return;
      }

      // Create a new Facebook credential
      const credential = FacebookAuthProvider.credential(
        authentication.accessToken
      );

      // Sign in with the Facebook credential
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return (
    <TouchableOpacity onPress={() => promptAsync()}>
      <Image source={require('../../../assets/facebook.png')} style={{ width: 50, height: 50, marginHorizontal: 20 }} />
    </TouchableOpacity>
  );
}
