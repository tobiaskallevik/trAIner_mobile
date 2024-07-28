import React, { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

interface PasswordInputFieldProps {
    placeholder: string;
    onChangeText: (text: string) => void;
}

const PasswordInputField: React.FC<PasswordInputFieldProps> = ({ placeholder, onChangeText }) => {
    const [isPasswordVisible, setPasswordVisibility] = useState<boolean>(false);

    const togglePasswordVisibility = () => {
        setPasswordVisibility(!isPasswordVisible);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                onChangeText={onChangeText}
                secureTextEntry={!isPasswordVisible}
            />
            <View style={styles.iconContainer}>
                <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        width: 320,
        margin: 8,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#000',
        backgroundColor: '#FFF',
        position: 'relative', 
    },
    input: {
        flex: 1,
        height: '100%',
        padding: 10,
        borderRadius: 15,
    },
    iconContainer: {
        position: 'absolute',
        right: 10,
        top: 10,
        bottom: 10,
        width: 40, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#FFF',
        borderRadius: 15,
    },
});

export default PasswordInputField;
