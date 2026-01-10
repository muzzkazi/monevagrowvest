import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
const Partners = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Featured partners (highlighted)
  const featuredPartners = [
    {
      name: "AngelOne",
      logo: "/lovable-uploads/angelone-logo.png", // Replace with actual logo
      type: "Trading Partner",
      description: "Leading digital trading platform"
    },
    {
      name: "Asset Plus",
      logo: "/lovable-uploads/assetplus-logo.png", // Replace with actual logo
      type: "Investment Partner", 
      description: "Comprehensive investment solutions"
    }
  ];

  // Major mutual fund houses
  const mutualFundPartners = [
    { name: "HDFC Mutual Fund", logo: "/lovable-uploads/hdfc-mf-logo.png" },
    { name: "ICICI Prudential", logo: "/lovable-uploads/icici-pru-logo.png" },
    { name: "SBI Mutual Fund", logo: "/lovable-uploads/sbi-mf-logo.png" },
    { name: "Axis Mutual Fund", logo: "/lovable-uploads/axis-mf-logo.png" },
    { name: "Kotak Mahindra MF", logo: "/lovable-uploads/kotak-mf-logo.png" },
    { name: "Aditya Birla Sun Life", logo: "/lovable-uploads/absl-logo.png" },
    { name: "Nippon India MF", logo: "/lovable-uploads/nippon-logo.png" },
    { name: "UTI Mutual Fund", logo: "/lovable-uploads/uti-mf-logo.png" },
    { name: "DSP Mutual Fund", logo: "/lovable-uploads/dsp-mf-logo.png" },
    { name: "Franklin Templeton", logo: "/lovable-uploads/franklin-logo.png" },
    { name: "Mirae Asset", logo: "/lovable-uploads/mirae-logo.png" },
    { name: "Tata Mutual Fund", logo: "/lovable-uploads/tata-mf-logo.png" }
  ];

  // Auto-scroll carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === Math.ceil(mutualFundPartners.length / 6) - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [mutualFundPartners.length]);

  const getVisiblePartners = () => {
    const partnersPerSlide = 6;
    const startIndex = currentIndex * partnersPerSlide;
    return mutualFundPartners.slice(startIndex, startIndex + partnersPerSlide);
  };

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: featuredRef, isVisible: featuredVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: carouselRef, isVisible: carouselVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div 
          ref={headerRef}
          className={`text-center mb-6 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Our <span className="text-financial-accent">Trusted Partners</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We partner with India's leading financial institutions to provide you with the best investment opportunities and trading platforms.
          </p>
        </div>

        {/* Featured Partners - Highlighted */}
        <div 
          ref={featuredRef}
          className={`grid md:grid-cols-2 gap-5 mb-6 transition-all duration-700 delay-100 ${featuredVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {featuredPartners.map((partner, index) => (
            <Card 
              key={partner.name} 
              className="group hover-scale hover:shadow-xl transition-all duration-300 border-2 border-financial-accent/20"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="h-16 w-auto mx-auto object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to text if logo doesn't load
                      const target = e.currentTarget as HTMLImageElement;
                      const fallback = target.nextElementSibling as HTMLElement;
                      target.style.display = 'none';
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div className="hidden h-16 w-32 mx-auto bg-financial-muted rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-financial-accent">{partner.name}</span>
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-financial-accent text-white">
                    Featured
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {partner.name}
                </h3>
                <p className="text-financial-accent font-semibold mb-2">{partner.type}</p>
                <p className="text-gray-600 dark:text-gray-300">{partner.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mutual Fund Partners - Carousel */}
        <div 
          ref={carouselRef}
          className={`transition-all duration-700 delay-200 ${carouselVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="text-center mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Authorized Distributor for Leading Mutual Funds
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We are authorized distributors for all major mutual fund houses in India
            </p>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex transition-transform duration-500 ease-in-out"
               style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {Array.from({ length: Math.ceil(mutualFundPartners.length / 6) }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {mutualFundPartners
                    .slice(slideIndex * 6, (slideIndex + 1) * 6)
                    .map((partner, index) => (
                    <div
                      key={partner.name}
                      className="group flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover-scale"
                    >
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="h-12 w-auto object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to text if logo doesn't load
                          const target = e.currentTarget as HTMLImageElement;
                          const fallback = target.nextElementSibling as HTMLElement;
                          target.style.display = 'none';
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      <div className="hidden h-12 w-20 bg-financial-muted rounded flex items-center justify-center mb-3">
                        <span className="text-xs font-bold text-financial-accent text-center">{partner.name.split(' ')[0]}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                        {partner.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: Math.ceil(mutualFundPartners.length / 6) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-financial-accent scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
        </div>

        {/* Regulatory Information */}
        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Authorized Mutual Fund Distributor | 
            ARN: ARN-305935 | All investments are subject to market risks.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Partners;