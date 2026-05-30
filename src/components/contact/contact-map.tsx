"use client";

import {
  Map,
  MapTileLayer,
  MapMarker,
  MapPopup,
  MapZoomControl,
} from "@/components/ui/map";
import { MapPinIcon } from "lucide-react";

const SF_CENTER = [37.7749, -122.4194] as [number, number];

export function ContactMap() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/50">
      <Map
        center={SF_CENTER}
        zoom={13}
        scrollWheelZoom={false}
        className="h-[240px] min-h-0 rounded-xl"
      >
        <MapTileLayer />
        <MapMarker
          position={SF_CENTER}
          icon={
            <div className="flex items-center justify-center size-8 rounded-full bg-primary/70 text-primary-foreground shadow-lg ring-2 ring-background">
              <MapPinIcon className="size-4" />
            </div>
          }
          iconAnchor={[16, 16]}
          popupAnchor={[0, -20]}
        >
          <MapPopup>
            <div className="text-center text-sm">
              <p className="font-semibold">SaaSTARTER</p>
              <p className="text-muted-foreground">San Francisco, CA</p>
            </div>
          </MapPopup>
        </MapMarker>
        <MapZoomControl />
      </Map>
    </div>
  );
}
