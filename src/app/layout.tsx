import "~/styles/globals.css";

import { type Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Nav from "~/components/nav";
import { TRPCReactProvider } from "~/trpc/react";
import CreateMeasurableDialog from "~/components/createMeasurableDialog";
import { AppContextProvider } from "~/contexts/AppContext";
import Fabs from "~/components/fabs";

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
              <CreateMeasurableDialog />
              <Fabs />
            </ThemeProvider>
          </AppContextProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
