import Image from "next/image";

export const Icon = () => {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/logo/main/raw.svg"
        alt="SaaStarter"
        width={24}
        height={24}
        className="h-6 w-6"
        priority
      />
    </div>
  );
};
