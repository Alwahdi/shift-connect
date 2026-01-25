import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Accordion component for displaying collapsible content sections. Built on Radix UI with smooth animations and keyboard navigation.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is SyndeoCare?</AccordionTrigger>
        <AccordionContent>
          SyndeoCare connects healthcare professionals with clinics for temporary staffing needs. 
          Our platform makes it easy to find shifts, manage bookings, and get paid.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I get started?</AccordionTrigger>
        <AccordionContent>
          Sign up as a professional or clinic, complete your profile, verify your credentials, 
          and start browsing or posting shifts. It takes just a few minutes!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is there a fee to use SyndeoCare?</AccordionTrigger>
        <AccordionContent>
          Creating an account and browsing is free. A small service fee is applied when 
          bookings are confirmed to cover platform operations and support.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  name: "Multiple Open",
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>For Professionals</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Find flexible work opportunities</li>
            <li>Set your own availability</li>
            <li>Get paid weekly</li>
            <li>Build your professional network</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>For Clinics</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Access verified professionals</li>
            <li>Fill shifts quickly</li>
            <li>Manage all bookings in one place</li>
            <li>Review and rate workers</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const FAQSection: Story = {
  name: "FAQ Section",
  render: () => (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible>
        <AccordionItem value="verification">
          <AccordionTrigger>How long does verification take?</AccordionTrigger>
          <AccordionContent>
            Document verification typically takes 1-2 business days. You'll receive an email 
            notification once your credentials have been reviewed. Some specialties may require 
            additional verification steps.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="cancellation">
          <AccordionTrigger>What is the cancellation policy?</AccordionTrigger>
          <AccordionContent>
            Shifts can be cancelled up to 24 hours before the start time without penalty. 
            Cancellations within 24 hours may incur a fee. Emergency cancellations are 
            handled on a case-by-case basis.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="payment">
          <AccordionTrigger>How and when do I get paid?</AccordionTrigger>
          <AccordionContent>
            Professionals are paid weekly via direct deposit. Payments are processed every 
            Friday for shifts completed the previous week. You can view your earnings and 
            payment history in your dashboard.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="insurance">
          <AccordionTrigger>Is malpractice insurance required?</AccordionTrigger>
          <AccordionContent>
            Yes, all healthcare professionals must maintain current malpractice insurance. 
            You'll need to upload proof of coverage during the onboarding process. 
            Insurance must be renewed before expiration to maintain active status.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="support">
          <AccordionTrigger>How can I contact support?</AccordionTrigger>
          <AccordionContent>
            Our support team is available via email at support@syndeocare.com or through 
            the in-app chat feature. For urgent matters, you can reach our emergency line 
            at 1-800-SYNDEO-1 during business hours.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const ShiftRequirements: Story = {
  name: "Shift Requirements Accordion",
  render: () => (
    <div className="w-full max-w-md border rounded-xl p-4 bg-card">
      <h3 className="font-semibold mb-4">Shift Requirements</h3>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="certs" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm">Required Certifications</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">RDA License</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">CPR Certified</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">X-Ray Certified</span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="duties" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm">Duties & Responsibilities</AccordionTrigger>
          <AccordionContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Perform prophylaxis procedures</li>
              <li>• Take and develop dental radiographs</li>
              <li>• Apply fluoride treatments</li>
              <li>• Educate patients on oral hygiene</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="dress" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm">Dress Code</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              Professional medical scrubs in solid colors. Closed-toe shoes required. 
              No excessive jewelry or strong fragrances.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
