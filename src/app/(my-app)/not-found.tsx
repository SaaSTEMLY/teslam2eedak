import Link from "@/components/Link/customLink";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center"
    >
      <p className="text-8xl font-bold text-muted-foreground/20 font-serif sm:text-[10rem]">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild className="mt-8 h-11 rounded-xl px-6" variant="outline">
        <Link href="/">
          <ArrowLeft className="me-2 size-4" />
          Back to home
        </Link>
      </Button>
    </main>
  );
}
