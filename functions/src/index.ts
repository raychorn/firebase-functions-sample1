import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//
const https = require("https");

admin.initializeApp();

/* eslint indent: ["error", 4] */

/* eslint "require-jsdoc": ["error", {
    "require": {
        "FunctionDeclaration": false,
        "MethodDefinition": false,
        "ClassDeclaration": false,
        "ArrowFunctionExpression": false,
        "FunctionExpression": false
    }
}]*/

// const db = admin.firestore();

interface LooseObject {
    [key: string]: any
}

let httpbinData: LooseObject = {};

// getIpAddress...
function getIpAddress() {
    https.get("https://httpbin.org/ip", (response: any) => {
        // called when a data chunk is received.
        response.on("data", (chunk: any) => {
            httpbinData = JSON.parse(chunk);
            functions.logger.info("chunk -> " + chunk, {structuredData: true});
        });

        // called when the complete response is received.
        response.on("end", () => {
            functions.logger.info("end -> " + JSON.stringify(httpbinData),
                {structuredData: true});
        });
    }).on("error", (error: any) => {
        httpbinData = {"origin": error.message};
        functions.logger.info("Error: " + error.message,
            {structuredData: true});
    });
}

export const helloWorld = functions.https.onRequest((request, response) => {
    getIpAddress();

    const resp: LooseObject = {};
    resp.message = "Hello, again, from Firebase!";
    const obj: LooseObject = {};
    for (const k1 in request.body) {
        if ({}.hasOwnProperty.call(request.body, k1)) {
            obj.key = request.body[k1];
        }
    }
    resp.body = obj;

    const queryObj: LooseObject = {};
    for (const k2 in request.query) {
        if ({}.hasOwnProperty.call(request.body, k2)) {
            queryObj.key = request.query[k2];
        }
    }
    resp.query = queryObj;

    resp.params = request.params;
    resp.query = request.query;

    resp.ipAddress = httpbinData;

    response.contentType("application/json");
    response.send(JSON.stringify(resp));
});


