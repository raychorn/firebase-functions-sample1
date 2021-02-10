import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const express = require('express');
const cors = require('cors');
const app = express();
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//
admin.initializeApp();

//const db = admin.firestore();

app.use(cors({ origin: false }));

export const helloWorld = functions.https.onRequest((request, response) => {
    let str: string = '{ ';
    for (const key in request.body) {
        str = str + ' { ' + key + ' = ' + request.body[key] + ' },'
    }
    str = str + ' }';

    response.contentType("application/json");
    functions.logger.info("request.params -> " + str, { structuredData: true });
    response.send('{ "message" : "Hello, again, from Firebase!" }');
});

app.get('/hello-world', (request, response) => {
    response.contentType("application/json");
    response.end('{"response":"Received GET request!"}');
});

app.post('/hello-world', (request, response) => {
    response.contentType("application/json");
    response.end('{"response":"Received GET request!"}');
});

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(app);