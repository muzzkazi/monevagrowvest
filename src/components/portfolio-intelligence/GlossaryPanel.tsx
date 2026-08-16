import { useMemo, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { glossaryList } from "@/lib/pi/glossary";

type LayerFilter = "all" | "A" | "B";

const QUICK_FILTERS = ["risk", "stress", "tax", "allocation", "SIP"];

const GlossaryPanel = () => {
  const entries = glossaryList();
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState<LayerFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const layerOk = layer === "all" || e.layer === layer || e.layer === "both";
      if (!layerOk) return false;
      if (!q) return true;
      return `${e.term} ${e.short} ${e.long}`.toLowerCase().includes(q);
    });
  }, [entries, query, layer]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-financial-accent" /> Glossary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Every term used in this console. Dotted underlines anywhere in the analysis open the same definition inline.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms, e.g. risk capacity, stress test"
              aria-label="Search glossary terms"
              className="pl-9 pr-9"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Clear glossary search"
                onClick={() => setQuery("")}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup
              type="single"
              value={layer}
              onValueChange={(v) => v && setLayer(v as LayerFilter)}
              aria-label="Filter glossary by layer"
            >
              <ToggleGroupItem value="all" className="text-xs px-3">All</ToggleGroupItem>
              <ToggleGroupItem value="A" className="text-xs px-3">Layer A · math</ToggleGroupItem>
              <ToggleGroupItem value="B" className="text-xs px-3">Layer B · plain English</ToggleGroupItem>
            </ToggleGroup>

            <div className="flex flex-wrap gap-1.5">
              {QUICK_FILTERS.map((f) => (
                <Badge
                  key={f}
                  role="button"
                  tabIndex={0}
                  aria-pressed={query.toLowerCase() === f.toLowerCase()}
                  onClick={() => setQuery(query.toLowerCase() === f.toLowerCase() ? "" : f)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setQuery(query.toLowerCase() === f.toLowerCase() ? "" : f);
                    }
                  }}
                  variant={query.toLowerCase() === f.toLowerCase() ? "default" : "secondary"}
                  className="cursor-pointer text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {f}
                </Badge>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
            Showing {filtered.length} of {entries.length} terms
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No term matches “{query}”. Try a broader word such as risk, tax or allocation.
          </p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {filtered.map((e) => (
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
        )}
      </CardContent>
    </Card>
  );
};

export default GlossaryPanel;
