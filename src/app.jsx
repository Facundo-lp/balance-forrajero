import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MONTHS = [
  { key: "ene", label: "Ene", days: 31 },
  { key: "feb", label: "Feb", days: 28 },
  { key: "mar", label: "Mar", days: 31 },
  { key: "abr", label: "Abr", days: 30 },
  { key: "may", label: "May", days: 31 },
  { key: "jun", label: "Jun", days: 30 },
  { key: "jul", label: "Jul", days: 31 },
  { key: "ago", label: "Ago", days: 31 },
  { key: "sep", label: "Sep", days: 30 },
  { key: "oct", label: "Oct", days: 31 },
  { key: "nov", label: "Nov", days: 30 },
  { key: "dic", label: "Dic", days: 31 },
];

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
    utilization: 0.5,
  },
  {
    region: "Sierras del Este",
    environment: "Serrano medio",
    annual: 2200,
    autumn: 26,
    winter: 7,
    spring: 28,
    summer: 39,
    utilization: 0.52,
  },
  {
    region: "Sierras del Este",
    environment: "Serrano profundo",
    annual: 2800,
    autumn: 24,
    winter: 9,
    spring: 30,
    summer: 37,
    utilization: 0.55,
  },
  {
    region: "Lomadas del Este",
    environment: "General",
    annual: 3426,
    autumn: 26,
    winter: 15,
    spring: 35,
    summer: 24,
    utilization: 0.55,
  },
  {
    region: "Basalto",
    environment: "Superficial",
    annual: 2885,
    autumn: 28,
    winter: 15,
    spring: 40,
    summer: 17,
    utilization: 0.55,
  },
  {
    region: "Basalto",
    environment: "Profundo",
    annual: 4000,
    autumn: 25,
    winter: 12,
    spring: 44,
    summer: 19,
    utilization: 0.6,
  },
  {
    region: "Cristalino / Centro Sur",
    environment: "Superficial",
    annual: 2316,
    autumn: 22,
    winter: 22,
    spring: 21,
    summer: 35,
    utilization: 0.52,
  },
  {
    region: "Cristalino / Centro Sur",
    environment: "Brunosol subeútrico",
    annual: 3206,
    autumn: 22,
    winter: 18,
    spring: 27,
    summer: 33,
    utilization: 0.55,
  },
  {
    region: "Cristalino / Centro Sur",
    environment: "Brunosol eútrico",
    annual: 3665,
    autumn: 21,
    winter: 16,
    spring: 28,
    summer: 35,
    utilization: 0.58,
  },
  {
    region: "Areniscas",
    environment: "Ladera alta",
    annual: 5144,
    autumn: 13,
    winter: 7,
    spring: 31,
    summer: 49,
    utilization: 0.58,
  },
  {
    region: "Cretácico",
    environment: "Agrio",
    annual: 5530,
    autumn: 23,
    winter: 15,
    spring: 28,
    summer: 34,
    utilization: 0.6,
  },
  {
    region: "Litoral",
    environment: "General",
    annual: 6000,
    autumn: 24,
    winter: 16,
    spring: 34,
    summer: 26,
    utilization: 0.62,
  },
  {
    region: "Litoral Sur",
    environment: "General agrícola-ganadero",
    annual: 7000,
    autumn: 25,
    winter: 18,
    spring: 36,
    summer: 21,
    utilization: 0.65,
  },
  {
    region: "Llanuras del Este / Cuenca Laguna Merín",
    environment: "Tendido alto",
    annual: 3000,
    autumn: 22,
    winter: 10,
    spring: 28,
    summer: 40,
    utilization: 0.52,
  },
  {
    region: "Llanuras del Este / Cuenca Laguna Merín",
    environment: "Plano medio",
    annual: 3800,
    autumn: 21,
    winter: 11,
    spring: 30,
    summer: 38,
    utilization: 0.55,
  },
  {
    region: "Llanuras del Este / Cuenca Laguna Merín",
    environment: "Bajo dulce/húmedo",
    annual: 4500,
    autumn: 20,
    winter: 14,
    spring: 31,
    summer: 35,
    utilization: 0.58,
  },
];

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

function SummaryCard({ title, value, subtitle }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
        {value}
      </div>
      {subtitle ? (
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

export default function App() {
  const [farm, setFarm] = useState({
    name: "Mi establecimiento",
    region: "Sierras del Este",
  });

  const [paddocks, setPaddocks] = useState([
    {
      id: 1,
      name: "Potrero 1",
      hectares: 100,
      environment: "Serrano medio",
    },
  ]);

  const [herd, setHerd] = useState([
    {
      id: 1,
      category: "Vaca cría",
      heads: 100,
      weight: 400,
      intake: 2.3,
    },
  ]);

  const environmentOptions = getEnvironmentOptions(farm.region);

  const addPaddock = () => {
    setPaddocks((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `Potrero ${prev.length + 1}`,
        hectares: 0,
        environment: getEnvironmentOptions(farm.region)[0] || "",
      },
    ]);
  };

  const updatePaddock = (id, key, value) => {
    setPaddocks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: value } : p))
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
    const offerByMonth = MONTHS.map((m, monthIndex) => {
      return paddocks.reduce((sum, p) => {
        const row = getFieldNaturalRow(farm.region, p.environment);
        if (!row) return sum;

        const dist = seasonToMonthly(row);
        const pct = n(dist[m.key]);
        const monthlyPerHa = row.annual * (pct / 100);
        const offer = monthlyPerHa * n(p.hectares) * row.utilization;

        return sum + offer;
      }, 0);
    });

    const demandByMonth = MONTHS.map((m) => {
      return herd.reduce((sum, h) => {
        const daily =
          n(h.heads) * n(h.weight) * (n(h.intake) / 100);
        return sum + daily * m.days;
      }, 0);
    });

    const balanceByMonth = MONTHS.map(
      (_, i) => offerByMonth[i] - demandByMonth[i]
    );

    const annualOffer = offerByMonth.reduce((a, b) => a + b, 0);
    const annualDemand = demandByMonth.reduce((a, b) => a + b, 0);
    const annualBalance = balanceByMonth.reduce((a, b) => a + b, 0);

    const totalPV = herd.reduce(
      (sum, h) => sum + n(h.heads) * n(h.weight),
      0
    );
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
  }, [farm.region, paddocks, herd]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: 24,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 32,
              margin: 0,
              color: "#0f172a",
            }}
          >
            Balance Forrajero
          </h1>
          <p style={{ color: "#64748b", marginTop: 8 }}>
            Primera versión usable para cargar potreros, rodeo y ver el balance
            mensual.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 20 }}>Establecimiento</h2>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 14, color: "#334155" }}>
                  Nombre
                </label>
                <input
                  value={farm.name}
                  onChange={(e) =>
                    setFarm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 14, color: "#334155" }}>
                  Región
                </label>
                <select
                  value={farm.region}
                  onChange={(e) => {
                    const region = e.target.value;
                    const firstEnv = getEnvironmentOptions(region)[0] || "";
                    setFarm((prev) => ({ ...prev, region }));
                    setPaddocks((prev) =>
                      prev.map((p) => ({
                        ...p,
                        environment: firstEnv,
                      }))
                    );
                  }}
                  style={inputStyle}
                >
                  {REGIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 20 }}>Resumen</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>Potreros</h2>
              <button onClick={addPaddock} style={buttonStyle}>
                + Agregar
              </button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {paddocks.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: 14,
                    padding: 12,
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 0.7fr 1fr auto",
                      gap: 8,
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <label style={{ fontSize: 13, color: "#334155" }}>
                        Nombre
                      </label>
                      <input
                        value={p.name}
                        onChange={(e) =>
                          updatePaddock(p.id, "name", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 13, color: "#334155" }}>
                        Hectáreas
                      </label>
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
                      <label style={{ fontSize: 13, color: "#334155" }}>
                        Ambiente
                      </label>
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

                    <button
                      onClick={() => removePaddock(p.id)}
                      style={dangerButtonStyle}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>Rodeo</h2>
              <button onClick={addHerdRow} style={buttonStyle}>
                + Agregar
              </button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {herd.map((h) => (
                <div
                  key={h.id}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: 14,
                    padding: 12,
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 0.7fr 0.7fr 0.7fr auto",
                      gap: 8,
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <label style={{ fontSize: 13, color: "#334155" }}>
                        Categoría
                      </label>
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
                      <label style={{ fontSize: 13, color: "#334155" }}>
                        Cabezas
                      </label>
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
                      <label style={{ fontSize: 13, color: "#334155" }}>
                        Peso
                      </label>
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
                      <label style={{ fontSize: 13, color: "#334155" }}>
                        Consumo %
                      </label>
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

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 20 }}>Gráfico mensual</h2>
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

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 20 }}>Tabla mensual</h2>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
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

const dangerButtonStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  fontWeight: 600,
  cursor: "pointer",
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
