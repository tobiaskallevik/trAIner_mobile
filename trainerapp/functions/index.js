// Firebase Cloud Function for OpenAI Requests
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

const { SendNotification } = require('./notificationCloudFunc'); // for push notification
const { deleteUserAccount } = require('./deleteAuthAccount'); // for delete auth acc

admin.initializeApp();

const apiKey = functions.config().openai.apikey;

exports.getOpenAIResponse = functions.region('europe-west1').https.onCall(async (data) => {
    try {
        const { conversation } = data;

        if (!conversation || !apiKey) {
            throw new functions.https.HttpsError("invalid-arg", "API Error");
        }

        const url = "https://api.openai.com/v1/chat/completions";

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        };

        const body = {
            "messages": conversation,
            "temperature": 0.7,
            "model": "gpt-3.5-turbo",
        };

        const response = await axios.post(url, body, { headers });

        if (response.status === 200) {
            return { response: response.data.choices[0].message.content };
        } else {
            throw new functions.https.HttpsError("internal", "Request failed.");
        }
    } catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});

exports.SendNotification = SendNotification; // for push notification

exports.deleteUserAccount = deleteUserAccount; // for delete auth acc