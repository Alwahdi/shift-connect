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

const LocationPicker = ({ value, onChange, placeholder, className = "" }: LocationPickerProps) => {
  const { t } = useTranslation();
  const { geocode, reverseGeocode, isLoading: isGeocoding } = useGeocoding();
  const { getCurrentLocation, isLoading: isGettingLocation } = useUserLocation();
  
  const [inputValue, setInputValue] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedInput = useDebounceValue(inputValue, 500);

  // Search for address suggestions
  useEffect(() => {
    const searchAddresses = async () => {
      if (debouncedInput.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedInput)}&limit=5`,
          { headers: { "Accept-Language": "en,ar" } }
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to search addresses:", error);
      } finally {
        setIsSearching(false);
      }
    };

    searchAddresses();
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
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder || t("location.searchPlaceholder")}
            className="ps-10 pe-10"
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
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-start text-sm hover:bg-secondary transition-colors flex items-start gap-2"
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
