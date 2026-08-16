import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { GLOSSARY } from "@/lib/pi/glossary";

/** Inline, keyboard-accessible glossary marker. Renders its children plus a help affordance. */
const GlossaryTerm = ({
  id,
  children,
  className = "",
}: {
  id: keyof typeof GLOSSARY;
  children?: React.ReactNode;
  className?: string;
}) => {
  const entry = GLOSSARY[id];
  if (!entry) return <>{children}</>;

  return (
    <Popover>
      <PopoverTrigger
        className={`inline-flex items-center gap-1 underline decoration-dotted decoration-muted-foreground/60 underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:text-foreground ${className}`}
        aria-label={`What is ${entry.term}?`}
      >
        {children ?? entry.term}
        <HelpCircle className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2" align="start" role="dialog" aria-label={`${entry.term} definition`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{entry.term}</p>
          <Badge
            variant="secondary"
            className={
              entry.layer === "B"
                ? "bg-financial-gold/10 text-financial-gold text-[10px]"
                : "bg-financial-accent/10 text-financial-accent text-[10px]"
            }
          >
            {entry.layer === "B" ? "Layer B" : "Layer A"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{entry.short}</p>
        <p className="text-xs text-muted-foreground">{entry.long}</p>
      </PopoverContent>
    </Popover>
  );
};

export default GlossaryTerm;
