import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//
admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
    let str: string = '{ ';
    for (const key in request.body) {
        str = str + ' { ' + key + ' = ' + request.body[key] + ' },'
    }
    str = str + ' }';
    response.contentType("application/json");
    functions.logger.info("request.body -> " + request.body, { structuredData: true });
    functions.logger.info("request.params -> " + str, { structuredData: true });
    response.send('{ "message" : "Hello from Firebase!" }');
});
