import { Skeleton as ShadcnSkeleton } from "@/components/ui/skeleton";

export const Skeleton: React.FC = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row items-center py-4 justify-center md:justify-between gap-5">
        <ShadcnSkeleton className="w-full h-10 rounded" />
        <ShadcnSkeleton className="w-40 h-10 rounded" />
      </div>
      <div className="border solid px-1 p-1 rounded-lg flex flex-col gap-1">
        {[...Array(10)].map((_, index) => (
          <ShadcnSkeleton key={index} className="h-8 w-full rounded" />
        ))}
      </div>
    </>
  );
};
