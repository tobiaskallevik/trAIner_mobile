import {Button, StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity, FlatList} from 'react-native';
import {NavigationProp, RouteProp, useIsFocused, useRoute} from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// This back header works for both modals and screens
// If the navigation prop is passed, it will go back to the previous screen
// If the closeModal prop is passed, it will close the modal
// If neither prop is passed, it will do nothing
// The title prop is the text that will be displayed in the header
export const BackHeader = ({ title, navigation, closeModal }: { title: string, navigation?: NavigationProp<any>, closeModal?: () => void }) => {
    const handlePress = () => {
        if (closeModal) {
            closeModal();
        } else if (navigation) {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.simpleBackHeader}>
            <TouchableOpacity onPress={handlePress}>
                <Icon name="arrow-left" size={30} color="white"/>
            </TouchableOpacity>
            <Text style={styles.headerText}>{title}</Text>
        </View>
    );
}

export default Headers;

const styles = StyleSheet.create({
    simpleBackHeader: {
        width: Dimensions.get('window').width*0.9,
        justifyContent: 'flex-start',
        flexDirection: 'row',
    },
    headerText: {
        color: 'white',
        fontSize: 20,
        marginLeft: 10,
    },
});
