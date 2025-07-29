import { useState } from "react";
import ContactFormModal from "./ContactFormModal";

const TickerBand = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-financial-dark text-white py-3 overflow-hidden relative w-full z-10" style={{ minHeight: '40px' }}>
        <div className="flex items-center justify-center px-4 gap-4">
          <span className="text-sm opacity-80">Market Updates</span>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-financial-accent hover:text-white transition-colors underline"
          >
            Subscribe Free
          </button>
        </div>
      </div>
      <ContactFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actionType="download"
      />
    </>
  );
};

export default TickerBand;