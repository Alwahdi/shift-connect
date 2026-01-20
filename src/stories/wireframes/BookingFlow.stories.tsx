import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Search, MapPin, Calendar, Clock, DollarSign, CheckCircle2, 
  ArrowRight, ArrowLeft, User, FileText, Send
} from "lucide-react";

const meta: Meta = {
  title: "Wireframes/Booking Flow",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Step-by-step booking flow wireframes showing the shift application process.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const BookingFlowComponent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    { id: 1, title: "Find Shift", icon: Search },
    { id: 2, title: "Review Details", icon: FileText },
    { id: 3, title: "Apply", icon: Send },
    { id: 4, title: "Confirmation", icon: CheckCircle2 },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Search for Available Shifts</h3>
            <p className="text-muted-foreground">
              Browse and filter shifts based on your preferences.
            </p>
            
            <div className="space-y-3 mt-6">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors"
                  onClick={() => setCurrentStep(2)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Dental Hygienist</h4>
                      <p className="text-sm text-muted-foreground">Downtown Medical Center</p>
                    </div>
                    <Badge>$45/hr</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Jan 20
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      09:00-17:00
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      2.3 mi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Review Shift Details</h3>
            <p className="text-muted-foreground">
              Make sure this shift matches your availability and qualifications.
            </p>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Dental Hygienist</CardTitle>
                    <p className="text-muted-foreground">Downtown Medical Center</p>
                  </div>
                  <Badge variant="urgent">Urgent</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">January 20, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">09:00 - 17:00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pay Rate</p>
                      <p className="font-medium">$45/hour ($360 total)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">123 Main St, New York</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Active RDH License</Badge>
                    <Badge variant="secondary">BLS Certification</Badge>
                    <Badge variant="secondary">2+ Years Experience</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    We're looking for a skilled dental hygienist to join our team for a day. 
                    You'll be performing routine cleanings, taking x-rays, and educating patients 
                    on oral hygiene practices.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Submit Application</h3>
            <p className="text-muted-foreground">
              Add a message to introduce yourself to the clinic.
            </p>

            <Card className="mt-6">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Sarah Johnson, RDH</p>
                    <p className="text-sm text-muted-foreground">5 years experience • 4.9 rating</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message to Clinic</label>
                  <Textarea
                    placeholder="Introduce yourself and explain why you're a great fit for this shift..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Optional but recommended</p>
                </div>

                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <h4 className="font-medium text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    You meet all requirements
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your profile matches all the requirements for this shift.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              The clinic will review your application and get back to you soon.
            </p>

            <Card className="max-w-sm mx-auto">
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shift</span>
                    <span className="font-medium">Dental Hygienist</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clinic</span>
                    <span className="font-medium">Downtown Medical Center</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">January 20, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="secondary">Pending Review</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${currentStep > step.id ? "bg-success text-success-foreground" : ""}
                ${currentStep === step.id ? "bg-primary text-primary-foreground" : ""}
                ${currentStep < step.id ? "bg-muted text-muted-foreground" : ""}
              `}>
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-1 mx-2 ${currentStep > step.id ? "bg-success" : "bg-muted"}`} 
                     style={{ width: "60px" }} />
              )}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-1" />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 me-2" />
          Back
        </Button>
        
        {currentStep < totalSteps ? (
          <Button onClick={() => setCurrentStep(currentStep + 1)}>
            {currentStep === 3 ? "Submit Application" : "Continue"}
            <ArrowRight className="w-4 h-4 ms-2" />
          </Button>
        ) : (
          <Button onClick={() => setCurrentStep(1)}>
            Find More Shifts
          </Button>
        )}
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <BookingFlowComponent />,
  parameters: {
    docs: {
      description: {
        story: "Interactive booking flow demonstrating the complete shift application process.",
      },
    },
  },
};
