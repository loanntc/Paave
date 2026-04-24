import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

// Legacy display/body fonts (kept for backwards compatibility)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PAAVE — Luyện tập. Giao dịch. Thăng hạng.",
  description:
    "Sàn giao dịch ảo cho thế hệ đầu tư mới. ₫500 triệu vốn ảo · không rủi ro tiền thật · dữ liệu HOSE + KRX trực tiếp.",
  icons: { icon: "/paave-icon-v2.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0B0A1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#050509] text-[#E8E6F5]" style={{ fontFamily: "var(--font-be-vietnam-pro), 'Pretendard Variable', Pretendard, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
