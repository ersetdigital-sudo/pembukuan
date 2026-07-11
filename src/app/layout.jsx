import "./globals.css";
import "gooey-toast/styles.css";
import { DM_Sans } from "next/font/google";
import LayoutShell from "@/components/layout/LayoutShell";
import { ToastProvider } from "@/components/ui/Toast";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "OOS SHOP - Sales Recap",
  description:
    "Sales recap dashboard - OOS SHOP X ASRUD 2026. Built on the Uber design system.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={dmSans.variable}>
      <body className="font-sans">
        <ToastProvider>
          <LayoutShell>{children}</LayoutShell>
        </ToastProvider>
      </body>
    </html>
  );
}
