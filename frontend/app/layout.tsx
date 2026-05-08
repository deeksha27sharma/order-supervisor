import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Order Supervisor",
  description: "AI-powered order lifecycle supervisor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "40px 24px 80px",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}