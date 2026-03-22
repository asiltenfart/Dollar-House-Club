import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/auth/AuthContext";
import FlowProvider from "@/lib/flow/FlowProvider";
import { DataSourceProvider } from "@/lib/data/DataSourceContext";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dollar House Club — Win a Home Through Real Estate Raffles",
  description:
    "Deposit stablecoins into property raffles. The yield funds the prize — you could win a house. No speculation, just yield-powered real estate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body className="antialiased" style={{ fontFamily: "var(--font-nunito), 'Nunito Sans', sans-serif" }}>
        <FlowProvider>
        <AuthProvider>
          <DataSourceProvider>
          <ToastProvider>
            <Navbar />
            <main
              className="min-h-[calc(100vh-64px)] pt-16"
              style={{ maxWidth: "1440px", margin: "0 auto" }}
            >
              {children}
            </main>
            <Footer />
          </ToastProvider>
          </DataSourceProvider>
        </AuthProvider>
        </FlowProvider>
      </body>
    </html>
  );
}
