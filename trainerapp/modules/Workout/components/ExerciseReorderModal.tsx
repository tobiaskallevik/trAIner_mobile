import React, {useEffect, useState} from 'react';
import {
    Modal,
    StyleSheet,
    View,
    Text,
    Dimensions,
    TouchableOpacity
} from "react-native";
import {workoutExerciseType} from "../../Shared/components/Types";

import {BackHeader} from "../../Shared/components/Headers";
import PlusBtn from "../../Shared/components/PlusBtn";
import DragList, {DragListRenderItemInfo} from "react-native-draglist";
const ExerciseReorderModal = ({exercises, modalVisible, setModalVisible, onExerciseReorder}: { exercises: workoutExerciseType[],
    modalVisible: boolean, onExerciseReorder: (exercises: workoutExerciseType[]) => void, setModalVisible: (modalVisible: boolean) => void }) => {

    const [order, setOrder] = useState(exercises);

    useEffect(() => {
        setOrder(exercises);
    }, [exercises]);

    console.log("Ordering:", exercises)

    function renderItem(info: DragListRenderItemInfo<string>) {
        const {item, onDragStart, onDragEnd, isActive} = info;

        return (
            <TouchableOpacity
                style={styles.exerciseItem}
                key={item}
                onPressIn={onDragStart}
                onPressOut={onDragEnd}>
                <Text style={styles.reorderText}>{item}</Text>
            </TouchableOpacity>
        );
    }

    async function onReordered(fromIndex: number, toIndex: number) {

        const copy = [...order];
        const removed = copy.splice(fromIndex, 1);

        copy.splice(toIndex, 0, removed[0]);

        // Update 'isOrder' attribute for each item
        const updatedData = copy.map((item, index) => ({
            ...item,
            isOrder: index + 1,
        }));

        setOrder(updatedData);
    }

    // Save the order of the exercises and close the modal
    const saveOrder = () => {
        onExerciseReorder(order);
        console.log("Ordering:", order)
        setModalVisible(false);
    };

    function keyExtractor(str: string) {
        return str;
    }


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <View  style={styles.modalView}>
                <View style={styles.header}>
                    <BackHeader title={"Go Back"} closeModal={() => setModalVisible(false)} />
                </View>
                <DragList
                    data={order.map((exercise) => exercise.exerciseName)}
                    keyExtractor={keyExtractor}
                    onReordered={onReordered}
                    renderItem={renderItem}
                    contentContainerStyle={{paddingBottom: '100%', marginTop: 20}}
                />
                <PlusBtn icon="check"  gradient={{ colors: ['#00FF3F', '#00C732'] }} onPress={saveOrder} />

            </View >
        </Modal>
    );
};

export default ExerciseReorderModal;

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
    exerciseItem: {
        backgroundColor: '#3C3C3E',
        width: Dimensions.get('window').width * 0.9,
        margin: 6,
        borderRadius: 8,
        elevation: 5,
        shadowColor: 'black',
        padding: 4,
        paddingLeft: 10,
        borderColor: 'white',
        borderWidth: 0.75,
    },
    reorderText: {
        color: 'white',
        fontSize: 16,
        padding: 10,
        textAlign: 'center',
    }
});
