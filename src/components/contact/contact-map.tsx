"use client";

import {
  Map,
  MapTileLayer,
  MapMarker,
  MapPopup,
  MapZoomControl,
} from "@/components/ui/map";
import { MapPinIcon } from "lucide-react";

const MAADI_CENTER = [29.9602, 31.2569] as [number, number];

export function ContactMap() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/50">
      <Map
        center={MAADI_CENTER}
        zoom={15}
        scrollWheelZoom={false}
        className="h-[240px] min-h-0 rounded-xl"
      >
        <MapTileLayer />
        <MapMarker
          position={MAADI_CENTER}
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
              <p className="font-semibold">Koffee Kulture</p>
              <p className="text-muted-foreground">Degla, Maadi · Cairo</p>
            </div>
          </MapPopup>
        </MapMarker>
        <MapZoomControl />
      </Map>
    </div>
  );
}
