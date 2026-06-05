// import {
//   Geist,
//   Geist_Mono,
//   Inter,
//   Playfair_Display,
//   DM_Sans,
//   Vazirmatn,
//   Noto_Sans_Arabic,
//   Scheherazade_New,
// } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });
// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
//   display: "swap",
// });
// const playfairDisplay = Playfair_Display({
//   variable: "--font-playfair-display",
//   subsets: ["latin"],
//   display: "swap",
// });
// const dmSans = DM_Sans({
//   variable: "--font-dm-sans",
//   subsets: ["latin"],
//   display: "swap",
// });

// const vazirmatn = Vazirmatn({
//   variable: "--font-vazirmatn",
//   subsets: ["arabic"],
//   display: "swap",
// });
// const notoSansArabic = Noto_Sans_Arabic({
//   variable: "--font-noto-arabic",
//   subsets: ["arabic"],
//   display: "swap",
// });
// const scheherazade = Scheherazade_New({
//   variable: "--font-scheherazade",
//   subsets: ["arabic"],
//   weight: ["400", "700"],
//   display: "swap",
// });

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html
//       lang="en"
//       className={[
//         geistSans.variable,
//         geistMono.variable,
//         inter.variable,
//         playfairDisplay.variable,
//         dmSans.variable,
//         vazirmatn.variable,
//         notoSansArabic.variable,
//         scheherazade.variable,
//       ].join(" ")}
//     >
//       <body>{children}</body>
//     </html>
//   );
// }


import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}