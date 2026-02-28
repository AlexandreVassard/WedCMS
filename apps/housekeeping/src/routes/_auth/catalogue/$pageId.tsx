import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_auth/catalogue/$pageId")({
  component: CataloguePageEditPage,
});

interface CataloguePage {
  id: number;
  name: string;
  nameIndex: string;
  layout: string;
  minRole: number;
  indexVisible: number;
  isClubOnly: number;
  imageHeadline: string;
  imageTeasers: string;
  body: string;
  linkList: string;
  labelPick: string;
  labelExtraS: string;
  labelExtraT: string;
}

function parseTeasers(raw: string): string[] {
  return (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseLabelExtraT(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((l) => l.replace(/^\d+:/, "").trim())
    .filter(Boolean);
}

// ─── Preview sub-components ───────────────────────────────────────────────────

function HeaderImg({
  name,
  width,
  height,
}: {
  name: string;
  width: number;
  height: number;
}) {
  const [missing, setMissing] = useState(false);
  useEffect(() => setMissing(false), [name]);
  if (!name || missing) {
    return (
      <div
        style={{ width, height, background: "#ccc" }}
        className="flex items-center justify-center text-gray-500 font-mono"
      >
        {name || "no headline"}
      </div>
    );
  }
  return (
    <img
      src={`/images/catalog-headers/${name}.gif`}
      width={width}
      height={height}
      style={{ display: "block", objectFit: "fill" }}
      onError={() => setMissing(true)}
      draggable={false}
    />
  );
}

function TeaserImg({
  name,
  maxHeight = 160,
}: {
  name: string;
  maxHeight?: number;
}) {
  const [missing, setMissing] = useState(false);
  useEffect(() => setMissing(false), [name]);
  if (missing) {
    return (
      <div
        style={{ minWidth: 50, height: 100, background: "#bbb" }}
        className="flex items-center justify-center text-gray-500 font-mono text-center p-1"
      >
        {name}
      </div>
    );
  }
  return (
    <img
      src={`/images/catalog-teasers/${name}.gif`}
      style={{ display: "block", maxHeight }}
      onError={() => setMissing(true)}
      draggable={false}
    />
  );
}

function StarburstBadge({ text, size = 80 }: { text: string; size?: number }) {
  const words = text.trim().split(/\s+/);
  const half = size / 2;
  const outer = half - 2;
  const inner = Math.round(outer * 0.62);
  const points = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? outer : inner;
    return `${half + r * Math.cos(a)},${half + r * Math.sin(a)}`;
  }).join(" ");
  const lineH = 11;
  const startY = Math.round(
    half - (Math.min(words.length, 4) * lineH) / 2 + lineH * 0.75,
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <polygon
        points={points}
        fill="#FFCC33"
        stroke="#CC9900"
        strokeWidth="1.5"
      />
      {words.slice(0, 4).map((w, i) => (
        <text
          key={i}
          x={half}
          y={startY + i * lineH}
          textAnchor="middle"
          fontSize="8"
          fill="#663300"
          fontWeight="bold"
        >
          {w}
        </text>
      ))}
    </svg>
  );
}

function BodyText({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p style={{ lineHeight: "13px", color: "#333", whiteSpace: "pre-wrap" }}>
      {text}
    </p>
  );
}

function ProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 32,
            height: 32,
            background: "#d8d8d8",
            border: "1px solid #bbb",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function PriceBar() {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
    >
      <div
        style={{
          color: "#555",
          background: "#e0e0e0",
          padding: "1px 4px",
          border: "1px solid #bbb",
        }}
      >
        — credits
      </div>
      <div
        style={{
          background: "#6a6",
          color: "#fff",
          padding: "1px 6px",
          border: "1px solid #484",
        }}
      >
        Buy
      </div>
    </div>
  );
}

// ─── Layout renderers ─────────────────────────────────────────────────────────
// Content area is 320×407 with bg #eeeeee
// Header image is 286×60 (standard) or 292×147 (frontpage)
// All positioned inside that space

type P = { page: Partial<CataloguePage>; teasers: string[]; labels: string[] };

function Layout_frontpage2({ page, teasers }: P) {
  // Large 292×147 header, then teasers in a row, then body
  const hLeft = Math.round((320 - 292) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={292} height={147} />
      </div>
      {teasers.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginTop: 5, paddingLeft: 4 }}>
          {teasers.map((t) => (
            <TeaserImg key={t} name={t} />
          ))}
        </div>
      )}
      <div style={{ padding: "4px 6px 0 6px" }}>
        <BodyText text={page.body ?? ""} />
        {page.labelExtraS && (
          <p style={{ fontWeight: "bold", marginTop: 3 }}>{page.labelExtraS}</p>
        )}
      </div>
    </div>
  );
}

function Layout_layout2({ page, teasers }: P) {
  // Real layout: full-width header → full-width body text → two columns
  // (left: "Select product:" + 3×3 grid | right: teaser image)
  // Starburst badge floats in upper-right, overlapping body text / teaser top
  const hLeft = Math.round((320 - 286) / 2); // 17px
  const extraS = page.labelExtraS ?? "";
  const extraSText = extraS.includes(":")
    ? extraS.split(":").slice(1).join(":").trim()
    : extraS;

  return (
    <div style={{ paddingTop: 6, position: "relative" }}>
      {/* Header: 286×60, centered */}
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>

      {/* Body text: full content width */}
      <div style={{ padding: "5px 8px 0 8px" }}>
        <BodyText text={page.body ?? ""} />
      </div>

      {/* Two-column section */}
      <div style={{ display: "flex", marginTop: 8 }}>
        {/* Left: "Select product:" + 3-col item grid */}
        <div style={{ width: 135, paddingLeft: 6, flexShrink: 0 }}>
          <p style={{ color: "#333", marginBottom: 4 }}>Select product:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  background: "#cbcbcb",
                  border: "1px solid #aaa",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: teaser image */}
        <div style={{ flex: 1, paddingLeft: 2 }}>
          {teasers.length > 0 && (
            <TeaserImg name={teasers[0]} maxHeight={230} />
          )}
        </div>
      </div>

      {/* Starburst: absolutely positioned upper-right, overlapping body+teaser area */}
      {extraS && (
        <div
          style={{
            position: "absolute",
            left: 148,
            top: 72,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <StarburstBadge text={extraSText} size={80} />
        </div>
      )}

      {/* labelPick at bottom center */}
      {page.labelPick && (
        <p style={{ textAlign: "center", color: "#444", marginTop: 8 }}>
          {page.labelPick}
        </p>
      )}
    </div>
  );
}

function Layout_productpage({ page, teasers }: P) {
  // Single product: 286×60 header, large preview image, details
  const hLeft = Math.round((320 - 286) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 5, padding: "0 6px" }}>
        {teasers.length > 0 ? (
          <div style={{ flexShrink: 0 }}>
            <TeaserImg name={teasers[0]} />
            {teasers.slice(1).map((t) => (
              <TeaserImg key={t} name={t} />
            ))}
          </div>
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              background: "#ccc",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
            }}
          >
            preview
          </div>
        )}
        <div style={{ flex: 1 }}>
          <BodyText text={page.body ?? ""} />
          {page.labelPick && (
            <p style={{ fontStyle: "italic", color: "#666", marginTop: 3 }}>
              {page.labelPick}
            </p>
          )}
          <PriceBar />
        </div>
      </div>
    </div>
  );
}

function Layout_spaces({ page, labels }: P) {
  const hLeft = Math.round((320 - 286) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>
      <div style={{ padding: "5px 6px 0 6px" }}>
        <BodyText text={page.body ?? ""} />
        {labels.length > 0 && (
          <div
            style={{
              marginTop: 6,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {labels.map((l, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <span style={{ color: "#555", width: 50, flexShrink: 0 }}>
                  {l}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 18,
                    background: "#d8d8d8",
                    border: "1px solid #bbb",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Layout_presents({ page, teasers }: P) {
  const hLeft = Math.round((320 - 286) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>
      {teasers.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginTop: 5, paddingLeft: 4 }}>
          {teasers.map((t) => (
            <TeaserImg key={t} name={t} />
          ))}
        </div>
      )}
      <div style={{ padding: "5px 6px 0 6px" }}>
        <BodyText text={page.body ?? ""} />
        <div
          style={{
            marginTop: 6,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#555", width: 48 }}>Recipient</span>
            <div
              style={{
                flex: 1,
                height: 16,
                background: "#fff",
                border: "1px solid #999",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#555", width: 48 }}>Message</span>
            <div
              style={{
                flex: 1,
                height: 16,
                background: "#fff",
                border: "1px solid #999",
              }}
            />
          </div>
        </div>
        <ProductGrid count={8} />
        <PriceBar />
      </div>
    </div>
  );
}

function Layout_pets({ page, teasers, labels }: P) {
  const hLeft = Math.round((320 - 286) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 5, padding: "0 6px" }}>
        {teasers.length > 0 && (
          <div style={{ flexShrink: 0 }}>
            <TeaserImg name={teasers[0]} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <BodyText text={page.body ?? ""} />
          {labels.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 4,
              }}
            >
              <span style={{ color: "#555" }}>{labels[0]}</span>
              <div
                style={{
                  flex: 1,
                  height: 16,
                  background: "#fff",
                  border: "1px solid #999",
                }}
              />
            </div>
          )}
          {page.labelPick && (
            <p style={{ fontStyle: "italic", color: "#666", marginTop: 3 }}>
              {page.labelPick}
            </p>
          )}
          <PriceBar />
        </div>
      </div>
    </div>
  );
}

function Layout_club({ page, teasers, labels }: P) {
  const hLeft = Math.round((320 - 286) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>
      {teasers.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginTop: 5, paddingLeft: 4 }}>
          {teasers.map((t) => (
            <TeaserImg key={t} name={t} />
          ))}
        </div>
      )}
      <div style={{ padding: "5px 6px 0 6px" }}>
        {labels.map((l, i) => (
          <p key={i} style={{ color: "#444", marginBottom: 3 }}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

function Layout_trophies({ page, labels }: P) {
  const hLeft = Math.round((320 - 286) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>
      <div style={{ padding: "5px 6px 0 6px" }}>
        <BodyText text={page.body ?? ""} />
        {labels.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 6,
            }}
          >
            <span style={{ color: "#555", width: 80 }}>{labels[0]}</span>
            <div
              style={{
                flex: 1,
                height: 16,
                background: "#fff",
                border: "1px solid #999",
              }}
            />
          </div>
        )}
        <ProductGrid count={6} />
        <PriceBar />
      </div>
    </div>
  );
}

function Layout_recycler({ page }: P) {
  const hLeft = Math.round((320 - 286) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>
      <div
        style={{
          padding: "20px 6px 0 6px",
          display: "flex",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 64,
              height: 64,
              background: "#d0d0d0",
              border: "2px dashed #999",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
            }}
          >
            slot {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function Layout_soundmachine({ page, teasers }: P) {
  const hLeft = Math.round((320 - 286) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>
      {teasers.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginTop: 5, paddingLeft: 4 }}>
          {teasers.map((t) => (
            <TeaserImg key={t} name={t} />
          ))}
        </div>
      )}
      <div style={{ padding: "5px 6px 0 6px" }}>
        <BodyText text={page.body ?? ""} />
        <ProductGrid count={6} />
        <PriceBar />
      </div>
    </div>
  );
}

function Layout_plasto({ page, labels }: P) {
  const hLeft = Math.round((320 - 286) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>
      <div style={{ padding: "5px 6px 0 6px" }}>
        <BodyText text={page.body ?? ""} />
        {labels.length > 0 && (
          <div
            style={{
              marginTop: 6,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {labels.map((l, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <span style={{ color: "#555", width: 50, flexShrink: 0 }}>
                  {l}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 18,
                    background: "#d8d8d8",
                    border: "1px solid #bbb",
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {page.labelPick && (
          <p style={{ fontStyle: "italic", color: "#666", marginTop: 3 }}>
            {page.labelPick}
          </p>
        )}
      </div>
    </div>
  );
}

function Layout_camera({ page, teasers, labels }: P) {
  const hLeft = Math.round((320 - 286) / 2);
  return (
    <div style={{ padding: "5px 0 0 0" }}>
      <div style={{ marginLeft: hLeft }}>
        <HeaderImg name={page.imageHeadline ?? ""} width={286} height={60} />
      </div>
      {teasers.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginTop: 5, paddingLeft: 4 }}>
          {teasers.map((t) => (
            <TeaserImg key={t} name={t} />
          ))}
        </div>
      )}
      <div style={{ padding: "5px 6px 0 6px" }}>
        <BodyText text={page.body ?? ""} />
        {labels.map((l, i) => (
          <p key={i} style={{ color: "#666", marginTop: 2 }}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

function UnknownLayout({ page }: { page: Partial<CataloguePage> }) {
  return (
    <div style={{ padding: 10, color: "#999" }}>
      <p className="font-mono">{page.layout || "No layout set"}</p>
      <p style={{ marginTop: 4 }}>No preview for this layout</p>
    </div>
  );
}

// ─── Main preview ─────────────────────────────────────────────────────────────

function CataloguePreview({ page }: { page: Partial<CataloguePage> }) {
  const teasers = parseTeasers(page.imageTeasers ?? "");
  const labels = parseLabelExtraT(page.labelExtraT ?? "");
  const props: P = { page, teasers, labels };

  let Content: () => JSX.Element;
  switch (page.layout) {
    case "ctlg_frontpage2":
      Content = () => <Layout_frontpage2 {...props} />;
      break;
    case "ctlg_layout2":
      Content = () => <Layout_layout2 {...props} />;
      break;
    case "ctlg_productpage1":
    case "ctlg_productpage3":
      Content = () => <Layout_productpage {...props} />;
      break;
    case "ctlg_spaces":
      Content = () => <Layout_spaces {...props} />;
      break;
    case "ctlg_presents":
      Content = () => <Layout_presents {...props} />;
      break;
    case "ctlg_pets":
      Content = () => <Layout_pets {...props} />;
      break;
    case "ctlg_club1":
    case "ctlg_club2":
      Content = () => <Layout_club {...props} />;
      break;
    case "ctlg_trophies":
      Content = () => <Layout_trophies {...props} />;
      break;
    case "ctlg_recycler":
      Content = () => <Layout_recycler {...props} />;
      break;
    case "ctlg_soundmachine":
      Content = () => <Layout_soundmachine {...props} />;
      break;
    case "ctlg_camera1":
    case "ctlg_camera2":
      Content = () => <Layout_camera {...props} />;
      break;
    case "ctlg_plasto":
      Content = () => <Layout_plasto {...props} />;
      break;
    default:
      Content = () => <UnknownLayout page={page} />;
  }

  return (
    <div
      className="select-none"
      style={{ position: "relative", width: 443, height: 443, flexShrink: 0 }}
    >
      {/* Catalogue chrome */}
      <img
        src="/images/wedcms/empty_catalogue.png"
        style={{
          position: "absolute",
          inset: 0,
          width: 443,
          height: 443,
          pointerEvents: "none",
        }}
        draggable={false}
      />

      {/* Left content area: x=1, y=30, w=320, h=407 */}
      <div
        style={{
          position: "absolute",
          left: 1,
          top: 30,
          width: 320,
          height: 407,
          background: "#eeeeee",
          overflow: "hidden",
          fontFamily: "'Volter', monospace",
          fontSize: 9,
        }}
      >
        <Content />
      </div>

      {/* Right nav panel: x=327, y=41, w=96, h=384 */}
      <div
        style={{
          position: "absolute",
          left: 327,
          top: 41,
          width: 96,
          height: 384,
          background: "#dddddd",
          overflow: "hidden",
          fontFamily: "'Volter', monospace",
          fontSize: 9,
        }}
      >
        {/* Simulated page list */}
        {[page.name, "Other page", "Another page", "..."]
          .filter(Boolean)
          .map((label, i) => (
            <div
              key={i}
              style={{
                height: 21,
                lineHeight: "21px",
                paddingLeft: 6,
                background: i === 0 ? "#c8c8cc" : "transparent",
                borderBottom: "1px solid #aaaaaa",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                fontWeight: i === 0 ? "bold" : undefined,
                color: "#222",
              }}
            >
              {label}
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Edit page ────────────────────────────────────────────────────────────────

const LAYOUTS = [
  "ctlg_frontpage2",
  "ctlg_layout2",
  "ctlg_productpage1",
  "ctlg_productpage3",
  "ctlg_spaces",
  "ctlg_presents",
  "ctlg_pets",
  "ctlg_club1",
  "ctlg_club2",
  "ctlg_trophies",
  "ctlg_recycler",
  "ctlg_soundmachine",
  "ctlg_camera1",
  "ctlg_camera2",
  "ctlg_plasto",
];

function CataloguePageEditPage() {
  const { pageId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: page, isLoading } = useQuery({
    queryKey: ["catalogue-pages", pageId],
    queryFn: () =>
      api.get<CataloguePage>(`/api/housekeeping/catalogue/pages/${pageId}`),
  });

  const [form, setForm] = useState<Partial<CataloguePage>>({});

  useEffect(() => {
    if (page) setForm(page);
  }, [page]);

  const set = (field: keyof CataloguePage, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const update = useMutation({
    mutationFn: () =>
      api.patch(`/api/housekeeping/catalogue/pages/${pageId}`, form),
    onSuccess: () => {
      toast.success("Page saved");
      qc.invalidateQueries({ queryKey: ["catalogue-pages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !page)
    return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8">
      <button
        onClick={() => navigate({ to: "/catalogue" })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Catalogue
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Edit Page{" "}
        <span className="text-gray-400 font-normal text-lg">#{page.id}</span>
      </h1>

      <div className="flex gap-8 items-start">
        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate();
          }}
          className="flex-1 space-y-4 min-w-0"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Index Name</Label>
              <Input
                value={form.nameIndex ?? ""}
                onChange={(e) => set("nameIndex", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Layout</Label>
            <select
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white"
              value={form.layout ?? ""}
              onChange={(e) => set("layout", e.target.value)}
            >
              <option value="">— select layout —</option>
              {LAYOUTS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Headline Image</Label>
              <Input
                placeholder="e.g. catalog_rares_headline1"
                value={form.imageHeadline ?? ""}
                onChange={(e) => set("imageHeadline", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Teaser Images</Label>
              <Input
                placeholder="teaser1,teaser2,"
                value={form.imageTeasers ?? ""}
                onChange={(e) => set("imageTeasers", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Body</Label>
            <Textarea
              rows={4}
              value={form.body ?? ""}
              onChange={(e) => set("body", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Label Pick</Label>
              <Input
                value={form.labelPick ?? ""}
                onChange={(e) => set("labelPick", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Label Extra S</Label>
              <Input
                value={form.labelExtraS ?? ""}
                onChange={(e) => set("labelExtraS", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              Label Extra T{" "}
              <span className="text-gray-400 font-normal text-xs">
                (one per line: 1:Text)
              </span>
            </Label>
            <Textarea
              rows={5}
              value={form.labelExtraT ?? ""}
              onChange={(e) => set("labelExtraT", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Link List</Label>
              <Input
                value={form.linkList ?? ""}
                onChange={(e) => set("linkList", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min Role</Label>
              <Input
                type="number"
                value={form.minRole ?? ""}
                onChange={(e) => set("minRole", parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.indexVisible}
                onChange={(e) => set("indexVisible", e.target.checked ? 1 : 0)}
              />
              Visible in index
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.isClubOnly}
                onChange={(e) => set("isClubOnly", e.target.checked ? 1 : 0)}
              />
              Club only
            </label>
          </div>

          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </form>

        {/* Preview */}
        <div className="shrink-0 sticky top-8">
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
            Preview
          </p>
          <CataloguePreview page={form} />
        </div>
      </div>
    </div>
  );
}
