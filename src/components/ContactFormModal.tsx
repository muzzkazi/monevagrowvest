import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, User, FileText } from "lucide-react";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: "download" | "implement" | "subscribe" | "webinar";
}

const ContactFormModal = ({ isOpen, onClose, actionType }: ContactFormModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    city: "",
    investmentAmount: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countryCodes = [
    { code: "+91", country: "India" },
    { code: "+1", country: "USA" },
    { code: "+44", country: "UK" },
    { code: "+971", country: "UAE" },
    { code: "+65", country: "Singapore" },
    { code: "+852", country: "Hong Kong" }
  ];

  // Email domain validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    // Check for common disposable email domains
    const disposableDomains = [
      'tempmail.org', '10minutemail.com', 'guerrillamail.com', 
      'mailinator.com', 'temp-mail.org', 'throwaway.email'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) return false;
    
    // Ensure domain has proper format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const validateMobile = (mobile: string): boolean => {
    // Indian mobile number validation (10 digits)
    if (formData.countryCode === "+91") {
      return /^[6-9]\d{9}$/.test(mobile);
    }
    // General mobile validation (7-15 digits)
    return /^\d{7,15}$/.test(mobile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address from a genuine domain.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    if (!validateMobile(formData.mobile)) {
      toast({
        title: "Invalid Mobile Number",
        description: formData.countryCode === "+91" 
          ? "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
          : "Please enter a valid mobile number.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call - replace with actual lead capture
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success!",
        description: actionType === "download" 
          ? "Your report will be sent to your email shortly. Our advisor will contact you within 24 hours."
          : actionType === "subscribe"
          ? "Welcome! You'll start receiving market updates and insights in your inbox. Our advisor may also reach out with personalized recommendations."
          : actionType === "webinar"
          ? "Registration successful! You'll receive the webinar link and schedule details via email. Our team will also contact you with additional resources."
          : "Thank you for your interest! Our financial advisor will contact you within 2 hours to discuss your investment strategy."
      });

      // Reset form and close modal
      setFormData({
        fullName: "",
        email: "",
        countryCode: "+91",
        mobile: "",
        city: "",
        investmentAmount: ""
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {actionType === "download" ? <FileText className="h-5 w-5" /> : 
             actionType === "subscribe" ? <Mail className="h-5 w-5" /> : 
             actionType === "webinar" ? <Phone className="h-5 w-5" /> :
             <User className="h-5 w-5" />}
            {actionType === "download" ? "Download Investment Report" : 
             actionType === "subscribe" ? "Subscribe to Market Updates" :
             actionType === "webinar" ? "Join Live Investment Webinar" :
             "Start Your Hyper Personalized Investment Journey"}
          </DialogTitle>
          <DialogDescription>
            {actionType === "download" 
              ? "Get your detailed investment report and personalized guidance from our advisors."
              : actionType === "subscribe"
              ? "Get daily market updates, fund performance reports, and expert insights delivered to your inbox."
              : actionType === "webinar"
              ? "Register for our weekly live sessions where our experts share investment strategies and market insights. Get your questions answered in real-time."
              : "Connect with our SEBI-certified advisors to implement your AI-generated investment strategy and start your wealth building journey."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Please use a genuine email address. Temporary/disposable emails are not accepted.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="countryCode">Country</Label>
              <Select value={formData.countryCode} onValueChange={(value) => setFormData({ ...formData, countryCode: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.code} ({country.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                placeholder={formData.countryCode === "+91" ? "9876543210" : "Mobile number"}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Your city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentAmount">Investment Budget</Label>
              <Input
                id="investmentAmount"
                placeholder="e.g., 50,000/month"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Privacy Notice:</strong> Your information will be used only for providing investment guidance 
              and will not be shared with third parties. Our advisors are SEBI registered professionals.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-financial-accent hover:bg-financial-accent/90">
              {isSubmitting ? "Submitting..." : 
               actionType === "download" ? "Get Report" : 
               actionType === "subscribe" ? "Subscribe Now" : 
               actionType === "webinar" ? "Register Now" :
               "Get Started"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;