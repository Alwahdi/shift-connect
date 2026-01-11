import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  DollarSign,
  Star,
  Search,
  Filter,
  Building2,
  MapPin,
  X,
  SlidersHorizontal
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShiftDetailModal from "@/components/shifts/ShiftDetailModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShiftCardSkeleton, SkeletonGrid } from "@/components/ui/skeleton-cards";
import { EmptyState } from "@/components/ui/empty-state";

interface Shift {
  id: string;
  title: string;
  role_required: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  location_address: string | null;
  description: string | null;
  required_certifications: string[] | null;
  is_urgent: boolean;
  clinic: {
    id: string;
    name: string;
    address: string | null;
    rating_avg: number | null;
    logo_url: string | null;
  };
}

interface Filters {
  role: string;
  minRate: number;
  maxRate: number;
  dateRange: string;
}

interface Profile {
  id: string;
  verification_status: string;
}

const ROLE_OPTIONS = [
  "All Roles",
  "Registered Nurse",
  "LPN/LVN",
  "CNA",
  "Medical Assistant",
  "Dental Hygienist",
  "Dental Assistant",
  "Physical Therapist",
  "Other",
];

const ShiftSearch = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showShiftDetail, setShowShiftDetail] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filters, setFilters] = useState<Filters>({ 
    role: "All Roles", 
    minRate: 0, 
    maxRate: 200, 
    dateRange: "all" 
  });
  const { user, userRole, isOnboardingComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchShifts();
    fetchProfile();
  }, [filters, user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, verification_status")
      .eq("user_id", user.id)
      .single();
    if (data) setProfile(data);
  };

  const fetchShifts = async () => {
    setIsLoading(true);
    let query = supabase
      .from("shifts")
      .select(`
        id,
        title,
        role_required,
        shift_date,
        start_time,
        end_time,
        hourly_rate,
        location_address,
        description,
        required_certifications,
        is_urgent,
        clinic:clinics(id, name, address, rating_avg, logo_url)
      `)
      .eq("is_filled", false)
      .gte("shift_date", new Date().toISOString().split("T")[0])
      .order("shift_date", { ascending: true })
      .limit(50);

    // Apply role filter
    if (filters.role && filters.role !== "All Roles") {
      query = query.ilike("role_required", `%${filters.role}%`);
    }

    // Apply rate filter
    if (filters.minRate > 0) {
      query = query.gte("hourly_rate", filters.minRate);
    }
    if (filters.maxRate < 200) {
      query = query.lte("hourly_rate", filters.maxRate);
    }

    // Apply date filter
    if (filters.dateRange === "today") {
      const today = new Date().toISOString().split("T")[0];
      query = query.eq("shift_date", today);
    } else if (filters.dateRange === "week") {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      query = query.lte("shift_date", nextWeek.toISOString().split("T")[0]);
    } else if (filters.dateRange === "month") {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      query = query.lte("shift_date", nextMonth.toISOString().split("T")[0]);
    }

    const { data, error } = await query;

    if (!error && data) {
      setShifts(data as unknown as Shift[]);
    }
    setIsLoading(false);
  };

  const clearFilters = () => {
    setFilters({ role: "All Roles", minRate: 0, maxRate: 200, dateRange: "all" });
  };

  const hasActiveFilters = filters.role !== "All Roles" || filters.minRate > 0 || filters.maxRate < 200 || filters.dateRange !== "all";

  const filteredShifts = shifts.filter(shift => 
    shift.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.role_required?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.clinic?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.location_address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{t("dashboard.filters.role")}</label>
        <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t("shifts.rate")}: ${filters.minRate} - ${filters.maxRate}
        </label>
        <Slider
          value={[filters.minRate, filters.maxRate]}
          min={0}
          max={200}
          step={5}
          onValueChange={(value) => setFilters({ ...filters, minRate: value[0], maxRate: value[1] })}
          className="mt-3"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{t("dashboard.filters.dateRange")}</label>
        <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("shiftSearch.allUpcoming")}</SelectItem>
            <SelectItem value="today">{t("shiftSearch.today")}</SelectItem>
            <SelectItem value="week">{t("shiftSearch.thisWeek")}</SelectItem>
            <SelectItem value="month">{t("shiftSearch.thisMonth")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 me-2" />
          {t("dashboard.filters.clearFilters")}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("shiftSearch.title")}</h1>
          <p className="text-muted-foreground">{t("shiftSearch.subtitle")}</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Desktop Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <div className="bg-card rounded-xl border border-border p-6 shadow-card sticky top-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                {t("common.filter")}
              </h2>
              <FilterContent />
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-3 mb-6"
            >
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("dashboard.search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9"
                />
              </div>
              
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant={hasActiveFilters ? "default" : "outline"} className="lg:hidden">
                    <Filter className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "left" : "right"}>
                  <SheetHeader>
                    <SheetTitle>{t("common.filter")}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </motion.div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {t("shiftSearch.resultsCount", { count: filteredShifts.length })}
              </p>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="hidden lg:flex">
                  <X className="w-4 h-4 me-1" />
                  {t("dashboard.filters.clearFilters")}
                </Button>
              )}
            </div>

            {/* Shift Cards */}
            {isLoading ? (
              <SkeletonGrid count={6} columns="grid-cols-1">
                <ShiftCardSkeleton />
              </SkeletonGrid>
            ) : filteredShifts.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={t("dashboard.noShifts")}
                description={t("shiftSearch.noResults")}
                action={
                  hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="w-4 h-4 me-2" />
                      {t("dashboard.filters.clearFilters")}
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-4">
                {filteredShifts.map((shift, index) => (
                  <motion.div
                    key={shift.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => {
                      setSelectedShift(shift);
                      setShowShiftDetail(true);
                    }}
                    role="article"
                    aria-label={`${shift.clinic?.name} - ${shift.role_required} - $${shift.hourly_rate}/hr`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedShift(shift);
                        setShowShiftDetail(true);
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Clinic Logo */}
                      <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {shift.clinic?.logo_url ? (
                          <img 
                            src={shift.clinic.logo_url} 
                            alt={shift.clinic.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-7 h-7 text-accent" />
                        )}
                      </div>

                      {/* Shift Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Link 
                            to={`/clinic/${shift.clinic?.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {shift.clinic?.name}
                          </Link>
                          {shift.is_urgent && (
                            <Badge variant="destructive" className="text-xs">{t("common.urgent")}</Badge>
                          )}
                          {shift.clinic?.rating_avg && shift.clinic.rating_avg > 0 && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="w-3 h-3 text-warning fill-warning" />
                              {shift.clinic.rating_avg.toFixed(1)}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{shift.role_required}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(shift.shift_date).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {shift.start_time} - {shift.end_time}
                          </span>
                          {shift.location_address && (
                            <span className="flex items-center gap-1 max-w-[200px] truncate">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              {shift.location_address}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rate */}
                      <div className="text-end flex-shrink-0">
                        <div className="flex items-center gap-1 text-lg font-bold text-primary">
                          <DollarSign className="w-4 h-4" />
                          {shift.hourly_rate}
                        </div>
                        <span className="text-xs text-muted-foreground">{t("common.perHour")}</span>
                      </div>
                    </div>

                    {/* Certifications */}
                    {shift.required_certifications && shift.required_certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
                        {shift.required_certifications.slice(0, 3).map((cert, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{cert}</Badge>
                        ))}
                        {shift.required_certifications.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{shift.required_certifications.length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Shift Detail Modal */}
      <ShiftDetailModal
        open={showShiftDetail}
        onOpenChange={setShowShiftDetail}
        shift={selectedShift}
        profileId={profile?.id || ""}
        verificationStatus={profile?.verification_status || "pending"}
        onApplicationSuccess={() => {
          fetchShifts();
          setShowShiftDetail(false);
        }}
      />
    </div>
  );
};

export default ShiftSearch;
