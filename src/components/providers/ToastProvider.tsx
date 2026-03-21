"use client";

import { useEffect, useState } from "react";
import { Toaster, type ToasterProps } from "react-hot-toast";

export default function ToastProvider() {
  const [position, setPosition] = useState<ToasterProps["position"]>("top-right");

  useEffect(() => {
    const onResize = () => {
      setPosition(window.innerWidth < 768 ? "top-center" : "top-right");
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 3000,
        style: {
          border: "1px solid rgba(201, 168, 76, 0.28)",
          background: "#fffdf8",
          color: "#1a1a1a",
          fontSize: "13px",
          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(26, 26, 26, 0.12)",
        },
        success: {
          iconTheme: {
            primary: "#8B6914",
            secondary: "#fffdf8",
          },
        },
        error: {
          iconTheme: {
            primary: "#DC2626",
            secondary: "#fffdf8",
          },
        },
      }}
    />
  );
}
