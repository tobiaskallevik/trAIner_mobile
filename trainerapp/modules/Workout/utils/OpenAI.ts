import {app} from "../../Shared/utils/firebase";
import {getFunctions, httpsCallable} from "firebase/functions";

/* Generate a workout using the OpenAI API.
*  The function takes in three parameters: type, difficulty, and requiresGym.
*  From these it will use the OpenAI API through a proxy Firebase function to generate a workout.
*  Once a workout has been generated, it will parse the response and return it as a JSON object.
*/

const OpenAI = async (type: string, difficulty: string, requiresGym: string) => {

    // Connect to the Firebase functions
    const functions = getFunctions(app, 'europe-west1'); // Specify region here
    const getOpenAIResponse = httpsCallable(functions, 'getOpenAIResponse');


    // Convert the requiresGym string to a boolean
    const gym = requiresGym === "true";
    console.log(`Type: ${type}, Difficulty: ${difficulty}, Requires Gym: ${gym}`);

    // Interface for the response from the OpenAI API
    interface OpenAIResponse {
        response: string;
    }

    // Initialize the response object
    let response: OpenAIResponse = {response: ""};

    // System message to be sent to the OpenAI API. This will inform the API of the task it needs to perform
    const systemMessage: string = "You are told to create a workout for a client. " +
        "You are given the following information: workout type, client's skill level, and whether the client wants to train at home or at a gym. " +
        "You provide an appropriate workout for the client based on the information given. " +
        "The workout should be formatted as JSON and only include the following attributes: exerciseName, sets. The root element should be exercises."

    // User message for when gym is available
    const gymMessage: string = "Create a " + type + " workout for a client who wants to train at a gym. " +
        "They are a " + difficulty + " level athlete and wants 10 different exercises."

    // User message for when gym is not available
    const homeMessage: string = "Create a " + type + " workout for a client who wants to train at home. " +
        "They are a " + difficulty + " level athlete and wants 10 different exercises."

    // Call the OpenAI API with the appropriate message based on the gym variable
    if (gym) {
        try {
            const result = await getOpenAIResponse({
                // The conversation array contains the system message and the user message
                // This tells the GPT what role it should take in the conversation and gives it the request to respond to
                // The API uses GPT-3-Turbo to generate a response
                conversation: [
                    {
                        role: "system",
                        content: systemMessage
                    },
                    {
                        role: "user",
                        content: gymMessage
                    }
                ]
            });

            // Gets the response from the API
            response = result.data as OpenAIResponse;
        } catch (error) {
            console.error(`Error calling getOpenAIResponse: ${error}`);
        }
    }

    else {
        try {
            const result = await getOpenAIResponse({
                conversation: [
                    {
                        role: "system",
                        content: systemMessage
                    },
                    {
                        role: "user",
                        content: homeMessage
                    }
                ]
            });

            response = result.data as OpenAIResponse;

        } catch (error) {
            console.error(`Error calling getOpenAIResponse: ${error}`);
        }
    }


    // Removes everything before the first { and after the last }. This is done to ensure that the response is a valid JSON object
    let responseString = response.response;
    const firstBracket = responseString.indexOf("{");
    const lastBracket = responseString.lastIndexOf("}");
    responseString = responseString.substring(firstBracket, lastBracket + 1);

    // Return the generated workout as a JSON object
    return JSON.parse(responseString);

}

export default OpenAI;