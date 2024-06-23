import React from "react";
import { useState } from "react";
import Card from "../../Helpers/Card";
import Button from "../../Helpers/Button";
import { getAuth } from "@firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "@firebase/storage";
import {
  getDatabase,
  onValue,
  set,
  ref as dbRef,
  get,
} from "@firebase/database";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getBase64 } from "../Encryption/helpers";

function MakePost(props) {
  const user = getAuth().currentUser;
  function makeid(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  async function post(temp) {
    const db = getDatabase();
    const user = getAuth().currentUser;
    const userRef = dbRef(db, "users/" + user.uid);
    let key;
    let name;
    let snapshot = await get(userRef);
    name = snapshot.val().name;
    const date = new Date();
    const curr_date =
      date.toLocaleString("en-US", { day: "2-digit" }) +
      " " +
      date.toLocaleString("en-US", { month: "long" }) +
      " " +
      date.getFullYear();

    //! -----------
    if (temp.file) {
      toast("Uploading, this may take some time...");
      let baseconverted = await getBase64(temp.file);
      const postid = makeid(20);
      await fetch(
        "https://us-central1-amigoconnect-2023.cloudfunctions.net/amigoConnect/senddata",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            data: baseconverted,
            user: name,
            userid: user.uid,
            date: curr_date,
            text: temp.text,
            // likesCount: 0,
            postid: postid,
            // liked: [],
          }),
        }
      );
    } else {
      const postid = makeid(20);
      set(dbRef(db, "server/posts/" + postid), {
        user: name,
        userid: user.uid,
        date: curr_date,
        text: temp.text,
        likesCount: 0,
        postid: postid,
        liked: [],
      }); 
    }
  }



  const initialpost = {
    text: "",
  };
  const [temp, settemp] = useState(initialpost);
  return (
    <Card className="w-[800px] mx-auto p-10 flex-col">
      <ToastContainer />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          post(temp);
        }}
        className="flex flex-col w-full"
      >
        <h3 className="mr-auto text-xl font-medium">{`Hey ${props.user}, post what's on your mind: `}</h3>
        <textarea
          name=""
          className="w-full appearance-none mt-5 h-[100px] resize-none"
          id=""
          cols="30"
          rows="10"
          required
          onChange={(e) => {
            settemp({ ...temp, text: e.target.value });
          }}
        ></textarea>
        {/* <Button image={plus} className="mr-auto mt-5">Add Attachment</Button> */}
        <p className="my-2">Choose PNG file</p>
        <input
          type="file"
          name=""
          id=""
          accept="image/x-png"
          className="mr-auto mt-2"
          onChange={(e) => {
            settemp({ ...temp, file: e.target.files[0] });
          }}
        />
        <Button image={"/plus.svg"} className="mr-auto mt-5" type="submit">
          Post
        </Button>
      </form>
    </Card>
  );
}

export default MakePost;
