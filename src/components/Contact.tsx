import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock, MessageCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', phone: '', service: '', message: '' });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Head Office",
      details: ["Unit no. 611, Reliables Pride, Anand Nagar", "Opp. Heera Panna, Jogeshwari West, Mumbai – 400102"],
      color: "text-blue-600"
    },
    {
      icon: Phone,
      title: "Phone Numbers",
      details: ["+91-9876-543-210", "+91-9876-543-211"],
      color: "text-green-600"
    },
    {
      icon: Mail,
      title: "Email Addresses",
      details: ["invest@moneva.in", "support@moneva.in"],
      color: "text-purple-600"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
      color: "text-orange-600"
    }
  ];

  const faqs = [
    {
      question: "What is the minimum amount to start investing?",
      answer: "You can start your investment journey with as little as ₹500 per month through SIP."
    },
    {
      question: "How do you charge for your services?",
      answer: "We offer transparent fee-based advisory services. No hidden charges or commissions from fund houses."
    },
    {
      question: "Do you provide tax planning services?",
      answer: "Yes, we offer comprehensive tax planning strategies to help you save tax legally and efficiently."
    },
    {
      question: "How often will I receive portfolio updates?",
      answer: "You'll receive monthly portfolio statements and quarterly review calls with your dedicated advisor."
    }
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Get In <span className="text-financial-accent">Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to take control of your financial future? Contact our expert advisors for personalized guidance and comprehensive financial planning solutions.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-0 shadow-financial">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-financial-accent" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Interest</Label>
                      <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="investment-planning">Investment Planning</SelectItem>
                          <SelectItem value="retirement-planning">Retirement Planning</SelectItem>
                          <SelectItem value="tax-planning">Tax Planning</SelectItem>
                          <SelectItem value="insurance-planning">Insurance Planning</SelectItem>
                          <SelectItem value="portfolio-management">Portfolio Management</SelectItem>
                          <SelectItem value="financial-consultation">General Financial Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your financial goals and how we can help..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-financial-accent hover:bg-financial-accent/90 text-white">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-financial-accent" />
                  Schedule a Call
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Prefer to talk directly? Schedule a free 30-minute consultation with our financial experts.
                </p>
                <Button className="w-full bg-financial-gold hover:bg-financial-gold/90 text-financial-primary">
                  Book Free Consultation
                </Button>
              </CardContent>
            </Card>

            {contactInfo.map((info, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <info.icon className={`w-5 h-5 mt-1 ${info.color}`} />
                    <div>
                      <h4 className="font-semibold mb-2">{info.title}</h4>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Frequently Asked Questions</h3>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions about our services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-card">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-3 text-financial-accent">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">Have more questions?</p>
            <Button variant="outline" className="border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white">
              View All FAQs
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;