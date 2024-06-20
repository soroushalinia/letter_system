import React, { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";

axios.defaults.withCredentials = true;

const Auth: React.FC = () => {
  const [action, setAction] = useState<"login" | "register">("login");

  const changeAction: () => void = () => {
    if (action === "login") {
      setAction("register");
    } else if (action === "register") {
      setAction("login");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-row">
      <Navbar></Navbar>
      <div className="p-4 flex flex-col justify-center items-center w-full">
        {action === "login" ? <Login /> : <Register />}
        <br />
        <p onClick={changeAction}>
          {action === "login"
            ? "نام کاربری ندارید؟ ثبت نام کنید"
            : "ثبلا ثبت نام کرده اید؟ وارد شوید"}
        </p>
      </div>
    </div>
  );
};

export default Auth;
