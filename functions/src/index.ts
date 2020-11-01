import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//
admin.initializeApp();

const db = admin.firestore();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'email-smtp.us-east-2.amazonaws.com',
    port: 25,
    secure: true,
    auth: {
        user: 'AKIAW7PHWMWJRGYY3LOQ',
        pass: 'BPbSWmFaB7R/rqqsyIjVHsLitzqLGVvdryeqUchyroUy'
    }
});

export const helloWorld = functions.https.onRequest((request, response) => {
    let str: string = '{ ';
    for (const key in request.body) {
        str = str + ' { ' + key + ' = ' + request.body[key] + ' },'
    }
    str = str + ' }';

    const mailOptions = {
        from: "no-reply@vyperlogix.com",
        to: "raychorn80231@gmail.com",
        subject: "email from firebase functions",
        html: "<h1>This is a Test</h1>" + "<p>" + str + "</p>" + "<p> <b>Email: </b>raychorn@hotmail.com</p>"
    };

    transporter.sendMail(mailOptions);
    response.contentType("application/json");
    //functions.logger.info("request.body -> " + request.body, { structuredData: true });
    functions.logger.info("request.params -> " + str, { structuredData: true });
    response.send('{ "message" : "Hello from Firebase!" }');
});

export const saveContact = functions.https.onRequest((request, response) => {
    let str: string = '{ ';
    let first_name = "";
    let last_name = "";
    for (const key in request.body) {
        if (key == 'first_name') {
            first_name = request.body[key];
        } else if (key == 'last_name') {
            last_name = request.body[key];
        }
        str = str + ' { ' + key + ' = ' + request.body[key] + ' },'
    }
    str = str + ' }';

    const collection_id = "VyperLogixCorp_Contacts";
    const doc_id = 'web: ' + last_name + ',' + first_name;
    const data = request.body;
    let was_ok: boolean = true;
    let res1 = db.collection(collection_id).doc(doc_id).set(data);
    res1.catch(function (error) {
        was_ok = false;
        functions.logger.error("Cannot Save Web Contact -> " + error, { structuredData: true });
    }).finally(function () {
        functions.logger.info("Saved Web Contact.", { structuredData: true });
    });

    let doc_count = 0;
    let res2 = db.collection(collection_id).select().get().then(function (querySnapshot) {
        doc_count = querySnapshot.docs.length;
    });
    res2.catch(function (error) {
        doc_count = -1;
        functions.logger.error("Cannot get collection doc count -> " + error, { structuredData: true });
    }).finally(function () {
        functions.logger.info("Collection doc count is valid.", { structuredData: true });
    });

    const response_data = {
        "status" : was_ok,
        "count" : doc_count
    };

    response.contentType("application/json");
    //functions.logger.info("request.body -> " + request.body, { structuredData: true });
    functions.logger.info("request.params -> " + str, { structuredData: true });
    response.send(JSON.stringify(response_data));
});
