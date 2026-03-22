"use client";

import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/store/authStore";

export default function AuthModalProvider() {
  const isOpen = useAuthStore((state) => state.isModalOpen);
  if (!isOpen) {
    return null;
  }

  return <AuthModal />;
}
