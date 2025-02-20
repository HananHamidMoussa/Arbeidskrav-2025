import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";

import "ol/ol.css";

import { Layer } from "ol/layer";

useGeographic();

const view = new View({ center: [10.8, 59.9], zoom: 10 });
const map = new Map({ view });

function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    return () => map.setTarget(undefined);
  }, []);
  return <div ref={mapRef}></div>;
}

export function Application() {
  const [layers, setLayers] = useState<Layer[]>([
    new TileLayer({ source: new OSM() }),
  ]);
  useEffect(() => map.setLayers(layers), [layers]);
  return (
    <>
      <header>
        <h1>Skoler i Norge</h1>
      </header>
      <nav></nav>
      <MapView />
    </>
  );
}
