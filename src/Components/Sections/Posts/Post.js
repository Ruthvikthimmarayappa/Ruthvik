import { React, useEffect, useState } from "react";
import Card from "../../Helpers/Card";
import Container from "../../Helpers/Container";
import Button from "../../Helpers/Button";
import { getAuth } from "@firebase/auth";
import { getDatabase, onValue, ref, set, remove } from "@firebase/database";
import Comment from "./Comment";
import MakeComment from "./MakeComment";
import { toast } from "react-toastify";

function Post(props) {
  const db = getDatabase();
  const user = getAuth().currentUser;
  const currPostRef = ref(db, "server/posts/" + props.postid);
  const currPostCommentsRef = ref(
    db,
    "server/posts/" + props.postid + "/comments"
  );
  function handleLike(postid, increment) {
    if (increment) {
      set(ref(db, "server/posts/" + postid + "/likesCount"), likes + 1);
      set(ref(db, "server/posts/" + postid + "/liked/" + user.uid), 1);
    } else {
      set(ref(db, "server/posts/" + postid + "/likesCount"), likes - 1);
      set(ref(db, "server/posts/" + postid + "/liked/" + user.uid), 0);
    }
  }
  const [isLiked, setisLiked] = useState();
  const [likes, setlikes] = useState();
  const [comments, setcomments] = useState();
  const [viewcomments, setviewcomments] = useState(false);
  const [unlocked, setunlocked] = useState(false);
  const [src, setsrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [uid, setuid] = useState("");

  useEffect(() => {
    onValue(currPostRef, (snapshot) => {
      setlikes(snapshot.val().likesCount);
      setisLiked(
        snapshot.val()["liked"] === undefined ||
          snapshot.val()["liked"][user.uid] === 0 ||
          snapshot.val()["liked"][user.uid] === undefined
      );
      setuid(snapshot.val().userid);
    });
    onValue(currPostCommentsRef, (snapshot) => {
      let temp = [];
      snapshot.forEach((child) => {
        temp.push(child.val());
      });
      setcomments(temp);
    });
  }, []);

  async function unhash(data) {
    let temp = await fetch(
      "https://us-central1-amigoconnect-2023.cloudfunctions.net/amigoConnect/decryptimage",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
          body: JSON.stringify({
          link: data,
          userid: props.userid,
        }),
      }
    );
    temp = await temp.json();
    setsrc(JSON.parse(temp));
    console.log("success");
  }

  

  function deletePost() {
    remove(currPostRef);
    window.location.reload(true);
  }

  return (
    <Card className="w-[800px] mx-auto p-10 flex-col">
      <div className="w-full flex justify-between">
        <span>
          <h1 className="mr-auto font-bold text-3xl p-3">{props.user}</h1>
          <h3 className="mr-auto pl-5 font-extralight text-lg text-gray-500">
            {props.time}
          </h3>
        </span>
        {props.delete && (
          <img
            className="cursor-pointer h-[30px] my-auto"
            src="./bin.svg"
            onClick={() => {
              deletePost();
            }}
          ></img>
        )}
      </div>
      {props.image && !unlocked && (
        <Button
          onClick={async () => {
            setLoading(true);
            toast("Decrypting");
            try {
              await unhash(props.image);
              toast("Decryption Successful");
              setunlocked(true);
            } catch (e) {
              toast("Decryption unsuccesful, please ask the user to repost...");
            }
            setLoading(false);
          }}
        >
          Decrypt image
        </Button>
      )}
      {props.image && unlocked && (
        <img
          src={src}
          alt="post"
          className="h-[500px] w-[90%] object-cover mt-10"
        />
      )}
      <p className="text-gray-800 font-light px-20 mt-10">{props.children}</p>
      <hr className="w-[80%] bg-gray-400 h-[2px] mt-5" />
      <Container className="pt-5 flex-col gap-3 w-full">
        <span className="flex gap-3 w-full justify-evenly">
          <Button
            image={"/like.svg"}
            onClick={() => {
              setisLiked(!isLiked);
              handleLike(props.postid, isLiked);
            }}
            white={isLiked}
          >
            {likes}
          </Button>
          <Button
            image={"/comment.svg"}
            onClick={() => {
              setviewcomments(!viewcomments);
            }}
          >
            Comments
          </Button>
        </span>
        {viewcomments && (
          <div className="w-full flex flex-col border border-gray-500 divide-y-2 rounded-lg p-2">
            {comments.map((comment) => {
              return (
                <Comment
                  author={comment.author}
                  text={comment.text}
                  authorid={comment.authorid}
                  path={`server/posts/${props.postid}/comments/${comment.id}`}
                />
              );
            })}
            {comments.length === 0 && "No Comments"}
            <MakeComment postid={props.postid}></MakeComment>
          </div>
        )}
      </Container>
    </Card>
  );
}
export default Post;
