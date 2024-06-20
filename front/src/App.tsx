import "./App.css";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="w-screen h-screen flex flex-row">
      <Navbar></Navbar>
      <div className="flex flex-col p-8 gap-4">
        <div className="flex flex-row gap-2 items-center">
          <img
            className="w-24 h-24"
            src="http://localhost:5173/public/logo.jpeg"
            alt=""
          />
          <h1 className="text-3xl font-bold">
            سامانه ثبت نام های اداره آب (محرمانه)
          </h1>
        </div>
        <p className="p-6">سامانه ثبت نام های یکپارچه درون سازمانی</p>
      </div>
    </div>
  );
}

export default App;
