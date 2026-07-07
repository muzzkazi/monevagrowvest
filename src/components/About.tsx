import { Card, CardContent } from "@/components/ui/card";
import { StatsBlock } from "@/components/shared/StatsBlock";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const About = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: storyRef, isVisible: storyVisible } = useScrollAnimation({ threshold: 0.15 });
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: teamRef, isVisible: teamVisible } = useScrollAnimation({ threshold: 0.1 });


  const values = [
    {
      title: "Transparency",
      description: "We believe in complete transparency in all our dealings. No hidden fees, no surprise charges - just honest, straightforward advice."
    },
    {
      title: "Innovation",
      description: "We leverage cutting-edge technology and modern investment strategies to maximize your returns while minimizing risks."
    },
    {
      title: "Client-First Approach",
      description: "Your financial success is our priority. Every recommendation is tailored to your unique circumstances and goals."
    },
    {
      title: "Continuous Learning",
      description: "Our team stays updated with market trends and regulatory changes to provide you with the most current advice."
    }
  ];

  return (
    <section id="about" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div 
          ref={headerRef}
          className={`text-center mb-10 transition-all duration-700 ease-out ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl font-bold mb-4">
            About <span className="text-financial-accent">Moneva</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Founded with a mission to democratize financial planning, Moneva Growvest Pvt. Ltd. has been helping individuals and families achieve their financial dreams through expert guidance and personalized strategies.
          </p>
        </div>

        {/* Our Story */}
        <div 
          ref={storyRef}
          className={`mb-12 transition-all duration-700 ease-out ${
            storyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="max-w-3xl mb-12 sm:mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Our Story</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Moneva Growvest Pvt. Ltd. was born from a simple observation: traditional financial advisory services were either too expensive for the average investor or too generic to be truly helpful. We set out to change that.
              </p>
              <p>
                Since our founding just over a year ago, we've built a dynamic team of certified financial planners, market researchers, and technology experts who share a common goal - making sophisticated financial planning accessible to everyone.
              </p>
              <p>
                In our first year, we're proud to serve over 500 clients across India, managing assets worth more than ₹12 crores, and maintaining an average return rate of 12%+ through our research-driven approach.
              </p>
              <p>
                As authorized channel partners of leading brokerages like <strong>AngelOne</strong> and <strong>AssetPlus</strong>, we provide seamless investment execution while maintaining complete transparency in our advisory process.
              </p>
            </div>
          </div>
          
          {/* Stats cards - larger spaced grid */}
          <StatsBlock variant="cards" />
        </div>

        {/* Our Values */}
        <div ref={valuesRef} className="mb-12">
          <div 
            className={`text-center mb-12 transition-all duration-700 ease-out ${
              valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h3 className="text-3xl font-bold mb-3">Our Values</h3>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className={`bg-gradient-card border-0 shadow-card hover:shadow-financial transition-all duration-500 hover:-translate-y-2 ${
                  valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: valuesVisible ? `${index * 100}ms` : '0ms' }}
              >
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-3 text-financial-accent">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div 
          ref={teamRef}
          className={`text-center transition-all duration-700 ease-out ${
            teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h3 className="text-3xl font-bold mb-4">Meet Our Expert Team</h3>
          <p className="text-xl text-muted-foreground mb-6">
            Certified professionals with decades of combined experience in financial planning and wealth management
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Kiran Desai",
                role: "Chief Financial Advisor",
                experience: "15+ years",
                certifications: "CFP, CFA"
              },
              {
                name: "Neeraj Mehta", 
                role: "Portfolio Manager",
                experience: "12+ years",
                certifications: "FRM, CFA"
              },
              {
                name: "Sunita Joshi",
                role: "Tax Planning Specialist", 
                experience: "10+ years",
                certifications: "CA, CFP"
              }
            ].map((member, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-gold rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-financial-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{member.name}</h4>
                  <p className="text-financial-accent font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-1">{member.experience} Experience</p>
                  <p className="text-sm text-muted-foreground">{member.certifications}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;