import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
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
  { key: "dic", label: "Dic", days: 31 }
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
    utilization: 0.5
  },
  {
    region: "Sierras del Este",
    environment: "Serrano medio",
    annual: 2200,
    autumn: 26,
    winter: 7,
    spring: 28,
    summer: 39,
    utilization: 0.52
  },
  {
    region: "Sierras del Este",
    environment: "Serrano profundo",
    annual: 2800,
    autumn: 24,
    winter: 9,
    spring: 30,
    summer: 37,
    utilization: 0.55
  }
];

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
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
    dic: row.summer / 3
  };
}

function getRow(region, env) {
  return (
    FIELD_NATURAL_TABLE.find(
      r => r.region === region && r.environment === env
    ) || FIELD_NATURAL_TABLE[0]
  );
}

export default function BalanceForrajeroWebApp() {

  const [farm, setFarm] = useState({
    name: "Mi establecimiento",
    region: "Sierras del Este"
  });

  const [paddocks, setPaddocks] = useState([
    {
      id: 1,
      name: "Campo natural",
      hectares: 100,
      environment: "Serrano medio"
    }
  ]);

  const [herd, setHerd] = useState([
    { id: 1, category: "Vaca cría", heads: 100, weight: 400, intake: 2.3 }
  ]);

  useEffect(() => {
    localStorage.setItem(
      "bf_autosave",
      JSON.stringify({ farm, paddocks, herd })
    );
  }, [farm, paddocks, herd]);

  const monthlyResults = useMemo(() => {

    const paddockOffers = paddocks.map(p => {

      const row = getRow(farm.region, p.environment);

      const dist = seasonToMonthly(row);

      return MONTHS.map(m => {

        const pct = dist[m.key] || 0;

        const perHa = row.annual * (pct / 100);

        return perHa * n(p.hectares) * row.utilization;

      });

    });

    const offerByMonth = MONTHS.map((_, i) =>
      paddockOffers.reduce((s, p) => s + p[i], 0)
    );

    const demandByMonth = MONTHS.map(m =>
      herd.reduce(
        (sum, h) =>
          sum +
          n(h.heads) *
            n(h.weight) *
            (n(h.intake) / 100) *
            m.days,
        0
      )
    );

    const balanceByMonth = MONTHS.map(
      (_, i) => offerByMonth[i] - demandByMonth[i]
    );

    const totalPV = herd.reduce(
      (s, h) => s + n(h.heads) * n(h.weight),
      0
    );

    const totalArea = paddocks.reduce(
      (s, p) => s + n(p.hectares),
      0
    );

    return {
      offerByMonth,
      demandByMonth,
      balanceByMonth,
      totalPV,
      totalArea
    };

  }, [farm.region, paddocks, herd]);

  const exportCSV = () => {

    const rows = MONTHS.map((m, i) => [
      m.label,
      monthlyResults.offerByMonth[i],
      monthlyResults.demandByMonth[i],
      monthlyResults.balanceByMonth[i]
    ]);

    const csv = [["Mes", "Oferta", "Demanda", "Balance"], ...rows]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob([csv]);

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "balance_forrajero.csv";

    a.click();

  };

  return (

    <div style={{ padding: 40, maxWidth: 900, margin: "auto" }}>

      <h1>App Balance Forrajero</h1>

      <button onClick={exportCSV}>Exportar CSV</button>

      <h2>Resumen</h2>

      <div style={{ display: "flex", gap: 20 }}>

        <div>
          Carga actual
          <br />
          {(
            monthlyResults.totalPV /
            monthlyResults.totalArea
          ).toFixed(1)}{" "}
          kg PV/ha
        </div>

        <div>
          Oferta anual
          <br />
          {Math.round(
            monthlyResults.offerByMonth.reduce((a, b) => a + b, 0)
          )}{" "}
          kg MS
        </div>

        <div>
          Demanda anual
          <br />
          {Math.round(
            monthlyResults.demandByMonth.reduce((a, b) => a + b, 0)
          )}{" "}
          kg MS
        </div>

      </div>

      <h2>Gráfico</h2>

      <LineChart
        width={800}
        height={300}
        data={MONTHS.map((m, i) => ({
          mes: m.label,
          oferta: monthlyResults.offerByMonth[i],
          demanda: monthlyResults.demandByMonth[i],
          balance: monthlyResults.balanceByMonth[i]
        }))}
      >

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

    </div>

  );

}
