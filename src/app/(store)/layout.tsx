import { Suspense, type ReactNode } from "react";
import dynamic from "next/dynamic";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import AuthModalProvider from "@/components/auth/AuthModalProvider";
import CartSyncOnLogin from "@/components/auth/CartSyncOnLogin";
import WelcomePopupTrigger from "@/components/auth/WelcomePopupTrigger";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import { AuthRequiredTrigger } from "@/components/auth/AuthRequiredTrigger";

const CartDrawer = dynamic(() => import("@/components/store/CartDrawer"), {
  ssr: false,
});

type StoreLayoutProps = {
  children: ReactNode;
};

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <AuthRequiredTrigger />
      <WelcomePopupTrigger />
      <CartSyncOnLogin />
      <AuthModalProvider />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-0 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-8">
              <div className="h-8 w-56 animate-pulse rounded bg-stone-200" />
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
