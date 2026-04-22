import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import DashboardPage from "./pages/DashboardPage";
import {
  addLocation,
  fetchLocationQueue,
  fetchLocations,
  resetQueue,
  sendGpsCheckin,
  updateQueue,
} from "./services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [gpsStatus, setGpsStatus] = useState(
    "GPS crowd sharing is off. Turn it on to contribute anonymous nearby presence."
  );
  const gpsWatchIdRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const allLocations = await fetchLocations();
        if (!isMounted) {
          return;
        }

        setLocations(allLocations);

        const initialLocationId = allLocations[0]?.id || "";
        setSelectedLocationId(initialLocationId);

        if (initialLocationId) {
          const queueData = await fetchLocationQueue(initialLocationId);
          if (isMounted) {
            setSelectedLocation(queueData);
          }
        }
      } catch (_error) {
        if (isMounted) {
          setError("Unable to load queue data right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = io(API_URL);

    socket.on("locations:updated", ({ locations: nextLocations }) => {
      setLocations(nextLocations);

      const currentLocation =
        nextLocations.find((location) => location.id === selectedLocationId) ||
        nextLocations[0] ||
        null;

      if (currentLocation) {
        setSelectedLocationId(currentLocation.id);
        setSelectedLocation(currentLocation);

        if (currentLocation.waitingTime < 5) {
          setNotification(
            `${currentLocation.name} is nearly empty. Waiting time is under 5 minutes.`
          );
          window.setTimeout(() => setNotification(""), 4000);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedLocationId]);

  useEffect(() => {
    if (!selectedLocationId) {
      return;
    }

    const nextLocation =
      locations.find((location) => location.id === selectedLocationId) || null;

    if (nextLocation) {
      setSelectedLocation(nextLocation);
    }
  }, [locations, selectedLocationId]);

  useEffect(() => {
    return () => {
      if (gpsWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      }
    };
  }, []);

  async function handleSelectLocation(locationId) {
    setSelectedLocationId(locationId);
    setIsLoading(true);

    try {
      const queueData = await fetchLocationQueue(locationId);
      setSelectedLocation(queueData);
      setError("");
    } catch (_error) {
      setError("Unable to load that location.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleQueueUpdate(people) {
    if (!selectedLocationId) {
      return;
    }

    setIsSaving(true);

    try {
      await updateQueue(selectedLocationId, people);
      setError("");
    } catch (_error) {
      setError("Queue update failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddLocation(formData) {
    setIsSaving(true);

    try {
      const response = await addLocation(formData);
      setSelectedLocationId(response.location.id);
      setError("");
    } catch (addError) {
      setError(addError.message || "Unable to add location.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResetQueue(locationId) {
    setIsSaving(true);

    try {
      await resetQueue(locationId);
      setError("");
    } catch (_error) {
      setError("Queue reset failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function sendCurrentPosition(position) {
    const storedUserId =
      window.localStorage.getItem("queuesmart-gps-user") ||
      `gps-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    window.localStorage.setItem("queuesmart-gps-user", storedUserId);

    await sendGpsCheckin({
      userId: storedUserId,
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
  }

  function handleStartGpsSharing() {
    if (!navigator.geolocation) {
      setGpsStatus("This browser does not support live geolocation.");
      return;
    }

    setGpsStatus("Requesting GPS permission...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await sendCurrentPosition(position);
          setGpsStatus("GPS crowd sharing is active. Your nearby presence is now counted.");
        } catch (_error) {
          setGpsStatus("Unable to send the first GPS crowd update.");
        }
      },
      () => {
        setGpsStatus("GPS permission was denied or unavailable.");
      },
      {
        enableHighAccuracy: true,
      }
    );

    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
    }

    gpsWatchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await sendCurrentPosition(position);
          setGpsStatus("Live GPS crowd sharing is running.");
        } catch (_error) {
          setGpsStatus("GPS update failed. We will try again on the next position update.");
        }
      },
      () => {
        setGpsStatus("Live GPS tracking stopped because location access failed.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
      }
    );
  }

  return (
    <DashboardPage
      error={error}
      gpsStatus={gpsStatus}
      isDarkMode={isDarkMode}
      isLoading={isLoading}
      isSaving={isSaving}
      locations={locations}
      notification={notification}
      onAddLocation={handleAddLocation}
      onResetQueue={handleResetQueue}
      onSelectLocation={handleSelectLocation}
      onStartGpsSharing={handleStartGpsSharing}
      onToggleTheme={() => setIsDarkMode((current) => !current)}
      onUpdateQueue={handleQueueUpdate}
      selectedLocation={selectedLocation}
      selectedLocationId={selectedLocationId}
    />
  );
}

export default App;
