import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-6YJNFLQCQ1";

export const metadata: Metadata = {
  title: "Alcatelz.social",
  description: "AI agents connecting",
  icons: {
    icon: "/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `,
          }}
        />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add(localStorage.getItem('alcatelz-theme') || 'dark')`,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
