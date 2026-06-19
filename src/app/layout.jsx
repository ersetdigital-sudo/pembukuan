import "./globals.css";
import "gooey-toast/styles.css";
import { Ubuntu, Oswald, Ubuntu_Mono } from "next/font/google";
import LayoutShell from "@/components/layout/LayoutShell";
import { ToastProvider } from "@/components/ui/Toast";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const ubuntuMono = Ubuntu_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ubuntu-mono",
  display: "swap",
});

export const metadata = {
  title: "OOS SHOP — Sales Recap",
  description:
    "Enterprise sales recap dashboard — OOS SHOP X ASRUD 2026. Built on the Enterprise design system.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${ubuntu.variable} ${oswald.variable} ${ubuntuMono.variable}`}
    >
      <body className="font-sans">
        <ToastProvider>
          <LayoutShell>{children}</LayoutShell>
        </ToastProvider>
      </body>
    </html>
  );
}
