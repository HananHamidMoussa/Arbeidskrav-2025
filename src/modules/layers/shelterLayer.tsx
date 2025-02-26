import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Feature, Map, MapBrowserEvent, Overlay } from "ol";
import { GeoJSON } from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { Layer } from "ol/layer";
import { FeatureLike } from "ol/Feature";
import { CheckboxButton } from "../../widgets/checkboxButton";

function shelterStyle(feature: FeatureLike) {
  const plasser = feature.getProperties().plasser;
  let color: string;

  if (plasser < 100) {
    color = "green"; // For nødshelter med under 100 plasser
  } else if (plasser >= 100 && plasser <= 500) {
    color = "orange"; //
  } else {
    color = "red"; //
  }

  return new Style({
    image: new CircleStyle({
      radius: 3,
      fill: new Fill({ color: color }),
      stroke: new Stroke({ color: "rgba(0, 0, 0, 0.9)", width: 0.5 }),
    }),
  });
}

type TypedFeature<T> = { getProperties(): T } & Feature;

interface ShelterProperties {
  romnr: number;
  plasser: number;
  adresse: string;
}

const source = new VectorSource<TypedFeature<ShelterProperties>>({
  url: "Arbeidskrav-2025/public/geojson/emergency-shelters.geojson",
  format: new GeoJSON(),
});

const shelterLayer = new VectorLayer({ source, style: shelterStyle });
const overlay = new Overlay({
  autoPan: true,
  positioning: "bottom-center",
});

function ShelterLayer({ features }: { features: ShelterProperties[] }) {
  if (features.length >= 2) {
    return (
      <div>
        <h3>{features.length} shelters</h3>
        <ul>
          {features
            .slice()
            .sort((a, b) => a.adresse.localeCompare(b.adresse))
            .slice(0, 5)
            .map(({ adresse }) => (
              <li key={adresse}> {adresse} </li>
            ))}
          {features.length > 5 && <li>...</li>}
        </ul>
      </div>
    );
  } else if (features.length === 1) {
    return (
      <div>
        <h3> {features[0].adresse}</h3>
        <p>
          <strong>Romnr:</strong> {features[0].romnr}
          <br />
          <strong>Plasser:</strong> {features[0].plasser}
        </p>
      </div>
    );
  }
  return <div></div>;
}

export function ShelterLayers({
  setLayers,
  map,
}: {
  setLayers: Dispatch<SetStateAction<Layer[]>>; // Accepts all layers
  map: Map;
}) {
  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    const shelters = map
      .getFeaturesAtPixel(e.pixel, {
        layerFilter: (l) => l === shelterLayer, // Only get shelters
        hitTolerance: 5,
      })
      .map((f) => f.getProperties()) as ShelterProperties[];

    if (shelters.length > 0) {
      overlay.setPosition(e.coordinate);
    } else {
      overlay.setPosition(undefined);
    }
    setSelectedFeatures(shelters);
  }

  const [selectedFeatures, setSelectedFeatures] = useState<ShelterProperties[]>(
    [],
  );
  const [checked, setChecked] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => overlay.setElement(overlayRef.current || undefined), []);

  useEffect(() => {
    if (checked) {
      setLayers((old) => [...old, shelterLayer]);
      map.on("click", handleClick);
      map.addOverlay(overlay);
    }
    return () => {
      overlay.setPosition(undefined);
      map.removeOverlay(overlay);
      map.un("click", handleClick);
      setLayers((old) => old.filter((l) => l !== shelterLayer));
    };
  }, [checked]);

  return (
    <CheckboxButton checked={checked} onClick={() => setChecked((s) => !s)}>
      Show Shelters
      <div ref={overlayRef} className={"overlay"}>
        <ShelterLayer features={selectedFeatures} />
      </div>
    </CheckboxButton>
  );
}
