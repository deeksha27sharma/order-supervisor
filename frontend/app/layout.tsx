import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Supervisor",
  description: "AI-powered order lifecycle supervisor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white border-b px-6 py-3 flex gap-6 items-center">
          <span className="font-bold text-gray-800">Order Supervisor</span>
          <Link href="/supervisors" className="text-sm text-gray-600 hover:text-gray-900">
            Supervisors
          </Link>
          <Link href="/runs" className="text-sm text-gray-600 hover:text-gray-900">
            Runs
          </Link>
          <Link href="/runs/new" className="text-sm text-gray-600 hover:text-gray-900">
            New Run
          </Link>
        </nav>
        <main className="px-6 py-6 max-w-5xl mx-auto">{children}</main>
      </body>
    </html>
  );
}