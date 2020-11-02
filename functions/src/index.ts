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
        user: 'AKIAW7PHWMWJQLDO3KA4',
        pass: 'BNdNIX9k/IJEOdCioy268CnHneW02HuuGjSm/FKV8kb8'
    }
});

const asHTML = ( (body:any) => {
    let content: string = '<UL>';
    for (const key in body) {
        content = content + '<LI>' + key + ' : ' + body[key] + '</LI>'
    }
    content = content + '</UL>';
    return content;
});

const submitEmail = ((collection: string, data: any) => {
    db.collection(collection)
        .add({
            to: "raychorn@gmail.com",
            message: {
                subject: "New Contact for www.VyperLogix.com",
                text: JSON.stringify(data),
                html: asHTML(data)
            }
        }).then(() => 
            functions.logger.info("Queued email for delivery!", { structuredData: true })
    ).catch(() => 'obligatory catch');
});

export const helloWorld = functions.https.onRequest((request, response) => {
    let str: string = '{ ';
    for (const key in request.body) {
        str = str + ' { ' + key + ' = ' + request.body[key] + ' },'
    }
    str = str + ' }';

    const mailOptions = {
        from: "no-reply@vyperlogix.com",
        to: "raychorn@gmail.com",
        subject: "email from firebase functions",
        html: "<h1>This is a Test</h1>" + "<p>" + str + "</p>" + "<p> <b>Email: </b>raychorn@hotmail.com</p>"
    };

    transporter.sendMail(mailOptions);
    response.contentType("application/json");
    functions.logger.info("request.params -> " + str, { structuredData: true });
    response.send('{ "message" : "Hello from Firebase!" }');
});

export const saveContact = functions.https.onRequest((request, response) => {
    let first_name = "";
    let last_name = "";
    for (const key in request.body) {
        if (key === 'first_name') {
            first_name = request.body[key];
        } else if (key === 'last_name') {
            last_name = request.body[key];
        }
    }

    const collection_id = "VyperLogixCorp_Contacts";
    const doc_id = 'web: ' + last_name + ',' + first_name;
    const data = request.body;
    let was_ok: boolean = true;
    const res1 = db.collection(collection_id).doc(doc_id).set(data);
    res1.catch(function (error) {
        was_ok = false;
        functions.logger.error("Cannot Save Web Contact -> " + error, { structuredData: true });
    }).finally(function () {

        submitEmail("mail-to", data);
        functions.logger.info("Saved Web Contact.", { structuredData: true });

        const response_data = {
            "status": was_ok
        };

        response.contentType("application/json");
        response.send(JSON.stringify(response_data));

    });
});

export const getNewContacts = functions.https.onRequest((request, response) => {
    const collection_id = "VyperLogixCorp_Contacts";
    const collRef = db.collection(collection_id);
    const snapshotPromise = collRef.where('handled', '==', false).get();

    const data:any[] = [];

    let was_ok: boolean = true;
    snapshotPromise.then((snapshotQuery) => {
        snapshotQuery.forEach(doc => {
            const doc_data = doc.data();
            data.push(doc_data);
            functions.logger.info("*** " + doc.id + ' => ' + doc_data, { structuredData: true });
        });

        const response_data = {
            "status": was_ok,
            "data": data
        };

        response.contentType("application/json");
        response.send(JSON.stringify(response_data));

    }).catch(function (error) {
        was_ok = false;
        functions.logger.error("ERROR -> " + error, { structuredData: true });
    });

});
