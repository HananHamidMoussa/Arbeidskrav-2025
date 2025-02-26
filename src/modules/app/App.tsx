import React, { useEffect, useRef } from "react";
import { Feature, Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Fill, Stroke, Style, Text } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { FeatureLike } from "ol/Feature";

useGeographic();

function originalStyle(feature: FeatureLike) {
  return new Style({
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
  });
}

function hoverStyle(_feature: FeatureLike) {
  return new Style({
    fill: new Fill({ color: "rgba(19,119,1,0.44)" }),
  });
}

const civilDefenseLayer = new VectorLayer({
  source: new VectorSource({
    url: "Arbeidskrav-2025/public/geojson/civil-defence.geojson",
    format: new GeoJSON(),
  }),
  style: originalStyle,
});

const emergencySheltersLayer = new VectorLayer({
  source: new VectorSource({
    url: "Arbeidskrav-2025/public/geojson/emergency-shelters.geojson",
    format: new GeoJSON(),
  }),
  style: new Style({
    image: new CircleStyle({
      radius: 3,
      fill: new Fill({ color: "rgba(255, 0, 0, 0.7)" }),
      stroke: new Stroke({ color: "rgba(0, 0, 0, 0.9)", width: 0.5 }),
    }),
  }),
});

const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    civilDefenseLayer,
    emergencySheltersLayer,
  ],
  view: new View({ center: [10, 60], zoom: 7 }),
});

export function App() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const focusFeatures = useRef<Feature[]>([]);

  function handlePointerMove(e: MapBrowserEvent<MouseEvent>) {
    for (const feature of focusFeatures.current) {
      feature.setStyle(originalStyle(feature));
    }

    const features = civilDefenseLayer
      .getSource()!
      .getFeaturesAtCoordinate(e.coordinate);

    if (features.length === 0) {
      focusFeatures.current = [];
      return;
    }

    for (const feature of features) {
      feature.setStyle(hoverStyle(feature));
    }

    focusFeatures.current = features;
  }

  useEffect(() => {
    map.setTarget(mapRef.current!);
    map.on("pointermove", handlePointerMove);
  }, []);

  return <div ref={mapRef}></div>;
}
