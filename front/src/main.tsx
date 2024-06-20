import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";


import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.tsx";
import Profile from "./pages/Profile.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Admin from "./pages/Admin.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "auth/",
    element: <Auth />,
  },
  {
    path: "profile/:username",
    element: <Profile />,
  },
  {
    path: "dashboard",
    element: <Dashboard />,
  },
  {
    path: "admin",
    element: <Admin />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
