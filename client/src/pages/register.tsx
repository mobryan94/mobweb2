import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Github, CreditCard, Shield, User, Mail, Phone, MapPin } from "lucide-react";
import logoPath from "@assets/triangle-logo.svg";

const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Complete address is required"),
  cardNumber: z.string().min(16, "Valid card number is required"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "MM/YY format required"),
  cvv: z.string().min(3, "CVV is required"),
  tier: z.enum(["free", "official", "premium"]).default("free"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"free" | "official" | "premium">("free");

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      tier: "free",
    },
  });

  const handleGitHubAuth = async () => {
    try {
      window.location.href = "/api/login";
    } catch (error) {
      toast({
        title: "GitHub Auth Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: RegistrationForm) => {
    setIsLoading(true);
    try {
      // Registration logic will be handled by backend
      console.log("Registration data:", data);
      toast({
        title: "Registration Successful!",
        description: "Welcome to SESKROW! Redirecting to dashboard...",
      });
      setTimeout(() => setLocation("/dashboard"), 2000);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tiers = [
    {
      id: "free",
      name: "Free",
      price: "$0/month",
      features: ["Basic deployments", "1GB storage", "Community support"],
      color: "bg-gray-500/20 text-gray-400 border-gray-500",
    },
    {
      id: "official",
      name: "Official Member",
      price: "$15/month",
      features: ["Advanced deployments", "10GB storage", "Priority support", "Custom domains"],
      color: "bg-blue-500/20 text-blue-400 border-blue-500",
    },
    {
      id: "premium",
      name: "Premium Member",
      price: "$35/month",
      features: ["Unlimited deployments", "100GB storage", "24/7 support", "Advanced analytics", "Telegram bot hosting"],
      color: "bg-purple-500/20 text-purple-400 border-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logoPath} alt="SESKROW" className="w-12 h-12 mr-3" />
            <h1 className="text-3xl font-bold">Join SESKROW</h1>
          </div>
          <p className="text-gray-400">Deploy smarter, scale faster</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <Card className="glass-morphism border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Create Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* GitHub Auth */}
                  <Button
                    type="button"
                    onClick={handleGitHubAuth}
                    className="w-full bg-gray-800 hover:bg-gray-700"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Connect GitHub Account
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-black px-2 text-gray-400">Personal Details</span>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, State 12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-black px-2 text-gray-400">Payment Verification</span>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 5678 9012 3456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Pricing Tiers */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Choose Your Plan</h3>
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                className={`glass-morphism cursor-pointer transition-all ${
                  selectedTier === tier.id
                    ? tier.color
                    : "border-gray-700 hover:border-gray-600"
                }`}
                onClick={() => {
                  setSelectedTier(tier.id as "free" | "official" | "premium");
                  form.setValue("tier", tier.id as "free" | "official" | "premium");
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{tier.name}</h4>
                    <Badge variant="outline">{tier.price}</Badge>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-400">
                    {tier.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            <div className="text-center text-sm text-gray-400">
              <p>Payments processed via Telegram: <a href="http://t.me/seskrow/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@seskrow</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
