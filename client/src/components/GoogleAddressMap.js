import React, { useDeferredValue, useEffect, useRef, useState } from "react";
import { getMapEmbedUrl } from "../ultils/Common/systemPost";

const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 };

let googleMapsLoader = null;

const loadGoogleMaps = (apiKey) => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsLoader) {
    return googleMapsLoader;
  }

  googleMapsLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      "script[data-google-maps-loader='true']",
    );

    const handleReady = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps failed to initialize"));
      }
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleReady, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Maps")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=vi&region=VN`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "true";
    script.onload = handleReady;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  }).catch((error) => {
    googleMapsLoader = null;
    throw error;
  });

  return googleMapsLoader;
};

const GoogleAddressMap = ({
  address = "",
  className = "",
  emptyMessage = "Nhập địa chỉ cụ thể để bản đồ định vị chính xác hơn.",
}) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const deferredAddress = useDeferredValue(String(address || "").trim());
  const [status, setStatus] = useState("idle");
  const [matchedAddress, setMatchedAddress] = useState("");

  useEffect(() => {
    if (!deferredAddress) {
      setStatus("idle");
      setMatchedAddress("");
      return undefined;
    }

    if (!apiKey) {
      setStatus("fallback");
      setMatchedAddress("");
      return undefined;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setStatus("loading");
        const maps = await loadGoogleMaps(apiKey);
        if (isCancelled || !mapElementRef.current) return;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new maps.Map(mapElementRef.current, {
            center: DEFAULT_CENTER,
            zoom: 14,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "cooperative",
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
          });
          markerRef.current = new maps.Marker({
            map: mapInstanceRef.current,
          });
          geocoderRef.current = new maps.Geocoder();
        }

        geocoderRef.current.geocode(
          {
            address: deferredAddress,
            componentRestrictions: { country: "VN" },
          },
          (results, geocodeStatus) => {
            if (isCancelled) return;

            if (geocodeStatus === "OK" && results?.[0]?.geometry?.location) {
              const location = results[0].geometry.location;
              mapInstanceRef.current.setCenter(location);
              mapInstanceRef.current.setZoom(16);
              markerRef.current.setPosition(location);
              setMatchedAddress(results[0].formatted_address || "");
              setStatus("ready");
              return;
            }

            setMatchedAddress("");
            setStatus("error");
          },
        );
      } catch (error) {
        if (!isCancelled) {
          setMatchedAddress("");
          setStatus("fallback");
        }
      }
    }, 450);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [apiKey, deferredAddress]);

  if (!deferredAddress) {
    return (
      <div
        className={`flex h-full min-h-[280px] items-center justify-center bg-slate-50 px-6 text-center text-sm leading-7 text-slate-500 ${className}`}
      >
        {emptyMessage}
      </div>
    );
  }

  if (status === "fallback") {
    return (
      <div
        className={`relative h-full min-h-[280px] bg-slate-100 ${className}`}
      >
        <iframe
          title="google-map-embed"
          className="h-full w-full border-0"
          src={getMapEmbedUrl(deferredAddress)}
        />
        <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/70 bg-white/92 px-3 py-2 text-xs leading-6 text-slate-500 shadow-sm">
          Đang dùng bản đồ nhúng để xem nhanh vị trí.
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full min-h-[280px] bg-slate-100 ${className}`}>
      <div ref={mapElementRef} className="h-full w-full" />

      {status === "loading" ? (
        <div className="absolute inset-x-4 top-4 rounded-xl border border-white/70 bg-white/92 px-3 py-2 text-xs font-medium leading-6 text-slate-500 shadow-sm">
          Đang tìm vị trí theo địa chỉ đã nhập...
        </div>
      ) : null}

      {matchedAddress ? (
        <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/70 bg-white/92 px-3 py-2 text-xs leading-6 text-slate-500 shadow-sm">
          Google Maps định vị:{" "}
          <span className="font-semibold text-slate-700">{matchedAddress}</span>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="absolute inset-x-4 bottom-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-700 shadow-sm">
          Chưa định vị chính xác. Hãy kiểm tra lại tỉnh, quận/huyện hoặc địa chỉ
          chi tiết.
        </div>
      ) : null}
    </div>
  );
};

export default GoogleAddressMap;
