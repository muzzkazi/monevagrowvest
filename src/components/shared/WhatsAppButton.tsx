import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  message?: string;
}

const WhatsAppButton = ({ message = "Hi! I'm interested in your financial services" }: WhatsAppButtonProps) => {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/918087855185?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleWhatsAppClick}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="ml-2 hidden md:inline">WhatsApp Us</span>
      </Button>
    </div>
  );
};

export default WhatsAppButton;