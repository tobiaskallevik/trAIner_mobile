// Import necessary modules
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Define the CheckboxProps type
type CheckboxProps = {
    label: string;
    isChecked: boolean;
    onChange: (value: boolean) => void; // Explicitly define the type of value
};

// Define the Checkbox component
const Checkbox: React.FC<CheckboxProps> = ({ label, isChecked, onChange }) => {
    return (
        <TouchableOpacity onPress={() => onChange(!isChecked)} style={styles.container}>
            <View style={[styles.checkbox, isChecked ? styles.checked : null]} />
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
};

// Define styles
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#FFF',
        marginRight: 10,
    },
    checked: {
        backgroundColor: '#FFF',
    },
    label: {
        color: '#FFF',
        fontSize: 16,
    },
});

export default Checkbox;
