import Link from "next/link";
import Image from "next/image";

export function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Fiber and Electric Solutions home">
    <Image
      src="/images/fes-logo.png"
      alt="Fiber & Electric Solutions Ltd. — Make it good. Make it last."
      width={1653}
      height={749}
      priority
      className={`h-auto w-[8.75rem] sm:w-[10.5rem] ${light ? "rounded-sm bg-white p-1" : ""}`}
      sizes="(max-width: 639px) 140px, 168px"
    />
  </Link>;
}
