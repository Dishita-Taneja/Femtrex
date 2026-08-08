import { BrandMark } from "@/shared/components/BrandMark";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-femtrex-navy p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <div className="space-y-3">
          <Skeleton className="mx-auto h-4 w-64" />
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
      </div>
    </div>
  );
}
