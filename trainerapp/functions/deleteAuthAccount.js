const functions = require('firebase-functions');
const admin = require('firebase-admin');
// cloud function to delete the user for firebase auth
exports.deleteUserAccount = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The user is not logged in');
    }
    try {
        await deleteUserData(context.auth.uid);
        // Delete the user in firebase auth
        await admin.auth().deleteUser(context.auth.uid);
        return { status: 'success', message: 'The firebase auth user was deleted' };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'error deleting the user', error);
    }
});

async function deleteUserData(uid) {
    const userReference = admin.firestore().doc(`users/${uid}`);
    await userReference.delete();
}