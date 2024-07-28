import AsyncStorage from "@react-native-async-storage/async-storage";

export const clearAsyncStorage = async () => {
    try {
        await AsyncStorage.removeItem('@logState');
        await AsyncStorage.removeItem('@workoutState');
    } catch (error) {
        console.error('Error clearing async storage: ', error);
    }
}