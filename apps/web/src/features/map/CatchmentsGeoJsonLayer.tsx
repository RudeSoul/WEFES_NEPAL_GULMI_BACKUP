import { GeoJSON } from "react-leaflet";

interface CatchmentsGeoJsonLayerProps {
  data: any;
}

/**
 * HydroBASINS / Pfafstetter classification.
 *
 * For a Level 10 dataset, the 10th Pfafstetter digit is used when
 * the supplied PFAF_ID contains the complete hierarchy.
 *
 * Pfafstetter convention:
 *   - Even basin numbers: sub-basins
 *   - Odd basin numbers: inter-basins
 *
 * NOTE:
 * Do not use ORDER to redefine Pfafstetter type. ORDER is a separate
 * drainage/network attribute.
 */
const getTopologicalColor = (
  properties: any,
): {
  color: string;
  label: string;
  level10Digit: number | null;
} => {
  const pfafId = String(properties?.PFAF_ID ?? "")
    .trim()
    .replace(/\s+/g, "");

  // Require a valid numeric Pfafstetter code.
  if (!/^\d+$/.test(pfafId)) {
    return {
      color: "#94a3b8",
      label: "Unknown Pfafstetter Type",
      level10Digit: null,
    };
  }

  /*
   * HydroBASINS L10 should contain at least 10 hierarchical digits
   * when PFAF_ID is represented as the complete Pfafstetter code.
   */
  if (pfafId.length < 10) {
    return {
      color: "#94a3b8",
      label: "Incomplete Pfafstetter Code",
      level10Digit: null,
    };
  }

  const level10Digit = Number(pfafId.charAt(9));

  if (level10Digit === 0) {
    return {
      color: "#94a3b8",
      label: "Invalid Level 10 Code",
      level10Digit,
    };
  }

  // Even Pfafstetter codes represent sub-basins.
  if (level10Digit % 2 === 0) {
    return {
      color: "#38bdf8",
      label: "Sub-basin",
      level10Digit,
    };
  }

  // Odd Pfafstetter codes represent inter-basins.
  return {
    color: "#bae6fd",
    label: "Inter-basin",
    level10Digit,
  };
};

export function CatchmentsGeoJsonLayer({ data }: CatchmentsGeoJsonLayerProps) {
  return (
    <GeoJSON
      key="hydrobasins-l10-layer"
      data={data}
      pane="palikasPane"
      style={(feature: any) => {
        const { color: fillColor } = getTopologicalColor(feature?.properties);

        return {
          fillColor,
          fillOpacity: 0.65,
          color: "#0369a1",
          weight: 1.5,
          opacity: 0.9,
        };
      }}
      onEachFeature={(feature: any, layer: any) => {
        const p = feature?.properties ?? {};

        const {
          color: fillColor,
          label: topologicalLabel,
          level10Digit,
        } = getTopologicalColor(p);

        const order = p.ORDER;
        const subArea = p.SUB_AREA;
        const upArea = p.UP_AREA;
        const distSink = p.DIST_SINK;
        const pfafId = p.PFAF_ID;

        layer.bindTooltip(
          `
            <div
              style="
                padding: 7px 10px;
                font-size: 11px;
                min-width: 230px;
                font-family: sans-serif;
              "
            >
              <div
                style="
                  font-weight: 800;
                  color: #0369a1;
                  border-bottom: 1px solid #e2e8f0;
                  padding-bottom: 5px;
                  margin-bottom: 6px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  gap: 8px;
                "
              >
                <span>🏔️ HydroBASINS</span>

                <span
                  style="
                    font-size: 9px;
                    background: #e0f2fe;
                    color: #0369a1;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 700;
                    white-space: nowrap;
                  "
                >
                  Level 10
                </span>
              </div>

              <div
                style="
                  color: #0f172a;
                  font-size: 11px;
                  margin-bottom: 6px;
                "
              >
                <strong>Pfafstetter Type:</strong>

                <span
                  style="
                    color: ${fillColor};
                    font-weight: 700;
                    margin-left: 4px;
                  "
                >
                  ${topologicalLabel}
                </span>
              </div>

              <div
                style="
                  color: #334155;
                  font-size: 10.5px;
                  margin-bottom: 3px;
                "
              >
                <strong>Level 10 Digit:</strong>
                ${level10Digit ?? "N/A"}
              </div>

              <div
                style="
                  color: #334155;
                  font-size: 10.5px;
                  margin-bottom: 3px;
                "
              >
                <strong>Local Unit Area:</strong>
                ${formatNumber(subArea)} km²
              </div>

              <div
                style="
                  color: #334155;
                  font-size: 10.5px;
                  margin-bottom: 3px;
                "
              >
                <strong>Upstream Area:</strong>
                ${formatNumber(upArea)} km²
              </div>

              <div
                style="
                  color: #475569;
                  font-size: 10px;
                  margin-top: 5px;
                  padding-top: 5px;
                  border-top: 1px dashed #e2e8f0;
                "
              >
                <strong>Drainage Order:</strong>
                ${order ?? "N/A"}
              </div>

              <div
                style="
                  color: #64748b;
                  font-size: 9.5px;
                  margin-top: 2px;
                "
              >
                Pfafstetter Code:
                <strong>${pfafId ?? "N/A"}</strong>
              </div>

              <div
                style="
                  color: #64748b;
                  font-size: 9.5px;
                  margin-top: 2px;
                "
              >
                Distance to Sink:
                <strong>${formatNumber(distSink)}</strong> km
              </div>
            </div>
          `,
          {
            direction: "top",
            offset: [0, -6],
            opacity: 0.98,
            pane: "popupPane",
          },
        );

        layer.on({
          mouseover: (event: any) => {
            event.target.setStyle({
              fillOpacity: 0.85,
              weight: 2.5,
              color: "#ffffff",
            });

            event.target.bringToFront();
          },

          mouseout: (event: any) => {
            event.target.setStyle({
              fillColor,
              fillOpacity: 0.65,
              color: "#0369a1",
              weight: 1.5,
              opacity: 0.9,
            });
          },
        });
      }}
    />
  );
}

/**
 * Keeps tooltip values readable while safely handling
 * null, undefined and non-numeric values.
 */
function formatNumber(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}
