import { cn } from "@/utils/lib/utils";
import { Loader2 } from "lucide-react";

type Props = {
  classname?: string;
};

export const Spinner: React.FC<Props> = ({ classname }) => {
  return <Loader2 className={cn("h-4 w-4 animate-spin", classname)} />;
};
