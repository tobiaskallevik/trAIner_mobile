import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard, TextInput, Dimensions, FlatList, StatusBar, Alert
} from 'react-native';
import { workoutType, workoutExerciseType, exerciseType } from "../../Shared/components/Types";
import {globalStyles} from "../../Shared/components/GlobalStyles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import GifModal from "../../Shared/components/GifModal";
import {BackHeader} from "../../Shared/components/Headers";
import {Picker} from "@react-native-picker/picker";
import {ckeckInternet} from "../../Shared/utils/checkForInternett";


// This modal is used to show a list of exercises that can be added to a workout
// The exercises can be filtered by search text and muscle group
// Only exercises NOT already in the workout are shown
const ExerciseListModal = ({ exercises, modalVisible, setModalVisible, onExerciseAdd }: { exercises: exerciseType[], modalVisible: boolean, onExerciseAdd: (id: number) => void, setModalVisible: (modalVisible: boolean) => void }) => {

    // Constants
    const Online = ckeckInternet();
    const [currentGif, setCurrentGif] = useState('');
    const [gifModalVisible, setGifModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
    const muscleGroups = [
        {label:"All", value:""},
        {label:"Back", value:"Back"},
        {label:"Biceps", value:"Biceps"},
        {label:"Calves", value:"Calves"},
        {label:"Cardio", value:"Cardio"},
        {label:"Chest", value:"Chest"},
        {label:"Forearms", value:"Forearms"},
        {label:"Legs", value:"Legs"},
        {label:"Neck", value:"Neck"},
        {label:"Shoulders", value:"Shoulders"},
        {label:"Traps", value:"Traps"},
        {label:"Triceps", value:"Triceps"}
    ];

    useEffect(() => {
        if (!modalVisible) {
            setSearchText('');
            setSelectedMuscleGroup('');
        }
    }, [modalVisible]);



    // Show the gif modal
    const showGif = (gifFileName: string) => {
        if (!Online) {
            Alert.alert("You dont have internet", "Please check your internet connection and retry :).");
            return;
        }
        setCurrentGif(gifFileName);
        setGifModalVisible(true);
    };

    // Filter the exercises based on the search text and the selected muscle group
    const filteredExercises = exercises.filter(exercise =>
        exercise.exerciseName.toLowerCase().includes(searchText.toLowerCase()) &&
        (selectedMuscleGroup === '' || exercise.muscleGroup === selectedMuscleGroup)
    );


    // Used to render the exercises in the modal.
    // Using a renderItem function to render the exercises in a FlatList.
    // Without a flatlist or similar list component, the performance would be poor.
    const renderItem = ({ item }: { item: exerciseType }) => (
        <View key={item.exerciseId} style={styles.exerciseItem}>
            <Text style={{...globalStyles.largeText, width: Dimensions.get('window').width * 0.6,}}>
                {item.exerciseName}
            </Text>
            <Icon style={styles.info} name="information-outline" size={29} onPress={() => showGif(item.gifFileName)}/>
            <TouchableOpacity onPress={() => {setModalVisible(false); onExerciseAdd(item.exerciseId)}}>
                <Icon style={styles.plus} name="plus" size={25} color= "#0A84FF" />
            </TouchableOpacity>
        </View>
    );




    // Show the modal
    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <TouchableWithoutFeedback  onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.modalView}>
                    <View style={styles.header}>
                    {/*Back header to navigate back to workout*/}
                    <BackHeader title={"Go Back"} closeModal={() => setModalVisible(false)} />

                    <View style={styles.exerciseSearchContainer}>
                        <View style={{flexDirection: "row"}}>
                            <TextInput
                                style={styles.exerciseSearchInput}
                                placeholder="Search for exercises "
                                placeholderTextColor="#666"
                                onChangeText={text => setSearchText(text)}
                                blurOnSubmit={true}
                            />
                            <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
                        </View>
                    </View>

                    {/*Filter by muscle group*/}
                    <View style={styles.pickerContainer}>
                        <Icon name={"dumbbell"} size={25} style={{...styles.icons, transform: [{rotate: '-45deg'}]}}/>
                        <Picker
                            selectedValue={selectedMuscleGroup}
                            style={styles.picker}
                            onValueChange={(itemValue, itemIndex) =>
                                setSelectedMuscleGroup(itemValue)
                            }>
                            <Picker.Item label={"Muscle Group"} value="" />
                            <Picker.Item label="Back" value="Back" />
                            <Picker.Item label="Biceps" value="Biceps" />
                            <Picker.Item label="Calves" value="Calves" />
                            <Picker.Item label="Cardio" value="Cardio" />
                            <Picker.Item label="Chest" value="Chest" />
                            <Picker.Item label="Forearms" value="Forearms" />
                            <Picker.Item label="Legs" value="Legs" />
                            <Picker.Item label="Neck" value="Neck" />
                            <Picker.Item label="Shoulders" value="Shoulders" />
                            <Picker.Item label="Traps" value="Traps" />
                            <Picker.Item label="Triceps" value="Triceps" />

                        </Picker>
                    </View>
                    </View>
                    {/*List of exercises*/}
                <View style={styles.exerciseContainer}>
                    <FlatList
                        style={{marginBottom: 50}}
                        data={filteredExercises}
                        renderItem={renderItem}
                        keyExtractor={item => item.exerciseId.toString()}
                        ListEmptyComponent={<Text style={{...globalStyles.mediumText, marginTop:30}}>No matches</Text>}
                    />
                    </View>


                </View>
            </TouchableWithoutFeedback>
            <GifModal modalVisible={gifModalVisible} setModalVisible={setGifModalVisible} currentGif={currentGif} />
        </Modal>
    );
}

export default ExerciseListModal;

const styles = StyleSheet.create({

    header: {
        backgroundColor: '#2c2c2e',
        width: '100%',
        alignItems: 'center',
        elevation: 5,
        borderBottomWidth: 0.5,
        paddingBottom: 10,
    },
    modalView: {
        backgroundColor: '#1c1c1e',
        alignItems: 'center',
        height: '100%',
    },

    exerciseContainer: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#1c1c1e',
    },

    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3C3C3E',
        width: Dimensions.get('window').width * 0.90,
        margin: 10,
        borderRadius: 8,
        textAlign: 'left',
        elevation: 5,
        shadowColor: 'black',
        padding: 4,
        paddingLeft: 10,
        color: 'white',
        borderColor: 'white',
        borderWidth: 0.75,
    },

    topList: {
        height: Dimensions.get('window').height * 0.2,
    },
    info: {
        color: "#0A84FF",
    },
    exerciseSearchContainer: {
        borderColor: '#ddd',
        backgroundColor: 'white',
        padding: 10,
        marginTop: 5,
        fontSize: 18,
        borderRadius: 50,
        width: Dimensions.get('window').width * 0.92,
        height: Dimensions.get('window').height * 0.065,
        zIndex: 1,
        color: 'black',
        justifyContent: 'center',

    },
    exerciseSearchInput: {
        width: Dimensions.get('window').width * 0.7,
    },
    searchIcon: {
        paddingTop: Dimensions.get('window').height * 0.005,
        position: 'absolute',
        right: 0
    },
    pickerContainer: {
        marginTop: 10,
        backgroundColor: 'white',
        borderRadius: 20,
        width: Dimensions.get('window').width * 0.92,
        height: Dimensions.get('window').height * 0.065,
        flexDirection: 'row',
        alignItems: 'center',

    },
    picker: {
        width: Dimensions.get('window').width * 0.85,
        height: Dimensions.get('window').height * 0.065,
    },
    filterText: {
        color: '#666',
        position: 'absolute',
        left: 50,
        top: Dimensions.get('window').height * 0.025,
    },
    plus: {
        backgroundColor: '#0A84FF',
        color: 'white',
        borderRadius: 50,
    },


    icons: {
        marginLeft: 10,
    }

});
