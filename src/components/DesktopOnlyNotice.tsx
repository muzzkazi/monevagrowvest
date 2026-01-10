import { Monitor } from "lucide-react";

const DesktopOnlyNotice = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background p-8 lg:hidden">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-financial-accent/10 flex items-center justify-center">
          <Monitor className="w-10 h-10 text-financial-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Desktop Experience Only
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          For the best experience, please visit Moneva GrowVest on a desktop or laptop computer. 
          Mobile optimization is coming soon!
        </p>
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Minimum recommended width: 1024px
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesktopOnlyNotice;
