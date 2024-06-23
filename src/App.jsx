import "./App.css";
import React, { useEffect, useState } from "react";
import Authentication from "./Components/Sections/Authentication";
import Posts from "./Components/Sections/Posts";
import Button from "./Components/Helpers/Button";
import { FirebaseApp } from "./firebase_setup/firebase";
import { getDatabase, ref, set } from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { JSEncrypt } from "jsencrypt";

const auth = getAuth(FirebaseApp);

function App() {
  const [User, setUser] = useState("");
  const [LoggedIn, setLoggedIn] = useState();

  async function writeUserData(userId, name, email) {
    const db = getDatabase();
    const clientKeyPair = await crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-384",
      },
      true,
      ["deriveKey"]
    );
    const clientPublicKey = await crypto.subtle.exportKey(
      "jwk",
      clientKeyPair.publicKey
    );
    const clientPrivateKey = await crypto.subtle.exportKey(
      "jwk",
      clientKeyPair.privateKey
    );
    //? Setting up user database end
    set(ref(db, "users/" + userId), {
      name: name,
      email: email,
      publicKey: clientPublicKey,
      privateKey: clientPrivateKey,
    });
    //? Setting up server database end
    fetch("https://us-central1-amigoconnect-2023.cloudfunctions.net/amigoConnect/adduser", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        name: name,
        email: email,
        publicKey: clientPublicKey,
      }),
    });
    signout();
  }

  function getErrorMessage(message) {
    switch (message) {
      case "auth/invalid-email":
        return window.alert("Please check email.");
      case "auth/wrong-password":
        return window.alert("Incorrect Password");
      case "auth/weak-password":
        return window.alert("Make password atleast 6 characters.");
      default:
        return window.alert("An error occurred, please retry.");
    }
  }

  async function signup(name, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      setLoggedIn(true);
      writeUserData(userCredential.user.uid, name, email);
      toast("Signed Up");
    } catch (e) {
      console.log(e);
      getErrorMessage(e.code);
    }
  }

  async function signin(email, password) {
    return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setUser(userCredential.user);
          setLoggedIn(true);
          resolve(true);
          console.log("successfully signed in");
        })
        .catch((e) => {
          getErrorMessage(e.code);
          reject(e);
        });
    });
  }

  function signout() {
    signOut(auth);
    setUser("");
    setLoggedIn(false);
    console.log("succesfully signed out");
  }
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    });
  }, []);
  if (LoggedIn === undefined) return null;
  return (
    <div className="flex flex-col justify-center items-center min-h-[100%]">
      <ToastContainer />
      {!LoggedIn && <Authentication signinfunc={signin} signupfunc={signup} />}
      {LoggedIn && <Posts signoutfunc={signout} />}
    </div>
  );
}

export default App;
