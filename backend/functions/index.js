const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { getStorage } = require("firebase-admin/storage");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto")
const fetch = require("node-fetch");
const { subtle } = crypto.webcrypto;

const { ref: dbRef, set, onValue, get } = require("firebase/database");

var serviceAccount = require("./amigoconnect-2023-firebase-adminsdk-mq81x-f3cd777ffc.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://amigoconnect-2023-default-rtdb.firebaseio.com",
  storageBucket: "amigoconnect-2023.appspot.com",
});


//! ----------Initialisers------------------
const fs = require("fs");

const app = express();
app.use(cors({ origin: "*" }));
const port = 3000;
var jsonParser = bodyParser.json();
const db = getDatabase();
// const storage = getStorage();

//! -----------Helpers----------------------

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await subtle.digest("SHA-256", msgUint8); // calculate the hash of the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert hash to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}


async function aesGcmEncrypt(plaintext, password) {
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await subtle.digest("SHA-256", pwUtf8); // hash the password

  const iv = crypto.webcrypto.getRandomValues(new Uint8Array(12)); // get 96-bit random iv
  const ivStr = Array.from(iv)
    .map((b) => String.fromCharCode(b))
    .join(""); // iv as utf-8 string

  const alg = { name: "AES-GCM", iv: iv }; // specify algorithm to use

  const key = await subtle.importKey("raw", pwHash, alg, false, [
    "encrypt",
  ]); // generate key from pw

  const ptUint8 = new TextEncoder().encode(plaintext); // encode plaintext as UTF-8
  const ctBuffer = await subtle.encrypt(alg, key, ptUint8); // encrypt plaintext using key

  const ctArray = Array.from(new Uint8Array(ctBuffer)); // ciphertext as byte array
  const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join(""); // ciphertext as string

  return btoa(ivStr + ctStr); // iv+ciphertext base64-encoded
}

async function aesGcmDecrypt(ciphertext, password) {
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await subtle.digest("SHA-256", pwUtf8); // hash the password

  const ivStr = atob(ciphertext).slice(0, 12); // decode base64 iv
  const iv = new Uint8Array(Array.from(ivStr).map((ch) => ch.charCodeAt(0))); // iv as Uint8Array

  const alg = { name: "AES-GCM", iv: iv }; // specify algorithm to use

  const key = await subtle.importKey("raw", pwHash, alg, false, [
    "decrypt",
  ]); // generate key from pw

  const ctStr = atob(ciphertext).slice(12); // decode base64 ciphertext
  const ctUint8 = new Uint8Array(
    Array.from(ctStr).map((ch) => ch.charCodeAt(0))
  ); // ciphertext as Uint8Array
  // note: why doesn't ctUint8 = new TextEncoder().encode(ctStr) work?

  try {
    const plainBuffer = await subtle.decrypt(alg, key, ctUint8); // decrypt ciphertext using key
    const plaintext = new TextDecoder().decode(plainBuffer); // plaintext from ArrayBuffer
    return plaintext; // return the plaintext
  } catch (e) {
    throw new Error("Decrypt failed");
  }
}


console.log("Begin Functions");


app.post("/adduser", jsonParser, async (req, res) => {
  const userId = req.body["userId"];
  const name = req.body["name"];
  const email = req.body["email"];
  const publicKey = req.body["publicKey"];
  set(dbRef(db, "server/users/" + userId), {
    name: name,
    email: email,
    publicKey: publicKey,
  });
});

app.get("/", (_, res) => res.send("OK"));
app.post("/senddata", jsonParser, async (req, res) => {
  const data = req.body["data"];
  const user = req.body["user"];
  const userId = req.body["userid"];
  const date = req.body["date"];
  const text = req.body["text"];
  const postid = req.body["postid"];
  // const storef = ref(storage, "server/posts/" + postid);
  const userRef = dbRef(db, "server/users/" + userId);
  let snapshot = await get(userRef);
  // onValue(userRef, async (snapshot) => {
  let tempKey = snapshot.val().publicKey;
  //! User Public Key
  let publicKey = await subtle.importKey(
    "jwk",
    tempKey,
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    true,
    ["deriveKey"]
  );
  const serverref = dbRef(db, "server/key");
  snapshot = await get(serverref);
  tempKey = snapshot.val().privateKey;
  //! Server Private Key
  let privateKey = await subtle.importKey(
    "jwk",
    tempKey,
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    true,
    ["deriveKey"]
  );
  let sharedKey = await subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  const file = admin
    .storage()
    .bucket()
    .file("server/posts/" + postid);
  const stream = file.createWriteStream({
    metadata: {
      contentType: "text/plain",
    },
  });
  let encryptedData = await aesGcmEncrypt(data, sharedKey);
  const digest = await digestMessage(data);
  stream.end(new Buffer.from(encryptedData));
  admin
    .storage()
    .bucket()
    .upload("encrypted.txt", {
      destination: "server/posts/" + postid,
      contentType: "text/plain",
    })
    .then(async (res) => {
      set(dbRef(db, "server/posts/" + postid), {
        userId: userId,
        user: user,
        date: date,
        text: text,
        postid: postid,
        digest: digest,
        link: "server/posts/" + postid,
        likesCount: 0,
        liked: [],
      });
    });
    res.send("Okay")
  // });
});

app.post("/decryptimage", jsonParser, async (req, res) => {
  const link = req.body["link"];
  const userid = req.body["userid"];
  const userRef = dbRef(db, "server/users/" + userid);
  let snapshot = await get(userRef);
  // onValue(userRef, async (snapshot) => {
  let tempKey = snapshot.val().publicKey;
  let publicKey = await subtle.importKey(
    "jwk",
    tempKey,
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    true,
    ["deriveKey"]
  );
  //!User Public Key
  const serverref = dbRef(db, "server/key");
  snapshot = await get(serverref);
  tempKey = snapshot.val().privateKey;
  let privateKey = await subtle.importKey(
    "jwk",
    tempKey,
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    true,
    ["deriveKey"]
  );
  //! Server Private Key
  let sharedKey = await subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  const file = await admin.storage().bucket().file(link).download();
  let image = await aesGcmDecrypt(file.toString(), sharedKey);
  //res.json(JSON.stringify(image));
  
  // Now encrypt and decrypt the decrypted post using current user and server's shared key
  // converting the image to base 64
  let baseconverted = await getBase64(image);
  //Current user public key
  const currUser = getAuth().currentUser.uid;
  const currUserRef = dbRef(db, "users/" + currUser);
  let currUsersnapshot = await get(currUserRef);
  let currTempKey = currUsersnapshot.val().publicKey;
  let currUserpublicKey = await subtle.importKey(
    "jwk",
    currTempKey,
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    true,
    ["deriveKey"]
  );
  //creating a shared key for current user
  let currSharedKey = await subtle.deriveKey(
    {
      name: "ECDH",
      public: currUserpublicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  let currEncryptedData = await aesGcmEncrypt(baseconverted, currSharedKey);
  stream.end(new Buffer.from(currEncryptedData));
  admin
    .storage()
    .bucket()
    .upload("encrypted.txt", {
      destination: "server/posts/" + postid,
      contentType: "text/plain",
    })
    .then(async (res) => {
      set(dbRef(db, "server/posts/" + postid), {
        userId: userId,
        user: user,
        date: date,
        text: text,
        postid: postid,
        digest: digest,
        link: "server/posts/" + postid,
        likesCount: 0,
        liked: [],
      });
    });
    res.send("Okay")
    const currFile = await admin.storage().bucket().file(link).download();
    let currImage = await aesGcmDecrypt(currFile.toString(), sharedKey);
    res.json(JSON.stringify(currImage)); // sending the response back to Post.js

});

exports.amigoConnect = functions.https.onRequest(app);
