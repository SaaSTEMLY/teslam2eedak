"use client";

import { useAuth } from "@payloadcms/ui";
import Image from "next/image";
import { dicebearUrl } from "@/lib/avatar";

export const Avatar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const email = user.email || "";
  const imageUrl = (user.image as string | undefined) || dicebearUrl(email);

  return (
    <div
      className="relative overflow-hidden rounded-full"
      style={{ position: "relative", width: "32px", height: "32px" }}
    >
      <Image
        src={imageUrl}
        alt={user.name || email || "User"}
        fill
        className="object-cover"
        unoptimized={!user.image} // Don't optimize dicebear SVGs
        sizes="32px"
      />
    </div>
  );
};
