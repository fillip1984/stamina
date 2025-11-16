import Link from "next/link";

import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <p>The page was not found...</p>
      <Link href="/">
        <Button>Go back Home</Button>
      </Link>
    </div>
  );
}
