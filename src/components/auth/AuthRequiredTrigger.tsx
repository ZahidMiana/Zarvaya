"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function AuthRequiredTrigger() {
  const searchParams = useSearchParams();
  const openModal = useAuthStore((state) => state.openModal);

  useEffect(() => {
    if (searchParams.get("auth") === "required") {
      openModal("login");
    }
  }, [openModal, searchParams]);

  return null;
}
