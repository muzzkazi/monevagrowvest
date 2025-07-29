import { Card, CardContent } from "@/components/ui/card";
import { Award, Users2, TrendingUp, Shield } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

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
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            About <span className="text-financial-accent">Moneva</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Founded with a mission to democratize financial planning, Moneva has been helping individuals and families achieve their financial dreams through expert guidance and personalized strategies.
          </p>
        </div>

        {/* Our Story */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-foreground">Our Story</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Moneva was born from a simple observation: traditional financial advisory services were either too expensive for the average investor or too generic to be truly helpful. We set out to change that.
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
          
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-card hover:shadow-financial transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 text-financial-accent mx-auto mb-4" />
                  <div ref={stat.animated ? stat.ref : undefined} className="text-2xl font-bold text-financial-accent mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-foreground mb-2">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Our Values</h3>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-card hover:shadow-financial transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-3 text-financial-accent">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-6">Meet Our Expert Team</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Certified professionals with decades of combined experience in financial planning and wealth management
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
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