import React from "react";
import { useState } from "react";
import Container from "../../Helpers/Container";
import Card from "../../Helpers/Card";
import Floater from "./Floater";
import Button from "../../Helpers/Button";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Authentication(props) {
  const initialCreds = {
    email: "",
    password: "",
    name: "",
  };
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [signedup, setsignedup] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [Credentials, setCredentials] = useState(initialCreds);
  function resetPass(email) {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast('Sent Email');
      })
      .catch((e) => {});
  }
  return (
    <Container className={"rounded-lg w-[1000px] shadow-cool m-auto"}>
      <Card className={"flex-grow p-20 divide-x-2 transition-all"}>
        {/* Signup */}
        <div
          className={`flex flex-col justify-center items-center p-10 flex-grow transition-all ${
            signedup && "hidden"
          }`}>
          <h1 className="text-4xl pb-10 font-extrabold">
            Sign up for the Website
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              props
                .signupfunc(
                  Credentials.name,
                  Credentials.email,
                  Credentials.password
                )
                .finally(() => {
                  setLoading(false);
                });
            }}
            className="flex flex-col justify-center">
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              id=""
              className="my-4 appearance-none rounded-md px-5 py-3"
              onChange={(e) => {
                setCredentials({
                  ...Credentials,
                  [e.target.name]: e.target.value,
                });
              }}
            />
            <input
              type="text"
              name="email"
              placeholder="Enter Email"
              id=""
              className="my-4 appearance-none rounded-md px-5 py-3"
              onChange={(e) => {
                setCredentials({
                  ...Credentials,
                  [e.target.name]: e.target.value,
                });
              }}
            />
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              id=""
              className="my-4 appearance-none rounded-md px-5 py-3"
              onChange={(e) => {
                setCredentials({
                  ...Credentials,
                  [e.target.name]: e.target.value,
                });
              }}
            />
            <Button
              loading={loading}
              className="mt-5 shadow-cool"
              type="submit">
              Sign Up
            </Button>
          </form>
        </div>
        <Floater
          heading={`${signedup ? "Sign In" : "Sign Up"}`}
          subheading={`${
            signedup
              ? "Enter your details to enter the platform."
              : "Enter your personal details to start your journey with us."
          }`}
          buttonText={`${signedup ? "Sign Up" : "Sign In"}`}
          buttonClick={() => {
            setsignedup(!signedup);
          }}
        />
        {/* Login */}
        <div
          className={`flex flex-col justify-center items-center p-10 flex-grow transition-all ${
            !signedup && "hidden"
          }`}>
          <h1 className="text-4xl pb-10 font-extrabold text-center">
            {showModal ? "Enter email to reset password" : "Sign in to Website"}
          </h1>
          <p className="font-thin pb-2 text-gray-400 text-sm">
            use email account
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              props
                .signinfunc(Credentials.email, Credentials.password)
                .finally(() => {
                  setLoading(false);
                });
            }}
            className="flex flex-col justify-center w-full">
            <input
              type="text"
              name="email"
              placeholder="Enter Email"
              id=""
              className="my-4 appearance-none rounded-md px-5 py-3 w-[80%] mx-auto"
              onChange={(e) => {
                setCredentials({
                  ...Credentials,
                  [e.target.name]: e.target.value,
                });
              }}
            />
            {!showModal && (
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                id=""
                className="my-4 appearance-none rounded-md px-5 py-3 w-[80%] mx-auto"
                onChange={(e) => {
                  setCredentials({
                    ...Credentials,
                    [e.target.name]: e.target.value,
                  });
                }}
              />
            )}
            <div
              className="underline mx-auto cursor-pointer"
              onClick={() => {
                setShowModal(!showModal);
                resetPass(Credentials.email);
              }}>
              {showModal ? "Send Reset Mail" : "Forgot Password"}
            </div>
            {!showModal && (
              <Button
                loading={loading}
                className="mt-5 shadow-cool"
                type="submit">
                Sign In
              </Button>
            )}
          </form>
        </div>
      </Card>
    </Container>
  );
}

export default Authentication;
