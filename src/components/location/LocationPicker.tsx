import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Navigation, X } from "lucide-react";
import { useGeocoding } from "@/hooks/useGeocoding";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useTranslation } from "react-i18next";

interface LocationPickerProps {
  value?: {
    address: string;
    lat: number | null;
    lng: number | null;
  };
  onChange: (location: { address: string; lat: number | null; lng: number | null }) => void;
  placeholder?: string;
  className?: string;
}

// Custom debounce hook
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

const FALLBACK_LOCATION_SUGGESTIONS: SearchResult[] = [
  { display_name: "Riyadh, Saudi Arabia", lat: "24.7136", lon: "46.6753" },
  { display_name: "Jeddah, Saudi Arabia", lat: "21.5433", lon: "39.1728" },
  { display_name: "Mecca, Saudi Arabia", lat: "21.3891", lon: "39.8579" },
  { display_name: "Medina, Saudi Arabia", lat: "24.5247", lon: "39.5692" },
  { display_name: "Dammam, Saudi Arabia", lat: "26.4207", lon: "50.0888" },
  { display_name: "Khobar, Saudi Arabia", lat: "26.2172", lon: "50.1971" },
  { display_name: "Dubai, United Arab Emirates", lat: "25.2048", lon: "55.2708" },
  { display_name: "Abu Dhabi, United Arab Emirates", lat: "24.4539", lon: "54.3773" },
  { display_name: "Cairo, Egypt", lat: "30.0444", lon: "31.2357" },
  { display_name: "London, United Kingdom", lat: "51.5074", lon: "-0.1278" },
  { display_name: "New York, USA", lat: "40.7128", lon: "-74.0060" },
  { display_name: "San Francisco, CA, USA", lat: "37.7749", lon: "-122.4194" },
];

const LocationPicker = ({ value, onChange, placeholder, className = "" }: LocationPickerProps) => {
  const { t } = useTranslation();
  const { reverseGeocode, isLoading: isGeocoding } = useGeocoding();
  const { getCurrentLocation, isLoading: isGettingLocation } = useUserLocation();
  
  const [inputValue, setInputValue] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasNetworkResults, setHasNetworkResults] = useState(false);

  const debouncedInput = useDebounceValue(inputValue, 500);

  useEffect(() => {
    setInputValue(value?.address || "");
  }, [value?.address]);

  const buildFallbackSuggestions = (query: string): SearchResult[] => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return FALLBACK_LOCATION_SUGGESTIONS
      .filter((item) => item.display_name.toLowerCase().includes(normalized))
      .slice(0, 5);
  };

  // Search for address suggestions
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const searchAddresses = async () => {
      const query = debouncedInput.trim();
      if (query.length < 2) {
        setSuggestions([]);
        setHasNetworkResults(false);
        setShowSuggestions(false);
        setActiveIndex(-1);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
          {
            headers: { "Accept-Language": "en,ar" },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data = await response.json();

        if (!isMounted) return;

        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
          setHasNetworkResults(true);
        } else {
          setSuggestions(buildFallbackSuggestions(query));
          setHasNetworkResults(false);
        }

        setActiveIndex(-1);
        setShowSuggestions(true);
      } catch (error) {
        if (!isMounted || (error as Error).name === "AbortError") return;
        console.error("Failed to search addresses:", error);
        setSuggestions(buildFallbackSuggestions(query));
        setHasNetworkResults(false);
        setActiveIndex(-1);
        setShowSuggestions(true);
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    };

    searchAddresses();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedInput]);

  const handleSelectSuggestion = (suggestion: SearchResult) => {
    setInputValue(suggestion.display_name);
    onChange({
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setActiveIndex(-1);

    // Keep parent form in sync even before selecting from suggestions.
    onChange({
      address: text,
      lat: null,
      lng: null,
    });
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex]);
      return;
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleUseCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      const address = await reverseGeocode(location.lat, location.lng);
      if (address) {
        setInputValue(address);
        onChange({
          address,
          lat: location.lat,
          lng: location.lng,
        });
      }
    }
  };

  const handleClear = () => {
    setInputValue("");
    onChange({ address: "", lat: null, lng: null });
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const isLoading = isGeocoding || isGettingLocation || isSearching;

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (inputValue.trim().length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Let click events on suggestions run before hiding.
              setTimeout(() => setShowSuggestions(false), 120);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder || t("location.searchPlaceholder")}
            className="ps-10 pe-10"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="location-suggestions"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          title={t("location.useCurrentLocation")}
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div id="location-suggestions" className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {!hasNetworkResults && (
            <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/50">
              {t("location.popularSuggestions")}
            </div>
          )}
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full px-4 py-3 text-start text-sm transition-colors flex items-start gap-2 ${
                index === activeIndex ? "bg-secondary" : "hover:bg-secondary"
              }`}
            >
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{suggestion.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t("common.loading")}</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {showSuggestions && !isSearching && suggestions.length === 0 && inputValue.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-4">
          <p className="text-sm text-muted-foreground">{t("location.noResults")}</p>
        </div>
      )}

      {/* Location coordinates display */}
      {value?.lat && value?.lng && (
        <p className="text-xs text-muted-foreground mt-1">
          📍 {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
