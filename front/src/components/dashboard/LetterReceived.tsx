import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
//@ts-expect-error For some reason js-cookie is not detected whilist its working and installed
import Cookies from "js-cookie";
import Alert from "../Alert";
import formatDateToLocalTime from "../../utils";
//@ts-expect-error For some reason jreact-signature-canvas is not detected whilist its working and installed
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";


function LetterReceived() {
    const navigate = useNavigate();

  const refreshPage = () => {
    navigate(
      '/'
    );
  };
  const [history, setHistory] = useState([]);
  const [error, setError] = useState<[boolean, string]>([false, ""]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [file, setFile] = useState<string>("");
  const sigCanvas = useRef({});
  const saveData: () => void = async () => {
    //@ts-expect-error type error
    const data = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    const fileBlob = await fetch(`http://localhost:4000/download-pdf/${file}`);
    const arrayBuffer = (await fileBlob.arrayBuffer()) as ArrayBuffer;
    // const pdfArrayBuffer = (await fetch(`http://localhost:4000/download-pdf/${file}`).) as ArrayBuffer;
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, } = firstPage.getSize();
      const padding = 50;
      const imageWidth = 100;
      const imageHeight = 50;
      const x = width - imageWidth - padding;
      const y = padding;
      const pngImage = await pdfDoc.embedPng(data);
      firstPage.drawImage(pngImage, {
        x,
        y,
        width: imageWidth,
        height: imageHeight,
      });
      const pdfBytes = await pdfDoc.save();
      const dataBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('pdf', dataBlob , file);
      try {
        const response = await axios.put('http://localhost:4000/update-pdf/' + file, formData, {
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
    //   formData.append('recipientUsername', username)
  };
  const clearData: () => void = () => {
    //@ts-expect-error type error
    sigCanvas.current.clear();
  };

  const triggerDialog = () => {
    setShowDialog(!showDialog);
  };

  async function getLetter() {
    try {
      const response = await axios.get("http://localhost:4000/received-pdfs");
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
      {showDialog === true ? (
        <div className="absolute top-0 left-0 z-50 w-screen h-screen bg-white bg-opacity-80 flex flex-col justify-center p-8 gap-4">
          <button
            onClick={triggerDialog}
            className="bg-black text-white rounded-lg w-16 p-2 flex flex-row justify-center items-center text-center"
          >
            بستن
          </button>
          <br />
          <h1 className="text-3xl font-bold w-full text-center">ثبت امضا</h1>
          {/* <p>file: {file}</p> */}
          <div className="h-full">
            <div className="p-2 flex flex-col justify-center items-center gap-4">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: 400,
                  height: 300,
                  className:
                    "sigCanvas border border-blue-300 rounded-lg border-2",
                }}
              />
              <div className="flex flex-row justify-start gap-12">
                <button
                  className="bg-blue-400 rounded-lg p-2 text-white"
                  onClick={saveData}
                >
                  ثبت امضا
                </button>
                <button
                  className="bg-blue-400 rounded-lg p-2 text-white"
                  onClick={clearData}
                >
                  بازنشانی
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <br />
      {error[0] === true ? <Alert type="error" msg={error[1]}></Alert> : null}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ردیف</th>
            <th className="py-2 px-4 border-b">فایل</th>
            <th className="py-2 px-4 border-b">فرستنده</th>
            <th className="py-2 px-4 border-b">تاریخ</th>
            <th className="py-2 px-4 border-b">امضا</th>
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
              <td className="py-2 px-4 border-b">
                {letter.sender === null ? "" : letter.sender.username}
              </td>
              <td className="py-2 px-4 border-b">
                {formatDateToLocalTime(letter.uploadedAt)}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => {
                    triggerDialog();
                    setFile(letter.filename);
                  }}
                  className="bg-blue-400 rounded-lg p-2 text-white"
                >
                  امضا
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LetterReceived;
