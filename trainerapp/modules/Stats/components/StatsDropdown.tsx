import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';


interface StatsButtonProps {
    data: { label: string, value: number }[];
    icon?: string;
    text: string;
    color?: string;
    onChange: (item: { label: string, value: number }) => void;
};


export default function StatsButton({onChange, data, icon, text, color}: StatsButtonProps): JSX.Element {

    return (
        <View style={styles.button}>
            <Dropdown 
            search
            searchPlaceholder="Search..."
            placeholder={text}
            placeholderStyle={styles.buttonText}
            style={styles.dropdown}
            labelField="label"
            valueField="value"
            selectedTextStyle={styles.buttonText}
            data={data}
            onChange={onChange}
            renderLeftIcon={() => (
                icon ? <Icon name={icon} size={24} color={color} style={styles.iconLeft}  /> : null      
            )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginVertical: 10,
        alignSelf: 'center',
        width: '90%',
        alignItems: 'center',
        elevation: 5,
    },
    iconLeft: {},
    iconRight: {},
    textContainer: {
        flex: 1,
        marginLeft: 20,
        elevation: 5,
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        marginLeft: 15, 
    },
    dropdown: {
        margin: -10,
        height: 50,
        width: Dimensions.get("screen").width * 0.9 - 15,
    },
});
