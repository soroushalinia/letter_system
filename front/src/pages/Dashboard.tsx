import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { PDFDocument } from "pdf-lib";
import Navbar from "../components/Navbar";
//@ts-expect-error For some reason js-cookie is not detected whilist its working and installed
import Cookies from "js-cookie";

import { Link, useNavigate } from "react-router-dom";
import FileUpload from "../components/dashboard/FileUpload";
import Signature from "../components/dashboard/SignatureCanvas";
import { ChangeEvent, useState } from "react";
import Alert from "../components/Alert";
import axios from "axios";
import LetterView from "../components/dashboard/LetterView";
import LetterReceived from "../components/dashboard/LetterReceived";

export default function Dashboard() {
  const navigate = useNavigate();

  const refreshPage = () => {
    navigate(
      '/'
    );
  };
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<[boolean, string]>([false, ""]);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSignatureChange = (data: string) => {
    setSignature(data);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const submit: () => void = async () => {
    if (username === "") {
      setError([true, "نام کاربری صحیح نیست"]);
    } else if (selectedFile === null) {
      setError([true, "فایلی انتخاب نشده است"]);
    } else {
      const pdfArrayBuffer = (await selectedFile?.arrayBuffer()) as ArrayBuffer;
      // const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      // const pages = pdfDoc.getPages();
      // const firstPage = pages[0];
      // const { width, } = firstPage.getSize();
      // const padding = 50;
      // const imageWidth = 100;
      // const imageHeight = 50;
      // const x = width - imageWidth - padding;
      // const y = padding;
      // const pngImage = await pdfDoc.embedPng(signature);
      // firstPage.drawImage(pngImage, {
      //   x,
      //   y,
      //   width: imageWidth,
      //   height: imageHeight,
      // });
      // const pdfBytes = await pdfDoc.save();
      const dataBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('pdf', dataBlob , selectedFile.name);
      formData.append('recipientUsername', username)
      try {
        const response = await axios.post('http://localhost:4000/upload-pdf', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.status === 200) {
          refreshPage()
        } else {
          setError([true, `خطا در ثبت: ${response.status} ${response.data}`])
        }
      } catch (error) {
        setError([true, `عدم اتصال به سرور : ${error}`])
      }
      
    }
  };

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
    <>
      <div className="w-screen h-screen flex flex-row">
        <Navbar></Navbar>
        <div className="p-8 flex flex-col gap-2 w-full overflow-y-scroll">
          <h1 className="text-3xl font-bold">داشبورد</h1>
          <br />
          <h3 className="text-xl font-semibold">ارسال نامه</h3>
          {error[0] === true ? (
            <Alert type="error" msg={error[1]}></Alert>
          ) : null}
          <div>
            <div className="flex flex-col justify-center pt-4 pb-4">
              <p className="pt-2">ارسال به کاربر:</p>
              <input
                className="border border-gray-400 rounded-lg p-2 focus:outline-none focus:border-blue-400 rtl text-left"
                type="text"
                name="username"
                value={username}
                onChange={handleChange}
              />
            </div>

            <FileUpload onFileChange={handleFileChange}></FileUpload>
            <br />
            <button
              onClick={submit}
              className="bg-green-400 rounded-lg p-2 text-white"
            >
              ثبت و ارسال نامه
            </button>
          </div>
          <hr />
          <h3 className="text-xl font-semibold">نامه های دریافتی</h3>
          <div>
            <LetterReceived></LetterReceived>
          </div>
          <br />
          <br />
          {/* <hr /> */}
          <h3 className="text-xl font-semibold">نامه های ارسالی</h3>
          <div>
            <LetterView></LetterView>
          </div>
        </div>
      </div>
    </>
  );
}
