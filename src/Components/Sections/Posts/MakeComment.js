import React, { useState } from "react";
import Button from "../../Helpers/Button";
import { getDatabase, ref, set, onValue } from "@firebase/database";
import { getAuth } from "@firebase/auth";

function MakeComment(props) {
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
  const [comment, setcomment] = useState("");
  const db = getDatabase();
  const user = getAuth().currentUser;
  const userRef = ref(db, "users/" + user.uid);
  let name;
  onValue(userRef, (snapshot) => {
    name = snapshot.val().name;
  });
  function postComment() {
    const commentid = makeid(20);
    set(ref(db, "server/posts/" + props.postid + "/comments/" + commentid), {
        author: name,
        text: comment,
        authorid: user.uid,
        id: commentid,
    });
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        postComment();
      }}
      className="flex gap-3 mt-3">
      <textarea
        required
        className="appearance-none resize-none w-full rounded-lg bg-transparent border-2 p-2"
        name=""
        id=""
        cols="30"
        rows="1"
        onChange={(e) => {
          setcomment(e.target.value);
        }}></textarea>
      <Button type="submit">Comment</Button>
    </form>
  );
}

export default MakeComment;
