import "~/styles/globals.css";

import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "stamina",
  description: "Count down based productivity tool",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <ThemeProvider
            attribute={"class"}
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex h-screen grow overflow-hidden">{children}</div>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
