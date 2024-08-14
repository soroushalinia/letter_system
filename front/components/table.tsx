import DataTable from "react-data-table-component";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// @ts-ignore
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";

import { Switch } from "@/components/ui/switch";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import axios from "axios";
import { useRouter } from "next/navigation";
import moment from "moment-timezone";
import jalaali from "jalaali-js";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { roleTranslate } from "@/lib/utils";

export default function TableView() {
  const { toast } = useToast();
  const [letterData, setLetterData] = useState([]);
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const router = useRouter();
  const sigCanvas = useRef({});
  //   const [switch, setSwitch] = useState("R");
  const [uswitch, setUswitch] = useState("R");
  const [adminInfo, setAdminInfo] = useState(false);
  const [aswitch, setAswitch] = useState("U");
  const [recipient, setRecipient] = useState("");
  const [usersListState, setUserListState] = useState([]);
  const [orgRoleTag, setOrgRoleTag] = useState("");
  const [filter, setFilter] = useState("");

  const columns = [
    {
      name: "ردیف",
      //@ts-ignore
      selector: (row) => row.index,
      sortable: true,
      width: "75px",
    },
    {
      name: "توضیحات",
      //@ts-ignore
      selector: (row) => row.filename,
      //@ts-ignore
      cell: (row) => {
        return (
          <a href={`http://localhost:4000/download-pdf/${row.filename}`}>
            {row.filename.slice(0, 45)}
          </a>
        );
      },
      width: "300px",
    },
    {
      name: "تاریخ",
      //@ts-ignore
      selector: (row) => {
        const date = new Date(row.uploadedAt);
        return date;
      },
      sortable: true,
      //@ts-ignore
      format: (row) => {
        const dateObj = new Date(row.uploadedAt);
        const date = jalaali.toJalaali(dateObj);
        const fmtTime = moment(row.uploadedAt)
          .tz("Asia/Tehran")
          .format("HH:mm:ss");
        return `${fmtTime} - ${date.jy}/${date.jm}/${date.jd}`;
      },
      maxWidth: "300px",
    },
    {
      name: "شرح",
      selector: (row) => row.description,
    },
    {
      name: "فرستنده",
      //@ts-ignore
      selector: (row) => row.sender.username,
      maxWidth: "300px",
      cell: (row) => {
        return (
          <div className="flex flex-row gap-4 justify-center items-center">
            <p>{row.sender.username}</p>
            {row.sender.Organizational_role === undefined ? (
              <></>
            ) : (
              <Badge>{roleTranslate(row.sender.Organizational_role)}</Badge>
            )}
          </div>
        );
      },
    },
    {
      name: "گیرنده",
      //@ts-ignore
      selector: (row) => row.sendedTo.username,
      maxWidth: "300px",
      //@ts-ignore
      cell: (row) => {
        return (
          <div className="flex flex-row gap-4 justify-center items-center">
            <p>{row.sendedTo.username}</p>
            {row.sendedTo.Organizational_role === undefined ? (
              <></>
            ) : (
              <Badge>{roleTranslate(row.sendedTo.Organizational_role)}</Badge>
            )}
          </div>
        );
      },
    },
    {
      name: "امضا",
      //@ts-ignore
      selector: (row) => "امضا",
      maxWidth: "300px",
      //@ts-ignore
      cell: (row) => {
        return (
          <div className="flex flex-row justify-center items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-800">
                  امضا
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>امضا نامه</DialogTitle>
                </DialogHeader>
                <div className="gap-4 py-4 flex flex-col items-center">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                      width: 350,
                      height: 300,
                      className:
                        "sigCanvas border border-blue-300 rounded-lg border-2",
                    }}
                  />

                  <Button onClick={clearData}>بازنشانی امضا</Button>
                </div>
                <DialogFooter>
                  <Button onClick={() => handleSignSubmit(row.filename)}>
                    ثبت
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={async () => {
                try {
                  const deleteFileResult = await axios.delete(
                    `http://localhost:4000/delete-pdf/${row.filename}`
                  );
                  if (deleteFileResult.status === 401) {
                    toast({
                      title: "خطا",
                      description:
                        "نشست شما منقضی شده است. لطفا دوباره وارد شوید",
                    });
                  } else if (deleteFileResult.status === 404) {
                    toast({
                      title: "خطا",
                      description: "فایل درخواستی وجود ندارد",
                    });
                  } else if (deleteFileResult.status === 200) {
                    toast({
                      title: "موفقیت",
                      description: "فایل حذف شد",
                    });
                    router.push("/");
                    router.refresh();
                    location.reload();
                  }
                } catch (err) {
                  toast({
                    title: "خطا",
                    description:
                      "اتصال با سرور برقرار نشد. اینترنت خود را چک کنید",
                  });
                }
              }}
              className="bg-red-500 hover:bg-red-800"
            >
              حذف
            </Button>
          </div>
        );
      },
    },
  ];

  const clearData: () => void = () => {
    //@ts-expect-error type error
    sigCanvas.current.clear();
  };

  const handleSignSubmit = async (filename: string) => {
    //@ts-ignore
    const data = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");

    const fileBlob = await fetch(
      `http://localhost:4000/download-pdf/${filename}`
    );
    const arrayBuffer = (await fileBlob.arrayBuffer()) as ArrayBuffer;
    // const pdfArrayBuffer = (await fetch(`http://localhost:4000/download-pdf/${file}`).) as ArrayBuffer;
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width } = firstPage.getSize();
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
    const dataBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("pdf", dataBlob, filename);
    try {
      console.log("http://localhost:4000/update-pdf/" + filename);
      const response = await axios.put(
        "http://localhost:4000/update-pdf/" + filename,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        toast({
          title: "تایید",
          description: "نامه با موفقیت ثبت شد",
        });
      } else {
        toast({
          title: "خطا",
          description: "اتصال با سرور برقرار نشد. اینترنت خود را چک کنید",
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "اتصال با سرور برقرار نشد. اینترنت خود را چک کنید",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      let url = "";
      try {
        const usersList = await axios.get("http://localhost:4000/users");
        // console.log(usersList)
        setUserListState(usersList.data.users);
        if (uswitch === "R") {
          const res = await axios.get("http://localhost:4000/received-pdfs");
          //   console.log("R USEEFFECT");
          //@ts-ignore
          const indexedRes = res.data.files.map((item, index) => {
            return { ...item, index: index + 1 };
          });
          setLetterData(indexedRes);
          console.log(indexedRes);
        }
        if (uswitch === "S") {
          const res = await axios.get("http://localhost:4000/my-sent-pdfs");
          //   console.log("S USEEFFECT");
          //@ts-ignore
          const indexedRes = res.data.files.map((item, index) => {
            return { ...item, index: index + 1 };
          });
          setLetterData(indexedRes);
          console.log(indexedRes);
        }
      } catch (err) {
        toast({
          title: "خطا",
          description: "اتصال با سرور برقرار نشد. اینترنت خود را چک کنید",
        });
      }
      try {
        const resFiles = await axios.get("http://localhost:4000/files");
        //@ts-ignore
        const indexedFiles = resFiles.data.files.map((item, index) => {
          return { ...item, index: index + 1 };
        });
        setFiles(indexedFiles);
        const resUsers = await axios.get("http://localhost:4000/users");
        //@ts-ignore
        const indexedUsers = resUsers.data.users.map((item, index) => {
          return { ...item, index: index + 1 };
        });
        setUsers(indexedUsers);
      } catch (err) {
        console.log(err);
        toast({
          title: "خطا",
          description: "اتصال با سرور برقرار نشد. اینترنت خود را چک کنید",
        });
      }
    };
    fetchData();
  }, [toast, uswitch]);

  const handleUploadSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    // console.log("here");
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const recipientUsername = formData.get("recipientUsername") as string;
    const pdf = formData.get("pdf") as string;
    const description = formData.get("description") as string;
    try {
      const response = await axios.post(
        "http://localhost:4000/upload-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        toast({
          title: "تایید",
          description: "نامه با موفقیت ثبت شد",
        });

        router.push("/");
        router.refresh();
        location.reload();
      } else {
        toast({
          title: "خطا",
          description: "اتصال با سرور برقرار نشد. اینترنت خود را چک کنید",
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "اتصال با سرور برقرار نشد. اینترنت خود را چک کنید",
      });
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="">
        <div className="border-b p-8">
          <h1 className="text-2xl">پنل مدیریت</h1>
        </div>
        <div className="p-4 flex flex-row gap-2 items-center">
          <Toaster />

          {adminInfo === false ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-800">
                    ثبت درخواست
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>ثبت درخواست</DialogTitle>
                  </DialogHeader>
                  <form
                    className="grid gap-4 py-4"
                    onSubmit={handleUploadSubmit}
                  >
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="recipient" className="text-right">
                        گیرنده
                      </Label>
                      <Input
                        value={recipient}
                        onChange={(event) => {
                          setRecipient(event.target.value);
                          const namelist = usersListState.map(
                            (user) => user.username
                          );
                          const idx = namelist.indexOf(event.target.value);
                          if (idx != -1) {
                            setOrgRoleTag(
                              usersListState[idx].Organizational_role
                            );
                          } else {
                            setOrgRoleTag("");
                          }
                        }}
                        name="recipientUsername"
                        id="recipientUsername"
                        className="col-span-3"
                      />
                      {orgRoleTag === "" ? (
                        <></>
                      ) : (
                        <>
                          <p>نقش گیرنده:</p>
                          <Badge className="text-center flex flex-row justify-center">
                            {roleTranslate(orgRoleTag)}
                          </Badge>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description">شرح نامه</Label>
                      <Input
                        name="description"
                        id="description"
                        placeholder="شرح نامه"
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="file" className="text-right">
                        فایل نامه
                      </Label>
                      <Input
                        accept="application/pdf"
                        name="pdf"
                        id="pdf"
                        type="file"
                        className="col-span-3"
                      />
                    </div>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600"
                      type="submit"
                    >
                      ارسال
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              {uswitch === "R" ? (
                <Button onClick={() => setUswitch("S")}>
                  مشاهده نامه های ارسالی
                </Button>
              ) : (
                <></>
              )}
              {uswitch === "S" ? (
                <Button onClick={() => setUswitch("R")}>
                  مشاهده نامه های دریافتی
                </Button>
              ) : (
                <></>
              )}
              <Input
                className=""
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                type="text"
                name=""
                id=""
                placeholder="جستجوی نامه"
              />
            </>
          ) : (
            <></>
          )}
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 "
            onClick={() => setAdminInfo(!adminInfo)}
          >
            {adminInfo === true
              ? "مشاهده نامه ها"
              : " مشاهده کاربران / فایل ها"}
          </Button>
        </div>
      </div>

      {adminInfo === false ? (
        <DataTable
          theme="default"
          columns={columns}
          data={letterData.filter((row) => row.description.includes(filter))}
        />
      ) : (
        <div className="">
          <Button
            className="mx-6 my-4"
            onClick={() => {
              if (aswitch === "U") {
                setAswitch("F");
              } else if (aswitch === "F") {
                setAswitch("U");
              }
            }}
          >
            نمایش {aswitch === "U" ? "کاربران" : "فایل ها"}
          </Button>
          {aswitch === "U" ? (
            <Table className="rlt">
              <TableCaption>لیست کاربران</TableCaption>
              <TableHeader className="rlt text-right">
                <TableRow>
                  <TableHead className="w-[100px] text-right">ردیف</TableHead>
                  <TableHead className="text-right">ایدی</TableHead>
                  <TableHead className="text-right">نام کاربری</TableHead>
                  <TableHead className="text-right">نقش</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-right">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-right">
                        USR{user.id}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.username}{" "}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role === "superadmin" ? (
                          <Badge>ادمین ویژه</Badge>
                        ) : (
                          <></>
                        )}
                        {user.role === "admin" ? <Badge>ادمین</Badge> : <></>}
                        {user.role === "client" ? (
                          <Badge>کاربر عادی</Badge>
                        ) : (
                          <></>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <></>
          )}
          {aswitch === "F" ? (
            <Table>
              <TableCaption>لیست فایل ها</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-right">ردیف</TableHead>
                  <TableHead className="text-right">اسم</TableHead>
                  <TableHead className="text-right">حجم</TableHead>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">فرستنده</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-right">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={`http://localhost:4000/download-pdf/${file.filename}`}
                        >
                          ... {file.filename.slice(0, 75)}
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        MB {parseFloat((file.size / 1024 / 1024).toFixed(4))}
                      </TableCell>
                      <TableCell className="text-right">
                        {moment(file.uploadedAt)
                          .tz("Asia/Tehran")
                          .format("HH:mm:ss YYYY/MM/DD")}
                      </TableCell>
                      <TableCell className="text-right">
                        {file.sender === null ? "null" : file.sender.username}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
}
