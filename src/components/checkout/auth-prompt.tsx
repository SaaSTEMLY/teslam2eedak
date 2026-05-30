"use client";

import Link from "@/components/Link/customLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserCircle, LogIn, UserPlus } from "lucide-react";
import type { Messages } from "@/lib/i18n";

interface AuthPromptProps {
  isLoggedIn: boolean;
  userName?: string | null;
  translations: Messages<"checkout">;
}

export function AuthPrompt({
  isLoggedIn,
  userName,
  translations: m,
}: AuthPromptProps) {
  if (isLoggedIn) {
    return (
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 size-10 rounded-full bg-primary/20 flex items-center justify-center">
              <UserCircle className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {m.welcomeBack.replace("{name}", userName ?? "there")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {m.loggedInMessage}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4 border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-medium text-foreground mb-1">
                {m.alreadyHaveAccount}
              </h3>
              <p className="text-sm text-muted-foreground">
                {m.createAccountBenefits}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="default" className="gap-2">
                <Link href="/auth/sign-in?redirectTo=/checkout">
                  <LogIn className="size-4" />
                  {m.loginButton}
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/auth/sign-up?redirectTo=/checkout">
                  <UserPlus className="size-4" />
                  {m.signupButton}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 text-center">
        <p className="text-sm text-muted-foreground">{m.orContinueAsGuest}</p>
      </div>
    </>
  );
}
