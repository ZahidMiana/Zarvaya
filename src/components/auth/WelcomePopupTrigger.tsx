"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";

export default function WelcomePopupTrigger() {
  const { data: session } = useSession();
  const openModal = useAuthStore((state) => state.openModal);

  useEffect(() => {
    if (session?.user?.id) {
      return;
    }

    const alreadyShown = localStorage.getItem("zarvaya_auth_prompted");
    if (alreadyShown) {
      return;
    }

    const timer = window.setTimeout(() => {
      openModal("welcome");
      localStorage.setItem("zarvaya_auth_prompted", "true");
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [openModal, session?.user?.id]);

  return null;
}
