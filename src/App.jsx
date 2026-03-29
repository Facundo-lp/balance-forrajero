import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const MONTHS = [
  { key: "ene", label: "Ene", days: 31, index: 1 },
  { key: "feb", label: "Feb", days: 28, index: 2 },
  { key: "mar", label: "Mar", days: 31, index: 3 },
  { key: "abr", label: "Abr", days: 30, index: 4 },
  { key: "may", label: "May", days: 31, index: 5 },
  { key: "jun", label: "Jun", days: 30, index: 6 },
  { key: "jul", label: "Jul", days: 31, index: 7 },
  { key: "ago", label: "Ago", days: 31, index: 8 },
  { key: "sep", label: "Sep", days: 30, index: 9 },
  { key: "oct", label: "Oct", days: 31, index: 10 },
  { key: "nov", label: "Nov", days: 30, index: 11 },
  { key: "dic", label: "Dic", days: 31, index: 12 },
];

const MONTH_OPTIONS = MONTHS.map((m) => ({
  value: m.index,
  label: m.label,
}));

const REGIONS = [
  "Sierras del Este",
  "Lomadas del Este",
  "Basalto",
  "Cristalino / Centro Sur",
  "Areniscas",
  "Cretácico",
  "Litoral",
  "Litoral Sur",
  "Llanuras del Este / Cuenca Laguna Merín",
];

const RESOURCE_TYPES = [
  "Campo natural",
  "Pradera",
  "Verdeo de invierno",
  "Verdeo de verano",
];

const SECOND_CROP_TYPES = ["Pradera", "Verdeo de invierno", "Verdeo de verano"];

const MANAGEMENT_LEVELS = [
  { label: "Bajo", factor: 0.7 },
  { label: "Medio", factor: 1.0 },
  { label: "Alto", factor: 1.3 },
];

const CLIMATE_SCENARIOS = [
  { label: "Seco", factor: 0.7 },
  { label: "Normal", factor: 1.0 },
  { label: "Húmedo", factor: 1.2 },
];

const ANIMAL_CATEGORIES = [
  { label: "Vaca cría", intake: 2.3, weight: 400 },
  { label: "Ternero", intake: 2.8, weight: 110 },
  { label: "Vaquillona", intake: 2.5, weight: 260 },
  { label: "Novillo recría", intake: 2.5, weight: 320 },
  { label: "Novillo engorde", intake: 2.7, weight: 420 },
  { label: "Vaca de invernada", intake: 2.3, weight: 400 },
];

const FIELD_NATURAL_TABLE = [
  {
    region: "Sierras del Este",
    environment: "Serrano superficial",
    annual: 1500,
    autumn: 28,
    winter: 5,
    spring: 26,
    summer: 41,
  },
  {
    region: "Sierras del Este",
    environment: "Serrano medio",
    annual: 2200,
    autumn: 26,
    winter: 7,
    spring: 28,
    summer: 39,
  },
  {
    region: "Sierras del Este",
    environment: "Serrano profundo",
    annual: 2800,
    autumn: 24,
    winter: 9,
    spring: 30,
    summer: 37,
  },
  {
    region: "Lomadas del Este",
    environment: "General",
    annual: 3426,
    autumn: 26,
    winter: 15,
    spring: 35,
    summer: 24,
  },
  {
    region: "Basalto",
    environment: "Superficial",
    annual: 2885,
    autumn: 28,
    winter: 15,
    spring: 40,
    summer: 17,
  },
  {
    region: "Basalto",
    environment: "Profundo",
    annual: 4000,
    autumn: 25,
    winter: 12,
    spring: 44,
    summer: 19,
  },
  {
    region: "Cristalino / Centro Sur",
    environment: "Superficial",
    annual: 2316,
    autumn: 22,
    winter: 22,
    spring: 21,
    summer: 35,
  },
  {
    region: "Cristalino / Centro Sur",
    environment: "Brunosol subeútrico",
    annual: 3206,
    autumn: 22,
    winter: 18,
    spring: 27,
    summer: 33,
  },
  {
    region: "Cristalino / Centro Sur",
    environment: "Brunosol eútrico",
    annual: 3665,
    autumn: 21,
    winter: 16,
    spring: 28,
    summer: 35,
  },
  {
    region: "Areniscas",
    environment: "Ladera alta",
    annual: 5144,
    autumn: 13,
    winter: 7,
    spring: 31,
    summer: 49,
  },
  {
    region: "Cretácico",
    environment: "Agrio",
    annual: 5530,
    autumn: 23,
    winter: 15,
    spring: 28,
    summer: 34,
  },
  {
    region: "Litoral",
    environment: "General",
    annual: 6000,
    autumn: 24,
    winter: 16,
    spring: 34,
    summer: 26,
  },
  {
    region: "Litoral Sur",
    environment: "General agrícola-ganadero",
    annual: 7000,
    autumn: 25,
    winter: 18,
    spring: 36,
    summer: 21,
  },
  {
    region: "Llanuras del Este / Cuenca Laguna Merín",
    environment: "Tendido alto",
    annual: 3000,
    autumn: 22,
    winter: 10,
    spring: 28,
    summer: 40,
  },
  {
    region: "Llanuras del Este / Cuenca Laguna Merín",
    environment: "Plano medio",
    annual: 3800,
    autumn: 21,
    winter: 11,
    spring: 30,
    summer: 38,
  },
  {
    region: "Llanuras del Este / Cuenca Laguna Merín",
    environment: "Bajo dulce/húmedo",
    annual: 4500,
    autumn: 20,
    winter: 14,
    spring: 31,
    summer: 35,
  },
];

const SEEDED_SUBTYPES = {
  Pradera: [
    {
      name: "Festuca + trébol blanco + lotus",
      annual: 8500,
      monthly: {
        ene: 9,
        feb: 7,
        mar: 7,
        abr: 7,
        may: 6,
        jun: 5,
        jul: 5,
        ago: 7,
        sep: 10,
        oct: 13,
        nov: 13,
        dic: 11,
      },
      defaultFirstGrazingDays: 90,
      defaultEndMonth: 12,
      defaultEfficiency: 65,
    },
    {
      name: "Dactylis + trébol blanco + trébol rojo",
      annual: 9000,
      monthly: {
        ene: 10,
        feb: 8,
        mar: 7,
        abr: 7,
        may: 6,
        jun: 5,
        jul: 5,
        ago: 7,
        sep: 10,
        oct: 13,
        nov: 12,
        dic: 10,
      },
      defaultFirstGrazingDays: 90,
      defaultEndMonth: 12,
      defaultEfficiency: 65,
    },
    {
      name: "Raigrás perenne + trébol blanco",
      annual: 8200,
      monthly: {
        ene: 8,
        feb: 7,
        mar: 8,
        abr: 8,
        may: 7,
        jun: 6,
        jul: 6,
        ago: 8,
        sep: 11,
        oct: 13,
        nov: 11,
        dic: 7,
      },
      defaultFirstGrazingDays: 75,
      defaultEndMonth: 12,
      defaultEfficiency: 65,
    },
  ],
  "Verdeo de invierno": [
    {
      name: "Raigrás anual",
      annual: 9500,
      monthly: {
        ene: 0,
        feb: 0,
        mar: 0,
        abr: 0,
        may: 8,
        jun: 15,
        jul: 20,
        ago: 22,
        sep: 20,
        oct: 10,
        nov: 5,
        dic: 0,
      },
      defaultFirstGrazingDays: 60,
      defaultEndMonth: 10,
      defaultEfficiency: 70,
    },
    {
      name: "Avena",
      annual: 8500,
      monthly: {
        ene: 0,
        feb: 0,
        mar: 0,
        abr: 0,
        may: 12,
        jun: 20,
        jul: 23,
        ago: 20,
        sep: 15,
        oct: 8,
        nov: 2,
        dic: 0,
      },
      defaultFirstGrazingDays: 45,
      defaultEndMonth: 10,
      defaultEfficiency: 70,
    },
    {
      name: "Avena + raigrás",
      annual: 9800,
      monthly: {
        ene: 0,
        feb: 0,
        mar: 0,
        abr: 0,
        may: 10,
        jun: 18,
        jul: 22,
        ago: 22,
        sep: 17,
        oct: 9,
        nov: 2,
        dic: 0,
      },
      defaultFirstGrazingDays: 50,
      defaultEndMonth: 10,
      defaultEfficiency: 70,
    },
  ],
  "Verdeo de verano": [
    {
      name: "Sudangrás",
      annual: 13000,
      monthly: {
        ene: 20,
        feb: 18,
        mar: 10,
        abr: 3,
        may: 0,
        jun: 0,
        jul: 0,
        ago: 0,
        sep: 0,
        oct: 0,
        nov: 14,
        dic: 35,
      },
      defaultFirstGrazingDays: 45,
      defaultEndMonth: 3,
      defaultEfficiency: 70,
    },
    {
      name: "Sorgo forrajero",
      annual: 14500,
      monthly: {
        ene: 22,
        feb: 20,
        mar: 12,
        abr: 4,
        may: 0,
        jun: 0,
        jul: 0,
        ago: 0,
        sep: 0,
        oct: 0,
        nov: 12,
        dic: 30,
      },
      defaultFirstGrazingDays: 50,
      defaultEndMonth: 3,
      defaultEfficiency: 70,
    },
    {
      name: "Moha",
      annual: 9000,
      monthly: {
        ene: 28,
        feb: 25,
        mar: 12,
        abr: 0,
        may: 0,
        jun: 0,
        jul: 0,
        ago: 0,
        sep: 0,
        oct: 0,
        nov: 10,
        dic: 25,
      },
      defaultFirstGrazingDays: 35,
      defaultEndMonth: 2,
      defaultEfficiency: 70,
    },
  ],
};

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function formatNumber(v, decimals = 0) {
  return new Intl.NumberFormat("es-UY", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v || 0);
}

function seasonToMonthly(row) {
  return {
    ene: row.summer / 3,
    feb: row.summer / 3,
    mar: row.autumn / 3,
    abr: row.autumn / 3,
    may: row.autumn / 3,
    jun: row.winter / 3,
    jul: row.winter / 3,
    ago: row.winter / 3,
    sep: row.spring / 3,
    oct: row.spring / 3,
    nov: row.spring / 3,
    dic: row.summer / 3,
  };
}

function getFieldNaturalRow(region, environment) {
  return (
    FIELD_NATURAL_TABLE.find(
      (r) => r.region === region && r.environment === environment
    ) || FIELD_NATURAL_TABLE.find((r) => r.region === region)
  );
}

function getEnvironmentOptions(region) {
  return FIELD_NATURAL_TABLE.filter((r) => r.region === region).map(
    (r) => r.environment
  );
}

function getSubtypeOptions(resourceType) {
  return SEEDED_SUBTYPES[resourceType] || [];
}

function getSubtypeRow(resourceType, subtypeName) {
  return getSubtypeOptions(resourceType).find((s) => s.name === subtypeName);
}

function parseLocalDate(dateString) {
  if (!dateString) return null;
  const d = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getFirstGrazingDate(crop) {
  const sowing = parseLocalDate(crop.sowingDate);
  if (!sowing) return null;
  return addDays(sowing, n(crop.firstGrazingDays));
}

function getEffectiveStartMonth(crop) {
  const first = getFirstGrazingDate(crop);
  if (!first) return 1;
  return first.getMonth() + 1;
}

function monthIsActive(monthIndex, startMonth, endMonth) {
  const start = n(startMonth);
  const end = n(endMonth);

  if (!start || !end) return true;

  if (start <= end) {
    return monthIndex >= start && monthIndex <= end;
  }

  return monthIndex >= start || monthIndex <= end;
}

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCardStyle}>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
        {value}
      </div>
    </div>
  );
}

function defaultSecondCrop() {
  const firstSubtype = getSubtypeOptions("Verdeo de verano")[0];
  return {
    enabled: false,
    resourceType: "Verdeo de verano",
    subtype: firstSubtype?.name || "",
    sowingDate: "",
    firstGrazingDays: firstSubtype?.defaultFirstGrazingDays ?? 45,
    endMonth: firstSubtype?.defaultEndMonth ?? 3,
    efficiency: firstSubtype?.defaultEfficiency ?? 70,
    management: "Medio",
  };
}

export default function App() {
  const loadSaved = () => {
    try {
      const saved = localStorage.getItem("bf_establecimientos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const loadAutosave = () => {
    try {
      const saved = localStorage.getItem("bf_autosave");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const autosave = loadAutosave();

  const [savedFarms, setSavedFarms] = useState(loadSaved());

  const [farm, setFarm] = useState(
    autosave?.farm || {
      name: "Mi establecimiento",
      region: "Sierras del Este",
      climate: "Normal",
    }
  );

  const [paddocks, setPaddocks] = useState(
    autosave?.paddocks || [
      {
        id: 1,
        name: "Potrero 1",
        hectares: 100,
        resourceType: "Campo natural",
        subtype: "",
        environment: "Serrano medio",
        sowingDate: "",
        firstGrazingDays: 0,
        endMonth: 12,
        efficiency: 50,
        management: "Medio",
        secondCrop: defaultSecondCrop(),
      },
    ]
  );

  const [herd, setHerd] = useState(
    autosave?.herd || [
      {
        id: 1,
        category: "Vaca cría",
        heads: 100,
        weight: 400,
        intake: 2.3,
      },
    ]
  );

  useEffect(() => {
    localStorage.setItem(
      "bf_autosave",
      JSON.stringify({ farm, paddocks, herd })
    );
  }, [farm, paddocks, herd]);

  const persistFarms = (list) => {
    setSavedFarms(list);
    localStorage.setItem("bf_establecimientos", JSON.stringify(list));
  };

  const saveFarm = () => {
    const farmData = {
      id: Date.now(),
      farm,
      paddocks,
      herd,
    };
    persistFarms([...savedFarms, farmData]);
  };

  const loadFarm = (f) => {
    setFarm(f.farm);
    setPaddocks(f.paddocks);
    setHerd(f.herd);
  };

  const duplicateScenario = () => {
    setPaddocks(JSON.parse(JSON.stringify(paddocks)));
    setHerd(JSON.parse(JSON.stringify(herd)));
  };

  const exportCSV = () => {
    const rows = MONTHS.map((m, i) => [
      m.label,
      Math.round(results.offerByMonth[i]),
      Math.round(results.demandByMonth[i]),
      Math.round(results.balanceByMonth[i]),
    ]);

    const csv = [["Mes", "Oferta", "Demanda", "Balance"], ...rows]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "balance_forrajero.csv";
    a.click();
  };

  const environmentOptions = getEnvironmentOptions(farm.region);

  const addPaddock = () => {
    setPaddocks((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `Potrero ${prev.length + 1}`,
        hectares: 0,
        resourceType: "Campo natural",
        subtype: "",
        environment: getEnvironmentOptions(farm.region)[0] || "",
        sowingDate: "",
        firstGrazingDays: 0,
        endMonth: 12,
        efficiency: 50,
        management: "Medio",
        secondCrop: defaultSecondCrop(),
      },
    ]);
  };

  const updatePaddock = (id, key, value) => {
    setPaddocks((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const updated = { ...p, [key]: value };

        if (key === "resourceType") {
          if (value === "Campo natural") {
            updated.subtype = "";
            updated.environment = getEnvironmentOptions(farm.region)[0] || "";
            updated.sowingDate = "";
            updated.firstGrazingDays = 0;
            updated.endMonth = 12;
            updated.efficiency = 50;
          } else {
            const firstSubtype = getSubtypeOptions(value)[0];
            updated.subtype = firstSubtype?.name || "";
            updated.environment = "";
            updated.sowingDate = "";
            updated.firstGrazingDays =
              firstSubtype?.defaultFirstGrazingDays ?? 60;
            updated.endMonth = firstSubtype?.defaultEndMonth ?? 12;
            updated.efficiency = firstSubtype?.defaultEfficiency ?? 65;
          }
        }

        if (key === "subtype") {
          const subtypeRow = getSubtypeRow(updated.resourceType, value);
          if (subtypeRow) {
            updated.firstGrazingDays = subtypeRow.defaultFirstGrazingDays;
            updated.endMonth = subtypeRow.defaultEndMonth;
            updated.efficiency = subtypeRow.defaultEfficiency;
          }
        }

        if (!updated.management) updated.management = "Medio";
        if (!updated.secondCrop) updated.secondCrop = defaultSecondCrop();

        return updated;
      })
    );
  };

  const updateSecondCrop = (id, key, value) => {
    setPaddocks((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        const second = { ...(p.secondCrop || defaultSecondCrop()), [key]: value };

        if (key === "resourceType") {
          const firstSubtype = getSubtypeOptions(value)[0];
          second.subtype = firstSubtype?.name || "";
          second.sowingDate = "";
          second.firstGrazingDays =
            firstSubtype?.defaultFirstGrazingDays ?? 45;
          second.endMonth = firstSubtype?.defaultEndMonth ?? 12;
          second.efficiency = firstSubtype?.defaultEfficiency ?? 70;
        }

        if (key === "subtype") {
          const subtypeRow = getSubtypeRow(second.resourceType, value);
          if (subtypeRow) {
            second.firstGrazingDays = subtypeRow.defaultFirstGrazingDays;
            second.endMonth = subtypeRow.defaultEndMonth;
            second.efficiency = subtypeRow.defaultEfficiency;
          }
        }

        if (!second.management) second.management = "Medio";

        return { ...p, secondCrop: second };
      })
    );
  };

  const removePaddock = (id) => {
    setPaddocks((prev) => prev.filter((p) => p.id !== id));
  };

  const addHerdRow = () => {
    const a = ANIMAL_CATEGORIES[0];
    setHerd((prev) => [
      ...prev,
      {
        id: Date.now(),
        category: a.label,
        heads: 0,
        weight: a.weight,
        intake: a.intake,
      },
    ]);
  };

  const updateHerd = (id, key, value) => {
    setHerd((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;

        if (key === "category") {
          const found = ANIMAL_CATEGORIES.find((a) => a.label === value);
          return {
            ...h,
            category: value,
            weight: found?.weight ?? h.weight,
            intake: found?.intake ?? h.intake,
          };
        }

        return { ...h, [key]: value };
      })
    );
  };

  const removeHerd = (id) => {
    setHerd((prev) => prev.filter((h) => h.id !== id));
  };

  const results = useMemo(() => {
    const climateFactor =
      CLIMATE_SCENARIOS.find((c) => c.label === farm.climate)?.factor ?? 1;

    const offerByMonth = MONTHS.map((m) => {
      return paddocks.reduce((sum, p) => {
        let total = sum;

        const primaryManagement =
          MANAGEMENT_LEVELS.find((lvl) => lvl.label === p.management)?.factor ??
          1;

        if (p.resourceType === "Campo natural") {
          if (monthIsActive(m.index, 1, p.endMonth)) {
            const row = getFieldNaturalRow(farm.region, p.environment);
            if (row) {
              const dist = seasonToMonthly(row);
              const pct = n(dist[m.key]);
              const monthlyPerHa = row.annual * (pct / 100);

              total +=
                monthlyPerHa *
                n(p.hectares) *
                (n(p.efficiency) / 100) *
                primaryManagement *
                climateFactor;
            }
          }
        } else {
          const startMonth = getEffectiveStartMonth(p);
          if (monthIsActive(m.index, startMonth, p.endMonth)) {
            const resource = getSubtypeRow(p.resourceType, p.subtype);
            if (resource) {
              const pct = n(resource.monthly[m.key]);
              const monthlyPerHa = resource.annual * (pct / 100);

              total +=
                monthlyPerHa *
                n(p.hectares) *
                (n(p.efficiency) / 100) *
                primaryManagement *
                climateFactor;
            }
          }
        }

        if (p.secondCrop?.enabled) {
          const second = p.secondCrop;
          const secondManagement =
            MANAGEMENT_LEVELS.find((lvl) => lvl.label === second.management)
              ?.factor ?? 1;
          const secondStart = getEffectiveStartMonth(second);

          if (monthIsActive(m.index, secondStart, second.endMonth)) {
            const secondResource = getSubtypeRow(
              second.resourceType,
              second.subtype
            );
            if (secondResource) {
              const pct = n(secondResource.monthly[m.key]);
              const monthlyPerHa = secondResource.annual * (pct / 100);

              total +=
                monthlyPerHa *
                n(p.hectares) *
                (n(second.efficiency) / 100) *
                secondManagement *
                climateFactor;
            }
          }
        }

        return total;
      }, 0);
    });

    const demandByMonth = MONTHS.map((m) => {
      return herd.reduce((sum, h) => {
        const daily = n(h.heads) * n(h.weight) * (n(h.intake) / 100);
        return sum + daily * m.days;
      }, 0);
    });

    const balanceByMonth = MONTHS.map(
      (_, i) => offerByMonth[i] - demandByMonth[i]
    );

    const annualOffer = offerByMonth.reduce((a, b) => a + b, 0);
    const annualDemand = demandByMonth.reduce((a, b) => a + b, 0);
    const annualBalance = balanceByMonth.reduce((a, b) => a + b, 0);
    const totalPV = herd.reduce((sum, h) => sum + n(h.heads) * n(h.weight), 0);
    const totalArea = paddocks.reduce((sum, p) => sum + n(p.hectares), 0);
    const currentLoad = totalArea > 0 ? totalPV / totalArea : 0;

    const chartData = MONTHS.map((m, i) => ({
      mes: m.label,
      oferta: Math.round(offerByMonth[i]),
      demanda: Math.round(demandByMonth[i]),
      balance: Math.round(balanceByMonth[i]),
    }));

    return {
      offerByMonth,
      demandByMonth,
      balanceByMonth,
      annualOffer,
      annualDemand,
      annualBalance,
      totalPV,
      totalArea,
      currentLoad,
      chartData,
    };
  }, [farm, paddocks, herd]);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerRowStyle}>
          <div>
            <h1 style={{ fontSize: 32, margin: 0, color: "#0f172a" }}>
              Balance Forrajero
            </h1>
            <p style={{ color: "#64748b", marginTop: 8 }}>
              Versión 9: doble cultivo en un mismo potrero.
            </p>
          </div>

          <div style={actionsRowStyle}>
            <button onClick={saveFarm} style={buttonStyle}>
              Guardar
            </button>
            <button onClick={duplicateScenario} style={buttonStyle}>
              Duplicar escenario
            </button>
            <button onClick={exportCSV} style={buttonStyle}>
              Exportar CSV
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={panelTitleStyle}>Establecimientos guardados</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {savedFarms.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: 14 }}>
                Aún no hay establecimientos guardados.
              </div>
            ) : (
              savedFarms.map((f) => (
                <button
                  key={f.id}
                  onClick={() => loadFarm(f)}
                  style={secondaryButtonStyle}
                >
                  {f.farm.name}
                </button>
              ))
            )}
          </div>
        </div>

        <div style={topGridStyle}>
          <div style={panelStyle}>
            <h2 style={panelTitleStyle}>Establecimiento</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  value={farm.name}
                  onChange={(e) =>
                    setFarm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Región</label>
                <select
                  value={farm.region}
                  onChange={(e) => {
                    const region = e.target.value;
                    const firstEnv = getEnvironmentOptions(region)[0] || "";
                    setFarm((prev) => ({ ...prev, region }));
                    setPaddocks((prev) =>
                      prev.map((p) =>
                        p.resourceType === "Campo natural"
                          ? { ...p, environment: firstEnv }
                          : p
                      )
                    );
                  }}
                  style={inputStyle}
                >
                  {REGIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Año climático</label>
                <select
                  value={farm.climate}
                  onChange={(e) =>
                    setFarm((prev) => ({ ...prev, climate: e.target.value }))
                  }
                  style={inputStyle}
                >
                  {CLIMATE_SCENARIOS.map((c) => (
                    <option key={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={panelStyle}>
            <h2 style={panelTitleStyle}>Resumen</h2>
            <div style={summaryGridStyle}>
              <SummaryCard
                title="Carga actual"
                value={`${formatNumber(results.currentLoad, 1)} kg PV/ha`}
              />
              <SummaryCard
                title="Oferta anual"
                value={`${formatNumber(results.annualOffer)} kg MS`}
              />
              <SummaryCard
                title="Demanda anual"
                value={`${formatNumber(results.annualDemand)} kg MS`}
              />
              <SummaryCard
                title="Balance anual"
                value={`${formatNumber(results.annualBalance)} kg MS`}
              />
            </div>
          </div>
        </div>

        <div style={midGridStyle}>
          <div style={panelStyle}>
            <div style={panelHeaderRowStyle}>
              <h2 style={panelTitleStyle}>Potreros</h2>
              <button onClick={addPaddock} style={buttonStyle}>
                + Agregar
              </button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {paddocks.map((p) => {
                const firstGrazingDate = getFirstGrazingDate(p);
                const firstGrazingText = firstGrazingDate
                  ? firstGrazingDate.toLocaleDateString("es-UY")
                  : "No aplica";

                const second = p.secondCrop || defaultSecondCrop();
                const secondFirstDate = getFirstGrazingDate(second);
                const secondFirstText = secondFirstDate
                  ? secondFirstDate.toLocaleDateString("es-UY")
                  : "No aplica";

                return (
                  <div key={p.id} style={paddockCardStyle}>
                    <div style={paddockRow1Style}>
                      <div>
                        <label style={smallLabelStyle}>Nombre</label>
                        <input
                          value={p.name}
                          onChange={(e) =>
                            updatePaddock(p.id, "name", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={smallLabelStyle}>Hectáreas</label>
                        <input
                          type="number"
                          value={p.hectares}
                          onChange={(e) =>
                            updatePaddock(p.id, "hectares", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={smallLabelStyle}>Recurso 1</label>
                        <select
                          value={p.resourceType}
                          onChange={(e) =>
                            updatePaddock(p.id, "resourceType", e.target.value)
                          }
                          style={inputStyle}
                        >
                          {RESOURCE_TYPES.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      {p.resourceType === "Campo natural" ? (
                        <div>
                          <label style={smallLabelStyle}>Ambiente</label>
                          <select
                            value={p.environment}
                            onChange={(e) =>
                              updatePaddock(p.id, "environment", e.target.value)
                            }
                            style={inputStyle}
                          >
                            {environmentOptions.map((env) => (
                              <option key={env}>{env}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label style={smallLabelStyle}>Subtipo 1</label>
                          <select
                            value={p.subtype}
                            onChange={(e) =>
                              updatePaddock(p.id, "subtype", e.target.value)
                            }
                            style={inputStyle}
                          >
                            {getSubtypeOptions(p.resourceType).map((s) => (
                              <option key={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div style={paddockRow2Style}>
                      {p.resourceType === "Campo natural" ? (
                        <>
                          <div>
                            <label style={smallLabelStyle}>Fecha siembra</label>
                            <input
                              value="No aplica"
                              disabled
                              style={{ ...inputStyle, background: "#f1f5f9" }}
                            />
                          </div>
                          <div>
                            <label style={smallLabelStyle}>1er pastoreo</label>
                            <input
                              value="No aplica"
                              disabled
                              style={{ ...inputStyle, background: "#f1f5f9" }}
                            />
                          </div>
                          <div>
                            <label style={smallLabelStyle}>Días a pastoreo</label>
                            <input
                              value="No aplica"
                              disabled
                              style={{ ...inputStyle, background: "#f1f5f9" }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label style={smallLabelStyle}>Fecha siembra</label>
                            <input
                              type="date"
                              value={p.sowingDate}
                              onChange={(e) =>
                                updatePaddock(p.id, "sowingDate", e.target.value)
                              }
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={smallLabelStyle}>1er pastoreo</label>
                            <input
                              value={firstGrazingText}
                              disabled
                              style={{ ...inputStyle, background: "#f1f5f9" }}
                            />
                          </div>
                          <div>
                            <label style={smallLabelStyle}>Días a pastoreo</label>
                            <input
                              type="number"
                              value={p.firstGrazingDays}
                              onChange={(e) =>
                                updatePaddock(
                                  p.id,
                                  "firstGrazingDays",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label style={smallLabelStyle}>Mes fin</label>
                        <select
                          value={p.endMonth}
                          onChange={(e) =>
                            updatePaddock(p.id, "endMonth", Number(e.target.value))
                          }
                          style={inputStyle}
                        >
                          {MONTH_OPTIONS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={smallLabelStyle}>Manejo</label>
                        <select
                          value={p.management}
                          onChange={(e) =>
                            updatePaddock(p.id, "management", e.target.value)
                          }
                          style={inputStyle}
                        >
                          {MANAGEMENT_LEVELS.map((lvl) => (
                            <option key={lvl.label}>{lvl.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={smallLabelStyle}>Eficiencia %</label>
                        <input
                          type="number"
                          value={p.efficiency}
                          onChange={(e) =>
                            updatePaddock(p.id, "efficiency", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={smallLabelStyle}>Segundo cultivo</label>
                        <select
                          value={second.enabled ? "Sí" : "No"}
                          onChange={(e) =>
                            updateSecondCrop(
                              p.id,
                              "enabled",
                              e.target.value === "Sí"
                            )
                          }
                          style={inputStyle}
                        >
                          <option>No</option>
                          <option>Sí</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", alignItems: "end" }}>
                        <button
                          onClick={() => removePaddock(p.id)}
                          style={dangerButtonStyle}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {second.enabled && (
                      <div style={secondCropBoxStyle}>
                        <div style={secondTitleStyle}>Segundo cultivo</div>

                        <div style={paddockRow1Style}>
                          <div>
                            <label style={smallLabelStyle}>Recurso 2</label>
                            <select
                              value={second.resourceType}
                              onChange={(e) =>
                                updateSecondCrop(
                                  p.id,
                                  "resourceType",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            >
                              {SECOND_CROP_TYPES.map((r) => (
                                <option key={r}>{r}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={smallLabelStyle}>Subtipo 2</label>
                            <select
                              value={second.subtype}
                              onChange={(e) =>
                                updateSecondCrop(p.id, "subtype", e.target.value)
                              }
                              style={inputStyle}
                            >
                              {getSubtypeOptions(second.resourceType).map((s) => (
                                <option key={s.name}>{s.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={smallLabelStyle}>Fecha siembra</label>
                            <input
                              type="date"
                              value={second.sowingDate}
                              onChange={(e) =>
                                updateSecondCrop(
                                  p.id,
                                  "sowingDate",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </div>

                          <div>
                            <label style={smallLabelStyle}>1er pastoreo</label>
                            <input
                              value={secondFirstText}
                              disabled
                              style={{ ...inputStyle, background: "#f1f5f9" }}
                            />
                          </div>
                        </div>

                        <div style={paddockRow2Style}>
                          <div>
                            <label style={smallLabelStyle}>Días a pastoreo</label>
                            <input
                              type="number"
                              value={second.firstGrazingDays}
                              onChange={(e) =>
                                updateSecondCrop(
                                  p.id,
                                  "firstGrazingDays",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </div>

                          <div>
                            <label style={smallLabelStyle}>Mes fin</label>
                            <select
                              value={second.endMonth}
                              onChange={(e) =>
                                updateSecondCrop(
                                  p.id,
                                  "endMonth",
                                  Number(e.target.value)
                                )
                              }
                              style={inputStyle}
                            >
                              {MONTH_OPTIONS.map((m) => (
                                <option key={m.value} value={m.value}>
                                  {m.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={smallLabelStyle}>Manejo</label>
                            <select
                              value={second.management}
                              onChange={(e) =>
                                updateSecondCrop(
                                  p.id,
                                  "management",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            >
                              {MANAGEMENT_LEVELS.map((lvl) => (
                                <option key={lvl.label}>{lvl.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={smallLabelStyle}>Eficiencia %</label>
                            <input
                              type="number"
                              value={second.efficiency}
                              onChange={(e) =>
                                updateSecondCrop(
                                  p.id,
                                  "efficiency",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={panelStyle}>
            <div style={panelHeaderRowStyle}>
              <h2 style={panelTitleStyle}>Rodeo</h2>
              <button onClick={addHerdRow} style={buttonStyle}>
                + Agregar
              </button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {herd.map((h) => (
                <div key={h.id} style={boxStyle}>
                  <div style={herdGridStyle}>
                    <div>
                      <label style={smallLabelStyle}>Categoría</label>
                      <select
                        value={h.category}
                        onChange={(e) =>
                          updateHerd(h.id, "category", e.target.value)
                        }
                        style={inputStyle}
                      >
                        {ANIMAL_CATEGORIES.map((a) => (
                          <option key={a.label}>{a.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={smallLabelStyle}>Cabezas</label>
                      <input
                        type="number"
                        value={h.heads}
                        onChange={(e) =>
                          updateHerd(h.id, "heads", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={smallLabelStyle}>Peso</label>
                      <input
                        type="number"
                        value={h.weight}
                        onChange={(e) =>
                          updateHerd(h.id, "weight", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={smallLabelStyle}>Consumo %</label>
                      <input
                        type="number"
                        step="0.1"
                        value={h.intake}
                        onChange={(e) =>
                          updateHerd(h.id, "intake", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>

                    <button
                      onClick={() => removeHerd(h.id)}
                      style={dangerButtonStyle}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...panelStyle, marginBottom: 24 }}>
          <h2 style={panelTitleStyle}>Gráfico mensual</h2>
          <div style={{ width: "100%", height: 360 }}>
            <ResponsiveContainer>
              <LineChart data={results.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="oferta"
                  stroke="#16a34a"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="demanda"
                  stroke="#dc2626"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Tabla mensual</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: "#e2e8f0" }}>
                  <th style={thStyle}>Mes</th>
                  <th style={thStyle}>Oferta</th>
                  <th style={thStyle}>Demanda</th>
                  <th style={thStyle}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((m, i) => (
                  <tr key={m.key}>
                    <td style={tdStyle}>{m.label}</td>
                    <td style={tdStyle}>
                      {formatNumber(results.offerByMonth[i])}
                    </td>
                    <td style={tdStyle}>
                      {formatNumber(results.demandByMonth[i])}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        color:
                          results.balanceByMonth[i] < 0
                            ? "#dc2626"
                            : "#16a34a",
                        fontWeight: 600,
                      }}
                    >
                      {formatNumber(results.balanceByMonth[i])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: 24,
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const containerStyle = {
  maxWidth: 1500,
  margin: "0 auto",
  background: "#ffffff",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 24,
  flexWrap: "wrap",
};

const actionsRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const topGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginBottom: 24,
};

const midGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: 16,
  marginBottom: 24,
};

const panelStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
};

const panelTitleStyle = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 20,
};

const panelHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const summaryCardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
};

const boxStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 14,
  padding: 12,
  background: "#fff",
};

const paddockCardStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 14,
  padding: 12,
  background: "#fff",
  display: "grid",
  gap: 10,
};

const secondCropBoxStyle = {
  marginTop: 8,
  borderTop: "1px dashed #cbd5e1",
  paddingTop: 10,
  display: "grid",
  gap: 10,
};

const secondTitleStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#0f172a",
};

const paddockRow1Style = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.7fr 1fr 1.3fr",
  gap: 8,
  alignItems: "end",
};

const paddockRow2Style = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 0.9fr 0.8fr 0.8fr 0.8fr 0.9fr auto",
  gap: 8,
  alignItems: "end",
};

const herdGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 0.7fr 0.7fr 0.7fr auto",
  gap: 8,
  alignItems: "end",
};

const labelStyle = {
  fontSize: 14,
  color: "#334155",
};

const smallLabelStyle = {
  fontSize: 13,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  marginTop: 4,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 600,
  cursor: "pointer",
};

const dangerButtonStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  fontWeight: 600,
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  borderRadius: 12,
  overflow: "hidden",
};

const thStyle = {
  textAlign: "left",
  padding: 12,
  fontSize: 14,
  color: "#0f172a",
};

const tdStyle = {
  padding: 12,
  borderTop: "1px solid #e2e8f0",
  fontSize: 14,
  color: "#334155",
};
