import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, MapPin, Calendar, Clock, DollarSign, Filter, 
  ChevronDown, Star, Bookmark, Grid, List
} from "lucide-react";

const meta: Meta = {
  title: "Screens/Shift Search",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Shift search screen with filters, map view, and shift cards.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const ShiftSearchComponent = ({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">(viewMode);

  const shifts = [
    {
      id: 1,
      title: "Dental Hygienist",
      clinic: "Downtown Medical Center",
      location: "123 Main St, New York",
      date: "Jan 20, 2026",
      time: "09:00 - 17:00",
      rate: 45,
      rating: 4.9,
      distance: "2.3 mi",
      urgent: true,
    },
    {
      id: 2,
      title: "Dental Assistant",
      clinic: "City Health Clinic",
      location: "456 Oak Ave, Brooklyn",
      date: "Jan 21, 2026",
      time: "08:00 - 14:00",
      rate: 38,
      rating: 4.7,
      distance: "4.1 mi",
      urgent: false,
    },
    {
      id: 3,
      title: "Orthodontic Technician",
      clinic: "Family Dental Care",
      location: "789 Elm St, Queens",
      date: "Jan 22, 2026",
      time: "10:00 - 18:00",
      rate: 52,
      rating: 4.8,
      distance: "5.8 mi",
      urgent: false,
    },
    {
      id: 4,
      title: "Dental Hygienist",
      clinic: "Smile Plus Dentistry",
      location: "321 Park Blvd, Manhattan",
      date: "Jan 23, 2026",
      time: "07:00 - 15:00",
      rate: 48,
      rating: 4.6,
      distance: "1.5 mi",
      urgent: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search shifts by role, clinic, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              <Button variant="outline" className="shrink-0">
                <MapPin className="w-4 h-4 me-2" />
                Location
                <ChevronDown className="w-4 h-4 ms-2" />
              </Button>
              <Button variant="outline" className="shrink-0">
                <Calendar className="w-4 h-4 me-2" />
                Date
                <ChevronDown className="w-4 h-4 ms-2" />
              </Button>
              <Button variant="outline" className="shrink-0">
                <DollarSign className="w-4 h-4 me-2" />
                Pay Rate
                <ChevronDown className="w-4 h-4 ms-2" />
              </Button>
              <Button variant="outline" className="shrink-0">
                <Filter className="w-4 h-4 me-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Available Shifts</h1>
            <p className="text-sm text-muted-foreground">{shifts.length} shifts found near you</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={currentView === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setCurrentView("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={currentView === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setCurrentView("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Shift Grid */}
        <div className={currentView === "grid" 
          ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {shifts.map((shift) => (
            <Card 
              key={shift.id} 
              className="group hover:shadow-lg transition-all hover:border-primary/50"
            >
              <CardContent className={`p-4 ${currentView === "list" ? "flex items-center gap-4" : ""}`}>
                <div className={currentView === "list" ? "flex-1" : ""}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{shift.title}</h3>
                        {shift.urgent && (
                          <Badge variant="urgent" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{shift.clinic}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Details */}
                  <div className={`space-y-2 ${currentView === "list" ? "flex gap-6 space-y-0" : ""}`}>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{shift.location}</span>
                      <Badge variant="secondary" className="text-xs">{shift.distance}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{shift.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{shift.time}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`flex items-center justify-between mt-4 pt-4 border-t ${currentView === "list" ? "border-0 pt-0 mt-0" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">${shift.rate}/hr</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span>{shift.rating}</span>
                      </div>
                    </div>
                    <Button size="sm">Apply Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export const GridView: Story = {
  render: () => <ShiftSearchComponent viewMode="grid" />,
  parameters: {
    docs: {
      description: {
        story: "Shift search results displayed in a grid layout.",
      },
    },
  },
};

export const ListView: Story = {
  render: () => <ShiftSearchComponent viewMode="list" />,
  parameters: {
    docs: {
      description: {
        story: "Shift search results displayed in a list layout.",
      },
    },
  },
};
