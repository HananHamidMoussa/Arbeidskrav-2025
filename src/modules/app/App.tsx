import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";
import "./App.css";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { Layer } from "ol/layer";
import { ShelterLayers } from "../layers/shelterLayer";
import { CivilDefenseLayer } from "../layers/civilDefenseLayer";

useGeographic();

const userSource = new VectorSource();
const view = new View({ center: [10, 60], zoom: 7 });
const map = new Map({ view });

/*
const map = new Map({
 layers: [
   new TileLayer({ source: new OSM() }),

   new VectorLayer({
     source: new VectorSource({
       url: "Arbeidskrav-2025/public/geojson/civil-defence.geojson",
       format: new GeoJSON(),
     }),

     style: (feature) =>
       new Style({
         stroke: new Stroke({
           color: "green",
           width: 2,
         }),
         fill: new Fill({
           color: "white",
         }),
         text: new Text({
           text: feature.getProperties().navn,
           fill: new Fill({ color: "green" }),
           stroke: new Stroke({ color: "white", width: 2 }),
         }),
       }),
   }),

   new VectorLayer({
     source: new VectorSource({
       url: "Arbeidskrav-2025/public/geojson/emergency-shelters.geojson",
       format: new GeoJSON(),
     }),
     style: defaultStyle,
   }),
 ],


});

*/

function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    return () => map.setTarget(undefined);
  }, []);
  return <div ref={mapRef}></div>;
}

export function App() {
  const [layers, setLayers] = useState<Layer[]>([
    new TileLayer({ source: new OSM() }),
    new VectorLayer({
      source: userSource,
    }),
  ]);
  useEffect(() => map.setLayers(layers), [layers]);
  return (
    <>
      <header></header>
      <nav>
        <ShelterLayers setLayers={setLayers} map={map} />
        <CivilDefenseLayer setLayers={setLayers} map={map} />
      </nav>
      <MapView />
    </>
  );
}
