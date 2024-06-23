import { React, useState, useEffect } from "react";
import Container from "../../Helpers/Container";
import Post from "./Post";
import MakePost from "./MakePost";
import Button from "../../Helpers/Button";
import { getAuth } from "@firebase/auth";
import { getDatabase, ref as dbRef, onValue } from "@firebase/database";
import Card from "../../Helpers/Card";

function Posts(props) {
  const db = getDatabase();
  const curruserid = getAuth().currentUser.uid;
  const users = dbRef(db, "users/");
  const userRef = dbRef(db, "users/" + curruserid);
  const postsRef = dbRef(db, "server/posts/");
  const [name, setname] = useState("");
  const [posts, setposts] = useState([]);
  const [names, setnames] = useState([]);
  useEffect(() => {
    onValue(users, (snapshot) => {
      let temp = [];
      Object.entries(snapshot.val()).forEach((entry) => {
        temp.push(entry[1].name);
      });
      setnames(temp);
    });
  }, []);
  useEffect(() => {
    onValue(userRef, (snapshot) => {
      setname(snapshot.val().name);
    });
  }, []);
  useEffect(() => {
    onValue(postsRef, (snapshot) => {
      let temp = [];
      snapshot.forEach((child) => {
        temp.push(child.val());
      });
      setposts(temp);
    });
  }, []);
  posts.forEach((post) => {
    const postid = post.postid;
    const uid = post.uid;
  });
  return (
    <Container className="gap-10 m-10 w-full justify-center flex-col">
      <div className="flex w-[80%] justify-between mx-auto">
        <h1 className="text-4xl font-bold">AmigoConnect</h1>
        <Button
          onClick={() => {
            props.signoutfunc();
          }}
          className="w-[200px] mx-10 ml-auto"
        >
          Log Out
        </Button>
      </div>
      <div className="flex w-[90%] justify-evenly">
        <Container className="p-10 flex-col gap-5 shadow-cool h-fit">
          <h1 className="text-xl font-semibold mb-5">Users</h1>
          {names.map((name) => {
            return <p className="text-lg ">{name}</p>;
          })}
        </Container>
        <div className="flex flex-col gap-10">
          <MakePost user={name} uid={curruserid} />
          {posts.map((element, id) => {
            return (
              <Post
                user={element.user}
                userid={element.userId}
                time={element.date}
                image={element.link}
                postid={element.postid}
                key={id}
                delete={curruserid === element.userId}
              >
                {element.text}
              </Post>
            );
          })}
        </div>
      </div>
      {/* <Post user = "Sample User" time = "15 Feb 2023" image={"/samplePost.jpg"}> This is a sample post made for testing. </Post> */}
    </Container>
  );
}

export default Posts;
