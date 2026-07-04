// reading-metrics.jsx — shared BP reading summaries for dashboard surfaces
const MimumReadingMetrics = (() => {
  const DAY_MS = 24 * 60 * 60 * 1000;

  const asNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const asDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === 'number') {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'string') {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (value.seconds != null) {
      const d = new Date(Number(value.seconds) * 1000);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  const pad2 = (n) => String(n).padStart(2, '0');
  const dateKey = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  const sameDay = (a, b) => dateKey(a) === dateKey(b);
  const monthLabel = (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const longDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const shortDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dayDiff = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / DAY_MS);

  const readingDate = (reading) => (
    asDate(reading.takenAt)
    || asDate(reading.registeredAt)
    || asDate(reading.createdAt)
    || asDate(reading.registeredAtMs)
    || asDate(reading.timestampMs)
  );

  const normalize = (readings = []) => readings
    .map((reading) => {
      const sys = asNumber(reading.sys ?? reading.systolic);
      const dia = asNumber(reading.dia ?? reading.diastolic);
      const pulse = asNumber(reading.pulse);
      const date = readingDate(reading);
      if (!sys || !dia || !date) return null;
      const attention = reading.tier === 'attention' || sys >= 130 || dia >= 80;
      return {
        ...reading,
        sys,
        dia,
        systolic: sys,
        diastolic: dia,
        pulse,
        date,
        dayKey: dateKey(date),
        attention,
        steady: !attention,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.date - a.date);

  const average = (items, key) => {
    const values = items.map((item) => asNumber(item[key])).filter((v) => v != null);
    if (!values.length) return null;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  };

  const averageReading = (items) => {
    if (!items.length) return null;
    return {
      sys: average(items, 'sys'),
      dia: average(items, 'dia'),
      pulse: average(items, 'pulse'),
    };
  };

  const groupByDay = (items) => items.reduce((acc, reading) => {
    acc[reading.dayKey] = acc[reading.dayKey] || [];
    acc[reading.dayKey].push(reading);
    return acc;
  }, {});

  const currentStreak = (daySet, today = new Date()) => {
    let cursor = startOfDay(today);
    if (!daySet.has(dateKey(cursor))) cursor = addDays(cursor, -1);
    let count = 0;
    while (daySet.has(dateKey(cursor))) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  };

  const weekDays = (items, today = new Date()) => {
    const days = new Set(items.map((reading) => reading.dayKey));
    const monday = addDays(startOfDay(today), -((today.getDay() + 6) % 7));
    return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => {
      const date = addDays(monday, index);
      const key = dateKey(date);
      return {
        label,
        date,
        key,
        state: days.has(key) ? 'done' : sameDay(date, today) ? 'today' : date > today ? 'future' : 'rest',
      };
    });
  };

  const calendarMonth = (items, today = new Date()) => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const leading = (monthStart.getDay() + 6) % 7;
    const byDay = groupByDay(items);
    const cells = [];
    for (let i = 0; i < leading; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const key = dateKey(date);
      const readings = byDay[key] || [];
      const avg = averageReading(readings);
      const attention = readings.some((reading) => reading.attention);
      cells.push({
        day,
        date,
        key,
        readings,
        count: readings.length,
        avg,
        attention,
        color: attention ? 'var(--honey-dot)' : readings.some((reading) => reading.manual) ? 'var(--lav-dot)' : 'var(--sage-dot)',
        isToday: sameDay(date, today),
        isFuture: date > startOfDay(today),
      });
    }
    return {
      label: monthLabel(today),
      todayDay: today.getDate(),
      cells,
      byDay,
    };
  };

  const chartFromReadings = (items, max = 7) => {
    const recent = items.slice(0, max).reverse();
    const sys = recent.map((reading) => reading.sys);
    const dia = recent.map((reading) => reading.dia);
    const labels = recent.map((reading) => sameDay(reading.date, new Date()) ? 'now' : String(reading.date.getDate()));
    const manualIdx = recent.reduce((acc, reading, index) => (reading.manual ? [...acc, index] : acc), []);
    return { recent, sys, dia, labels, manualIdx };
  };

  const trendLabel = (items) => {
    if (!items.length) return 'No BP readings yet';
    if (items.length < 3) return 'Building baseline';
    const recent = items.slice(0, Math.min(7, items.length));
    if (recent[0].attention) return 'Worth watching';
    const latest = recent[0].sys;
    const oldest = recent[recent.length - 1].sys;
    if (latest <= oldest - 4) return 'Trending lower';
    if (latest >= oldest + 4) return 'A little higher';
    return 'Holding steady';
  };

  const summarize = (readings = [], today = new Date()) => {
    const items = normalize(readings);
    const latest = items[0] || null;
    const daySet = new Set(items.map((reading) => reading.dayKey));
    const thisMonth = items.filter((reading) => reading.date.getFullYear() === today.getFullYear() && reading.date.getMonth() === today.getMonth());
    const steadyCount = items.filter((reading) => reading.steady).length;
    const chart = chartFromReadings(items);
    const recentAvg = averageReading(items.slice(0, Math.min(7, items.length)));
    return {
      items,
      latest,
      total: items.length,
      totalDays: daySet.size,
      today,
      todayKey: dateKey(today),
      todayLabel: longDate(today),
      thisMonth,
      monthCount: thisMonth.length,
      monthDays: new Set(thisMonth.map((reading) => reading.dayKey)).size,
      currentStreak: currentStreak(daySet, today),
      steadyCount,
      steadyPct: items.length ? Math.round((steadyCount / items.length) * 100) : 0,
      avg: recentAvg,
      chart,
      weekDays: weekDays(items, today),
      calendar: calendarMonth(items, today),
      trend: trendLabel(items),
      shortDate,
      dateKey,
    };
  };

  return {
    summarize,
    normalize,
    dateKey,
    shortDate,
    longDate,
  };
})();

const PhysiqueMetrics = (() => {
  const PLAN = {
    heightCm: 166,
    startWeight: 79,
    startWaist: 89,
    targetWaist: 77,
    targetWeightMid: 71.5,
    targetWeightRange: '70-73',
    firstCutKg: 6,
    totalDeficit: 46200,
    dailyDeficit: 450,
    targetCalories: 2100,
    bmr: 1685,
    proteinLow: 150,
    proteinHigh: 165,
    stepsLow: 8000,
    stepsHigh: 12000,
    weeklyLossLow: 0.3,
    weeklyLossHigh: 0.5,
  };

  const asNumber = (value, fallback = null) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const dateDaysAgo = (days) => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    d.setDate(d.getDate() - days);
    return d;
  };

  const isoDaysAgo = (days) => dateDaysAgo(days).toISOString();
  const dayKey = (date) => date.toISOString().slice(0, 10);

  const DEMO_ENTRIES = [
    { id: 'plan-start', weight: 79, waist: 89, calories: 2550, protein: 128, steps: 5600, deficit: 0, takenAt: isoDaysAgo(42), eventType: 'physique_check_in' },
    { id: 'week-1', weight: 78.2, waist: 88.1, calories: 2140, protein: 150, steps: 7900, deficit: 420, takenAt: isoDaysAgo(35), eventType: 'physique_check_in' },
    { id: 'week-2', weight: 77.7, waist: 87.3, calories: 2090, protein: 154, steps: 8500, deficit: 460, takenAt: isoDaysAgo(28), eventType: 'physique_check_in' },
    { id: 'week-3', weight: 77.2, waist: 86.6, calories: 2110, protein: 158, steps: 9300, deficit: 445, takenAt: isoDaysAgo(21), eventType: 'physique_check_in' },
    { id: 'week-4', weight: 76.8, waist: 85.8, calories: 2100, protein: 160, steps: 9800, deficit: 450, takenAt: isoDaysAgo(14), eventType: 'physique_check_in' },
    { id: 'today-demo', weight: 76.5, waist: 85.4, calories: 2080, protein: 162, steps: 9400, deficit: 470, takenAt: isoDaysAgo(0), eventType: 'physique_check_in' },
  ];

  const readDate = (entry) => {
    const raw = entry?.takenAt || entry?.registeredAt || entry?.createdAt || entry?.registeredAtIso;
    const date = raw ? new Date(raw) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
  };

  const normalize = (entries = []) => entries
    .filter((entry) => entry?.eventType === 'physique_check_in' || entry?.weight != null || entry?.waist != null)
    .map((entry) => {
      const date = readDate(entry) || new Date();
      const calories = asNumber(entry.calories, PLAN.targetCalories);
      const protein = asNumber(entry.protein, 0);
      const steps = asNumber(entry.steps, 0);
      const deficit = asNumber(entry.deficit, Math.max(0, Math.round((asNumber(entry.maintenance, 2550) || 2550) - calories)));
      return {
        ...entry,
        weight: asNumber(entry.weight, PLAN.startWeight),
        waist: asNumber(entry.waist, PLAN.startWaist),
        calories,
        protein,
        steps,
        deficit,
        date,
        dayKey: dayKey(date),
        onPlan: deficit >= 350 && deficit <= 550 && protein >= PLAN.proteinLow && steps >= PLAN.stepsLow,
      };
    })
    .sort((a, b) => a.date - b.date);

  const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MONTHS_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const WEEKDAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const shortDate = (date) => `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;

  const weekDays = (items, today = new Date()) => {
    const monday = new Date(today);
    const offset = (monday.getDay() + 6) % 7;
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - offset);
    const keys = new Set(items.map((item) => item.dayKey));
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = dayKey(d);
      const isToday = key === dayKey(today);
      return {
        label: ['L', 'M', 'X', 'J', 'V', 'S', 'D'][i],
        state: keys.has(key) ? 'done' : isToday ? 'today' : d > today ? 'future' : 'empty',
      };
    });
  };

  const calendar = (items, today = new Date()) => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (first.getDay() + 6) % 7;
    const byDay = items.reduce((acc, item) => {
      acc[item.dayKey] = acc[item.dayKey] || [];
      acc[item.dayKey].push(item);
      return acc;
    }, {});
    const cells = Array.from({ length: startOffset }).fill(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(year, month, d);
      const key = dayKey(date);
      const entries = byDay[key] || [];
      const latest = entries[entries.length - 1];
      cells.push({
        day: d,
        date,
        entries,
        count: entries.length,
        isToday: key === dayKey(today),
        isFuture: date > today,
        onPlan: latest?.onPlan,
        color: latest?.onPlan ? 'var(--sage-dot)' : entries.length ? 'var(--honey-dot)' : 'var(--bg-soft)',
      });
    }
    return {
      label: `${MONTHS_LONG[today.getMonth()]} ${today.getFullYear()}`,
      cells,
      todayDay: today.getDate(),
    };
  };

  const summarize = (rawEntries = [], today = new Date()) => {
    const realItems = normalize(rawEntries);
    const items = realItems.length ? realItems : normalize(DEMO_ENTRIES);
    const latest = items[items.length - 1];
    const start = items[0];
    const weightLost = Math.max(0, PLAN.startWeight - latest.weight);
    const waistDrop = Math.max(0, PLAN.startWaist - latest.waist);
    const waistGoalDrop = PLAN.startWaist - PLAN.targetWaist;
    const kgProgress = Math.min(100, Math.round((weightLost / PLAN.firstCutKg) * 100));
    const waistProgress = Math.min(100, Math.round((waistDrop / waistGoalDrop) * 100));
    const estimatedDeficitDone = Math.round(Math.min(PLAN.totalDeficit, weightLost * 7700));
    const days = Math.max(1, Math.round((latest.date - start.date) / 86400000));
    const weeklyRate = Math.round(((start.weight - latest.weight) / days) * 7 * 10) / 10;
    const remainingToSix = Math.max(0, Math.round((PLAN.firstCutKg - weightLost) * 10) / 10);
    const weeksLeft = remainingToSix ? Math.ceil(remainingToSix / 0.45) : 0;
    const monthItems = items.filter((item) => item.date.getFullYear() === today.getFullYear() && item.date.getMonth() === today.getMonth());
    const onPlanDays = new Set(items.filter((item) => item.onPlan).map((item) => item.dayKey)).size;

    return {
      plan: PLAN,
      demo: !realItems.length,
      items,
      latest,
      start,
      todayLabel: `${WEEKDAYS_LONG[today.getDay()]} ${today.getDate()} de ${MONTHS_LONG[today.getMonth()]}`,
      weightLost: Math.round(weightLost * 10) / 10,
      waistDrop: Math.round(waistDrop * 10) / 10,
      kgProgress,
      waistProgress,
      estimatedDeficitDone,
      remainingDeficit: Math.max(0, PLAN.totalDeficit - estimatedDeficitDone),
      remainingToSix,
      weeksLeft,
      weeklyRate,
      currentCalories: latest.calories,
      proteinRange: `${PLAN.proteinLow}-${PLAN.proteinHigh} g`,
      stepsRange: `${Math.round(PLAN.stepsLow / 1000)}k-${Math.round(PLAN.stepsHigh / 1000)}k`,
      onPlanDays,
      monthCount: monthItems.length,
      weekDays: weekDays(items, today),
      calendar: calendar(items, today),
      chart: {
        labels: items.map((item) => shortDate(item.date)),
        weight: items.map((item) => item.weight),
        waist: items.map((item) => item.waist),
        calories: items.map((item) => item.calories),
        steps: items.map((item) => Math.round(item.steps / 100) / 10),
      },
      trend: weeklyRate >= PLAN.weeklyLossLow && weeklyRate <= PLAN.weeklyLossHigh
        ? 'Ritmo ideal para conservar músculo'
        : weeklyRate > PLAN.weeklyLossHigh
          ? 'Ritmo rápido: vigila fuerza y recuperación'
          : 'Ritmo suave: revisa adherencia 2-3 semanas',
    };
  };

  return { PLAN, DEMO_ENTRIES, normalize, summarize, shortDate };
})();

Object.assign(window, { MimumReadingMetrics, PhysiqueMetrics });
