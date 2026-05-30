import Image from "next/image";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logo/main/raw.svg"
        alt="SaaStarter"
        width={120}
        height={32}
        className="h-8 w-auto"
        priority
      />
    </div>
  );
};
