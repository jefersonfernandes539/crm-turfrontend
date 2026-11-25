import { Badge } from "@/components/ui/badge";
import type { LodgingStayStatus } from "@/types/Lodging";
import { STAY_STATUS } from "@/utils/lodging";
import { cn } from "@/utils/lib/utils";

export function StayStatusBadge({ status }: { status: LodgingStayStatus }) {
  const s = STAY_STATUS[status];
  return (
    <Badge variant="outline" className={cn(s.className)}>
      {s.label}
    </Badge>
  );
}
