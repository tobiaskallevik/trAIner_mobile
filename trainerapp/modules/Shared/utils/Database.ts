import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import {Asset} from 'expo-asset';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function InitDatabase(pathToDatabaseFile: string = "../../../assets/app.db"): Promise<SQLite.SQLiteDatabase> {


    // Checks if the sqlite database already exists (on the phone (expo environment))
    if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');   // makes database if it doesn't exist
    }


    try{
        console.log(pathToDatabaseFile);
        const asset = Asset.fromModule(require("../../../assets/database/app.db"));
        console.log("BB\n\n\n\n\n\n\n\n\nnpx " + asset);

        // downloads the database from the project
        if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite/app.db')).exists) {

            await FileSystem.downloadAsync(
                asset.uri,                                               // source
                FileSystem.documentDirectory + 'SQLite/app.db');  // destination
        }

    } catch (error) {
        console.log(error);
    }

    return SQLite.openDatabase('app.db');
}
