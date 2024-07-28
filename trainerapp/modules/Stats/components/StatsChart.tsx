import React from 'react';
import {StyleSheet, View, Text, Dimensions} from "react-native";
import { LineChart, yAxisSides } from "react-native-gifted-charts";
import { globalStyles } from "../../Shared/components/GlobalStyles";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


interface Data {
    value1?: {label: string, value: number}[];
    value2?: {label: string, value: number}[];
    startindex?: number;
    startindex2?: number;
};


// displayes the stats chart
export default function StatsChart({value1, value2, startindex, startindex2}: Data): JSX.Element {

    // we need to check if the only data is the second dataset
    let secondDataOnly: boolean = false;
    if ((!value1 || value1.length === 0) && (!value2 || value2.length > 0)){    // if there is no data in the first dataset
        secondDataOnly = true;
    }   

    
    // since we will also be using the highest vales from both the datasets, 
    // we can loop through each of the datasets, store the highest value and then compare them
    let highestValue: number = 0;
    let highestValue1: number = 0;
    let highestValue2: number = 0;


    // loop through the first dataset:
    value1?.forEach((item) => {
        if (item.value > highestValue1){
            highestValue1 = item.value;
        }
    });

    // loop through the second dataset:
    value2?.forEach((item) => {
        if (item.value > highestValue2){
            highestValue2 = item.value;
        }
    });
    
    // get the highest value:
    highestValue = Math.max(highestValue1, highestValue2);


    // for only the last dataset (we swap the values so that the second dataset is the first one to be displayed)
    if (secondDataOnly){
        return (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={[globalStyles.text]}>Highest values:</Text>
                    <View style={[styles.text, styles.row]}>
                        <View style={[styles.row, styles.squares]}>
                            <Icon name="square" size={20} color="skyblue" />
                            <Text style={globalStyles.text}>: {(highestValue1.toFixed(2))}kg</Text>
                        </View>
                        <View style={[styles.row, styles.squares]}>
                            <Icon name="square" size={20} color="lightcoral" />
                            <Text style={globalStyles.text}>: {(highestValue2.toFixed(2))}kg</Text>
                        </View>
                    </View>
                </View>
                <LineChart 
                showValuesAsDataPointsText
                scrollToEnd
                startIndex={startindex2 || 0}
                data={value2}
                startIndex2={startindex || 0}
                data2={value1}
                maxValue={highestValue + 0.1*highestValue}
                mostNegativeValue={0}
                height={Dimensions.get('window').height * 0.4}
                spacing={100}
                width={Dimensions.get('window').width * 0.70}
                initialSpacing={20}
                endSpacing={20}
                yAxisLabelSuffix='kg'
                color2="skyblue"
                color1="lightcoral"
                textColor1="white"
                color="white"
                dataPointsColor2="blue"
                dataPointsColor1="red"
                startFillColor2="skyblue"
                startFillColor1="lightcoral"
                yAxisTextStyle={styles.chartTextStyleY}
                xAxisLabelTextStyle={styles.chartTextStyleX}
                yAxisSide={yAxisSides.RIGHT}

                />
            </View>
        );
    }



    // for only the first dataset, and both datasets at the same time
    return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={[globalStyles.text]}>Highest values:</Text>
                <View style={[styles.text, styles.row]}>
                    <View style={[styles.row, styles.squares]}>
                        <Icon name="square" size={20} color="skyblue" />
                        <Text style={globalStyles.text}>: {(highestValue1.toFixed(2))}kg</Text>
                    </View>
                    <View style={[styles.row, styles.squares]}>
                        <Icon name="square" size={20} color="lightcoral" />
                        <Text style={globalStyles.text}>: {(highestValue2.toFixed(2))}kg</Text>
                    </View>
                </View>
            </View>
            <LineChart 
            scrollToEnd
            showValuesAsDataPointsText
            startIndex={startindex || 0}
            data={value1}
            startIndex2={startindex2 || 0}
            data2={value2}
            maxValue={highestValue + 0.1*highestValue}
            mostNegativeValue={0}
            height={Dimensions.get('window').height * 0.4}
            spacing={100}
            width={Dimensions.get('window').width * 0.70}
            initialSpacing={20}
            endSpacing={20}
            yAxisLabelSuffix='kg'
            color1="skyblue"
            color2="lightcoral"
            textColor1="white"
            textColor2='white'
            dataPointsColor1="blue"
            dataPointsColor2="red"
            startFillColor1="skyblue"
            startFillColor2="lightcoral"
            yAxisTextStyle={styles.chartTextStyleY}
            xAxisLabelTextStyle={styles.chartTextStyleX}
            yAxisSide={yAxisSides.RIGHT}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    chartTextStyleY: {
        color: 'white',
        marginLeft: 35,
        paddingLeft: 0,
        fontSize: 12,
        width: Dimensions.get('window').width * 0.14,
    },
    chartTextStyleX: {
        color: 'white',
    },
    text: {
    },
    row: {
        flexDirection: 'row',
        // justifyContent: 'center',
        marginVertical: 10,
    },
    squares: {
        height: 20,
        marginHorizontal: 10,
    }
    

});

