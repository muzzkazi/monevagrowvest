import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Partners = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Featured partners (highlighted)
  const featuredPartners = [
    {
      name: "AngelOne",
      logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=100&fit=crop&crop=center",
      type: "Trading Partner",
      description: "Leading digital trading platform"
    },
    {
      name: "Asset Plus",
      logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=200&h=100&fit=crop&crop=center", 
      type: "Investment Partner",
      description: "Comprehensive investment solutions"
    }
  ];

  // Major mutual fund houses
  const mutualFundPartners = [
    { name: "HDFC Mutual Fund", logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=60&fit=crop&crop=center" },
    { name: "ICICI Prudential", logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=120&h=60&fit=crop&crop=center" },
    { name: "SBI Mutual Fund", logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&h=60&fit=crop&crop=center" },
    { name: "Axis Mutual Fund", logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=120&h=60&fit=crop&crop=center" },
    { name: "Kotak Mahindra MF", logo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&h=60&fit=crop&crop=center" },
    { name: "Aditya Birla Sun Life", logo: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=120&h=60&fit=crop&crop=center" },
    { name: "Nippon India MF", logo: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&h=60&fit=crop&crop=center" },
    { name: "UTI Mutual Fund", logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=120&h=60&fit=crop&crop=center" },
    { name: "DSP Mutual Fund", logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=60&fit=crop&crop=center" },
    { name: "Franklin Templeton", logo: "https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=120&h=60&fit=crop&crop=center" },
    { name: "Mirae Asset", logo: "https://images.unsplash.com/photo-1551836022-b06f4b3d8ecd?w=120&h=60&fit=crop&crop=center" },
    { name: "Tata Mutual Fund", logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=120&h=60&fit=crop&crop=center" }
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

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="text-financial-accent">Trusted Partners</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We partner with India's leading financial institutions to provide you with the best investment opportunities and trading platforms.
          </p>
        </div>

        {/* Featured Partners - Highlighted */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {featuredPartners.map((partner, index) => (
            <Card key={partner.name} className="group hover-scale hover:shadow-xl transition-all duration-300 border-2 border-financial-accent/20">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-16 w-auto mx-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
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
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authorized Distributor for Leading Mutual Funds
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            We are authorized distributors for all major mutual fund houses in India
          </p>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
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
                        alt={partner.name}
                        className="h-12 w-auto object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
                      />
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

        {/* Regulatory Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            SEBI Registered Investment Advisor & Authorized Mutual Fund Distributor | 
            ARN: ARN-305935 | All investments are subject to market risks.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Partners;