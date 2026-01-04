import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  MapPin, 
  Loader2,
  Briefcase,
  AlertCircle,
  X
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  "Registered Nurse (RN)",
  "Licensed Practical Nurse (LPN)",
  "Certified Nursing Assistant (CNA)",
  "Medical Assistant (MA)",
  "Dental Hygienist",
  "Dental Assistant",
  "Physical Therapist",
  "Occupational Therapist",
  "Radiologic Technologist",
  "Phlebotomist",
  "Medical Receptionist",
  "Other",
];

const CERTIFICATION_OPTIONS = [
  "BLS",
  "ACLS",
  "PALS",
  "NRP",
  "TNCC",
  "CEN",
  "CCRN",
  "CPR",
];

const CreateShiftModal = ({ open, onOpenChange, clinicId, onSuccess }: CreateShiftModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    role_required: "",
    description: "",
    shift_date: null as Date | null,
    start_time: "08:00",
    end_time: "16:00",
    hourly_rate: "",
    location_address: "",
    is_urgent: false,
    required_certifications: [] as string[],
    max_applicants: "10",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shift_date || !formData.role_required || !formData.hourly_rate) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("shifts").insert({
        clinic_id: clinicId,
        title: formData.title || formData.role_required,
        role_required: formData.role_required,
        description: formData.description,
        shift_date: format(formData.shift_date, "yyyy-MM-dd"),
        start_time: formData.start_time,
        end_time: formData.end_time,
        hourly_rate: parseFloat(formData.hourly_rate),
        location_address: formData.location_address,
        is_urgent: formData.is_urgent,
        required_certifications: formData.required_certifications.length > 0 ? formData.required_certifications : null,
        max_applicants: parseInt(formData.max_applicants) || 10,
      });

      if (error) throw error;

      toast({
        title: "Shift posted!",
        description: "Your shift has been posted and is now visible to professionals.",
      });

      // Reset form
      setFormData({
        title: "",
        role_required: "",
        description: "",
        shift_date: null,
        start_time: "08:00",
        end_time: "16:00",
        hourly_rate: "",
        location_address: "",
        is_urgent: false,
        required_certifications: [],
        max_applicants: "10",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error posting shift",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      required_certifications: prev.required_certifications.includes(cert)
        ? prev.required_certifications.filter(c => c !== cert)
        : [...prev.required_certifications, cert],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Post a New Shift</DialogTitle>
          <DialogDescription>
            Fill in the details below to find qualified healthcare professionals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role Required *</Label>
              <Select
                value={formData.role_required}
                onValueChange={(value) => setFormData({ ...formData, role_required: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Shift Title (Optional)</Label>
              <Input
                id="title"
                placeholder="e.g., Morning ICU Coverage"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Shift Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.shift_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.shift_date ? format(formData.shift_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.shift_date || undefined}
                    onSelect={(date) => setFormData({ ...formData, shift_date: date || null })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Hourly Rate & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="45.00"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_applicants">Max Applicants</Label>
              <Input
                id="max_applicants"
                type="number"
                min="1"
                value={formData.max_applicants}
                onChange={(e) => setFormData({ ...formData, max_applicants: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Shift Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="123 Medical Center Dr, San Francisco, CA"
                value={formData.location_address}
                onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">Leave blank to use your clinic's default address</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the shift responsibilities, department, and any special requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Required Certifications */}
          <div className="space-y-3">
            <Label>Required Certifications</Label>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATION_OPTIONS.map(cert => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => toggleCertification(cert)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    formData.required_certifications.includes(cert)
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cert}
                  {formData.required_certifications.includes(cert) && (
                    <X className="w-3 h-3 ml-1 inline" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Urgent Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-foreground">Mark as Urgent</p>
                <p className="text-sm text-muted-foreground">Urgent shifts get highlighted and prioritized</p>
              </div>
            </div>
            <Switch
              checked={formData.is_urgent}
              onCheckedChange={(checked) => setFormData({ ...formData, is_urgent: checked })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post Shift
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShiftModal;