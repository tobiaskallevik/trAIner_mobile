import React, { useState, useEffect } from 'react';
import { NavigationProp } from "@react-navigation/native";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { globalStyles } from '../../Shared/components/GlobalStyles';
import StatsButton from '../components/StatsDropdown';
import StatsChart from '../components/StatsChart';
import StatsScreenButton from '../components/StatsScreenButton';
import { exerciseType,
    loggedExerciseloggedWorkoutType,
    loggedWorkoutType,
    mostFrequentExerciseType 
} from "../../Shared/components/Types";

import { getAllLoggedExerciseNamesNonCardio,
    getAllLoggedWorcoutExercisesNonCardio, 
    getTotalLoggedWorkouts, 
    getLoggedWorkoutsByDate, 
    getMostFrequentlyLoggedExercisesByDate,
    getMostFrequentlyMuscleGroupByDate,
    getLoggedWorkoutsInDateOrder
} from '../../Shared/utils/DbQueries';

import { useIsFocused } from '@react-navigation/native';
import StatsBox from '../components/StatsBox';



// function to calculate the time difference between two dates
function calculateEpochTimeDifference(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end.getTime() - start.getTime()); // returns the difference in milliseconds
}


// function to convert epoch time to human readable time
function epochToTime(epoch: number): string {

    // 1000 ms = 1 sec * 60 = 1 min * 60 = 1 hour * 24 = 1 day (% to remove previous value)
    const days    = Math.floor(epoch / (1000 * 60 * 60 * 24)); 
    const hours   = Math.floor(epoch / (1000 * 60 * 60) % 24);
    const minutes = Math.floor(epoch / (1000 * 60) % 60);
    const seconds = Math.floor(epoch / 1000 % 60);
    
    return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
}





// function to calculate the one rep max using the Epley formula
function calculateOneRepMax(weight: number, reps: number): number {
    if (weight === 0){ 
        weight = 1;
    } 
        
    return Math.round(weight * (1 + reps / 30) * 100) / 100;
}


// converts number into a month name
function monthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (month < 0) { 
        return months[(months.length + (month % 12))];
    }

    return months[(month) % 12];
}

// converts month name into a number
function monthNumber(month: string): number {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(month);
}


// this function is called to get the data for the 1 rep max chart
function jsonToData(input: loggedExerciseloggedWorkoutType[] | undefined, setLineOffset: (value: number) => void): {label: string, value: number} [] {

    // console.log("jsonToData: ", input);
    // console.log("jsonToData length: ", input?.length)


    const currentDate = new Date();                                 // to get date today
    const irlYear = currentDate.getFullYear();                      // to get the current year to make code more readable
    const irlMonth = currentDate.getMonth();                        // to get the current month to make code more readable

    let tempData: { label: string, value: number }[] = [];          // This data is returned to the chart 


    // if there is no data, return an empty array
    if (!input || input?.length === 0) return [];


    /* ---------------------- gathering data ---------------------- */
    // this just adds the data from the database to the array we will display
    // loops through the input data
    input?.map((workout) => {
    
        const date = new Date(workout.endTime);
        const workoutYear = date.getFullYear();
        const workoutMonth = date.getMonth();

        // gets last 12 months of data
        if ((workoutYear === (irlYear-1) && workoutMonth > irlMonth)            // if year of workout is from last year and month is higher than current month
        || (workoutYear === irlYear && workoutMonth <= irlMonth))  {            // or if year of workout is the current year and month is less than or equal to current month

            // if the last month is already in the array, check if the new value is higher
            if (tempData.length > 0 
            && tempData[tempData.length-1].label === monthName(workoutMonth)){

                // now if the new value is higher, replace the old value
                if (tempData[tempData.length-1].value < calculateOneRepMax(workout.weight, workout.reps)) 
                    tempData[tempData.length-1].value = calculateOneRepMax(workout.weight, workout.reps);
            }
            
            // if the month is not in the array, add it
            else{
                tempData.push({value: calculateOneRepMax(workout.weight, workout.reps), label: monthName(workoutMonth)});        
            }
        } 
    });
    /* ---------------- end of gathering data ------------------- */





    // console.log("Exercise: ", tempData.length);
    // console.log("Exercise: ", tempData);






    /* ---------------------- completing missing data ---------------------- */
    // if there is no new data for the last 12 months, fill the array with the last value, else it will be returned empty
    if (tempData.length === 0) {
        // console.log("filling data with last value");
        let lastRecordedValue: number = calculateOneRepMax(input[input.length-1].weight, input[input.length-1].reps)
                
        for (let i = 0; i < 12; i++){
            tempData.unshift({label: monthName(irlMonth - i), value: lastRecordedValue});
        }
    } 

    // if there is less than 12 months of data, fill the array
    else if (tempData.length < 12) {

        // this just fills any holes in the array
        // checks if any parts in the middle are missing:
        for (let i = 1; i < tempData.length; i++){
            if (tempData[i].label !== monthName(monthNumber(tempData[i-1].label) + 1)){

                tempData.splice(i, 0, {label: monthName(monthNumber(tempData[i-1].label) + 1), value: tempData[i-1].value});
            }
        }

        // checks if last part is missing
        // if last month is not the current month, fill the array with the last value
        if (tempData[tempData.length-1].label !== monthName(irlMonth)) {
            // console.log("filling last part");
            const lastRecordedValue: number = tempData[tempData.length-1].value;

            while (tempData[tempData.length-1].label !== monthName(irlMonth)) {
                tempData.push({label: monthName(monthNumber(tempData[tempData.length-1].label) + 1), value: lastRecordedValue});
            }
        }

        //checks if first part is missing
        // if first month is not the month 11 months back, fill the array with previous values
        if (tempData[0].label !== monthName(irlMonth+1)) {

            // number to check (and store the data) if the array contains previous months
            let lastRecordedValue: number = -1;
            
            // checks if input contains a month with data before the first month in the array
            input?.some((workout) => {
                const date = new Date(workout.endTime);
                const workoutYear = date.getFullYear();
                const workoutMonth = date.getMonth();
                
                
                if ((workoutMonth < monthNumber(tempData[0].label) 
                && workoutYear === irlYear-1)
                || workoutYear < irlYear-1){    
                    lastRecordedValue = calculateOneRepMax(workout.weight, workout.reps);
                    console.log("last recorded value: " + lastRecordedValue);
                }
            });


            // fills the start of the array with the last value from database
            if (lastRecordedValue !== -1)  {
                while (tempData[0].label !== monthName(irlMonth + 1)) {
                    tempData.unshift({label: monthName(monthNumber(tempData[0].label) - 1), value: lastRecordedValue});
                }
            }

            // if there is no previous data, fill the start of the array with the 0 value
            else {
                setLineOffset(12 - tempData.length); 
                while (tempData[0].label !== monthName(irlMonth + 1)) {
                    tempData.unshift({label: monthName(monthNumber(tempData[0].label) - 1), value: 0});
                }
            }
        }

    }
    /* ---------------------- end of completing missing data ---------------------- */


    // finally return the data
    return tempData;
}




export default function StatsHomeScreen({ navigation }: { navigation: NavigationProp<any>; }) : JSX.Element {
    const [screen, setScreen] = useState(false)                                                     // for switching between body comp and exercise
    
    //first screen:
    const [exercise, setExercises] = useState<exerciseType[]>([]);                                  // for the exercise info
    const [exerciseNames, setExerciseNames] = useState<{ label: string, value: number }[]>([]);     // for the dropdown
    const [data1, setData1] = useState<{label: string, value: number}[]>([]);                       // for the first chart
    const [data2, setData2] = useState<{label: string, value: number}[]>([]);                       // for the second chart
    const [lineOffset, setLineOffset] = useState<number>(0);                                        // for the line offset (where the line starts)
    const [lineOffset2, setLineOffset2] = useState<number>(0);                                      // for the line offset (where the line starts)
    const isFocused = useIsFocused();                                                               // for the useEffect hook to rerun when the screen is focused   

    //second screen:
    const [totalWorkouts, setTotalWorkouts] = useState<number>(0);                                  // for the total workouts
    const [averageWorkouts, setAverageWorkouts] = useState<number>(0);                              // for the average workouts per month
    const [totalWorkoutTime, setTotalWorkoutTime] = useState<string>('');                           // for the total workout time
    const [currentMonthWorkoutTime, setCurrentMonthWorkoutTime] = useState<string>('');             // for the current month workout time
    const [mostFrequentExercise, setMostFrequentExercise] = useState<string>('');                   // for the most frequent exercise
    const [mostFrequentExerciseCount, setMostFrequentExerciseCount] = useState<number>(0);          // for the count of the most frequent exercise
    const [mostFrequentMuscleGroup, setMostFrequentMuscleGroup] = useState<string>('');             // for the most frequent muscle group
    const [totalWorkoutsMontly, setTotalWorkoutsMontly] = useState<number>(0);                      // for the total workouts monthly
    const [firstWorkout, setFirstWorkout] = useState<string>("");     // for the first workout
    
    // to get correct grammar
    const [ending, setEnding] = useState<string>(' times');



    useEffect(() => {
        // reset the data when the screen is focused
        setData1([]);
        setData2([]);

        /* --------------------------  For the first part of the screen ------------------------------*/
        if (isFocused && screen === false){
            getAllLoggedExerciseNamesNonCardio((workoutsFromDb: exerciseType[]) => {
                setExercises(workoutsFromDb);
            });
        }



        /* --------------------------  For the seconds part of the screen ------------------------------*/
        else if (isFocused && screen){
            //current date:
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear().toString();
            const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // months are zero-based, so we add 1

            // total workouts
            getTotalLoggedWorkouts((workoutsFromDb: number) => {
                setTotalWorkouts(workoutsFromDb);
            });
            

            // total workout time
            getLoggedWorkoutsInDateOrder((workoutsFromDb: loggedWorkoutType[]) => {
                let time = 0;
                workoutsFromDb.map((workout) => {
                    time += calculateEpochTimeDifference(workout.startTime, workout.endTime);
                });
                setTotalWorkoutTime(epochToTime(time));
                setFirstWorkout(workoutsFromDb[0].startTime);
            });


            // average workouts per month
            getLoggedWorkoutsByDate(`${currentYear}-%`, (workoutsFromDb: loggedWorkoutType[]) => {

                // if the user has just started logging workouts:
                if (firstWorkout?.includes(currentYear)){
                    const firstWorkoutMonth = new Date(firstWorkout).getMonth();
                    setAverageWorkouts(workoutsFromDb.length /
                    (currentDate.getMonth() - firstWorkoutMonth + 1));
                }

                // if the user has been logging workouts for a while:
                else{
                    setAverageWorkouts(workoutsFromDb.length / (currentDate.getMonth()+1));
                }
            });


            
            // current month workout time
            getLoggedWorkoutsByDate(`${currentYear}-${currentMonth}%`, (workoutsFromDb: loggedWorkoutType[]) => {
                let time = 0;
                workoutsFromDb.map((workout) => {
                    time += calculateEpochTimeDifference(workout.startTime, workout.endTime);
                });
                setCurrentMonthWorkoutTime(epochToTime(time));
                setTotalWorkoutsMontly(workoutsFromDb.length);
            });


            // most frequently used exercise 
            getMostFrequentlyLoggedExercisesByDate(`${currentYear}%`, (result: mostFrequentExerciseType[]) => {
                if (result.length === 0){
                    setMostFrequentExercise('No exercises logged yet for this year');
                    setMostFrequentExerciseCount(0);
                    return;
                }

                // most frequent exercise and count
                setMostFrequentExercise(result[0].exerciseName + ': '); 
                setMostFrequentExerciseCount(result[0].exerciseCount);
                
                if (result[0].exerciseCount === 1){
                    setEnding(' time');
                }
                else {
                    setEnding(' times');
                }                
            });


            // most frequently used muscle group
            getMostFrequentlyMuscleGroupByDate(`${currentYear}%`, (result: mostFrequentExerciseType[]) => {
                if (result.length === 0){
                    setMostFrequentMuscleGroup('No exercises logged yet for this year');
                    return;
                }

                // most frequent muscle group
                setMostFrequentMuscleGroup(result[0].muscleGroup);
            });


        }
    }, [isFocused, screen]);

    useEffect(() => {
        setExerciseNames([]);
        exercise.map((workout) => {
            setExerciseNames(exerciseNames => [...exerciseNames, {label: workout.exerciseName, value: workout.exerciseId}]);
        });
    }, [exercise, screen]);

    
    /* --------------------------  the more stats screen of the stats ------------------------------*/
    if (screen){
        return (
            <View style={[globalStyles.container, styles.container]}>
                <StatsScreenButton onPress={() => setScreen(false)} button2={true}/>
                <ScrollView style={styles.scrollContainer} alwaysBounceVertical={true}>
                    <View style={styles.statsContainer}>
                        <View style={styles.everlasting}>
                            {/* <LineText textStyle={{fontSize: 25}} text="Everlasting" /> */}
                            <Text style={[globalStyles.text, styles.text]}>Everlasting: </Text>
                            <StatsBox headerText='Total workouts:' subText={totalWorkouts.toString()}/>
                            <StatsBox headerText='Total time:' subText={totalWorkoutTime}/>
                            <StatsBox headerText='First use:' subText={firstWorkout}/>
                        </View>

                        <View style={styles.yearly}>
                            {/* <LineText textStyle={{fontSize: 25}} text={"Yearly"} /> */}
                            <Text style={[globalStyles.text, styles.text]}>Yearly: </Text>
                            <StatsBox headerText='Average workouts:' subText={averageWorkouts.toString() + " workouts per month"}/>
                            <StatsBox headerText='Most freqent exercise:' subText={mostFrequentExercise} subSubText={"Done " + mostFrequentExerciseCount.toString() + ending }/>
                            <StatsBox headerText='Most frequent muscle group:' subText={mostFrequentMuscleGroup}/>
                        </View>

                        <View style={styles.monthly}>
                            {/* <LineText textStyle={{fontSize: 25}} text={"Monthly"} /> */}
                            <Text style={[globalStyles.text, styles.text]}>Monthly: </Text>
                            <StatsBox headerText='Total workouts this month:' subText={totalWorkoutsMontly.toString()}/>
                            <StatsBox headerText='Monthly time:' subText={currentMonthWorkoutTime}/>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }



    /* --------------------------  the 1 rep max part of the stats ------------------------------*/
    return (
        <View style={[globalStyles.container, styles.container]}>
            <StatsScreenButton onPress={() => setScreen(true)}/>
            <View style={{paddingTop: 10}}>
                <StatsButton  data={exerciseNames} text='Choose Exercise' icon='dumbbell' color='#9DCEFF'
                onChange={(item) => { 
                    getAllLoggedWorcoutExercisesNonCardio(item.value, (workoutsFromDb: loggedExerciseloggedWorkoutType[]) => {
                        setLineOffset(0);
                        setData1(jsonToData(workoutsFromDb, setLineOffset));
                    });
                }}
                />

                <StatsButton data={exerciseNames} text='Choose Exercise' icon='dumbbell' color='lightcoral'
                onChange={(item) => {
                    getAllLoggedWorcoutExercisesNonCardio(item.value, (workoutsFromDb: loggedExerciseloggedWorkoutType[]) => {
                        setLineOffset2(0);
                        setData2(jsonToData(workoutsFromDb, setLineOffset2));
                    });
                }} 
                />


                <View style={styles.chartContainer}>
                    <StatsChart value1={data1} value2={data2} startindex={lineOffset} startindex2={lineOffset2}/>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        width: '100%',
    },
    chartContainer: {
        marginTop: 10,
        marginLeft: -15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    everlasting: {
        marginTop: 50,
        // alignItems: 'center',
    },
    yearly: {
        // width: '60%',
        marginTop: 50,
        // alignItems: 'center',
    },
    monthly: {
        marginTop: 50,
        // alignItems: 'center',
        marginBottom: 100,
    },
    text: {
        marginLeft: 10,
        fontSize: 25,
    }
    

});
