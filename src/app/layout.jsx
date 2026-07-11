import "./globals.css";
import "gooey-toast/styles.css";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import LayoutShell from "@/components/layout/LayoutShell";
import { ToastProvider } from "@/components/ui/Toast";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata = {
  title: "OOS SHOP — Sales Recap",
  description:
    "Sales recap dashboard — OOS SHOP X ASRUD 2026. Built on the Sanity design system.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans">
        <ToastProvider>
          <LayoutShell>{children}</LayoutShell>
        </ToastProvider>
      </body>
    </html>
  );
}
