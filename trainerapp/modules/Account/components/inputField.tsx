import React from 'react';
import { StyleSheet, TextInput} from 'react-native';

interface inputFieldProps {
    placeholder: string;
    onChangeText: (text: string) => void;
    icon?: string;
    secureText?: boolean;     // for any other props that are passed to the component
}

export default function InputField({placeholder, onChangeText, icon, secureText }: inputFieldProps) {
    return (
        <TextInput
        style={styles.input}
        placeholder={placeholder}
        onChangeText={onChangeText}  
        secureTextEntry={secureText}
        />
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        height: 50,
        width: 320,
        margin: 8,
        borderWidth: 1,
        padding: 10,
        backgroundColor: '#FFF',
        borderRadius: 15,
    }
  });

  