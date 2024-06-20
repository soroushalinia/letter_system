export interface AlertProps {
  type: "error" | "info";
  msg: string;
}

export interface NavItem {
  name: string;
  path: string;
}

export interface FileUploadProps {
  onFileChange: (file: File | null) => void;
}

export interface SignatureProps {
  onSignatureChange: (data: string) => void;
}
