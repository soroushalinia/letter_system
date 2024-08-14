"use client";

import axios from "axios";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import React from "react";
//@ts-ignore
import Cookies from "js-cookie";
import TableView from "@/components/table";

import logo from "@/images/logo.png";

axios.defaults.withCredentials = true;

export default function Home() {
  const { toast } = useToast();
  const router = useRouter();
  const [login, setLogin] = useState(true);
  const [auth, setAuth] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = Cookies.get("user");
    if (user === undefined) {
      setAuth(true);
    } else {
      setAuth(false);
      setUser(user);
    }
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const Organizational_role = formData.get("Organizational_role") as string;

    if (login) {
      if (username === "" || password === "") {
        toast({
          title: "خطا",
          description: "اطلاعات وارد شده صحیح نمی باشد",
        });
      } else {
        try {
          const response = await axios.post(
            "http://localhost:4000/login",
            {
              username,
              password,
            },
            { withCredentials: true }
          );
          if (response.status === 400) {
            toast({
              title: "خطا",
              description: "اطلاعات وارد شده صحیح نمی باشد",
            });
          } else if (response.status === 200) {
            Cookies.set("user", username, { expires: 30 / 1440 });
            Cookies.set("role", response.data.user, { expires: 10 / 1440 });
            toast({
              title: "تایید",
              description: "ورود با موفقیت انجام شد",
            });
            setAuth(false);
            //@ts-ignore
            setUser(username);
          }
        } catch (e) {
          toast({
            title: "خطا",
            description: "اتصال با سرور برقرار نشد. اینترنت خود را چک کنید",
          });
        }
      }
    } else {
      if (username === "" || password === "" || role === "") {
        toast({
          title: "خطا",
          description: "اطلاعات وارد شده صحیح نمی باشد",
        });
      } else {
        try {
          const response = await axios.post(
            "http://localhost:4000/register",
            {
              username,
              password,
              role,
              Organizational_role
            },
            { withCredentials: true }
          );
          if (response.status === 400) {
            toast({
              title: "خطا",
              description: "اطلاعات وارد شده صحیح نمی باشد",
            });
          } else if (response.status === 200) {
            toast({
              title: "تایید",
              description: "کاربر با موفقیت ایجاد شد",
            });
          }
        } catch (e) {
          toast({
            title: "خطا",
            description: "اتصال با سرور برقرار نشد. اینترنت خود را چک کنید",
          });
        }
      }
    }
  };
  if (auth === false) {
    return (
      <main className="rtl h-screen w-screen flex flex-col items-center">
        <div className="flex flex-row bg-blue-500 text-white gap-8 px-8 w-full justify-between">
          <div className="flex flex-row items-center justify-center gap-4">
            <Image src={logo} width={100} height={100} alt="Logo" />
            <p>سامانه ثبت نام های اداره آب (محرمانه)</p>
          </div>
          <div className="flex flex-row items-center justify-center gap-1">
            <p>کاربر {user}</p>
            <p>|</p>
            <p
              onClick={() => {
                Cookies.remove("user");
                setAuth(true);
                setUser(null);
              }}
            >
              خروج
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-100 p-12 h-full">
          <div className="rounded-lg bg-white flex flex-row items-center justify-center h-full">
            <TableView />
          </div>
        </div>
        <Toaster />
      </main>
    );
  }
  return (
    <main className="rtl h-screen w-screen flex bg-blue-500 text-white flex-col items-center">
      <div className="flex flex-row gap-8 px-8 w-full ">
        <div className="flex flex-row items-center justify-center gap-4">
          <Image src={logo} width={100} height={100} alt="Logo" />
          <p>سامانه ثبت نام های اداره آب (محرمانه)</p>
        </div>
      </div>
      <div className="w-full p-12 bg-gray-100 h-full">
        <div className="rounded-lg bg-white text-black flex flex-row items-center justify-center h-full">
          <form
            className="flex flex-col w-[650px] justify-center items-center gap-6 p-8"
            onSubmit={handleSubmit}
          >
            <h1 className="text-2xl font-bold">ورود / ثبت نام</h1>
            <div className="flex flex-col w-full gap-1">
              <label htmlFor="username">نام کاربری</label>
              <Input name="username" id="username" placeholder="نام کاربری" />
              <label htmlFor="password">کلمه عبور</label>
              <Input
                name="password"
                id="password"
                placeholder="کلمه عبور"
                type="password"
              />
            </div>
            {login ? (
              <></>
            ) : (
              <>
                <Select name="role">
                  <SelectTrigger className="">
                    <SelectValue id="role" placeholder="نقش" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">کاربر عادی</SelectItem>
                    <SelectItem value="admin">ادمین</SelectItem>
                    <SelectItem value="superadmin">سوپر ادمین</SelectItem>
                  </SelectContent>
                </Select>
                <Select name="Organizational_role">
                  <SelectTrigger className="">
                    <SelectValue id="Organizational_role" placeholder="نقش سازمانی" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modir_kol">مدیر کل</SelectItem>
                    <SelectItem value="modir_arshad">مدیر ارشد</SelectItem>
                    <SelectItem value="modir">مدیر</SelectItem>
                    <SelectItem value="karmand">کارمند</SelectItem>
                    <SelectItem value="bazras">بازرس</SelectItem>
                    <SelectItem value="nameh_resan">نامه رسان</SelectItem>
                    <SelectItem value="herasat">حراست</SelectItem>
                    <SelectItem value="negahban">نگهبان</SelectItem>
                    <SelectItem value="no_role">بدون نقش</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {login ? (
              <a
                onClick={() => {
                  setLogin(!login);
                }}
              >
                هنوز ثبت نام نکرده اید؟
              </a>
            ) : (
              <a
                onClick={() => {
                  setLogin(!login);
                }}
              >
                قبلا ثبت نام کرده اید؟ وارد شوید
              </a>
            )}

            <Button type="submit" variant="outline">
              {login ? "ورود" : "ثبت نام"}
            </Button>
            <Toaster />
          </form>
        </div>
      </div>
    </main>
  );
}
