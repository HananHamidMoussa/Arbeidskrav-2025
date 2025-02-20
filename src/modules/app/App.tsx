import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";

useGeographic();

const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),

    new VectorLayer({
      source: new VectorSource({
        url: "Arbeidskrav-2025/public/geojson/emergency-shelters.geojson",
        format: new GeoJSON(),
      }),
    }),
  ],

  view: new View({ center: [15, 65.3], zoom: 5 }),
});

export function App() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  return <div ref={mapRef}></div>;
}
