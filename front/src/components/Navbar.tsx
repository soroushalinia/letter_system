import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavItem } from "../types";
//@ts-expect-error For some reason js-cookie is not detected whilist its working and installed
import Cookies from "js-cookie";

const navItems: NavItem[] = [
  { name: "خانه", path: "/" },
  { name: "داشبورد", path: "/dashboard" },
  { name: "ادمین", path: "/admin" },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const refreshPage = () => {
    navigate(
      '/'
    );
  };
  const [user, setUser] = useState<[string, string] | null>(null);
  useEffect(() => {
    const user = Cookies.get("user");
    if (user !== undefined) {
      const role = Cookies.get("role");
      setUser([user, role]);
    }
  }, []);
  return (
    <nav className="bg-gray-100 border-l-2 border-l-gray-200 w-1/6 h-screen p-4 flex flex-col gap-6 pt-8">
      <div className="flex flex-col w-full gap-4 justify-center items-center">
        <img
          className="rounded-full w-20 h-20"
          src="/public/profile.png"
          alt="avatar"
        />
        <div>
          {user === null ? (
            <Link to={"/auth"}>ورود / ثبت نام</Link>
          ) : (
            <Link to={`/profile/${user[0]}`}>
              کاربر {user[0]}
            </Link>
          )}
        </div>
      </div>
      <ul>
        {navItems.map((item, index) => (
          <li className="p-2 font-bold" key={index}>
            <Link to={item.path}>{item.name}</Link>
          </li>
        ))}

        {user !== null ? (
          <li className="p-2 font-bold">
            <a
              onClick={() => {
                Cookies.remove("user");
                Cookies.remove("role");
                setUser(null);
                refreshPage()
              }}
              href="#"
            >
              خروج
            </a>
          </li>
        ) : (
          <></>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
