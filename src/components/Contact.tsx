import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MapPin, Phone, Mail, Clock, MessageCircle, Calendar, Target, Shield, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState("contact");
  const [completionProgress, setCompletionProgress] = useState(33);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set(["contact"]));
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
      details: ["+91 80878 55185", "Available 24/7"],
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

  const steps = [
    {
      id: "contact",
      label: "Contact Form",
      icon: MessageCircle,
      completed: completedSteps.has("contact")
    },
    {
      id: "consultation",
      label: "Book Consultation",
      icon: Calendar,
      completed: completedSteps.has("consultation")
    },
    {
      id: "information",
      label: "Contact Info",
      icon: Phone,
      completed: completedSteps.has("information")
    }
  ];

  const isStepAccessible = (stepId: string) => {
    return true; // All steps are accessible
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="h-8 w-8 text-financial-accent" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">
              Get In Touch
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to take control of your financial future? Contact our expert advisors for personalized guidance and comprehensive financial planning solutions.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Contact Progress</span>
            <span className="text-sm text-muted-foreground">{completionProgress}% Complete</span>
          </div>
          <Progress value={completionProgress} className="h-2" />
        </div>

        {/* Main Content */}
        <Tabs value={currentStep} className="w-full">
          {/* Step Navigation */}
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {steps.map(step => {
              const Icon = step.icon;
              const isAccessible = isStepAccessible(step.id);
              return (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 py-3 relative ${
                    !isAccessible ? 'opacity-50 cursor-not-allowed' : ''
                  } ${step.completed ? 'text-green-600' : ''}`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.label}</span>
                  {step.completed && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>}
                  {!isAccessible && <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-800/50 rounded"></div>}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Contact Form Tab */}
          <TabsContent value="contact" className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-financial-accent" />
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
          </TabsContent>

          {/* Book Consultation Tab */}
          <TabsContent value="consultation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-financial-accent" />
                  Schedule a Call
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Prefer to talk directly? Schedule a free 30-minute consultation with our financial experts.
                </p>
                <Button 
                  className="w-full bg-financial-gold hover:bg-financial-gold/90 text-financial-primary"
                  onClick={() => {
                    setCompletedSteps(prev => new Set([...prev, "consultation"]));
                    setCompletionProgress(66);
                    setCurrentStep("information");
                  }}
                >
                  Book Free Consultation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="information" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="bg-gradient-card border-0 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <info.icon className={`w-6 h-6 mt-1 ${info.color}`} />
                      <div>
                        <h4 className="font-semibold mb-3">{info.title}</h4>
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-sm text-muted-foreground mb-1">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* FAQs */}
        <div className="mt-12">
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
    </div>
  );
};

export default Contact;