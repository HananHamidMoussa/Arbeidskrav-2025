import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { Feature, Map, MapBrowserEvent } from "ol";
import { useGeographic } from "ol/proj";
import "ol/ol.css";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Fill, Stroke, Style, Text } from "ol/style";

import { FeatureLike } from "ol/Feature";
import { Layer } from "ol/layer";

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

export function CivilDefenseLayer({
  setLayers,
  map,
}: {
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  map: Map;
}) {
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
    setLayers((old) => [...old, civilDefenseLayer]);
    map.on("pointermove", handlePointerMove);

    return () => {
      map.un("pointermove", handlePointerMove);
      setLayers((old: any[]) => old.filter((l) => l !== civilDefenseLayer));
    };
  }, []);

  return null;
}
