import { Card, CardContent } from "@/components/ui/card";
import { Award, Users2, TrendingUp, Shield } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import teamProfessional from "@/assets/team-professional.jpg";

const About = () => {
  const clientsCount = useCountUp({ end: 500, duration: 2000, suffix: "+" });
  const aumValue = useCountUp({ end: 12, duration: 2000, prefix: "₹", suffix: "Cr+" });

  const stats = [
    { icon: Users2, value: clientsCount.value, label: "Happy Clients", description: "Satisfied investors across India", ref: clientsCount.ref, animated: true },
    { icon: TrendingUp, value: aumValue.value, label: "Assets Under Management", description: "Growing portfolio value", ref: aumValue.ref, animated: true },
    { icon: Award, value: "12%+", label: "Average Returns", description: "Consistent performance track record", animated: false },
    { icon: Shield, value: "100%", label: "Research Based", description: "Data-driven investment decisions", animated: false }
  ];

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
    <section id="about" className="py-24 bg-gradient-to-b from-background to-financial-muted/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-glow opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-glow opacity-15 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-slide-up">
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            About <span className="gradient-text">Moneva</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Founded with a mission to democratize financial planning, <strong className="text-financial-accent">Moneva Growvest Pvt. Ltd.</strong> has been helping individuals and families achieve their financial dreams through expert guidance and personalized strategies.
          </p>
        </div>

        {/* Enhanced Our Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24 animate-scale-in">
          <div className="space-y-8">
            <div className="relative">
              <img 
                src={teamProfessional} 
                alt="Professional Team" 
                className="w-full h-[400px] object-cover rounded-3xl shadow-luxury hover-lift"
              />
              <div className="absolute -bottom-6 -right-6 bg-gradient-gold px-8 py-4 rounded-2xl shadow-gold">
                <div className="text-center">
                  <div className="text-2xl font-bold text-financial-primary">15+</div>
                  <div className="text-sm text-financial-primary">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <h3 className="text-4xl lg:text-5xl font-bold text-foreground">Our <span className="gradient-text">Story</span></h3>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p className="text-xl">
                <strong className="text-financial-accent">Moneva Growvest Pvt. Ltd.</strong> was born from a simple observation: traditional financial advisory services were either too expensive for the average investor or too generic to be truly helpful. We set out to change that.
              </p>
              <p>
                Since our founding just over a year ago, we've built a dynamic team of <strong className="text-financial-accent">certified financial planners</strong>, market researchers, and technology experts who share a common goal - making sophisticated financial planning accessible to everyone.
              </p>
              <p>
                In our first year, we're proud to serve over <strong className="text-financial-gold">500 clients across India</strong>, managing assets worth more than <strong className="text-financial-gold">₹12 crores</strong>, and maintaining an average return rate of <strong className="text-financial-gold">12%+</strong> through our research-driven approach.
              </p>
              <p>
                As authorized channel partners of leading brokerages like <strong className="text-financial-accent">AngelOne</strong> and <strong className="text-financial-accent">AssetPlus</strong>, we provide seamless investment execution while maintaining complete transparency in our advisory process.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <Card key={index} className="luxury-card border-0 shadow-luxury hover-lift group">
              <CardContent className="p-8 text-center">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-gold rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-8 h-8 text-financial-primary" />
                  </div>
                </div>
                <div ref={stat.animated ? stat.ref : undefined} className="text-3xl lg:text-4xl font-bold gradient-text mb-3">{stat.value}</div>
                <div className="text-base font-semibold text-foreground mb-2">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Our Values */}
        <div className="mb-24 animate-slide-up">
          <div className="text-center mb-16">
            <h3 className="text-4xl lg:text-5xl font-bold mb-6">Our <span className="gradient-text">Values</span></h3>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do and define who we are
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="luxury-card border-0 shadow-luxury hover-lift group">
                <CardContent className="p-8 h-full flex flex-col">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-gradient-gold rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-6 h-6 bg-financial-primary rounded-lg"></div>
                    </div>
                    <h4 className="text-xl font-bold mb-4 gradient-text">{value.title}</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed flex-grow">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Team Section */}
        <div className="text-center animate-scale-in">
          <h3 className="text-4xl lg:text-5xl font-bold mb-8">Meet Our <span className="gradient-text">Expert Team</span></h3>
          <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto">
            Certified professionals with decades of combined experience in financial planning and wealth management
          </p>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                name: "Rajesh Kumar",
                role: "Chief Financial Advisor",
                experience: "15+ years",
                certifications: "CFP, CFA"
              },
              {
                name: "Priya Sharma", 
                role: "Portfolio Manager",
                experience: "12+ years",
                certifications: "FRM, CFA"
              },
              {
                name: "Amit Patel",
                role: "Tax Planning Specialist", 
                experience: "10+ years",
                certifications: "CA, CFP"
              }
            ].map((member, index) => (
              <Card key={index} className="luxury-card border-0 shadow-luxury hover-lift group">
                <CardContent className="p-10 text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-gold rounded-full mx-auto flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-bold text-financial-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-financial-accent px-3 py-1 rounded-full text-xs text-white font-medium">
                      Expert
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-3 gradient-text">{member.name}</h4>
                  <p className="text-financial-accent font-semibold mb-3 text-lg">{member.role}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>{member.experience}</strong> Experience
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>{member.certifications}</strong>
                    </p>
                  </div>
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