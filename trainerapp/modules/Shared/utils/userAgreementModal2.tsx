import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';

type UserAgreementModalProps = {
    modalVisible: boolean;
    setModalVisible: (modalVisible: boolean) => void;
    agreementText: string;
    onAgree: () => void; // Callback function to handle user agreement
    onDisagree: () => void; // Callback function to handle user disagreement
};



const UserAgreementModal2: React.FC<UserAgreementModalProps> = ({ modalVisible, setModalVisible, agreementText, onAgree, onDisagree }) => {
    const [isChecked, setIsChecked] = useState(false); // State to track if the checkbox is checked


    const handleAgree = () => {
        const newCheckedState = !isChecked; // Toggle the checkbox state
        setIsChecked(newCheckedState); // Update isChecked state
    
        if (newCheckedState) {
            onAgree(); // Call the onAgree callback function if the checkbox is checked
        } else if (onDisagree) {
            onDisagree(); // Call the onDisagree callback function if provided and the checkbox is unchecked
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        <Text style={styles.agreementText}>{agreementText}</Text>
                        {/* Checkbox to agree to the terms */}
                        <TouchableOpacity onPress={handleAgree} style={styles.checkboxContainer}>
                            <View style={[styles.checkbox, isChecked ? styles.checked : null]} />
                            <Text style={styles.checkboxLabel}>I agree to the terms and conditions</Text>
                        </TouchableOpacity>
                    </ScrollView>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

UserAgreementModal2.defaultProps = {
    onDisagree: () => {
        console.log("User disagreed with the terms.");
    }
};

export default UserAgreementModal2;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: '#2c2c2e',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        maxHeight: '80%',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    agreementText: {
        color: 'white',
        fontSize: 16,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
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
    checkboxLabel: {
        color: 'white',
        fontSize: 14,
    },
    closeButton: {
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});