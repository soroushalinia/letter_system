import axios from "axios";
import Alert from "../Alert";
import { useState } from "react";

export default function Register() {
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
    const usertype = formData.get("userType") as string;

    try {
      const response = await axios.post(
        "http://localhost:4000/register",
        {
          username,
          password,
          role: usertype,
        },
        { withCredentials: true }
      );
      if (response.status === 400) {
        setAlert([true, "error", "نام کاربری و رمز را وارد کنید"]);
      } else if (response.status === 200) {
        setAlert([true, "info", "کاربر با موفقیت ایجاد شد"]);
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
      <p className="text-4xl font-bold">ثبت نام</p>
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

        <select
          id="choice"
          className="bg-white p-2 foucs:outline-none active:outline-none focus:border-0 active:border-0"
          name="userType"
        >
          <option value="client">کاربر عادی</option>
          <option value="admin">ادمین</option>
          <option value="superadmin">سوپر ادمین</option>
        </select>
        <button className="bg-blue-400 rounded-lg p-3 text-white ">
          ثبت نام
        </button>
      </form>
    </>
  );
}
