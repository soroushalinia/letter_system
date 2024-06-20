import { ChangeEvent, useRef, useState } from "react";
import { FileUploadProps } from "../../types";

function FileUpload({ onFileChange }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const updateFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFile(file);
      onFileChange(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      setFile(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleFileDrop}
      onClick={handleFileUploadClick}
      className="cursor-pointer bg-gray-50 border-gray-300 rounded-lg border-2 border-dashed p-12 flex flex-row justify-center items-center"
    >
      <div className="text-center">
        {file ? <p>{file.name}</p> : <span>فایل را انتخاب کنید</span>}
        <input
          className="hidden"
          ref={fileInputRef}
          type="file"
          accept={"application/pdf"}
          style={{ display: "none" }}
          onChange={updateFile}
        />
      </div>
    </div>
  );
}

export default FileUpload;
