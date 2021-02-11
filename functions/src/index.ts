import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as environ from "./env";
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//
const https = require("https");

const MongoClient = require("mongodb").MongoClient;

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

function getDataFrom(url:string, callback: any) {
    const request = https.request(url, (response: any) => {
        let data = "";
        response.on("data", (chunk: string) => {
            data = data + chunk.toString();
        });

        response.on("end", () => {
            httpbinData = JSON.parse(data);
            functions.logger.info("httpbinData on end -> " +
                JSON.stringify(httpbinData),
            {structuredData: true});
            try {
                callback(httpbinData);
            } catch (err) {
                functions.logger.error("ERROR -> " +
                    err,
                {structuredData: true});
            }
        });
    });

    request.on("error", (error: any) => {
        try {
            const obj: LooseObject = {"error": error};
            callback(obj);
        } catch (err) {
            functions.logger.error("ERROR -> " +
                err,
            {structuredData: true});
        }
        functions.logger.error("error -> " + error,
            {structuredData: true});
    });

    request.end();
}

function getIpAddress(callback: any) {
    const url: string = "https://httpbin.org/ip";

    return getDataFrom(url, callback);
}


const mongoUrl: string = "mongodb+srv://root:" + environ.environ.password + "@cluster0.as9re.mongodb.net/admin?retryWrites=true&w=majority";

/*
function getMongoClient1() {
    return new Promise(function (resolve, reject) {
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
            }
        })
    })

}
*/


/*
client.connect(err => {
    const collection = client.db("test").collection("devices");
    client.close();
});
*/

function getArticlesFromMongo(client: any, callback: any) {
    client.connect((err: any) => {
        const docs = client.db("WORD-CLOUD").collection("articles").find({});
        client.close();
        try {
            docs.toArray((err1: any, data: any) => {
                functions.logger.error("getArticlesFromMongo.ERROR.1 -> " +
                    err1,
                {structuredData: true});
                callback(data);
            });
        } catch (err) {
            functions.logger.error("getArticlesFromMongo.ERROR.2 -> " +
                err,
            {structuredData: true});
        }
        functions.logger.error("getArticlesFromMongo.ERROR.3 -> " +
            err,
        {structuredData: true});
    });
}

/*
    The Functions -------------------------------------------------------------
*/

export const helloWorld = functions.https.onRequest((request, response) => {
    function proceed(data: LooseObject): void {
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

        resp.ipAddress = data;
        resp.mongo = {"mongoUrl": mongoUrl};

        response.contentType("application/json");
        response.send(JSON.stringify(resp));
    }
    getIpAddress(proceed);
});


export const getArticles = functions.https.onRequest((request, response) => {
    function proceed(data: LooseObject, err: any): void {
        const resp: LooseObject = {};
        const ids: Array<string> = [];

        for (const i in data) {
            if ({}.hasOwnProperty.call(data[i], "_id")) {
                ids.push(data[i]["_id"]);
            }
        }

        resp.docs = data;

        response.contentType("application/json");
        response.send(JSON.stringify(resp));
    }
    const client = new MongoClient(mongoUrl, {useNewUrlParser: true});
    getArticlesFromMongo(client, proceed);
});

