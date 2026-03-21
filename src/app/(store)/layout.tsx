import type { ReactNode } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/store/CartDrawer";
import WhatsAppButton from "@/components/store/WhatsAppButton";

type StoreLayoutProps = {
  children: ReactNode;
};

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-0 sm:px-6 lg:px-8">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
