import React, { useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions} from 'react-native';

const PopUpMenuModal = ({ modalVisible, setModalVisible, children }: { modalVisible: boolean, setModalVisible: (modalVisible: boolean) => void, children: React.ReactNode }) => {


    console.log("Popup menu visible", modalVisible)

    // Return the modal with the children as content
    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <TouchableOpacity style={styles.centeredView} onPress={() => setModalVisible(false)}>
                <TouchableOpacity style={styles.modalView} onPress={() => {}}>
                    {children || <Text>No menu context</Text>}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

export default PopUpMenuModal;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    modalView: {
        backgroundColor: "#2c2c2e",
        paddingBottom: 20,
        paddingTop: 20,
        paddingLeft: 20,
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        borderTopWidth: 0.5,
    }
});
