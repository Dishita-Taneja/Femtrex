import { founderProfile } from "@/shared/constants/demo-data";

export function ProfileCard() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-11 place-items-center rounded-full border border-femtrex-line bg-black/20 text-lg font-semibold text-white">
        {founderProfile.initials[0]}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{founderProfile.name}</p>
        <p className="truncate text-sm text-femtrex-soft">{founderProfile.email}</p>
      </div>
    </div>
  );
}
