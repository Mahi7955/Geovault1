import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const LocationPicker = ({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedLat, setSelectedLat] = useState(initialLat || 0);
  const [selectedLng, setSelectedLng] = useState(initialLng || 0);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      toast.error("Google Maps API key not configured");
      setLoading(false);
      return;
    }

    // Check if script is already loaded
    if (window.google && window.google.maps) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      toast.error("Failed to load Google Maps");
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;

    const initMap = () => {
      try {
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: initialLat || 0, lng: initialLng || 0 },
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        setMap(mapInstance);

        // Add click listener to map
        mapInstance.addListener("click", async (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            updateMarker(lat, lng, mapInstance);
            await reverseGeocode(lat, lng);
          }
        });

        // Get current location
        if (navigator.geolocation && !initialLat) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              mapInstance.setCenter({ lat, lng });
              updateMarker(lat, lng, mapInstance);
              await reverseGeocode(lat, lng);
              setLoading(false);
            },
            (error) => {
              console.error("Error getting location:", error);
              toast.error("Could not get your location");
              setLoading(false);
            }
          );
        } else if (initialLat && initialLng) {
          updateMarker(initialLat, initialLng, mapInstance);
          reverseGeocode(initialLat, initialLng);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading map:", error);
        toast.error("Failed to load map");
        setLoading(false);
      }
    };

    initMap();
  }, [scriptLoaded]);

  const updateMarker = (lat: number, lng: number, mapInstance: google.maps.Map) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    onLocationSelect(lat, lng);

    if (marker) {
      marker.setPosition({ lat, lng });
    } else {
      const newMarker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      newMarker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          setSelectedLat(newLat);
          setSelectedLng(newLng);
          onLocationSelect(newLat, newLng);
          reverseGeocode(newLat, newLng);
        }
      });

      setMarker(newMarker);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const geocodeAddress = async () => {
    if (!address.trim()) {
      toast.error("Please enter an address");
      return;
    }

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]?.geometry.location) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          
          if (map) {
            map.setCenter({ lat, lng });
            updateMarker(lat, lng, map);
          }
          
          toast.success("Location found!");
        } else {
          toast.error("Location not found");
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to find location");
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (map) {
          map.setCenter({ lat, lng });
          updateMarker(lat, lng, map);
          await reverseGeocode(lat, lng);
        }
        
        toast.success("Using your current location");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Could not get your location");
      }
    );
  };

  const handleManualCoordinates = () => {
    if (!selectedLat || !selectedLng) {
      toast.error("Please enter valid coordinates");
      return;
    }

    if (map) {
      map.setCenter({ lat: selectedLat, lng: selectedLng });
      updateMarker(selectedLat, selectedLng, map);
      reverseGeocode(selectedLat, selectedLng);
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-border">
        <div ref={mapRef} className="w-full h-[400px]" />
        {loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Address Search */}
      <div className="space-y-2">
        <Label>Search Location by Address</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter address or place name"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && geocodeAddress()}
            className="flex-1"
          />
          <Button onClick={geocodeAddress} variant="outline">
            <MapPin className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Manual Coordinates */}
      <div className="space-y-2">
        <Label>Or Enter Coordinates Manually</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            step="any"
            placeholder="Latitude"
            value={selectedLat || ""}
            onChange={(e) => setSelectedLat(parseFloat(e.target.value))}
          />
          <Input
            type="number"
            step="any"
            placeholder="Longitude"
            value={selectedLng || ""}
            onChange={(e) => setSelectedLng(parseFloat(e.target.value))}
          />
        </div>
        <Button onClick={handleManualCoordinates} variant="outline" className="w-full">
          Use These Coordinates
        </Button>
      </div>

      {/* Current Location Button */}
      <Button onClick={useCurrentLocation} variant="outline" className="w-full">
        <Navigation className="w-4 h-4 mr-2" />
        Use My Current Location
      </Button>

      {/* Selected Location Info */}
      {selectedLat !== 0 && selectedLng !== 0 && (
        <div className="p-3 bg-accent/10 border border-border rounded-lg space-y-1">
          <p className="text-sm font-medium">Selected Location:</p>
          <p className="text-xs text-muted-foreground">
            {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
          </p>
          {address && (
            <p className="text-xs text-muted-foreground mt-1">{address}</p>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        💡 Click anywhere on the map to set the restricted location, or drag the marker to adjust
      </p>
    </div>
  );
};

export default LocationPicker;
