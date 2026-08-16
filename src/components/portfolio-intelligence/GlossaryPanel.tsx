import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { glossaryList } from "@/lib/pi/glossary";

const GlossaryPanel = () => {
  const entries = glossaryList();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-financial-accent" /> Glossary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Every term used in this console. Dotted underlines anywhere in the analysis open the same definition inline.
        </p>
        <Accordion type="multiple" className="w-full">
          {entries.map((e) => (
            <AccordionItem key={e.term} value={e.term}>
              <AccordionTrigger className="text-sm hover:no-underline">
                <span className="flex flex-wrap items-center gap-2 text-left">
                  <span className="font-medium text-foreground">{e.term}</span>
                  <Badge
                    variant="secondary"
                    className={
                      e.layer === "B"
                        ? "bg-financial-gold/10 text-financial-gold text-[10px]"
                        : "bg-financial-accent/10 text-financial-accent text-[10px]"
                    }
                  >
                    {e.layer === "B" ? "Layer B" : "Layer A"}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1.5">
                <p className="text-sm text-muted-foreground">{e.short}</p>
                <p className="text-xs text-muted-foreground">{e.long}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default GlossaryPanel;
