import React from "react";
import { getAuth } from "@firebase/auth";
import { getDatabase, ref, remove } from "firebase/database";

function Comment(props) {
  const currUser = getAuth().currentUser;
  const db = getDatabase();
  function deleteComment(path) {
    const commentRef = ref(db, path);
    remove(commentRef);
  }
  return (
    <div className="flex justify-between p-5">
      <span>
        <h1 className="text-xl font-semibold">{props.author}</h1>
        <p className="pl-3 pt-1 text-gray-500 font-thin">{props.text}</p>
      </span>
      {currUser.uid === props.authorid && (
        <img
          src="./bin.svg"
          alt=""
          className="h-[20px] cursor-pointer"
          onClick={() => {
            deleteComment(props.path);
          }}
        />
      )}
    </div>
  );
}

export default Comment;
