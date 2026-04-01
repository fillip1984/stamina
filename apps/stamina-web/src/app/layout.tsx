import "~/styles/globals.css";

import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import MeasurableDialog from "~/components/measurable/measurableDialog";
import Fab from "~/components/nav/fab";
import Nav from "~/components/nav/nav";
import { AppContextProvider } from "~/contexts/AppContext";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "stamina",
  description: "Count down based productivity tool",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TRPCReactProvider>
          <AppContextProvider>
            <ThemeProvider
              attribute={"class"}
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="relative flex h-screen grow flex-col overflow-hidden">
                <Nav />
                {children}
              </div>
              <MeasurableDialog />
              <Fab />
            </ThemeProvider>
          </AppContextProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
