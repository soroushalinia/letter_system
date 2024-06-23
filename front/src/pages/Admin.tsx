//@ts-expect-error For some reason js-cookie is not detected whilist its working and installed
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import Alert from "../components/Alert";
import formatDateToLocalTime from "../utils";

function roundToDecimal(number: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(number * factor) / factor;
}

function Admin() {
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState<[boolean, string]>([false, ""]);
  const [filter, setFilter] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  async function getUsers() {
    try {
      const response = await axios.get("http://localhost:4000/users");
      if (response.status === 200) {
        return response.data.users;
      } else {
        setError([true, `خطا در دریافت: ${response.status} ${response.data}`]);
        return null;
      }
    } catch (error) {
      setError([true, "عدم اتصال به سرور"]);
      return null;
    }
  }

  async function getFiles() {
    try {
      const response = await axios.get("http://localhost:4000/files");
      if (response.status === 200) {
        if (filter === "") {
          return response.data.files;
        } else {
          const filteredResponse = response.data.files.filter((file) => file.filename === filter)
          return filteredResponse;
        }
        
      } else {
        setError([true, `خطا در دریافت: ${response.status} ${response.data}`]);
        return null;
      }
    } catch (error) {
      setError([true, "عدم اتصال به سرور"]);
      return null;
    }
  }

  useEffect(() => {
    getFiles().then((res) => setHistory(res));
    getUsers().then((res) => setUsers(res));
  }, []);

  const user = Cookies.get("user");
  if (user === undefined) {
    return (
      <div className="w-screen h-screen flex flex-row">
        <Navbar></Navbar>
        <div className="p-4 flex flex-col justify-center items-center gap-4 w-full">
          <h1 className="text-3xl font-bold">خطا!</h1>
          <p>برای استفاده از این بخش باید وارد شوید</p>
          <p>
            <Link to={"/auth"}>ورود / ثبت نام</Link>
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-screen h-screen flex flex-row">
      <Navbar></Navbar>
      <div className="flex flex-col gap-2 p-8">
        <h1 className="text-3xl font-bold">ادمین</h1>
        <br />
        {error[0] === true ? <Alert type="error" msg={error[1]}></Alert> : null}
        <br />
        <h3 className="text-xl font-semibold">لیست نامه ها</h3>
        <br />
        <div className="w-full flex flex-row">
          <input className="border border-gray-300 rounded-2xl p-2 focus:outline-none w-full" value={filter} onChange={handleChange} placeholder="جستجوی نامه" type="text" />
        </div>
        <br />
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ردیف</th>
              <th className="py-2 px-4 border-b">فایل</th>
              <th className="py-2 px-4 border-b">حجم (MB)</th>
              <th className="py-2 px-4 border-b">فرستنده</th>
              <th className="py-2 px-4 border-b">تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {history.map((file, index) => (
              <tr key={index} className="text-center">
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b break-words break-all">
                  <a href={`http://localhost:4000${file.filePath}`}>
                    {file.filename}
                  </a>
                </td>
                <td className="py-2 px-4 border-b">
                  {roundToDecimal(file.size / 1024 / 1024, 4)} MB
                </td>
                <td className="py-2 px-4 border-b">
                  {file.sender === null ? "nouser" : file.sender.username}
                </td>
                <td className="py-2 px-4 border-b">
                  {formatDateToLocalTime(file.uploadedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <h3 className="text-xl font-semibold">لیست کاربران</h3>
        {error[0] === true ? <Alert type="error" msg={error[1]}></Alert> : null}
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ردیف</th>
              <th className="py-2 px-4 border-b">نام کاربری</th>
              <th className="py-2 px-4 border-b">نقش</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="text-center">
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
