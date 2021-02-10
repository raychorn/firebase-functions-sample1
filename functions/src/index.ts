import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//
admin.initializeApp();

const db = admin.firestore();

const nodemailer = require('nodemailer');

const collection_id = "VyperLogixCorp_Contacts";
const no_reply_address = "no-reply@vyperlogix.com";
const notify_address = "raychorn@gmail.com";

const transporter = nodemailer.createTransport({
    host: 'email-smtp.us-east-2.amazonaws.com',
    port: 25,
    secure: true,
    auth: {
        user: 'AKIAW7PHWMWJQLDO3KA4',
        pass: 'BNdNIX9k/IJEOdCioy268CnHneW02HuuGjSm/FKV8kb8'
    }
});

const asHTML = ((body: any) => {
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
            to: notify_address,
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
        from: no_reply_address,
        to: notify_address,
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
    let full_name = "";
    const data = request.body;
    for (const key in data) {
        if (key === 'first_name') {
            first_name = data[key];
        } else if (key === 'last_name') {
            last_name = data[key];
        } else if (key === 'full_name') {
            full_name = data[key];
        }
    }

    if ((first_name.length > 0) && (last_name.length > 0) && (full_name.length === 0)) {
        full_name = last_name + ', ' + first_name;
        data["full_name"] = full_name;
    } else if ((full_name.length > 0) && (first_name.length === 0) && (last_name.length === 0)) {
        const toks = full_name.split(',');
        first_name = toks[toks.length - 1].trimStart().trimEnd();
        last_name = toks[0].trimStart().trimEnd();
        data["first_name"] = first_name;
        data["last_name"] = last_name;
    }

    const doc_id = 'web: ' + last_name + ',' + first_name;
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
    const collRef = db.collection(collection_id);
    const snapshotPromise = collRef.where('handled', '==', false).get();

    const data: any[] = [];

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
