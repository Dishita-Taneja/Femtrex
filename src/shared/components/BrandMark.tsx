import Link from "next/link";
import Image from "next/image";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Femtrex home">
      <Image
        src="/assets/images/Femtrex_logo.jpeg"
        alt="Femtrex"
        width={compact ? 40 : 68}
        height={compact ? 40 : 68}
        priority={!compact}
        className={compact ? "size-10 rounded-sm object-contain shadow-glow" : "size-14 rounded-sm object-contain shadow-glow"}
      />
      {!compact && <span className="font-serif text-3xl font-semibold text-[#d887ff]">Femtrex</span>}
    </Link>
  );
}
