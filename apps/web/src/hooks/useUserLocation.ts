import { useState, useCallback } from "react";

interface UserLocation {
  lat: number;
  lng: number;
}

interface UseUserLocationReturn {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<UserLocation | null>;
}

export const useUserLocation = (): UseUserLocationReturn => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(userLocation);
          setIsLoading(false);
          resolve(userLocation);
        },
        (err) => {
          let errorMessage = "Failed to get location";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          setError(errorMessage);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    });
  }, []);

  return { location, isLoading, error, getCurrentLocation };
};
