"use client";

import { FaGoogle } from "react-icons/fa";
import { authClient } from "~/server/auth/client";
import { Button } from "./ui/button";

export default function SignInView() {
  const socialProviders = [
    { label: "google", icon: <FaGoogle /> },
    // { label: "github", icon: <FaGithub /> },
  ];

  return (
    <div className="flex h-screen w-screen flex-col items-center pt-40">
      <div className="flex w-2/3 flex-col items-center justify-center gap-2">
        <h3 className="text-center text-2xl font-bold">Welcome to stamina</h3>
        <p className="text-muted-foreground text-sm">
          This web application is by invitation only...
        </p>
        <div className="mt-8">
          {socialProviders.map((provider) => (
            <Button
              key={provider.label}
              onClick={() =>
                authClient.signIn.social({
                  provider: provider.label,
                  requestSignUp: true, // toggles on or off whether people can sign up/in
                })
              }
            >
              {provider.icon}
              {provider.label.charAt(0).toUpperCase() + provider.label.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
