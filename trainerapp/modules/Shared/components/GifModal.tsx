import React from 'react';
import {
    Modal,
    View,
    Image,
    Text,
    TouchableHighlight,
    TouchableWithoutFeedback,
    StyleSheet,
    Dimensions
} from 'react-native';
import { gifPathMapping } from "../utils/gifPathMapping";

interface GifModalProps {
    modalVisible: boolean;
    setModalVisible: (modalVisible: boolean) => void;
    currentGif: string;
}

// Shared modal used to display gifs explaining exercises
const GifModal: React.FC<GifModalProps> = ({ modalVisible, setModalVisible, currentGif }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={{...styles.centeredView}}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalView}>
                            {gifPathMapping[currentGif] ? (
                                <Image source={gifPathMapping[currentGif]} style={styles.gif} />
                            ) : (
                                <Text>Sorry. There isn't an explanation for the exercise yet.</Text>
                            )}

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default GifModal;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        margin: 40,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 40,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    gif: {
        width: 200,
        height: 200,
    }


});
