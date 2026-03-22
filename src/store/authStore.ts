"use client";

import { create } from "zustand";

export type AuthModalView =
  | "welcome"
  | "login"
  | "register"
  | "otp"
  | "forgot-password"
  | "reset-success";

type AuthStore = {
  isModalOpen: boolean;
  modalView: AuthModalView;
  pendingPhone: string;
  prefillEmail: string;
  returnTo: string | null;
  openModal: (view?: AuthModalView, returnTo?: string | null, prefillEmail?: string) => void;
  closeModal: () => void;
  setView: (view: AuthModalView) => void;
  setPendingPhone: (phone: string) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isModalOpen: false,
  modalView: "welcome",
  pendingPhone: "",
  prefillEmail: "",
  returnTo: null,
  openModal: (view = "login", returnTo = null, prefillEmail = "") =>
    set({ isModalOpen: true, modalView: view, returnTo, prefillEmail }),
  closeModal: () => set({ isModalOpen: false, pendingPhone: "" }),
  setView: (view) => set({ modalView: view }),
  setPendingPhone: (phone) => set({ pendingPhone: phone }),
}));
