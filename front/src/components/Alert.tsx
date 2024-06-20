import { AlertProps } from "../types";

export default function Alert(props: AlertProps) {
  return (
    <div className={`flex flex-row justify-center ${props.type === "info" ? "bg-green-100 border border-green-400" : "bg-red-100 border border-red-400"} p-6 rounded-lg `}>
      <p className={`${props.type === "info" ? "text-green-400" : "text-red-400"}`}>{props.msg}</p>
    </div>
  );
}
