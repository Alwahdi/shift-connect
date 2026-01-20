import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, FileCheck, Search, Calendar, CheckCircle2, 
  Star, ArrowRight, Building2, Users
} from "lucide-react";

const meta: Meta = {
  title: "Wireframes/User Journey",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "User journey wireframes showing the complete flow from signup to shift completion.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const JourneyStep = ({ 
  step, 
  title, 
  description, 
  icon: Icon, 
  status = "default",
  isLast = false 
}: { 
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  status?: "completed" | "current" | "default";
  isLast?: boolean;
}) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center
        ${status === "completed" ? "bg-success text-success-foreground" : ""}
        ${status === "current" ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
        ${status === "default" ? "bg-muted text-muted-foreground" : ""}
      `}>
        {status === "completed" ? (
          <CheckCircle2 className="w-6 h-6" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </div>
      {!isLast && (
        <div className={`w-0.5 flex-1 my-2 ${status === "completed" ? "bg-success" : "bg-border"}`} />
      )}
    </div>
    <div className="pb-8">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="secondary" className="text-xs">Step {step}</Badge>
        {status === "current" && <Badge>Current</Badge>}
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

const ProfessionalJourneyComponent = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Account",
      description: "Sign up with email and choose your role as a healthcare professional.",
      status: "completed" as const,
    },
    {
      icon: FileCheck,
      title: "Complete Onboarding",
      description: "Upload credentials, certifications, and set your availability preferences.",
      status: "completed" as const,
    },
    {
      icon: Search,
      title: "Find Shifts",
      description: "Search and filter available shifts by location, date, and specialty.",
      status: "current" as const,
    },
    {
      icon: Calendar,
      title: "Apply & Get Booked",
      description: "Apply to shifts and receive confirmation from clinics.",
      status: "default" as const,
    },
    {
      icon: CheckCircle2,
      title: "Complete Shift",
      description: "Check in, work your shift, and check out when done.",
      status: "default" as const,
    },
    {
      icon: Star,
      title: "Get Rated & Paid",
      description: "Receive ratings from clinics and get paid for your work.",
      status: "default" as const,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">Professional Journey</Badge>
        <h1 className="text-2xl font-bold mb-2">From Signup to Paid Shift</h1>
        <p className="text-muted-foreground">
          The complete journey for healthcare professionals using SyndeoCare
        </p>
      </div>

      <div className="mt-8">
        {steps.map((step, index) => (
          <JourneyStep
            key={index}
            step={index + 1}
            icon={step.icon}
            title={step.title}
            description={step.description}
            status={step.status}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

const ClinicJourneyComponent = () => {
  const steps = [
    {
      icon: Building2,
      title: "Register Clinic",
      description: "Create a clinic account and verify your business credentials.",
      status: "completed" as const,
    },
    {
      icon: FileCheck,
      title: "Complete Profile",
      description: "Add clinic details, location, and payment information.",
      status: "completed" as const,
    },
    {
      icon: Calendar,
      title: "Post Shifts",
      description: "Create shift listings with requirements and compensation.",
      status: "current" as const,
    },
    {
      icon: Users,
      title: "Review Applicants",
      description: "Browse professional profiles and select candidates.",
      status: "default" as const,
    },
    {
      icon: CheckCircle2,
      title: "Manage Shifts",
      description: "Track check-ins, monitor progress, and handle any issues.",
      status: "default" as const,
    },
    {
      icon: Star,
      title: "Rate & Pay",
      description: "Rate professionals and process payments securely.",
      status: "default" as const,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">Clinic Journey</Badge>
        <h1 className="text-2xl font-bold mb-2">From Registration to Staffed Shift</h1>
        <p className="text-muted-foreground">
          The complete journey for clinics finding professionals on SyndeoCare
        </p>
      </div>

      <div className="mt-8">
        {steps.map((step, index) => (
          <JourneyStep
            key={index}
            step={index + 1}
            icon={step.icon}
            title={step.title}
            description={step.description}
            status={step.status}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

const FullFlowComponent = () => (
  <div className="p-6">
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold mb-2">Complete Platform Flow</h1>
      <p className="text-muted-foreground">
        How professionals and clinics interact on the platform
      </p>
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      {/* Professional Side */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" />
            Professional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Sign Up", "Complete Profile", "Search Shifts", "Apply", "Work Shift", "Get Paid"].map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                {i + 1}
              </span>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Connection */}
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center mx-auto mb-4">
            <ArrowRight className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold mb-2">SyndeoCare</h3>
          <p className="text-sm text-muted-foreground">
            Matching • Booking • Payments
          </p>
        </div>
      </div>

      {/* Clinic Side */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-accent" />
            Clinic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Register", "Verify Business", "Post Shifts", "Review Applicants", "Manage Shifts", "Pay & Rate"].map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center font-medium">
                {i + 1}
              </span>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export const ProfessionalJourney: Story = {
  render: () => <ProfessionalJourneyComponent />,
  parameters: {
    docs: {
      description: {
        story: "Complete user journey for healthcare professionals from signup to getting paid.",
      },
    },
  },
};

export const ClinicJourney: Story = {
  render: () => <ClinicJourneyComponent />,
  parameters: {
    docs: {
      description: {
        story: "Complete user journey for clinics from registration to staffing shifts.",
      },
    },
  },
};

export const FullPlatformFlow: Story = {
  render: () => <FullFlowComponent />,
  parameters: {
    docs: {
      description: {
        story: "High-level overview of how professionals and clinics interact through the platform.",
      },
    },
  },
};
