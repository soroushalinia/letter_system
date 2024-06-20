import axios from "axios";
import Alert from "../Alert";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
//@ts-expect-error For some reason js-cookie is not detected whilist its working and installed
import Cookies from "js-cookie";

export default function Login() {
  const navigate = useNavigate();

  const refreshPage = () => {
    navigate(
      '/'
    );
  };

  const [alert, setAlert] = useState<[boolean, "error" | "info", string]>([
    false,
    "info",
    "",
  ]);

  axios.defaults.withCredentials = true;
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const response = await axios.post(
        "http://localhost:4000/login",
        {
          username,
          password,
        },
        { withCredentials: true }
      );
      if (response.status === 400) {
        setAlert([true, "error", "نام کاربری و رمز را وارد کنید"]);
      } else if (response.status === 200) {
        Cookies.set("user", username, { expires: 30 / 1440 });
        Cookies.set("role", response.data.user, { expires: 10 / 1440 });
        refreshPage()
      }
    } catch (e) {
      setAlert([true, "error", "عدم اتصال به سرور"]);
    }
  };

  return (
    <>
      <div className="w-full p-12">
        {alert[0] === true ? <Alert type={alert[1]} msg={alert[2]} /> : <></>}
      </div>
      <p className="text-4xl font-bold">ورود</p>
      <br />
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col justify-center">
          <p>نام کاربری</p>
          <input
            className="border border-gray-400 rounded-lg p-2 focus:outline-none focus:border-blue-400 rtl text-left"
            type="text"
            name="username"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p>کلمه عبور</p>
          <input
            className="border border-gray-400 rounded-lg p-2 focus:outline-none focus:border-blue-400 rtl text-left"
            type="password"
            name="password"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-400 rounded-lg p-3 text-white "
        >
          ثبت نام
        </button>
      </form>
    </>
  );
}
