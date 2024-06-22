import { useRef } from "react";
//@ts-expect-error For some reason jreact-signature-canvas is not detected whilist its working and installed
import SignatureCanvas from "react-signature-canvas";

function Signature({file, name}: SignatureCanvas) {
  const sigCanvas = useRef({});
  const saveData: () => void = async () => {
    //@ts-expect-error type error
    const data = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    
  };
  const clearData: () => void = () => {
    //@ts-expect-error type error
    sigCanvas.current.clear();
  };
  return (
    <div className="p-2 flex flex-col justify-center items-center gap-4">
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{
          width: 400,
          height: 300,
          className: "sigCanvas border border-blue-300 rounded-lg border-2",
        }}
      />
      <div className="flex flex-row justify-start gap-12">
        <button className="bg-blue-400 rounded-lg p-2 text-white" onClick={saveData}>
          ثبت امضا
        </button>
        <button className="bg-blue-400 rounded-lg p-2 text-white" onClick={clearData}>بازنشانی</button>
      </div>
    </div>
  );
}

export default Signature;
