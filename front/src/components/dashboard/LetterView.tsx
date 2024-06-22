import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";
//@ts-expect-error For some reason js-cookie is not detected whilist its working and installed
import Cookies from "js-cookie";
import Alert from "../Alert";
import formatDateToLocalTime from "../../utils";

function LetterView() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState<[boolean, string]>([false, ""]);

  async function getLetter() {
    try {
      const response = await axios.get("http://localhost:4000/my-sent-pdfs");
      if (response.status === 200) {
        return response.data.files;
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
    getLetter().then((res) => setHistory(res));
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
    <div className="">
      <br />
      {error[0] === true ? <Alert type="error" msg={error[1]}></Alert> : null}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ردیف</th>
            <th className="py-2 px-4 border-b">فایل</th>
            <th className="py-2 px-4 border-b">فرستنده</th>
            <th className="py-2 px-4 border-b">گیرنده</th>
            <th className="py-2 px-4 border-b">تاریخ</th>
          </tr>
        </thead>
        <tbody>
          {history.map((letter, index) => (
            <tr key={index} className="text-center">
              <td className="py-2 px-4 border-b">{index + 1}</td>
              <td className="py-2 px-4 border-b break-words break-all">
                <a href={`http://localhost:4000/download-pdf/${letter.filename}`}>
                  {letter.filename}
                </a>
              </td>
              <td className="py-2 px-4 border-b">{letter.sender === null ? "" : letter.sender.username}</td>
              <td className="py-2 px-4 border-b">{letter.sendedTo === null ? "" : letter.sendedTo.username}</td>
              <td className="py-2 px-4 border-b">
                {formatDateToLocalTime(letter.uploadedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LetterView;
