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

// Balance predial: un solo motor mensual de oferta y demanda; sin simulador rotativo.
const MONTHS = [
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
  { key: "ene", label: "Ene", days: 31, index: 1 },
  { key: "feb", label: "Feb", days: 28, index: 2 },
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
  "Campo natural mejorado",
  "Pradera bianual",
  "Pradera perenne",
  "Verdeo de invierno",
  "Verdeo de verano",
];

const SECOND_CROP_TYPES = [
  "Campo natural mejorado",
  "Pradera bianual",
  "Pradera perenne",
  "Verdeo de invierno",
  "Verdeo de verano",
];

const MANAGEMENT_LEVELS = [
  { label: "Bajo", factor: 0.75 },
  { label: "Medio", factor: 0.90 },
  { label: "Alto", factor: 1.0 },
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
  { region: "Sierras del Este", environment: "Serrano superficial", annual: 1500, autumn: 28, winter: 5, spring: 26, summer: 41 },
  { region: "Sierras del Este", environment: "Serrano medio", annual: 2200, autumn: 26, winter: 7, spring: 28, summer: 39 },
  { region: "Sierras del Este", environment: "Serrano profundo", annual: 2800, autumn: 24, winter: 9, spring: 30, summer: 37 },
  { region: "Lomadas del Este", environment: "General", annual: 3426, autumn: 26, winter: 15, spring: 35, summer: 24 },
  { region: "Basalto", environment: "Superficial", annual: 2885, autumn: 28, winter: 15, spring: 40, summer: 17 },
  { region: "Basalto", environment: "Profundo", annual: 4000, autumn: 25, winter: 12, spring: 44, summer: 19 },
  { region: "Cristalino / Centro Sur", environment: "Superficial", annual: 2316, autumn: 22, winter: 22, spring: 21, summer: 35 },
  { region: "Cristalino / Centro Sur", environment: "Brunosol subeútrico", annual: 3206, autumn: 22, winter: 18, spring: 27, summer: 33 },
  { region: "Cristalino / Centro Sur", environment: "Brunosol eútrico", annual: 3665, autumn: 21, winter: 16, spring: 28, summer: 35 },
  { region: "Areniscas", environment: "Ladera alta", annual: 5144, autumn: 13, winter: 7, spring: 31, summer: 49 },
  { region: "Cretácico", environment: "Agrio", annual: 5530, autumn: 23, winter: 15, spring: 28, summer: 34 },
  { region: "Litoral", environment: "General", annual: 6000, autumn: 24, winter: 16, spring: 34, summer: 26 },
  { region: "Litoral Sur", environment: "General agrícola-ganadero", annual: 7000, autumn: 25, winter: 18, spring: 36, summer: 21 },
  { region: "Llanuras del Este / Cuenca Laguna Merín", environment: "Tendido alto", annual: 3000, autumn: 22, winter: 10, spring: 28, summer: 40 },
  { region: "Llanuras del Este / Cuenca Laguna Merín", environment: "Plano medio", annual: 3800, autumn: 21, winter: 11, spring: 30, summer: 38 },
  { region: "Llanuras del Este / Cuenca Laguna Merín", environment: "Bajo dulce/húmedo", annual: 4500, autumn: 20, winter: 14, spring: 31, summer: 35 },
];

const SEEDED_SUBTYPES = {
  "Campo natural mejorado": [
    { name: "Campo natural + raigrás", annual: 3500, monthly: { ene: 12, feb: 10, mar: 10, abr: 10, may: 9, jun: 6, jul: 5, ago: 6, sep: 9, oct: 10, nov: 7, dic: 6 }, defaultFirstGrazingDays: 40, defaultEndMonth: 12, defaultEfficiency: 55 },
    { name: "Campo natural + lotus rincón", annual: 3800, monthly: { ene: 14, feb: 12, mar: 10, abr: 8, may: 7, jun: 5, jul: 4, ago: 5, sep: 8, oct: 10, nov: 9, dic: 8 }, defaultFirstGrazingDays: 60, defaultEndMonth: 12, defaultEfficiency: 55 },
    { name: "Campo natural + raigrás + lotus", annual: 4500, monthly: { ene: 12, feb: 10, mar: 10, abr: 10, may: 9, jun: 7, jul: 6, ago: 7, sep: 10, oct: 10, nov: 5, dic: 4 }, defaultFirstGrazingDays: 45, defaultEndMonth: 12, defaultEfficiency: 60 },
    { name: "Campo natural + trébol blanco + raigrás", annual: 4300, monthly: { ene: 11, feb: 9, mar: 10, abr: 10, may: 9, jun: 7, jul: 6, ago: 7, sep: 10, oct: 11, nov: 6, dic: 4 }, defaultFirstGrazingDays: 45, defaultEndMonth: 12, defaultEfficiency: 58 },
  ],
  "Pradera bianual": [
    { name: "Raigrás + trébol rojo", annual: 9000, monthly: { ene: 8, feb: 7, mar: 8, abr: 8, may: 7, jun: 6, jul: 6, ago: 8, sep: 12, oct: 14, nov: 10, dic: 6 }, defaultFirstGrazingDays: 70, defaultEndMonth: 12, defaultEfficiency: 65 },
    { name: "Holcus + trébol rojo", annual: 7800, monthly: { ene: 9, feb: 8, mar: 8, abr: 7, may: 6, jun: 5, jul: 5, ago: 7, sep: 10, oct: 13, nov: 12, dic: 10 }, defaultFirstGrazingDays: 80, defaultEndMonth: 12, defaultEfficiency: 62 },
    { name: "Raigrás + achicoria + trébol rojo", annual: 9500, monthly: { ene: 10, feb: 9, mar: 8, abr: 8, may: 7, jun: 6, jul: 5, ago: 7, sep: 11, oct: 13, nov: 10, dic: 6 }, defaultFirstGrazingDays: 70, defaultEndMonth: 12, defaultEfficiency: 65 },
    { name: "Cebadilla + trébol rojo", annual: 8200, monthly: { ene: 9, feb: 8, mar: 8, abr: 7, may: 6, jun: 5, jul: 5, ago: 7, sep: 11, oct: 13, nov: 12, dic: 9 }, defaultFirstGrazingDays: 80, defaultEndMonth: 12, defaultEfficiency: 63 },
  ],
  "Pradera perenne": [
    { name: "Festuca + trébol blanco + lotus", annual: 8500, monthly: { ene: 9, feb: 7, mar: 7, abr: 7, may: 6, jun: 5, jul: 5, ago: 7, sep: 10, oct: 13, nov: 13, dic: 11 }, defaultFirstGrazingDays: 90, defaultEndMonth: 12, defaultEfficiency: 65 },
    { name: "Dactylis + trébol blanco + trébol rojo", annual: 9000, monthly: { ene: 10, feb: 8, mar: 7, abr: 7, may: 6, jun: 5, jul: 5, ago: 7, sep: 10, oct: 13, nov: 12, dic: 10 }, defaultFirstGrazingDays: 90, defaultEndMonth: 12, defaultEfficiency: 65 },
    { name: "Raigrás perenne + trébol blanco", annual: 8200, monthly: { ene: 8, feb: 7, mar: 8, abr: 8, may: 7, jun: 6, jul: 6, ago: 8, sep: 11, oct: 13, nov: 11, dic: 7 }, defaultFirstGrazingDays: 75, defaultEndMonth: 12, defaultEfficiency: 65 },
    { name: "Festuca + lotus", annual: 7500, monthly: { ene: 10, feb: 9, mar: 8, abr: 7, may: 6, jun: 5, jul: 5, ago: 6, sep: 9, oct: 12, nov: 12, dic: 9 }, defaultFirstGrazingDays: 90, defaultEndMonth: 12, defaultEfficiency: 65 },
  ],
  "Verdeo de invierno": [
    { name: "Raigrás anual", annual: 8000, monthly: { ene: 0, feb: 0, mar: 0, abr: 0, may: 10, jun: 12, jul: 13, ago: 17, sep: 25, oct: 18, nov: 5, dic: 0 }, defaultFirstGrazingDays: 60, defaultEndMonth: 10, defaultEfficiency: 70 },
    { name: "Avena", annual: 8500, monthly: { ene: 0, feb: 0, mar: 0, abr: 0, may: 12, jun: 20, jul: 23, ago: 20, sep: 15, oct: 8, nov: 2, dic: 0 }, defaultFirstGrazingDays: 45, defaultEndMonth: 10, defaultEfficiency: 70 },
    { name: "Avena + raigrás", annual: 9800, monthly: { ene: 0, feb: 0, mar: 0, abr: 0, may: 10, jun: 18, jul: 22, ago: 22, sep: 17, oct: 9, nov: 2, dic: 0 }, defaultFirstGrazingDays: 50, defaultEndMonth: 10, defaultEfficiency: 70 },
    { name: "Raigrás tetraploide", annual: 10500, monthly: { ene: 0, feb: 0, mar: 0, abr: 0, may: 10, jun: 18, jul: 22, ago: 22, sep: 18, oct: 8, nov: 2, dic: 0 }, defaultFirstGrazingDays: 55, defaultEndMonth: 10, defaultEfficiency: 70 },
    { name: "Avena + trébol rojo", annual: 9000, monthly: { ene: 0, feb: 0, mar: 0, abr: 0, may: 12, jun: 20, jul: 22, ago: 20, sep: 16, oct: 8, nov: 2, dic: 0 }, defaultFirstGrazingDays: 50, defaultEndMonth: 10, defaultEfficiency: 70 },
  ],
  "Verdeo de verano": [
    { name: "Sudangrás", annual: 13000, monthly: { ene: 20, feb: 18, mar: 10, abr: 3, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, oct: 0, nov: 14, dic: 35 }, defaultFirstGrazingDays: 45, defaultEndMonth: 3, defaultEfficiency: 70 },
    { name: "Sorgo forrajero", annual: 14500, monthly: { ene: 22, feb: 20, mar: 12, abr: 4, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, oct: 0, nov: 12, dic: 30 }, defaultFirstGrazingDays: 50, defaultEndMonth: 3, defaultEfficiency: 70 },
    { name: "Moha", annual: 9000, monthly: { ene: 28, feb: 25, mar: 12, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, oct: 0, nov: 10, dic: 25 }, defaultFirstGrazingDays: 35, defaultEndMonth: 2, defaultEfficiency: 70 },
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

function localDateKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }

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

// Cada mes pertenece a un ejercicio marzo-febrero con año explícito.
function exerciseMonthDate(monthIndex, exerciseYear) {
  return new Date(exerciseYear + (monthIndex < 3 ? 1 : 0), monthIndex - 1, 1);
}

function getCropEndDate(crop) {
  const sowing = parseLocalDate(crop.sowingDate);
  if (!sowing) return null;
  const first = getFirstGrazingDate(crop);
  if (!first) return null;
  const endMonth = n(crop.endMonth);
  if (endMonth < 1 || endMonth > 12) return null;
  let endYear = sowing.getFullYear();
  if (endMonth < sowing.getMonth() + 1) endYear += 1;
  let end = new Date(endYear, endMonth, 0);
  // El fin nunca puede preceder al primer pastoreo.
  while (end < first) {
    endYear += 1;
    end = new Date(endYear, endMonth, 0);
  }
  return end;
}

function getMonthActivationFactor(monthIndex, crop, exerciseYear) {
  const first = getFirstGrazingDate(crop);
  const end = getCropEndDate(crop);
  if (!first || !end) return 0;
  const monthStart = exerciseMonthDate(monthIndex, exerciseYear);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  const from = new Date(Math.max(first.getTime(), monthStart.getTime()));
  const to = new Date(Math.min(end.getTime(), monthEnd.getTime()));
  if (to < from) return 0;
  return (Math.round((to - from) / 86400000) + 1) / monthEnd.getDate();
}

// Salida exclusiva: el día de venta no genera consumo.
function activeHerdDays(row, monthIndex, exerciseYear) {
  const start = exerciseMonthDate(monthIndex, exerciseYear);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  const entry = parseLocalDate(row.entryDate);
  const exit = parseLocalDate(row.exitDate);
  // Compatibilidad con rodeos de versiones anteriores: sin fechas, todo el ejercicio.
  if (!entry && !exit) return Math.round((end - start) / 86400000);
  if ((row.entryDate && !entry) || (row.exitDate && !exit)) return 0;
  const from = entry && entry > start ? entry : start;
  const to = exit && exit < end ? exit : end;
  return Math.max(0, Math.round((to - from) / 86400000));
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

// Períodos semiabiertos: fecha de salida no cuenta como día de alimentación.
function overlapDaysForSupplement(s, lot, monthIndex, exerciseYear) {
  const monthStart = exerciseMonthDate(monthIndex, exerciseYear);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  const entry = parseLocalDate(lot.entryDate);
  const exit = parseLocalDate(lot.exitDate);
  const start = parseLocalDate(s.startDate);
  const end = parseLocalDate(s.endDate);
  if ((s.startDate && !start) || (s.endDate && !end)) return 0;
  if (start && end && end <= start) return 0;
  if (entry && exit && exit <= entry) return 0;
  // Exigir fechas explícitas: evita contabilizar accidentalmente
  // raciones históricas con meses y años ambiguos.
  if (!start || !end) return 0;
  const from = new Date(Math.max(monthStart.getTime(), entry?.getTime() ?? -Infinity, start?.getTime() ?? -Infinity));
  const to = new Date(Math.min(monthEnd.getTime(), exit?.getTime() ?? Infinity, end?.getTime() ?? Infinity));
  return Math.max(0, Math.round((to - from) / 86400000));
}
function lotAverageWeight(lot) {
  return lot.entryWeight != null && lot.exitWeight != null
    ? (n(lot.entryWeight) + n(lot.exitWeight)) / 2 : n(lot.weight);
}
// Peso diario interpolado entre los pesos de entrada y salida declarados.
// Es una trayectoria de planificación, NO la predicción nutricional del simulador.
function lotWeightOnDay(lot, day) {
  const fallback = Math.max(0, lotAverageWeight(lot));
  const entry = parseLocalDate(lot.entryDate);
  const exit = parseLocalDate(lot.exitDate);
  const initial = Number(lot.entryWeight), final = Number(lot.exitWeight);
  if (!entry || !exit || exit <= entry || !Number.isFinite(initial) || !Number.isFinite(final) ||
      lot.entryWeight == null || lot.exitWeight == null) return fallback;
  const total = Math.round((exit - entry) / 86400000);
  if (total <= 0) return fallback;
  const elapsed = Math.max(0, Math.min(total, Math.round((day - entry) / 86400000)));
  return Math.max(0, initial + (final - initial) * elapsed / total);
}
function rationKgPerHeadAtWeight(s, lot, weight) {
  const dm = n(s.dmPercent) / 100;
  if (dm <= 0 || dm > 1) return 0;
  if (s.rationPvPercent == null) return Math.max(0, n(s.kgRation));
  return Math.max(0, weight * n(s.rationPvPercent) / 100 / dm);
}
function rationKgPerHead(s, lot) {
  return rationKgPerHeadAtWeight(s, lot, lotAverageWeight(lot));
}
function hasSupplementConflict(s, supplements) {
  return supplements.some(other => other !== s &&
    String(other.herdId) === String(s.herdId) &&
    s.startDate && s.endDate && other.startDate && other.endDate &&
    s.startDate < other.endDate && other.startDate < s.endDate);
}
function supplementStats(s, lot, exerciseYear, supplements = []) {
  if (!lot) return { days: 0, kgHead: 0, totalKg: 0, totalDm: 0, cost: 0 };
  let days = 0, totalKg = 0;
  for (const month of MONTHS) {
    const from = exerciseMonthDate(month.index, exerciseYear);
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
    for (let day = new Date(from); day < to; day = addDays(day, 1)) {
      const entry = parseLocalDate(lot.entryDate), exit = parseLocalDate(lot.exitDate);
      const begin = parseLocalDate(s.startDate), finish = parseLocalDate(s.endDate);
      if (!begin || !finish || finish <= begin || day < begin || day >= finish ||
          (entry && day < entry) || (exit && day >= exit)) continue;
      const overlapping = supplements.filter(other => String(other.herdId) === String(lot.id) &&
        parseLocalDate(other.startDate) && parseLocalDate(other.endDate) &&
        day >= parseLocalDate(other.startDate) && day < parseLocalDate(other.endDate));
      if (overlapping.length > 1) continue;
      days++;
      totalKg += Math.max(0, n(lot.heads)) * rationKgPerHeadAtWeight(s, lot, lotWeightOnDay(lot, day));
    }
  }
  const kgHead = days > 0 && n(lot.heads) > 0 ? totalKg / days / n(lot.heads) : 0;
  return { days, kgHead, totalKg, totalDm: totalKg * n(s.dmPercent) / 100,
    cost: totalKg / 1000 * n(s.pricePerTon) };
}

// Costo y toneladas tal cual coherentes con el registro nutricional diario.
// Para el lote proyectado, se usa la MS realmente suministrada por fecha,
// el %MS y el precio del período activo; los demás lotes conservan planificación.
function annualSupplementAccounting(herd, supplements, exerciseYear, projection = null) {
  let totalKg = 0, totalCost = 0, missingPriceDays = 0;
  for (const s of supplements) {
    const lot = herd.find(h => String(h.id) === String(s.herdId));
    if (!lot || (projection && String(lot.id) === String(projection.lotId))) continue;
    const stats = supplementStats(s, lot, exerciseYear, supplements);
    totalKg += stats.totalKg;
    totalCost += stats.cost;
  }
  if (projection) {
    for (const [date, row] of Object.entries(projection.byDate)) {
      const active = supplements.filter(s => String(s.herdId) === String(projection.lotId) &&
        s.startDate && s.endDate && date >= s.startDate && date < s.endDate);
      if (active.length !== 1) {
        if (row.rationDm > 1e-8) missingPriceDays++;
        continue;
      }
      const s = active[0];
      const fraction = n(s.dmPercent) / 100;
      if (!(fraction > 0 && fraction <= 1)) { missingPriceDays++; continue; }
      const kg = Math.max(0, n(row.rationDm)) / fraction;
      totalKg += kg;
      totalCost += kg / 1000 * Math.max(0, n(s.pricePerTon));
    }
  }
  return {totalKg, totalCost, missingPriceDays};
}

// Libro diario único del balance principal: kg de MS, días semiabiertos.
// Usa una trayectoria diaria interpolada entre los pesos declarados.
// Todavía NO equivale a la proyección nutricional del simulador.
function monthlyFeedLedger(herd, supplements, exerciseYear, projection = null) {
  return MONTHS.map(month => {
    const from = exerciseMonthDate(month.index, exerciseYear);
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
    let demand = 0, ration = 0, pastureReduction = 0;
    let conflictDays = 0;
    for (let day = new Date(from); day < to; day = addDays(day, 1)) {
      for (const lot of herd) {
        const entry = parseLocalDate(lot.entryDate);
        const exit = parseLocalDate(lot.exitDate);
        if ((lot.entryDate && !entry) || (lot.exitDate && !exit)) continue;
        if ((entry && day < entry) || (exit && day >= exit)) continue;
        const heads = Math.max(0, n(lot.heads));
        const projected = projection?.lotId === String(lot.id)
          ? projection.byDate[`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`]
          : null;
        if (projected) {
          // La demanda alimenticia del lote simulado es el consumo real
          // estimado (pasto + ración), no un porcentaje fijo del PV.
          const pastureDm = Math.max(0, projected.pastureDm);
          const rationDm = Math.max(0, projected.rationDm);
          demand += pastureDm + rationDm;
          ration += rationDm;
          pastureReduction += rationDm;
          continue;
        }
        const weight = lotWeightOnDay(lot, day);
        const dailyDemand = heads * weight * Math.max(0, n(lot.intake)) / 100;
        demand += dailyDemand;
        const active = supplements.filter(s => {
          if (String(s.herdId) !== String(lot.id)) return false;
          const start = parseLocalDate(s.startDate), end = parseLocalDate(s.endDate);
          return start && end && end > start && day >= start && day < end;
        });
        if (active.length > 1) { conflictDays++; continue; }
        if (active.length === 0) continue;
        const s = active[0];
        const dmFraction = n(s.dmPercent) / 100;
        if (!(dmFraction > 0 && dmFraction <= 1)) continue;
        const dailyRation = heads * rationKgPerHeadAtWeight(s, lot, weight) * dmFraction;
        ration += dailyRation;
        const displaced = s.feedingMode === 'complete'
          ? dailyDemand
          : dailyRation * Math.min(1, Math.max(0, n(s.substitutionRate)));
        pastureReduction += Math.min(dailyDemand, displaced);
      }
    }
    return { demand, ration, pastureReduction, conflictDays };
  });
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

function defaultSupplementRow() {
  const animal = ANIMAL_CATEGORIES[0];
  return {
    id: Date.now(),
    herdId: "",
    category: animal.label,
    heads: 0,
    weight: animal.weight,
    intake: animal.intake,
    rationPvPercent: 2,
    feedingMode: "partial",
    startDate: "",
    endDate: "",
    pricePerTon: 0,
    kgRation: 2,
    dmPercent: 90,
    substitutionRate: 0.3,
    monthStart: 6,
    monthEnd: 8,
  };
}


// Motor nutricional: AFRC (1993) y Australian Feeding Standards/CSIRO,
// transcritos en Simeone y Beretta, Guía SAGC (Udelar, 2024), pp. 5 y 8-13.
// Los coeficientes de proteína son REFERENCIAS INTERNAS de raigrás y maíz
// de la Tabla III.1, no análisis del alimento particular del productor.
// La PM de raciones comerciales no puede validarse con solo %PB y EM.
// La ración se fija como fracción de la ingesta potencial, independiente
// de restricciones físicas de la parcela. No equivale a % de dieta observada.
function estimatePastureNutrition({weight, heads, area, days, forage, residual, utilization,
  growth, me, digestibility, legumes, rationShare, rationMe, protein=17,
  rationProtein=16, pastureCapPerHead=null, supplementDmOverride=null, fullRation=false, sex='steer'}) {
  const pv=Math.max(1,weight), nHeads=Math.max(0,heads);
  const s=sex==='heifer'?550:660;
  // Sin edad ni condición corporal, z=PV/peso adulto es un supuesto explícito.
  const z=Math.min(1.6,pv/s);
  const potential=Math.max(0,0.025*s*z*(1.7-z));
  const quality=Math.max(0,Math.min(1.2,1-1.7*(0.8-digestibility)+0.17*legumes));
  const h=Math.max(0,forage)/1000;
  const harvest=(1-Math.exp(-0.8*h))*(1+0.6*Math.exp(-0.5*h*h));
  const voluntaryPasture=Math.max(0,potential*quality*harvest);
  const share=Math.max(0,Math.min(1,rationShare));
  const pastureCap=Math.max(0,pastureCapPerHead===null?Infinity:pastureCapPerHead);
  // La ración programada NO desaparece cuando falta pasto. La fracción
  // indica proporción de la ingesta POTENCIAL, no de la ingesta restringida.
  // El pasto disponible limita únicamente el componente pastoril.
  const supplementIntake=supplementDmOverride === null ? potential*share : Math.max(0,supplementDmOverride);
  const pastureIntake=fullRation ? 0 : Math.min(voluntaryPasture*(supplementDmOverride === null ? 1-share : Math.max(0,1-supplementIntake/Math.max(0.001,potential))),pastureCap);
  const totalIntake=pastureIntake+supplementIntake;
  const emIntake=pastureIntake*me+supplementIntake*rationMe;
  const dietEm=totalIntake>0?emIntake/totalIntake:me;
  const qm=Math.max(0.01,Math.min(0.95,dietEm/4.4)); // EB=4.4 Mcal/kg, supuesto
  const km=0.35*qm+0.503, kg=0.78*qm+0.006;
  const enBasal=0.53*Math.pow(pv/1.08,0.67); // MJ/día, novillos/vaquillonas (C1=1)
  const enBasicAct=0.0071*pv;
  const greenTons=Math.max(0.05,forage/1000); // disponibilidad total, supuesto de forraje verde
  const enGrazing=(0.006*pastureIntake*(0.9-digestibility)+0.05/(greenTons+3))*pv; // MJ/d: la guía expresa este término dividido por 4.184 en Mcal/d; NO multiplicar por 4.184 otra vez
  const emMaintenance=(enBasal+enBasicAct+enGrazing)/km/4.184;
  const c2=sex==='heifer'?1.15:1;
  const growthNeed=g=>g*c2*(4.1+0.0332*pv-0.000009*pv*pv)*(1-0.147*g)/kg/4.184;
  const surplus=emIntake-emMaintenance;
  // PM disponible (AFRC, p.13): síntesis microbiana limitada por EMF o ERDP.
  // Referencia ryegrass a=.34,b=.57,c=.10,ADIN=.5; suplemento se
  // aproxima con perfil de maíz grano y NO representa una ración comercial.
  const proteinSources=[
    {dm:pastureIntake,cp:protein*10,emf:me*(2.56/2.78),a:.34,b:.57,c:.10,adin:.5},
    {dm:supplementIntake,cp:rationProtein*10,emf:rationMe*(2.90/3.00),a:.26,b:.69,c:.01,adin:.02}
  ];
  const level=Math.max(0.01,emIntake/Math.max(.01,emMaintenance));
  const y=7+6*(1-Math.exp(-.35*level));
  const r=Math.max(0,-.024+.179*(1-Math.exp(-.278*level))); // tasa de pasaje físicamente no negativa
  let fermentable=0,erdp=0,udpDigestible=0;
  for(const f of proteinSources){
    const qdp=f.a*f.cp;
    const sdp=(f.b*f.c/(f.c+r))*f.cp;
    fermentable+=f.dm*f.emf*4.184;
    erdp+=f.dm*(.8*qdp+sdp);
    udpDigestible+=f.dm*.9*Math.max(0,f.cp-qdp-sdp-6.25*f.adin);
  }
  const microbialProtein=Math.min(y*fermentable,erdp)*.75*.85;
  const pmSupply=microbialProtein+udpDigestible;
  const pmMaintenance=2.30*Math.pow(pv,.75);
  const c6=sex==='heifer'?.9:1;
  const pmGrowthNeed=g=>c6*(168.07-.16869*pv+.0001633*pv*pv)*(1.12-.1223*g)*g/.59;
  // Resolver en rama creciente, con rango fisiológico de evaluación.
  // 2 kg/d no es una predicción máxima biológica, sino límite de validez
  // OPERATIVO de este modelo sin edad, condición corporal ni análisis de PM.
  const MAX_TEST_GMD=2;
  function solve(limit,fn){
    if(limit<=0)return 0;
    let lo=0,hi=MAX_TEST_GMD;
    for(let i=0;i<50;i++){
      const mid=(lo+hi)/2;
      if(fn(mid)<=limit)lo=mid;else hi=mid;
    }
    return lo;
  }
  const gmdEnergy=solve(surplus,growthNeed);
  const gmdProtein=solve(pmSupply-pmMaintenance,pmGrowthNeed);
  // Balance negativo: estimación exploratoria de movilización corporal.
  // Convertimos déficit de EM a EN mediante km. Se asumen 20 MJ de EN/kg
  // de peso vivo perdido; NO equivale a validación para animales flacos.
  const negativeGain=surplus<0 ? Math.max(-2, surplus*4.184*km/20) : 0; // sensibilidad: 20 MJ EN/kg pérdida, sin calibrar
  const gmd=surplus<0 ? negativeGain : Math.min(gmdEnergy,gmdProtein);
  // La búsqueda energética saturada no es una predicción de 2 kg/d:
  // significa que la ecuación no quedó acotada dentro del dominio evaluado.
  const energyAtBoundary=gmdEnergy>=MAX_TEST_GMD-0.0001;
  const proteinAtBoundary=gmdProtein>=MAX_TEST_GMD-0.0001;
  const outsideRange=gmd>=MAX_TEST_GMD-0.0001 || energyAtBoundary || proteinAtBoundary;
  // Aunque la PM determine la cifra final, no declarar validado un escenario
  // donde alguno de los submodelos agotó el dominio de búsqueda.
  const pmApproximate=supplementIntake>0.001;
  return {gmd, gmdEnergy,gmdProtein, energyAtBoundary,proteinAtBoundary,energyOutsideRange:outsideRange,
    pmApproximate,pmSupply,pmMaintenance,potential,pastureIntake,
    supplementIntake,totalIntake,emIntake,emMaintenance,qm,quality,harvest,surplus};
}

// Planificador independiente: los resultados son escenarios y no reemplazan
// las mediciones de disponibilidad ni un modelo nutricional calibrado.
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

  const [supplements, setSupplements] = useState(autosave?.supplements || []);
  const [exerciseYear, setExerciseYear] = useState(
    autosave?.exerciseYear ?? (Number((autosave?.paddocks || []).flatMap(p => [p.sowingDate, p.secondCrop?.sowingDate]).find(Boolean)?.slice(0, 4)) || new Date().getFullYear())
  );

  useEffect(() => {
    localStorage.setItem(
      "bf_autosave",
      JSON.stringify({ farm, paddocks, herd, supplements, exerciseYear })
    );
  }, [farm, paddocks, herd, supplements, exerciseYear]);

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
      supplements,
      exerciseYear,
    };
    persistFarms([...savedFarms, farmData]);
  };

  const loadFarm = (f) => {
    setFarm(f.farm);
    setPaddocks(f.paddocks);
    setHerd(f.herd);
    setSupplements(f.supplements || []);
    setExerciseYear(f.exerciseYear ?? (
      Number((f.paddocks || []).flatMap(p => [p.sowingDate, p.secondCrop?.sowingDate]).find(Boolean)?.slice(0, 4))
      || new Date().getFullYear()
    ));
  };

  const duplicateScenario = () => {
    setPaddocks(JSON.parse(JSON.stringify(paddocks)));
    setHerd(JSON.parse(JSON.stringify(herd)));
    setSupplements(JSON.parse(JSON.stringify(supplements)));
  };

  const exportCSV = () => {
    const rows = MONTHS.map((m, i) => [
      `${m.label} ${exerciseYear + (m.index < 3 ? 1 : 0)}`,
      Math.round(results.offerByMonth[i]),
      Math.round(results.demandByMonth[i]),
      Math.round(results.pastureReductionByMonth[i]),
      Math.round(results.adjustedDemandByMonth[i]),
      Math.round(results.supplementDmByMonth[i]),
      Math.round(results.totalFeedOfferByMonth[i]),
      Math.round(results.totalFeedBalanceByMonth[i]),
      Math.round(results.balanceByMonth[i]),
      Math.round(results.realBalanceByMonth[i]),
    ]);

    const csv = [
      [
        "Mes",
        "Oferta pasto",
        "Demanda original",
        "Reduccion pasto por sustitucion",
        "Demanda ajustada",
        "Suplemento MS",
        "Oferta total MS",
        "Balance alimenticio total",
        "Balance original",
        "Balance real",
      ],
      ...rows,
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "balance_forrajero_suplementacion.csv";
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
        entryWeight: a.weight,
        exitWeight: a.weight,
        intake: a.intake,
        entryDate: `${exerciseYear}-03-01`,
        exitDate: `${exerciseYear + 1}-03-01`,
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
            entryWeight: found?.weight ?? h.weight,
            exitWeight: found?.weight ?? h.weight,
            intake: found?.intake ?? h.intake,
          };
        }

        return { ...h, [key]: value };
      })
    );
  };

  const removeHerd = (id) => {
    setHerd((prev) => prev.filter((h) => h.id !== id));
    // Conservar suplementaciones históricas para reasignarlas, sin contabilizarlas.
  };

  const addSupplementRow = () => {
    const row = defaultSupplementRow();
    const lot = herd[0];
    row.herdId = lot ? String(lot.id) : "";
    // Cada período se define independientemente: no se aplica ración
    // automáticamente durante toda la permanencia del lote.
    row.startDate = "";
    row.endDate = "";
    setSupplements((prev) => [...prev, row]);
  };

  const updateSupplementRow = (id, key, value) => {
    setSupplements((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;

        const updated = { ...s, [key]: value };
        // Cambiar el lote no debe modificar el período estratégico elegido.

        if (key === "category") {
          const found = ANIMAL_CATEGORIES.find((a) => a.label === value);
          if (found) {
            updated.weight = found.weight;
            updated.intake = found.intake;
          }
        }

        return updated;
      })
    );
  };

  const removeSupplementRow = (id) => {
    setSupplements((prev) => prev.filter((s) => s.id !== id));
  };

  const results = useMemo(() => {
    const climateFactor =
      CLIMATE_SCENARIOS.find((c) => c.label === farm.climate)?.factor ?? 1;

    // Presupuesto mensual de existencias utilizables, sin simulador de parcelas.
    // La producción se incorpora desde la siembra, aunque aún no se pueda pastorear.
    // El forraje de un cultivo no puede utilizarse antes del primer pastoreo.
    const monthlyGrowthByPaddock = MONTHS.map(m => paddocks.map(p => {
      const primaryManagement = MANAGEMENT_LEVELS.find(x => x.label === p.management)?.factor ?? 1;
      const cropGrowth = (crop, management, efficiency) => {
        const row = getSubtypeRow(crop.resourceType, crop.subtype);
        if (!row) return 0;
        const sow = parseLocalDate(crop.sowingDate);
        const end = getCropEndDate(crop);
        if (!sow || !end) return 0;
        const monthStart = exerciseMonthDate(m.index, exerciseYear);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth()+1, 0);
        const from = new Date(Math.max(monthStart.getTime(), sow.getTime()));
        const to = new Date(Math.min(monthEnd.getTime(), end.getTime()));
        if (to < from) return 0;
        const days = Math.round((to-from)/86400000)+1;
        return row.annual * n(row.monthly[m.key])/100 * days/monthEnd.getDate() *
          n(p.hectares) * Math.max(0, Math.min(1, n(efficiency)/100)) * management * climateFactor;
      };
      if (p.resourceType === "Campo natural") {
        const row = getFieldNaturalRow(farm.region,p.environment);
        if (!row) return 0;
        return row.annual * n(seasonToMonthly(row)[m.key])/100 * n(p.hectares) *
          Math.max(0,Math.min(1,n(p.efficiency)/100)) * primaryManagement * climateFactor;
      }
      const primary = cropGrowth(p,primaryManagement,p.efficiency);
      const second = p.secondCrop?.enabled ? cropGrowth(p.secondCrop,
        MANAGEMENT_LEVELS.find(x=>x.label===p.secondCrop.management)?.factor ?? 1,
        p.secondCrop.efficiency) : 0;
      return primary + second;
    }));
    const offerByMonth = monthlyGrowthByPaddock.map(values => values.reduce((a,b)=>a+b,0));

    // Los tres indicadores salen del MISMO libro diario, evitando diferencias
    // por fechas, solapamientos y sustitución calculados en rutas separadas.
    const feedLedger = monthlyFeedLedger(herd, supplements, exerciseYear);
    const demandByMonth = feedLedger.map(x => x.demand);
    const supplementDmByMonth = feedLedger.map(x => x.ration);
    const pastureReductionByMonth = feedLedger.map(x => x.pastureReduction);
    const feedConflictDays = feedLedger.reduce((sum, x) => sum + x.conflictDays, 0);

    // Balance alimenticio en kg MS: la ración cubre parte de la demanda total.
    // El coeficiente de sustitución describe comportamiento de pastoreo, no aporte nutritivo.
    const adjustedDemandByMonth = MONTHS.map((_, i) => Math.max(0, demandByMonth[i] - supplementDmByMonth[i]));
    const supplementNetByMonth = MONTHS.map((_, i) => Math.max(0, supplementDmByMonth[i] - pastureReductionByMonth[i]));
    const totalFeedOfferByMonth = MONTHS.map((_, i) => offerByMonth[i] + supplementDmByMonth[i]);

    // Inventario de MS aprovechable: la eficiencia de utilización YA se descontó
    // al calcular monthlyGrowthByPaddock. No aplicar otra merma genérica ni
    // eliminar excedentes mediante un techo universal de stock.
    // Solo se retira inventario cuando el ciclo forrajero ha terminado.
    const inventories = paddocks.map(() => 0);
    const availableStartByMonth = [], availableEndByMonth = [], pastureShortfallByMonth = [];
    const pastureConsumedByMonth = [], forageLossByMonth = [], inaccessibleByMonth = [];
    const balanceByMonth = [], realBalanceByMonth = [], totalFeedBalanceByMonth = [];
    const monthAccessible = (p,m) => {
      if (p.resourceType === "Campo natural") return true;
      const first = getFirstGrazingDate(p);
      const secondFirst = p.secondCrop?.enabled ? getFirstGrazingDate(p.secondCrop) : null;
      const monthEnd = new Date(exerciseMonthDate(m.index,exerciseYear).getFullYear(),m.index,0);
      const primaryEnd = getCropEndDate(p);
      const secondEnd = p.secondCrop?.enabled ? getCropEndDate(p.secondCrop) : null;
      return Boolean((first && first<=monthEnd && primaryEnd && primaryEnd>=exerciseMonthDate(m.index,exerciseYear)) ||
        (secondFirst && secondFirst<=monthEnd && secondEnd && secondEnd>=exerciseMonthDate(m.index,exerciseYear)));
    };
    MONTHS.forEach((m,i) => {
      const monthStart = exerciseMonthDate(m.index,exerciseYear);
      const monthEnd = new Date(monthStart.getFullYear(),monthStart.getMonth()+1,0);
      let losses = 0;
      paddocks.forEach((p,j) => {
        // Evita trasladar existencias de un cultivo ya terminado a otro cultivo.
        if (p.resourceType !== "Campo natural") {
          const ends = [getCropEndDate(p), p.secondCrop?.enabled ? getCropEndDate(p.secondCrop) : null].filter(Boolean);
          const lastEnd = ends.length ? new Date(Math.max(...ends.map(d=>d.getTime()))) : null;
          if (lastEnd && lastEnd < monthStart) { losses += inventories[j]; inventories[j] = 0; }
        }
      });
      const beginning = inventories.reduce((a,b)=>a+b,0);
      paddocks.forEach((p,j) => {
        inventories[j] += monthlyGrowthByPaddock[i][j];
      });
      const accessible = paddocks.reduce((sum,p,j) => sum+(monthAccessible(p,m)?inventories[j]:0),0);
      const demand = adjustedDemandByMonth[i];
      let remaining = Math.min(demand,accessible);
      const consumed = remaining;
      paddocks.forEach((p,j)=>{
        if (!monthAccessible(p,m) || accessible<=0) return;
        const take = consumed * inventories[j]/accessible;
        inventories[j] = Math.max(0,inventories[j]-take);
      });
      const closing = inventories.reduce((a,b)=>a+b,0);
      const shortfall = Math.max(0,demand-consumed);
      availableStartByMonth.push(beginning);
      availableEndByMonth.push(closing);
      pastureConsumedByMonth.push(consumed);
      pastureShortfallByMonth.push(shortfall);
      forageLossByMonth.push(losses);
      inaccessibleByMonth.push(Math.max(0,inventories.reduce((a,b)=>a+b,0)-paddocks.reduce((sum,p,j)=>sum+(monthAccessible(p,m)?inventories[j]:0),0)));
      balanceByMonth.push(offerByMonth[i]-demandByMonth[i]); // balance de flujo, solo referencia
      realBalanceByMonth.push(closing); // inventario final de pasto utilizable
      totalFeedBalanceByMonth.push(-shortfall);
    });

    const annualOffer = offerByMonth.reduce((a, b) => a + b, 0);
    const annualDemand = demandByMonth.reduce((a, b) => a + b, 0);
    const annualAdjustedDemand = adjustedDemandByMonth.reduce((a, b) => a + b, 0);
    const annualSupplementDm = supplementDmByMonth.reduce((a, b) => a + b, 0);
    const rationAccounting = annualSupplementAccounting(herd, supplements, exerciseYear);
    const annualRationKg = rationAccounting.totalKg;
    const annualRationCost = rationAccounting.totalCost;
    const unpricedRationDays = rationAccounting.missingPriceDays;
    const annualPastureReduction = pastureReductionByMonth.reduce((a, b) => a + b, 0);
    const annualSupplementNet = supplementNetByMonth.reduce((a, b) => a + b, 0);
    const annualBalance = balanceByMonth.reduce((a, b) => a + b, 0);
    const annualRealBalance = availableEndByMonth.at(-1) ?? 0;
    const totalPV = herd.reduce((sum, h) => sum + n(h.heads) * ((h.entryWeight != null && h.exitWeight != null) ? (n(h.entryWeight) + n(h.exitWeight)) / 2 : n(h.weight)), 0);
    const totalArea = paddocks.reduce((sum, p) => sum + n(p.hectares), 0);
    const currentLoad = totalArea > 0 ? totalPV / totalArea : 0;

    const chartData = MONTHS.map((m, i) => ({
      mes: `${m.label} ${exerciseYear + (m.index < 3 ? 1 : 0)}`,
      oferta: Math.round(offerByMonth[i]),
      racion: Math.round(supplementDmByMonth[i]),
      demanda: Math.round(demandByMonth[i]),
      demandaAjustada: Math.round(adjustedDemandByMonth[i]),
      balance: Math.round(balanceByMonth[i]),
      balanceReal: Math.round(realBalanceByMonth[i]),
      stockInicial: Math.round(availableStartByMonth[i]),
      stockFinal: Math.round(availableEndByMonth[i]),
      consumoPasto: Math.round(pastureConsumedByMonth[i]),
      deficitPasto: Math.round(pastureShortfallByMonth[i]),
      perdidas: Math.round(forageLossByMonth[i]),
      ofertaTotal: Math.round(totalFeedOfferByMonth[i]),
      balanceAlimenticio: Math.round(totalFeedBalanceByMonth[i]),
    }));

    // Alertas de flujo: EXACTAMENTE las mismas series de la gráfica.
    // El inventario pastoril se informa aparte, sin confundirlo con el balance total.
    const flowDeficitsWithoutRation = MONTHS.filter((_, i) =>
      offerByMonth[i] + 0.001 < demandByMonth[i]
    ).map(m => m.label);
    const flowDeficitsWithRation = MONTHS.filter((_, i) =>
      totalFeedOfferByMonth[i] + 0.001 < demandByMonth[i]
    ).map(m => m.label);
    const pastureInventoryDeficits = MONTHS.filter((_, i) =>
      pastureShortfallByMonth[i] > 0.001
    ).map(m => m.label);
    const annualTotalFeedBalance = totalFeedOfferByMonth.reduce((sum, x, i) =>
      sum + x - demandByMonth[i], 0);
    const alerts = [];

    if (flowDeficitsWithRation.length > 0) {
      alerts.push({
        level: "high",
        text: `Según las curvas del gráfico, pasto + ración NO cubren la demanda mensual en: ${flowDeficitsWithRation.join(", ")}.`,
      });
    } else if (supplementDmByMonth.some(x => x > 0)) {
      alerts.push({
        level: "low",
        text: "Según las curvas del gráfico, pasto + ración cubren la demanda mensual en todos los meses con animales. Esto no garantiza disponibilidad de pasto dentro del mes.",
      });
    }

    if (flowDeficitsWithoutRation.length > 0) {
      alerts.push({
        level: "medium",
        text: `Comparando únicamente las curvas de pasto y demanda, hay déficit mensual sin ración en: ${flowDeficitsWithoutRation.join(", ")}.`,
      });
    }


    if (annualTotalFeedBalance < -0.001) {
      alerts.push({
        level: "medium",
        text: "La suma anual de pasto + ración es inferior a la demanda anual. Los excedentes de otros meses no resuelven automáticamente los déficits mensuales.",
      });
    }
    if (currentLoad > 850) {
      alerts.push({
        level: "medium",
        text: "Carga alta para un planteo pastoril. Revisar oferta, suplementación o carga animal.",
      });
    }

    return {
      offerByMonth,
      availableStartByMonth, availableEndByMonth, pastureConsumedByMonth, pastureShortfallByMonth, forageLossByMonth,
      demandByMonth,
      adjustedDemandByMonth,
      supplementDmByMonth,
      totalFeedOfferByMonth,
      totalFeedBalanceByMonth,
      pastureReductionByMonth,
      supplementNetByMonth,
      balanceByMonth,
      realBalanceByMonth,
      annualOffer,
      annualDemand,
      annualAdjustedDemand,
      annualSupplementDm,
      annualRationKg,
      annualRationCost,
      unpricedRationDays,
      annualPastureReduction,
      annualSupplementNet,
      annualBalance,
      annualRealBalance,
      totalPV,
      totalArea,
      currentLoad,
      chartData,
      alerts,
    };
  }, [farm, paddocks, herd, supplements, exerciseYear]);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerRowStyle}>
          <div>
            <h1 style={{ fontSize: 32, margin: 0, color: "#0f172a" }}>
              Balance Forrajero
            </h1>
            <p style={{ color: "#64748b", marginTop: 8 }}>
              Presupuesto forrajero predial: oferta, demanda, suplementación e inventario mensual de materia seca aprovechable. Sin simulación de parcelas.
            </p>
          </div>

          <div style={actionsRowStyle}>
            <label style={{display:"flex", alignItems:"center", gap:8}}>Ejercicio marzo–febrero
              <input type="number" min="2000" max="2100" value={exerciseYear} onChange={e => setExerciseYear(Number(e.target.value))} style={{...inputStyle, width:100}} />
              <span>– {exerciseYear + 1}</span>
            </label>
            <button onClick={saveFarm} style={buttonStyle}>Guardar</button>
            <button onClick={duplicateScenario} style={buttonStyle}>Duplicar escenario</button>
            <button onClick={exportCSV} style={buttonStyle}>Exportar CSV</button>
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
                <button key={f.id} onClick={() => loadFarm(f)} style={secondaryButtonStyle}>
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
                  onChange={(e) => setFarm((prev) => ({ ...prev, name: e.target.value }))}
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
                        p.resourceType === "Campo natural" ? { ...p, environment: firstEnv } : p
                      )
                    );
                  }}
                  style={inputStyle}
                >
                  {REGIONS.map((r) => (<option key={r}>{r}</option>))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Año climático</label>
                <select
                  value={farm.climate}
                  onChange={(e) => setFarm((prev) => ({ ...prev, climate: e.target.value }))}
                  style={inputStyle}
                >
                  {CLIMATE_SCENARIOS.map((c) => (<option key={c.label}>{c.label}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div style={panelStyle}>
            <h2 style={panelTitleStyle}>Resumen</h2>
            <div style={summaryGridStyle}>
              <SummaryCard title="Carga actual" value={`${formatNumber(results.currentLoad, 1)} kg PV/ha`} />
              <SummaryCard title="Oferta anual" value={`${formatNumber(results.annualOffer)} kg MS`} />
              <SummaryCard title="Demanda original" value={`${formatNumber(results.annualDemand)} kg MS`} />
              <SummaryCard title="Demanda ajustada" value={`${formatNumber(results.annualAdjustedDemand)} kg MS`} />
              <SummaryCard title="Suplemento MS" value={`${formatNumber(results.annualSupplementDm)} kg MS`} />
              <SummaryCard title="Ración necesaria" value={`${formatNumber(results.annualRationKg / 1000, 2)} t tal cual`} />
              <SummaryCard title="Costo ración" value={`USD ${formatNumber(results.annualRationCost, 2)}`} />
              {results.unpricedRationDays > 0 && <div style={{color:'#b45309',fontSize:12}}>Hay {results.unpricedRationDays} días con ración exploratoria sin período/precio asignado: el costo no incluye esa ración.</div>}
              <SummaryCard title="Stock final de pasto" value={`${formatNumber(results.availableEndByMonth.at(-1))} kg MS`} />
              <SummaryCard title="Déficit pastoril acumulado" value={`${formatNumber(results.pastureShortfallByMonth.reduce((a,b)=>a+b,0))} kg MS`} />
            </div>
          </div>
        </div>

        <div style={{ ...panelStyle, marginBottom: 24 }}>
          <div style={panelHeaderRowStyle}>
            <h2 style={panelTitleStyle}>Alertas automáticas</h2>
          </div>
          {results.alerts.length === 0 ? (
            <div style={{ color: "#166534", fontWeight: 600 }}>
              No se detectan alertas importantes con la configuración actual.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {results.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    ...alertBoxStyle,
                    background: alert.level === "high" ? "#fee2e2" : alert.level === "medium" ? "#fef3c7" : "#dcfce7",
                    borderColor: alert.level === "high" ? "#fecaca" : alert.level === "medium" ? "#fde68a" : "#86efac",
                    color: alert.level === "high" ? "#991b1b" : alert.level === "medium" ? "#92400e" : "#166534",
                  }}
                >
                  {alert.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={midGridStyle}>
          <div style={panelStyle}>
            <div style={panelHeaderRowStyle}>
              <h2 style={panelTitleStyle}>Potreros</h2>
              <button onClick={addPaddock} style={buttonStyle}>+ Agregar</button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {paddocks.map((p) => {
                const firstGrazingDate = getFirstGrazingDate(p);
                const firstGrazingText = firstGrazingDate ? firstGrazingDate.toLocaleDateString("es-UY") : "No aplica";

                const second = p.secondCrop || defaultSecondCrop();
                const secondFirstDate = getFirstGrazingDate(second);
                const secondFirstText = secondFirstDate ? secondFirstDate.toLocaleDateString("es-UY") : "No aplica";

                return (
                  <div key={p.id} style={paddockCardStyle}>
                    <div style={paddockRow1Style}>
                      <div>
                        <label style={smallLabelStyle}>Nombre</label>
                        <input value={p.name} onChange={(e) => updatePaddock(p.id, "name", e.target.value)} style={inputStyle} />
                      </div>

                      <div>
                        <label style={smallLabelStyle}>Hectáreas</label>
                        <input type="number" value={p.hectares} onChange={(e) => updatePaddock(p.id, "hectares", e.target.value)} style={inputStyle} />
                      </div>

                      <div>
                        <label style={smallLabelStyle}>Recurso 1</label>
                        <select value={p.resourceType} onChange={(e) => updatePaddock(p.id, "resourceType", e.target.value)} style={inputStyle}>
                          {RESOURCE_TYPES.map((r) => (<option key={r}>{r}</option>))}
                        </select>
                      </div>

                      {p.resourceType === "Campo natural" ? (
                        <div>
                          <label style={smallLabelStyle}>Ambiente</label>
                          <select value={p.environment} onChange={(e) => updatePaddock(p.id, "environment", e.target.value)} style={inputStyle}>
                            {environmentOptions.map((env) => (<option key={env}>{env}</option>))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label style={smallLabelStyle}>Subtipo 1</label>
                          <select value={p.subtype} onChange={(e) => updatePaddock(p.id, "subtype", e.target.value)} style={inputStyle}>
                            {getSubtypeOptions(p.resourceType).map((s) => (<option key={s.name}>{s.name}</option>))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div style={paddockRow2Style}>
                      {p.resourceType === "Campo natural" ? (
                        <>
                          <div><label style={smallLabelStyle}>Fecha siembra</label><input value="No aplica" disabled style={{ ...inputStyle, background: "#f1f5f9" }} /></div>
                          <div><label style={smallLabelStyle}>1er pastoreo</label><input value="No aplica" disabled style={{ ...inputStyle, background: "#f1f5f9" }} /></div>
                          <div><label style={smallLabelStyle}>Días a pastoreo</label><input value="No aplica" disabled style={{ ...inputStyle, background: "#f1f5f9" }} /></div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label style={smallLabelStyle}>Fecha siembra</label>
                            <input type="date" value={p.sowingDate} onChange={(e) => updatePaddock(p.id, "sowingDate", e.target.value)} style={inputStyle} />
                          </div>
                          <div>
                            <label style={smallLabelStyle}>1er pastoreo</label>
                            <input value={firstGrazingText} disabled style={{ ...inputStyle, background: "#f1f5f9" }} />
                          </div>
                          <div>
                            <label style={smallLabelStyle}>Días a pastoreo</label>
                            <input type="number" value={p.firstGrazingDays} onChange={(e) => updatePaddock(p.id, "firstGrazingDays", e.target.value)} style={inputStyle} />
                          </div>
                        </>
                      )}

                      <div>
                        <label style={smallLabelStyle}>Mes fin</label>
                        <select value={p.endMonth} onChange={(e) => updatePaddock(p.id, "endMonth", Number(e.target.value))} style={inputStyle}>
                          {MONTH_OPTIONS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                        </select>
                      </div>

                      <div>
                        <label style={smallLabelStyle}>Manejo</label>
                        <select value={p.management} onChange={(e) => updatePaddock(p.id, "management", e.target.value)} style={inputStyle}>
                          {MANAGEMENT_LEVELS.map((lvl) => (<option key={lvl.label}>{lvl.label}</option>))}
                        </select>
                      </div>

                      <div>
                        <label style={smallLabelStyle}>Eficiencia %</label>
                        <input type="number" value={p.efficiency} onChange={(e) => updatePaddock(p.id, "efficiency", e.target.value)} style={inputStyle} />
                      </div>

                      <div>
                        <label style={smallLabelStyle}>Segundo cultivo</label>
                        <select value={second.enabled ? "Sí" : "No"} onChange={(e) => updateSecondCrop(p.id, "enabled", e.target.value === "Sí")} style={inputStyle}>
                          <option>No</option>
                          <option>Sí</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", alignItems: "end" }}>
                        <button onClick={() => removePaddock(p.id)} style={dangerButtonStyle}>Eliminar</button>
                      </div>
                    </div>

                    {second.enabled && (
                      <div style={secondCropBoxStyle}>
                        <div style={secondTitleStyle}>Segundo cultivo</div>

                        <div style={paddockRow1Style}>
                          <div>
                            <label style={smallLabelStyle}>Recurso 2</label>
                            <select value={second.resourceType} onChange={(e) => updateSecondCrop(p.id, "resourceType", e.target.value)} style={inputStyle}>
                              {SECOND_CROP_TYPES.map((r) => (<option key={r}>{r}</option>))}
                            </select>
                          </div>

                          <div>
                            <label style={smallLabelStyle}>Subtipo 2</label>
                            <select value={second.subtype} onChange={(e) => updateSecondCrop(p.id, "subtype", e.target.value)} style={inputStyle}>
                              {getSubtypeOptions(second.resourceType).map((s) => (<option key={s.name}>{s.name}</option>))}
                            </select>
                          </div>

                          <div>
                            <label style={smallLabelStyle}>Fecha siembra</label>
                            <input type="date" value={second.sowingDate} onChange={(e) => updateSecondCrop(p.id, "sowingDate", e.target.value)} style={inputStyle} />
                          </div>

                          <div>
                            <label style={smallLabelStyle}>1er pastoreo</label>
                            <input value={secondFirstText} disabled style={{ ...inputStyle, background: "#f1f5f9" }} />
                          </div>
                        </div>

                        <div style={paddockRow2Style}>
                          <div>
                            <label style={smallLabelStyle}>Días a pastoreo</label>
                            <input type="number" value={second.firstGrazingDays} onChange={(e) => updateSecondCrop(p.id, "firstGrazingDays", e.target.value)} style={inputStyle} />
                          </div>

                          <div>
                            <label style={smallLabelStyle}>Mes fin</label>
                            <select value={second.endMonth} onChange={(e) => updateSecondCrop(p.id, "endMonth", Number(e.target.value))} style={inputStyle}>
                              {MONTH_OPTIONS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                            </select>
                          </div>

                          <div>
                            <label style={smallLabelStyle}>Manejo</label>
                            <select value={second.management} onChange={(e) => updateSecondCrop(p.id, "management", e.target.value)} style={inputStyle}>
                              {MANAGEMENT_LEVELS.map((lvl) => (<option key={lvl.label}>{lvl.label}</option>))}
                            </select>
                          </div>

                          <div>
                            <label style={smallLabelStyle}>Eficiencia %</label>
                            <input type="number" value={second.efficiency} onChange={(e) => updateSecondCrop(p.id, "efficiency", e.target.value)} style={inputStyle} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={panelStyle}>
              <div style={panelHeaderRowStyle}>
                <h2 style={panelTitleStyle}>Rodeo</h2>
                <button onClick={addHerdRow} style={buttonStyle}>+ Agregar</button>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {herd.map((h) => (
                  <div key={h.id} style={boxStyle}>
                    <div style={herdGridStyle}>
                      <div>
                        <label style={smallLabelStyle}>Categoría</label>
                        <select value={h.category} onChange={(e) => updateHerd(h.id, "category", e.target.value)} style={inputStyle}>
                          {ANIMAL_CATEGORIES.map((a) => (<option key={a.label}>{a.label}</option>))}
                        </select>
                      </div>
                      <div><label style={smallLabelStyle}>Cabezas</label><input type="number" value={h.heads} onChange={(e) => updateHerd(h.id, "heads", e.target.value)} style={inputStyle} /></div>
                      <div><label style={smallLabelStyle}>Peso entrada (kg)</label><input type="number" min="0" value={h.entryWeight ?? h.weight} onChange={(e) => updateHerd(h.id, "entryWeight", e.target.value)} style={inputStyle} /></div>
                      <div><label style={smallLabelStyle}>Peso salida (kg)</label><input type="number" min="0" value={h.exitWeight ?? h.weight} onChange={(e) => updateHerd(h.id, "exitWeight", e.target.value)} style={inputStyle} /></div>
                      <div><label style={smallLabelStyle}>Peso promedio (kg)</label><input type="number" readOnly value={((n(h.entryWeight ?? h.weight) + n(h.exitWeight ?? h.weight)) / 2).toFixed(1)} style={{...inputStyle, backgroundColor:"#f1f5f9"}} /></div>
                      <div><label style={smallLabelStyle}>Consumo % PV</label><input type="number" step="0.1" value={h.intake} onChange={(e) => updateHerd(h.id, "intake", e.target.value)} style={inputStyle} /></div>
                      <button onClick={() => removeHerd(h.id)} style={dangerButtonStyle}>Eliminar</button>
                    </div>
                    <div style={{display:"flex", gap:12, flexWrap:"wrap", marginTop:12}}>
                      <div style={{flex:"1 1 160px"}}><label style={smallLabelStyle}>Fecha de entrada</label><input type="date" value={h.entryDate || ""} onChange={e => updateHerd(h.id, "entryDate", e.target.value)} style={inputStyle}/></div>
                      <div style={{flex:"1 1 160px"}}><label style={smallLabelStyle}>Fecha de salida / venta</label><input type="date" value={h.exitDate || ""} min={h.entryDate || undefined} onChange={e => updateHerd(h.id, "exitDate", e.target.value)} style={inputStyle}/></div>
                    </div>
                    {h.entryDate && h.exitDate && h.exitDate <= h.entryDate && <div style={{color:"#b91c1c", fontSize:13, marginTop:8}}>La salida debe ser posterior a la entrada.</div>}
                    {!h.entryDate && !h.exitDate && <div style={{color:"#64748b", fontSize:12, marginTop:8}}>Sin fechas: lote presente durante todo el ejercicio (compatibilidad con datos anteriores).</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={panelStyle}>
              <div style={panelHeaderRowStyle}>
                <h2 style={panelTitleStyle}>Suplementación estratégica por períodos</h2>
                <button onClick={addSupplementRow} style={buttonStyle}>+ Agregar período</button>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {supplements.length === 0 ? (
                  <div style={{ color: "#64748b", fontSize: 14 }}>No hay suplementación cargada.</div>
                ) : (
                  supplements.map((s) => {
                    const lot = herd.find(h => String(h.id) === String(s.herdId));
                    const stats = supplementStats(s, lot, exerciseYear, supplements);
                    return (
                    <div key={s.id} style={boxStyle}>
                      <div style={supplementRowStyle}>
                        <div style={{gridColumn:"1 / -1"}}>
                          <label style={smallLabelStyle}>Lote a suplementar</label>
                          <select value={s.herdId ?? ""} onChange={e => updateSupplementRow(s.id,"herdId",e.target.value)} style={inputStyle}>
                            <option value="">Seleccionar lote…</option>
                            {herd.map((h,idx) => <option key={h.id} value={String(h.id)}>Lote {idx+1} · {h.category} · {h.heads} cabezas</option>)}
                          </select>
                        </div>
                        <div><label style={smallLabelStyle}>Modalidad</label>
                          <select value={s.feedingMode || "partial"} onChange={e => updateSupplementRow(s.id,"feedingMode",e.target.value)} style={inputStyle}>
                            <option value="partial">Pastoreo + ración</option><option value="complete">100% ración (sin pasto)</option>
                          </select></div>
                        <div><label style={smallLabelStyle}>Ración (% PV, base MS)</label>
                          <input type="number" min="0" max="10" step="0.1" value={s.rationPvPercent ?? (lot ? (n(s.kgRation)*n(s.dmPercent)/100/Math.max(1,lotAverageWeight(lot))*100).toFixed(2) : 0)} onChange={e => updateSupplementRow(s.id,"rationPvPercent",e.target.value)} style={inputStyle}/></div>
                        <div><label style={smallLabelStyle}>Materia seca de ración (%)</label>
                          <input type="number" min="1" max="100" value={s.dmPercent} onChange={e => updateSupplementRow(s.id,"dmPercent",e.target.value)} style={inputStyle}/></div>
                        {s.feedingMode !== "complete" && <div><label style={smallLabelStyle}>Sustitución (0 a 1 kg MS/kg MS)</label>
                          <input type="number" min="0" max="1" step="0.05" value={s.substitutionRate} onChange={e => updateSupplementRow(s.id,"substitutionRate",e.target.value)} style={inputStyle}/></div>}
                        <div><label style={smallLabelStyle}>Inicio del período</label>
                          <input type="date" value={s.startDate || ""} onChange={e => updateSupplementRow(s.id,"startDate",e.target.value)} style={inputStyle}/></div>
                        <div><label style={smallLabelStyle}>Fin del período (exclusivo)</label>
                          <input type="date" min={s.startDate || undefined} value={s.endDate || ""} onChange={e => updateSupplementRow(s.id,"endDate",e.target.value)} style={inputStyle}/></div>
                        <div><label style={smallLabelStyle}>Precio ración (USD/t tal cual)</label>
                          <input type="number" min="0" value={s.pricePerTon ?? 0} onChange={e => updateSupplementRow(s.id,"pricePerTon",e.target.value)} style={inputStyle}/></div>
                        <button onClick={() => removeSupplementRow(s.id)} style={dangerButtonStyle}>Eliminar</button>
                      </div>
                      {!lot && <div style={{color:"#b91c1c",fontSize:13,marginTop:8}}>Seleccioná un lote para contabilizar la ración.</div>}
                      {s.startDate && s.endDate && s.endDate <= s.startDate && <div style={{color:"#b91c1c",fontSize:13}}>La fecha final debe ser posterior a la inicial.</div>}
                      {lot && stats.days === 0 && <div style={{color:"#b91c1c",fontSize:13,marginTop:8}}>
                        Este período no tiene días efectivos en el ejercicio {exerciseYear}–{exerciseYear+1} o fuera de la permanencia del lote. Revisá las fechas.
                      </div>}
                      {(!s.startDate || !s.endDate) && <div style={{color:"#b45309",fontSize:12,marginTop:8}}>Indicá inicio y fin de este período estratégico. Sin ambas fechas no se contabiliza ración.</div>}
                      {lot && supplements.some(other => other.id !== s.id && String(other.herdId) === String(s.herdId) && s.startDate && s.endDate && other.startDate && other.endDate && s.startDate < other.endDate && other.startDate < s.endDate) && <div style={{color:"#b91c1c",fontSize:13,marginTop:8}}>Atención: hay períodos de ración superpuestos en este lote. Sus aportes se sumarían dos veces; corregí las fechas.</div>}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginTop:12}}>
                        <SummaryCard title="Kg ración/cabeza/día (tal cual)" value={formatNumber(stats.kgHead,2)}/>
                        <SummaryCard title="Días efectivos del ejercicio" value={formatNumber(stats.days)}/>
                        <SummaryCard title="Ración total (t tal cual)" value={formatNumber(stats.totalKg/1000,2)}/>
                        <SummaryCard title="Ración total (t MS)" value={formatNumber(stats.totalDm/1000,2)}/>
                        <SummaryCard title="Costo total (USD)" value={formatNumber(stats.cost,2)}/>
                      </div>
                      {s.feedingMode === "complete" && <div style={{color:"#92400e",fontSize:12,marginTop:8}}>100% ración elimina la demanda pastoril del lote en ese período. Si la ración aporta menos MS que la demanda animal, la diferencia figurará como déficit. Verificá fibra efectiva y nutrientes adecuados.</div>}
                    </div>
                  );})
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...panelStyle, marginBottom: 24 }}>
          <h2 style={panelTitleStyle}>Gráfico mensual</h2>
          <p style={{fontSize:13,color:"#92400e"}}>Producciones orientativas, no mediciones de campo. El porcentaje de utilización se descuenta una sola vez; no se aplican mermas mensuales ni un límite universal de acumulación. El stock trasladado entre meses es una estimación contable, no una garantía de calidad ni de disponibilidad diaria. Verificá aforos, senescencia y remanentes antes de definir la carga.</p>
          <p style={{fontSize:13,color:"#475569"}}>La curva azul representa la oferta mensual de pasto + la materia seca de la ración. Las alertas de cobertura comparan esas mismas curvas. El inventario acumulado se mantiene como cálculo auxiliar; las fechas de acceso y la calidad de la dieta deben verificarse en campo.</p>
          <div style={{ width: "100%", height: 360 }}>
            <ResponsiveContainer>
              <LineChart data={results.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="oferta" name="Oferta de pasto" stroke="#16a34a" strokeWidth={3} />
                <Line type="monotone" dataKey="demanda" name="Demanda animal total" stroke="#ea580c" strokeWidth={3} />
                <Line type="monotone" dataKey="ofertaTotal" name="Oferta de pasto + suplementación (kg MS)" stroke="#2563eb" strokeWidth={3} />
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
                  <th style={thStyle}>Demanda original</th>
                  <th style={thStyle}>Reducción pasto</th>
                  <th style={thStyle}>Demanda ajustada</th>
                  <th style={thStyle}>Suplemento MS</th>
                  <th style={thStyle}>Oferta total MS</th>
                  <th style={thStyle}>Déficit alimentación MS</th>
                  <th style={thStyle}>Stock inicial</th>
                  <th style={thStyle}>Consumo de pasto</th>
                  <th style={thStyle}>Pérdidas de pasto</th>
                  <th style={thStyle}>Déficit pastoril</th>
                  <th style={thStyle}>Stock final</th>
                  <th style={thStyle}>Balance</th>
                  <th style={thStyle}>Stock final aprovechable</th>
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((m, i) => (
                  <tr key={m.key}>
                    <td style={tdStyle}>{m.label} {exerciseYear + (m.index < 3 ? 1 : 0)}</td>
                    <td style={tdStyle}>{formatNumber(results.offerByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.demandByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.pastureReductionByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.adjustedDemandByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.supplementDmByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.totalFeedOfferByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.totalFeedBalanceByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.availableStartByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.pastureConsumedByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.forageLossByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.pastureShortfallByMonth[i])}</td>
                    <td style={tdStyle}>{formatNumber(results.availableEndByMonth[i])}</td>
                    <td style={{ ...tdStyle, color: results.balanceByMonth[i] < 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                      {formatNumber(results.balanceByMonth[i])}
                    </td>
                    <td style={{ ...tdStyle, color: results.realBalanceByMonth[i] < 0 ? "#dc2626" : "#7c3aed", fontWeight: 700 }}>
                      {formatNumber(results.realBalanceByMonth[i])}
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
  maxWidth: 1550,
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
  gridTemplateColumns: "minmax(0, 1fr)",
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
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 12,
};

const summaryCardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
};

const alertBoxStyle = {
  border: "1px solid",
  borderRadius: 12,
  padding: 12,
  fontWeight: 600,
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
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
  gap: 12,
  alignItems: "end",
};

const supplementRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
  gap: 12,
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
  minWidth: 0,
  fontSize: 15,
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
