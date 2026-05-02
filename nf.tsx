'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ===========================
   PUBLISHED GOOGLE CHART URLS
   =========================== */
const PIE_CHART_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR_-3zZuL80j24hmZLaWB8BYPOMymkhLPTX1cWHvJaqJr9XWh4JH9ugZXyn_o8zZ5RRSzJ7OYD9RnT/pubchart?oid=700770207&format=interactive';
const BAR_CHART_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR_-3zZuL80j24hmZLaWB8BYPOMymkhLPTX1cWHvJaqJr9XWh4JH9ugZXyn_o8zZ5RRSzJ7OYD9RnT/pubchart?oid=1441604383&format=interactive';
const AREA_CHART_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR_-3zZuL80j24hmZLaWB8BYPOMymkhLPTX1cWHvJaqJr9XWh4JH9ugZXyn_o8zZ5RRSzJ7OYD9RnT/pubchart?oid=608190982&format=interactive';
const COLUMN_CHART_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR_-3zZuL80j24hmZLaWB8BYPOMymkhLPTX1cWHvJaqJr9XWh4JH9ugZXyn_o8zZ5RRSzJ7OYD9RnT/pubchart?oid=452666597&format=interactive';
const DOUGHNUT_CHART_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR_-3zZuL80j24hmZLaWB8BYPOMymkhLPTX1cWHvJaqJr9XWh4JH9ugZXyn_o8zZ5RRSzJ7OYD9RnT/pubchart?oid=1813078581&format=interactive';
const BAR2_CHART_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR_-3zZuL80j24hmZLaWB8BYPOMymkhLPTX1cWHvJaqJr9XWh4JH9ugZXyn_o8zZ5RRSzJ7OYD9RnT/pubchart?oid=1606809469&format=interactive';
const LINE_CHART_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR_-3zZuL80j24hmZLaWB8BYPOMymkhLPTX1cWHvJaqJr9XWh4JH9ugZXyn_o8zZ5RRSzJ7OYD9RnT/pubchart?oid=1872575462&format=interactive';

/* ===========================
   OPTIONAL OVERRIDES
   =========================== */
const CHART_OVERRIDES = {
  segmentsPct: {
    Dormant: null as number | null,
    'At Risk': null as number | null,
    Healthy: null as number | null,
  },
  reasonCounts: {
    'Onboarding Gap': null as number | null,
    'Pricing Confusion': null as number | null,
    'Bug/Incident': null as number | null,
    'Integration Incomplete': null as number | null,
    'Low Feature Adoption': null as number | null,
  },
};

/* ===========================
   DATA MODEL
   =========================== */
type Segment = 'Healthy' | 'At Risk' | 'Dormant';
type Reason =
  | 'Onboarding Gap'
  | 'Pricing Confusion'
  | 'Bug/Incident'
  | 'Integration Incomplete'
  | 'Low Feature Adoption'
  | 'None';

type Customer = {
  name: string; // owner name
  company: string; // account
  segment: Segment;
  days_since_last_login: number;
  risk: number;
  reason: Reason;
  message: string;
  accountSize?: 'Small' | 'Mid' | 'Enterprise';
  arpa?: number;
};

/* Demo dataset */
const baseCustomers: Customer[] = [
  { name: 'Sarah Lee', company: 'PayFit', segment: 'Dormant', days_since_last_login: 21, risk: 88, reason: 'Onboarding Gap', message: "You set up a dashboard but haven't used it lately — want a 20-min session to finish setup?", accountSize: 'Mid', arpa: 1200 },
  { name: 'David Park', company: 'PATHE CINEPASS', segment: 'Dormant', days_since_last_login: 25, risk: 91, reason: 'Bug/Incident', message: 'We fixed the export issue you hit — ready to try again with support on standby?', accountSize: 'Enterprise', arpa: 5000 },
  { name: 'Julia Kim', company: 'Growens S.p.A.', segment: 'Dormant', days_since_last_login: 24, risk: 84, reason: 'Pricing Confusion', message: 'Let’s review your plan — reduce costs and better fit your usage.', accountSize: 'Small', arpa: 700 },
  { name: 'Mia Johnson', company: 'Mediafin', segment: 'Dormant', days_since_last_login: 22, risk: 86, reason: 'Onboarding Gap', message: 'Let’s finish onboarding — book a 15-min session and unlock the dashboard you started.', accountSize: 'Mid', arpa: 1300 },
  { name: 'Mark Chen', company: 'Packt Publishing Ltd', segment: 'At Risk', days_since_last_login: 5, risk: 62, reason: 'Pricing Confusion', message: "Saw lower usage; here's a plan comparison and a call to optimize costs.", accountSize: 'Small', arpa: 600 },
  { name: 'Omar Haddad', company: 'Zeplug', segment: 'At Risk', days_since_last_login: 6, risk: 55, reason: 'Bug/Incident', message: 'We’ve optimized performance — can we run your workflow together today?', accountSize: 'Mid', arpa: 1400 },
  { name: 'Tom Rivera', company: 'EDF S.A', segment: 'At Risk', days_since_last_login: 8, risk: 60, reason: 'Integration Incomplete', message: 'Finish the connector setup — guided steps and a support buddy on the call.', accountSize: 'Enterprise', arpa: 4800 },
  { name: 'Nina Patel', company: 'BIGLOBE Inc.', segment: 'At Risk', days_since_last_login: 7, risk: 58, reason: 'Low Feature Adoption', message: 'Quick 10-min walkthrough of automation and alerts to show clear time savings.', accountSize: 'Small', arpa: 650 },
  { name: 'Ana Gomez', company: 'Sony Global Solutions Inc.', segment: 'Healthy', days_since_last_login: 1, risk: 12, reason: 'None', message: 'Advanced reporting tips to boost your workflow.', accountSize: 'Mid', arpa: 1100 },
  { name: 'Leo Rossi', company: 'Matterport, Inc.', segment: 'Healthy', days_since_last_login: 0, risk: 9, reason: 'None', message: 'Feature spotlight: automation shortcuts you haven’t tried yet.', accountSize: 'Enterprise', arpa: 5200 },
];

/* ===========================
   TOOLS
   =========================== */
type ToolId = 'okta' | 'de' | 'billing' | 'zendesk' | 'grafana' | 'sendgrid' | 'gpt';

const TOOL_CATALOG: { id: ToolId; label: string }[] = [
  { id: 'okta', label: 'Okta (Logins)' },
  { id: 'de', label: 'Zuora Digital Experience (Usage)' },
  { id: 'billing', label: 'Zuora Billing (Invoices/Payments)' },
  { id: 'zendesk', label: 'Zendesk (Support)' },
  { id: 'grafana', label: 'Grafana/Telemetry (Usage/Health)' },
  { id: 'sendgrid', label: 'Email (SendGrid)' },
  { id: 'gpt', label: 'AI Messaging (GPT)' },
];

const REQUIRED_BY_REASON: Record<Reason, ToolId[]> = {
  'Onboarding Gap': ['de', 'zendesk', 'gpt', 'sendgrid'],
  'Pricing Confusion': ['billing', 'de', 'gpt', 'sendgrid'],
  'Bug/Incident': ['zendesk', 'grafana', 'de', 'gpt', 'sendgrid'],
  'Integration Incomplete': ['zendesk', 'de', 'gpt', 'sendgrid'],
  'Low Feature Adoption': ['de', 'gpt', 'sendgrid'],
  None: ['de', 'gpt', 'sendgrid'],
};
function requiredToolsFor(c: Customer): ToolId[] {
  const base = [...REQUIRED_BY_REASON[c.reason]];
  if (c.days_since_last_login >= 14 && !base.includes('okta')) base.unshift('okta');
  return base;
}
function explainWhy(toolId: ToolId): string {
  const vendor = TOOL_CATALOG.find((t) => t.id === toolId)?.label || toolId;
  const base: Record<ToolId, string> = {
    okta: 'Confirms last-login and access — separates “no usage” from “cannot sign in”.',
    de: 'Feature-level usage and funnel drop-offs — shows where time is spent.',
    billing: 'Payments/renewals vs. utilization — exposes plan fit and timing.',
    zendesk: 'Friction history and themes — unresolved tickets to address directly.',
    grafana: 'Telemetry/SLIs — verifies stability after fixes and ties to affected features.',
    sendgrid: 'Reliable delivery/scheduling/tracking for empathetic outreach.',
    gpt: 'Drafts contextual, human messages from these signals.',
  };
  return `${vendor}: ${base[toolId]}`;
}

/* ===========================
   MICRO UI UTILS
   =========================== */
type SparkProps = { values: number[]; width?: number; height?: number; animateKey?: string; color?: string };
function Sparkline({ values, width = 140, height = 36, animateKey, color = '#0b57d0' }: SparkProps) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const pts = values
    .map((v, i) => {
      const x = pad + (i / Math.max(1, values.length - 1)) * w;
      const y = pad + h - ((v - min) / span) * h;
      return `${x},${y}`;
    })
    .join(' ');
  const endY = pad + h - ((values[values.length - 1] - min) / span) * h;
  return (
    <svg key={animateKey} width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} style={{ opacity: 0, animation: 'sparkIn 500ms ease forwards' }} />
      <circle cx={pad + w} cy={endY} r={3} style={{ fill: color, opacity: 0, animation: 'sparkIn 700ms ease forwards' }} />
      <style>{`@keyframes sparkIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </svg>
  );
}

function useCountUp(target: number | string, key: string, dur = 500) {
  const [val, setVal] = React.useState(String(target));
  React.useEffect(() => {
    const raw = String(target);
    const isNumberOrPercent = /^[\s]*-?\d+(\.\d+)?\s*%?[\s]*$/.test(raw);
    if (!isNumberOrPercent) {
      setVal(raw);
      return;
    }
    const t = parseFloat(raw.replace(/[^\d.-]/g, ''));
    if (isNaN(t)) {
      setVal(raw);
      return;
    }
    const start = performance.now();
    const from = 0;
    const asPct = raw.includes('%');
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const n = from + (t - from) * p;
      const out = asPct ? `${n.toFixed(0)}%` : n.toFixed(t % 1 === 0 ? 0 : 1);
      setVal(out);
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [key, target, dur]);
  return val;
}

function AnimatedTile({
  label,
  value,
  rightAddon,
  animationKey,
  variant,
  onClick,
}: {
  label: string;
  value: string;
  rightAddon?: React.ReactNode;
  animationKey?: string;
  variant?: 'glow' | 'normal';
  onClick?: () => void;
}) {
  const counted = useCountUp(value, `${label}-${animationKey ?? value}`);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        textAlign: 'left',
        flex: 1,
        background: '#f7f7f7',
        padding: 12,
        borderRadius: 12,
        border: '1px solid #eee',
        boxShadow: variant === 'glow' ? '0 0 0 rgba(11,87,208,0)' : '0 0 0 rgba(0,0,0,0)',
        transform: 'scale(0.98)',
        animation: variant === 'glow' ? 'tileGlow 800ms ease-out forwards' : 'tilePop 340ms ease-out forwards',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 12, color: '#777', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span>{label}</span>
        {rightAddon}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{counted}</div>
      <style>{`
        @keyframes tilePop { 0% { transform: scale(0.98); box-shadow: 0 0 0 rgba(0,0,0,0); }
          60% { transform: scale(1.02); box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
          100% { transform: scale(1); box-shadow: 0 4px 10px rgba(0,0,0,0.05); } }
        @keyframes tileGlow { 0% { box-shadow: 0 0 0 rgba(11,87,208,0.0); }
          50% { box-shadow: 0 0 24px rgba(11,87,208,0.28); }
          100% { box-shadow: 0 0 0 rgba(11,87,208,0.0); } }
      `}</style>
    </button>
  );
}

type Toast = { id: number; text: string };
function useToasts() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  };
  return { toasts, push };
}

function ConfidenceDot({ level }: { level: 'Low' | 'Med' | 'High' }) {
  const color = level === 'High' ? '#0F9D58' : level === 'Med' ? '#F4B400' : '#DB4437';
  return (
    <span title={`Confidence: ${level}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ fontSize: 12, color: '#666' }}>{level}</span>
    </span>
  );
}

/* Basic wrappers */
function Banner({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ background: '#0b1e30', color: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 14, opacity: 0.9 }}>{text}</div>
    </div>
  );
}
function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <div style={{ margin: '24px 0' }}>
      <h2 style={{ margin: '8px 0' }}>{title}</h2>
      {children}
    </div>
  );
}
function Card({ title, children }: React.PropsWithChildren<{ title?: string }>) {
  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
      {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
      {children}
    </div>
  );
}
function Modal({ children, onClose }: React.PropsWithChildren<{ onClose: () => void }>) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div role="dialog" aria-modal="true" style={{ background: '#fff', color: '#111', padding: 24, borderRadius: 10, maxWidth: 760, width: '94%', border: '1px solid #eee', animation: 'modalIn 200ms ease-out', position: 'relative' }}>
        <button aria-label="Close" onClick={onClose} style={{ position: 'absolute', right: 10, top: 8, border: 'none', background: 'transparent', fontSize: 22, cursor: 'pointer', color: '#111' }}>
          ×
        </button>
        {children}
        <style>{`@keyframes modalIn { from { transform: translateY(6px); opacity: .0 } to { transform: translateY(0); opacity: 1 } }`}</style>
      </div>
    </div>
  );
}
function Note({ text }: { text: string }) {
  return <div style={{ marginTop: 8, color: '#666' }}>{text}</div>;
}

/* Safety lint + ICS + time utils */
function lintSafety(text: string): { flagged: boolean; rewrite?: string; reason?: string; sentiment: 'Positive' | 'Neutral' | 'Caution' } {
  const pushy = /(now|immediately|urgent|must|last chance|act fast)/i.test(text);
  const negative = /(angry|frustrated|cancel|bad|annoyed)/i.test(text);
  if (!pushy && !negative) return { flagged: false, sentiment: 'Neutral' };
  const rewrite = text
    .replace(/now/gi, 'soon')
    .replace(/immediately/gi, 'as soon as convenient')
    .replace(/urgent/gi, 'important')
    .replace(/must/gi, 'might')
    .replace(/last chance/gi, 'a good time')
    .replace(/act fast/gi, 'act when ready');
  return { flagged: true, rewrite, reason: 'Message may feel pushy or negative; softened phrasing for empathy.', sentiment: 'Caution' };
}
function makeICS({ title, description, start, durationMins = 20, location = 'Online' }: { title: string; description: string; start: Date; durationMins?: number; location?: string }) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const toICS = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const dtStart = toICS(start);
  const dtEnd = toICS(new Date(start.getTime() + durationMins * 60000));
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ReviveAI//EN
BEGIN:VEVENT
UID:${Date.now()}@reviveai
DTSTAMP:${toICS(new Date())}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}
function humanizeCountdown(deadline: number) {
  const ms = deadline - Date.now();
  if (ms <= 0) return 'due';
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}h ${mm}m`;
  return `${mm}m`;
}

/* Shared styles */
const navBtnStyle: React.CSSProperties = { padding: '4px 8px', borderRadius: 6, border: '1px solid #eee', background: '#fff', cursor: 'pointer' };
const lbl: React.CSSProperties = { fontSize: 12, color: '#555', marginBottom: 4 };
const sub: React.CSSProperties = { fontSize: 12, color: '#666' };
/* ===========================
   PAGE COMPONENT
   =========================== */
export default function Page() {
  // Incident simulator
  const [incidentOn, setIncidentOn] = useState(false);

  const customers = useMemo(() => {
    if (!incidentOn) return baseCustomers;
    return baseCustomers.map((c) => {
      if (c.segment === 'Healthy') return c;
      if (c.reason === 'Bug/Incident') {
        return { ...c, risk: Math.min(99, c.risk + 4) };
        }
      if (Math.random() < 0.5) return { ...c, reason: 'Bug/Incident' as Reason, risk: Math.min(99, c.risk + 10) };
      return { ...c, risk: Math.min(99, c.risk + 6) };
    });
  }, [incidentOn]);

  // Persona + tone
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedName = customers[selectedIndex]?.name ?? customers[0].name;
  const focused = useMemo(() => customers[selectedIndex] ?? customers[0], [customers, selectedIndex]);
  type Persona = 'Empathetic' | 'Data-Driven' | 'ROI-Focused';
  type Tone = 'Supportive' | 'Direct' | 'Executive' | 'Consultative';
  const [persona, setPersona] = useState<Persona>('Empathetic');
  const [tone, setTone] = useState<Tone>('Supportive');

  // Tools
  const [availableTools, setAvailableTools] = useState<Set<ToolId>>(new Set<ToolId>());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTool, setConfirmTool] = useState<ToolId | null>(null);
  const [confirmMode, setConfirmMode] = useState<'add' | 'remove'>('add');
  const [confirmText, setConfirmText] = useState('');
  const [coverageGlow, setCoverageGlow] = useState(false);

  // Modals
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoBody, setInfoBody] = useState('');
  const [chartOpen, setChartOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState('');
  const [chartBody, setChartBody] = useState('');

  // Email + timeline + batch
  const [testEmail, setTestEmail] = useState('your-test@example.com');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerFor, setDrawerFor] = useState<Customer | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchText, setBatchText] = useState('');

  // Ownership / SLA / Priority  — owner is the **CSM selector fix**; reflected in Summary
  const [owners, setOwners] = useState<Record<string, string>>({});
  const [sla, setSla] = useState<Record<string, number>>({});
  const [customSla, setCustomSla] = useState<Record<string, string>>({});
  const [priority, setPriority] = useState<Record<string, 'High' | 'Medium' | 'Low'>>({});

  // Tour + toasts
  const [tourStep, setTourStep] = useState<number | null>(null);
  const refDetect = useRef<HTMLDivElement>(null);
  const refUnderstand = useRef<HTMLDivElement>(null);
  const refTools = useRef<HTMLDivElement>(null);
  const refSend = useRef<HTMLDivElement>(null);
  const refFuture = useRef<HTMLDivElement>(null);
  const [feedbackCount, setFeedbackCount] = useState(12);
  const { toasts, push } = useToasts();

  // ===== Future section state (sliders) =====
  const [cohort, setCohort] = useState(200);
  const [arpa, setArpa] = useState(1200);
  const [baseChurn, setBaseChurn] = useState(0.12);
  const [reviveReduction, setReviveReduction] = useState(0.15);
  const [csms, setCsms] = useState(3);
  const [weeklyCap, setWeeklyCap] = useState(25);

  // Derived capacity
  // Derived capacity metrics shared by the tile and the Capacity Planner
const capacity = useMemo(() => {
  const riskInflowPerWeek = Math.max(1, Math.round((cohort * baseChurn) / 12));
  const capacityPerWeek = csms * weeklyCap;

  // Make the tile directly reflect capacity knobs so it changes with CSMs / Weekly capacity
  const attainableSavesPerWeek = Math.round(capacityPerWeek * 0.6); // 60% of capacity

  // Keep gap/util to explain headroom/backlog vs inflow
  const gap = capacityPerWeek - riskInflowPerWeek; // + headroom, - backlog
  const util = Math.min(1, capacityPerWeek / Math.max(1, riskInflowPerWeek)); // 0..1

  return { riskInflowPerWeek, capacityPerWeek, attainableSavesPerWeek, gap, util };
}, [cohort, baseChurn, csms, weeklyCap]);

  // Init tools + email
  useEffect(() => {
    setAvailableTools(new Set(requiredToolsFor(focused)));
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('reviveai.test.email');
      if (saved) setTestEmail(saved);
    }
  }, [focused.name]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('reviveai.test.email', testEmail);
    }
  }, [testEmail]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setSelectedIndex((i) => (i + 1) % customers.length);
      if (e.key === 'ArrowLeft') setSelectedIndex((i) => (i - 1 + customers.length) % customers.length);
      if (['ArrowUp', 'ArrowDown', 'e', 'E', 'r', 'R', 's', 'S', 'b', 'B', '?'].includes(e.key)) {
        const current = selectedIndex;
        if (e.key === 'ArrowUp') setSelectedIndex(current <= 0 ? 0 : current - 1);
        if (e.key === 'ArrowDown') setSelectedIndex(current >= customers.length - 1 ? customers.length - 1 : current + 1);
        const row = customers[current];
        if (!row) return;
        if (e.key === 'e' || e.key === 'E') handleInlineEdit(row);
        if (e.key === 'r' || e.key === 'R') openReason(row.reason !== 'None' ? (row.reason as Exclude<Reason, 'None'>) : 'Low Feature Adoption');
        if (e.key === 's' || e.key === 'S') sendTestMail(row);
        if (e.key === 'b' || e.key === 'B') openBatchModal();
        if (e.key === '?') startTour();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [customers, selectedIndex]);

  /* KPIs */
  const avgRisk = useMemo(() => (customers.reduce((a, b) => a + b.risk, 0) / customers.length).toFixed(1), [customers]);
  const percentDormant = useMemo(() => `${((customers.filter((c) => c.segment === 'Dormant').length / customers.length) * 100).toFixed(0)}%`, [customers]);
  const hoursSaved = useMemo(() => {
    const dormant = customers.filter((c) => c.segment === 'Dormant').length;
    const atRisk = customers.filter((c) => c.segment === 'At Risk').length;
    const healthy = customers.filter((c) => c.segment === 'Healthy').length;
    const minutes = dormant * 30 + atRisk * 20 + healthy * 5;
    return ((minutes / 60) * 0.5).toFixed(1);
  }, [customers]);

  /* Chart stats for popups */
  const segmentStats = useMemo(() => {
    const total = customers.length || 1;
    const counts: Record<Segment, number> = { Healthy: 0, 'At Risk': 0, Dormant: 0 };
    customers.forEach((c) => counts[c.segment]++);
    const pct = (seg: Segment) => CHART_OVERRIDES.segmentsPct[seg] ?? Math.round((counts[seg] / total) * 100);
    return { counts, pct, total };
  }, [customers]);

  const reasonStats = useMemo(() => {
    const counts: Record<Exclude<Reason, 'None'>, number> = {
      'Onboarding Gap': 0,
      'Pricing Confusion': 0,
      'Bug/Incident': 0,
      'Integration Incomplete': 0,
      'Low Feature Adoption': 0,
    };
    customers
      .filter((c) => c.reason !== 'None')
      .forEach((c) => {
        counts[c.reason as Exclude<Reason, 'None'>]++;
      });
    (Object.keys(counts) as (keyof typeof counts)[]).forEach((k) => {
      const override = CHART_OVERRIDES.reasonCounts[k as keyof typeof CHART_OVERRIDES.reasonCounts];
      if (override != null) counts[k] = override;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const pct = (k: keyof typeof counts) => Math.round((counts[k] / total) * 100);
    return { counts, pct, total };
  }, [customers]);

  /* Info helpers */
  const theme = { bg: '#fff', text: '#111', card: '#fff', border: '#eee', sub: '#777' };
  function openInfo(title: string, body: string) {
    setInfoTitle(title);
    setInfoBody(body);
    setInfoOpen(true);
  }
  function explainMetric(label: string, value: string) {
    if (label.includes('Without ReviveAI')) return 'Baseline scenario without ReviveAI: reflects current churn and engagement levels using manual outreach; no AI interventions applied.';
    if (label.includes('With ReviveAI')) return 'Scenario with ReviveAI: improved outcomes from early detection and contextual nudges — reduced churn and higher engagement.';
    if (label.includes('Dormant Reduction')) return 'Target decrease in users inactive ≥14 days (90-day window). This tracks silent churn prevention.';
    if (label.includes('TTI')) return 'Time-to-Intervention: how quickly we act after a risk flag. Faster response → higher win rates.';
    if (label.includes('Engagement Lift')) return 'Increase in active usage among contacted accounts vs baseline.';
    if (label.includes('Upsell Uplift')) return 'Incremental revenue from recovered or expanded accounts after interventions.';
    if (label.includes('Average Risk')) return 'Mean risk score across cohort (0–100). The Incident Simulator increases this temporarily.';
    if (label.includes('% Dormant')) return 'Share of users without a login for ≥14 days. Lower is healthier.';
    if (label.includes('Hours Saved')) return 'Rough time saved by drafting messages and prioritizing focus. Demo estimate only.';
    if (label.includes('Flags this week'))
      return incidentOn ? 'Elevated flags due to simulated P1 incident. Use “Understand” + “Send” to reassure and guide recovery.' : 'Risk flags triggered by inactivity, usage dips, billing/support signals.';
    if (label.includes('Median idle days')) return 'Typical days since last login at the time of flag. Earlier detection means easier recoveries.';
    if (label.includes('Top theme today'))
      return incidentOn ? 'Bug/Incident dominates when a P1 is active — messaging should confirm stability and invite a brief verification session.' : 'Onboarding Gap is common — offer a short guided setup to reach value faster.';
    if (label.includes('Tickets resolved')) return 'Closed tickets in last 7 days — steady resolution builds trust and reduces risk.';
    if (label.includes('Signal coverage')) {
      const req = requiredToolsFor(focused);
      const covered = req.filter((t) => availableTools.has(t)).length;
      return `Tools connected for ${focused.name}: ${covered}/${req.length}. More coverage → higher confidence and personalization.`;
    }
    if (label.includes('Why these tools')) return 'The selected systems explain “why” risk exists and enable precise, helpful messages.';
    if (label.includes('Retained w/o ReviveAI')) return 'Estimated retained accounts at baseline churn, without interventions.';
    if (label.includes('Retained with ReviveAI')) return 'Estimated retained accounts after applying ReviveAI’s churn reduction slider.';
    if (label.includes('Revenue Retained')) return 'Incremental revenue retained = (retained with − retained without) × ARPA.';
    if (label.includes('Saves per week')) return 'Throughput limited by team capacity. Increase CSMs or capacity to rescue more accounts weekly.';
    if (label.includes('Churn') && label.includes('(Without)')) return 'Baseline churn without ReviveAI — reflects current manual process performance (no AI intervention).';
    if (label.includes('Churn') && label.includes('(With)')) return 'Reduced churn with ReviveAI — driven by proactive detection and contextual engagement.';
    if (label.includes('Churn') && value.includes('%')) return 'Projected churn for each scenario — lower with ReviveAI reflects earlier detection and helpful nudges.';
    if (label.includes('Engagement') && (value === 'Baseline' || value.includes('+'))) return 'Engagement level under each scenario — expect modest gains with relevant guidance.';
    return `${label}: ${value}`;
  }

  /* AI helpers */
  function confidenceForRow(row: Customer, tools: Set<ToolId>): 'Low' | 'Med' | 'High' {
    const needed = requiredToolsFor(row);
    const covered = needed.filter((t) => tools.has(t)).length / Math.max(1, needed.length);
    if (covered >= 0.75) return 'High';
    if (covered >= 0.4) return 'Med';
    return 'Low';
  }
  function aiSuggest(row: Customer, enabledTools: Set<ToolId>, t: Tone = 'Supportive', p: Persona = 'Empathetic'): string {
    const has = (id: ToolId) => enabledTools.has(id);
    const first = row.name.split(' ')[0];
    const bits: string[] = [];
    if (p === 'Empathetic') bits.push(`${first}, I want to make this easy.`);
    if (p === 'Data-Driven') bits.push(`${first}, based on your recent patterns:`);
    if (p === 'ROI-Focused') bits.push(`${first}, here’s the quickest path to value:`);

    if (row.segment === 'Dormant') {
      bits.push(`You haven’t been active for ${row.days_since_last_login} days.`);
      if (has('okta')) bits.push('Access looks good on our side.');
      if (has('de')) bits.push('You started a dashboard — let’s finish it together.');
      bits.push('A 15–20 min session can unlock quick wins this week.');
    } else if (row.segment === 'At Risk') {
      if (row.reason === 'Bug/Incident') {
        bits.push('We addressed the error in your workflow;');
        if (has('grafana')) bits.push('telemetry confirms stability;');
        bits.push('happy to retry together today with support on standby.');
      } else if (row.reason === 'Pricing Confusion') {
        if (has('billing')) bits.push('Your usage suggests a better-fitting plan;');
        bits.push('let’s compare and likely reduce costs.');
      } else if (row.reason === 'Integration Incomplete') {
        bits.push('Looks like the connector setup wasn’t finished; I’ll bring a support buddy to get it done.');
      } else if (row.reason === 'Low Feature Adoption') {
        if (has('de')) bits.push('Your team logs in but skipped automation/alerts — those drive the biggest time savings;');
        bits.push('can I walk you through two workflows that pay off immediately?');
      } else {
        bits.push('Saw usage dip — I can walk you through the key features you started.');
      }
    } else {
      bits.push('Great momentum on core features; here are advanced shortcuts to save time each week.');
    }

    if (has('sendgrid')) bits.push('I can send calendar options.');
    let msg = bits.join(' ');
    if (t === 'Direct') msg = msg.replace(/I want to make this easy\./, 'Let’s get this done.').replace(/I can /g, 'I’ll ');
    if (t === 'Executive') msg = `Summary: ${row.segment} due to ${row.reason}. ${msg} — Keeping this brief.`;
    if (t === 'Consultative') msg = msg + ' If we align on goals, I’ll propose a 2-step plan and measure outcomes.';
    const lint = lintSafety(msg);
    return lint.flagged && lint.rewrite ? lint.rewrite : msg;
  }
  function cadenceFor(row: Customer, enabledTools: Set<ToolId>, p: Persona, t: Tone) {
    const m0 = aiSuggest(row, enabledTools, t, p);
    const m3 = 'Follow-up: quick value proof with your data (screenshot or ROI stat).';
    const m7 = 'Calendar ask: 2–3 time options to finish setup and confirm outcomes.';
    return [m0, m3, m7];
  }

  /* Inline edit */
  function handleInlineEdit(row: Customer) {
    const draft = prompt('Edit message (Safety rails auto-lint):', row.message) ?? row.message;
    const lint = lintSafety(draft);
    if (lint.flagged && lint.rewrite) {
      const useRewrite = confirm(`Safety rails flagged: ${lint.reason}\n\nSuggested rewrite:\n\n${lint.rewrite}\n\nUse this version?`);
      row.message = useRewrite ? lint.rewrite : draft;
    } else row.message = draft;
    push('Message updated');
  }

  /* Send + ICS */
  function sendTestMail(row: Customer) {
    const subject = encodeURIComponent(`[ReviveAI] ${row.name} — ${row.segment} (${row.reason})`);
    const suggestion = aiSuggest(row, availableTools, tone, persona);
    const body = encodeURIComponent(
      `Hi ${row.name.split(' ')[0]},\n\n${suggestion}\n\n— Sent via ReviveAI demo\n\nContext:\nOwner: ${row.name}\nAccount: ${row.company}\nSegment: ${row.segment}\nReason: ${row.reason}\nDays since last login: ${row.days_since_last_login}\nRisk: ${row.risk}`
    );
    window.location.href = `mailto:${encodeURIComponent(testEmail)}?subject=${subject}&body=${body}`;
    push(`Test email queued for ${row.name}`);
  }
  function downloadICS(row: Customer) {
    const when = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const url = makeICS({
      title: `ReviveAI: quick working session with ${row.company}`,
      description: aiSuggest(row, availableTools, tone, persona),
      start: when,
      durationMins: 20,
      location: 'Google Meet',
    });
    const a = document.createElement('a');
    a.href = url;
    a.download = `ReviveAI_${row.company.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* Timeline */
  function openTimeline(row: Customer) {
    setDrawerFor(row);
    setDrawerOpen(true);
  }
  function timelineFor(row: Customer) {
    return [
      { t: 'Login', d: row.days_since_last_login === 0 ? 'Today' : `${row.days_since_last_login}d ago`, note: row.days_since_last_login >= 14 ? 'No logins since threshold' : 'Recent activity' },
      { t: 'Usage', d: 'This week', note: row.segment === 'Healthy' ? 'Consistent' : 'Intermittent' },
      { t: 'Ticket', d: row.reason === 'Bug/Incident' ? '2d ago' : '—', note: row.reason === 'Bug/Incident' ? 'Resolved' : 'No open P1' },
      { t: 'Invoice', d: 'This month', note: 'On time' },
      { t: 'Email', d: '3d ago', note: 'Opened' },
    ];
  }

  /* Reasons popups */
  function openSegment(seg: Segment) {
    const pct = segmentStats.pct(seg);
    const why =
      seg === 'Dormant'
        ? 'Dormant = no login for ≥14 days + low usage.'
        : seg === 'At Risk'
        ? 'At Risk = friction (tickets/incidents), falling usage, or plan fit issues.'
        : 'Healthy = frequent logins + consistent usage; no major friction.';
    setChartTitle(`${seg} — ${pct}% of users`);
    setChartBody(`${pct}% are ${seg}. We weigh activity patterns, engagement depth, purchase behavior, and responsiveness. ${why}`);
    setChartOpen(true);
  }
  function openReason(r: Exclude<Reason, 'None'>) {
    const pct = reasonStats.pct(r);
    const count = reasonStats.counts[r];
    const actions: Record<Exclude<Reason, 'None'>, string> = {
      'Onboarding Gap': 'Offer a short guided session to complete key steps and unlock visible outcomes.',
      'Pricing Confusion': 'Review usage vs. plan; share a side-by-side comparison and recommend the best fit.',
      'Bug/Incident': 'Acknowledge the issue, confirm stability, and invite a brief verification run-through.',
      'Integration Incomplete': 'Pair with support to finish connector setup live.',
      'Low Feature Adoption': 'Demonstrate two time-saving workflows and set alerts for ongoing value signals.',
    };
    setChartTitle(`${r} — ${pct}% (${count})`);
    setChartBody(`${pct}% (${count}) of flagged accounts show “${r}”. Suggested action: ${actions[r]}`);
    setChartOpen(true);
  }

  // Dynamic Summary — OWNER (CSM) now reflected from owners state
  function toolLabel(id: ToolId) {
    return TOOL_CATALOG.find((t) => t.id === id)?.label ?? id;
  }
  const dynamicSummary = useMemo(() => {
    const required = requiredToolsFor(focused);
    const connected = required.filter((t) => availableTools.has(t));
    const missing = required.filter((t) => !availableTools.has(t));
    const coverage = `${connected.length}/${required.length}`;
    const priText = priority?.[focused.name] ?? 'Medium';
    const slaText = sla[focused.name] ? `SLA in ${humanizeCountdown(sla[focused.name])}` : 'No SLA set';
    const actionText: Record<Exclude<Reason, 'None'>, string> = {
      'Onboarding Gap': 'Offer a short guided session to complete key steps and show visible outcomes.',
      'Pricing Confusion': 'Compare usage vs plan; recommend the best fit and likely reduce costs.',
      'Bug/Incident': 'Acknowledge the issue, confirm stability, and invite a quick verification run-through.',
      'Integration Incomplete': 'Finish connector setup live with support to unblock workflow.',
      'Low Feature Adoption': 'Walk through two time-saving workflows and set alerts for ongoing value.',
    };
    const reasonSentence = focused.reason === 'None' ? 'No active friction detected. Keep momentum with advanced tips and time-savers.' : actionText[focused.reason as Exclude<Reason, 'None'>];
    const connectedLbl = connected.map(toolLabel).join(' • ') || 'None';
    const missingLbl = missing.map(toolLabel).join(' • ') || 'None';
    const ownerDisplay = owners[focused.name] || 'Unassigned'; // <-- show chosen CSM

    const summary: string[] = [
      `For ${focused.company} (Owner: ${focused.name} • CSM: ${ownerDisplay}): ${focused.segment} — primary factor: ${focused.reason}.`,
      `Recommended next step: ${reasonSentence}`,
      `Connected tools: ${connectedLbl}`,
      `Missing tools: ${missingLbl}`,
      `Coverage: ${coverage}`,
      `Priority: ${priText}. ${slaText}.`,
    ];
    if (connected.length === required.length) summary.push('✅ Full context achieved — AI confidence high.');
    else summary.push('⚠️ Missing context may reduce personalization accuracy.');
    return summary;
  }, [focused, availableTools, sla, priority, owners]);

  /* Tools toggle & deltas */
  function requestToggleTool(id: ToolId) {
    const has = availableTools.has(id);
    if (has) {
      const required = requiredToolsFor(focused);
      if (required.includes(id)) {
        setConfirmTool(id);
        setConfirmMode('remove');
        setConfirmText(`${explainWhy(id)}\n\nRemoving reduces context for ${focused.company}. Still remove?`);
        setConfirmOpen(true);
        return;
      }
      const next = new Set(availableTools);
      next.delete(id);
      announceCoverageDelta(availableTools, next);
      setAvailableTools(next);
    } else {
      const label = TOOL_CATALOG.find((t) => t.id === id)?.label;
      const note = 'Optional unless required by the current reason.';
      setConfirmTool(id);
      setConfirmMode('add');
      setConfirmText(`${label}: ${note}\n\nAdd this tool to the current context?`);
      setConfirmOpen(true);
    }
  }
  function announceCoverageDelta(prev: Set<ToolId>, next: Set<ToolId>) {
    const req = requiredToolsFor(focused);
    const before = req.filter((t) => prev.has(t)).length;
    const after = req.filter((t) => next.has(t)).length;
    const beforePct = Math.round((before / Math.max(1, req.length)) * 100);
    const afterPct = Math.round((after / Math.max(1, req.length)) * 100);
    const dir = after > before ? '↑' : '↓';
    const confBefore = confidenceForRow(focused, prev);
    const confAfter = confidenceForRow(focused, next);
    push(`Context ${dir} ${beforePct}%→${afterPct}% • Confidence ${confBefore}→${confAfter}`);
    if (after === req.length && before < req.length) {
      setCoverageGlow(true);
      setTimeout(() => setCoverageGlow(false), 1200);
    }
  }
  function confirmChange() {
    if (!confirmTool) {
      setConfirmOpen(false);
      return;
    }
    const next = new Set(availableTools);
    if (confirmMode === 'add') next.add(confirmTool);
    else next.delete(confirmTool);
    announceCoverageDelta(availableTools, next);
    setAvailableTools(next);
    setConfirmOpen(false);
    setConfirmTool(null);
  }

  /* Batch + CSV */
  function toggleRowSelection(name: string) {
    const next = new Set(selectedRows);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedRows(next);
  }
  function openBatchModal() {
    if (selectedRows.size === 0) {
      push('Select rows for batch');
      return;
    }
    const picked = customers.filter((c) => selectedRows.has(c.name));
    const firstNames = picked.map((p) => p.name.split(' ')[0]);
    const rset = new Set(picked.map((p) => p.reason));
    const commonReason = rset.size === 1 ? picked[0].reason : 'Mixed';
    const template = `Hi ${firstNames.join(', ')},\n\nWe noticed ${commonReason === 'Mixed' ? 'similar patterns' : `a "${commonReason}" pattern`} across your accounts.\nWe can hop on a short call to finish setup, resolve blockers, and show quick wins tailored to your usage.\n\n— Sent via ReviveAI demo`;
    setBatchText(template);
    setBatchModalOpen(true);
  }
  function exportCSV() {
    const rows = customers.map((c) => ({
      Owner: c.name,
      Account: c.company,
      Segment: c.segment,
      Reason: c.reason,
      DaysSilent: c.days_since_last_login,
      Risk: c.risk,
      SuggestedMessage: aiSuggest(c, availableTools, tone, persona),
    }));
    const header = Object.keys(rows[0]).join(',');
    const body = rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reviveai_outreach_plan.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  /* Tour + ticker */
  function startTour() {
    setTourStep(0);
    setTimeout(() => setTourStep(1), 1200);
    setTimeout(() => {
      refDetect.current?.scrollIntoView({ behavior: 'smooth' });
      setTourStep(2);
    }, 2300);
    setTimeout(() => {
      refUnderstand.current?.scrollIntoView({ behavior: 'smooth' });
      setTourStep(3);
    }, 3600);
    setTimeout(() => {
      refTools.current?.scrollIntoView({ behavior: 'smooth' });
      setTourStep(4);
    }, 5100);
    setTimeout(() => {
      refSend.current?.scrollIntoView({ behavior: 'smooth' });
      setTourStep(5);
    }, 6600);
    setTimeout(() => {
      refFuture.current?.scrollIntoView({ behavior: 'smooth' });
      setTourStep(6);
    }, 8200);
    setTimeout(() => setTourStep(null), 10000);
  }
  useEffect(() => {
    const id = setInterval(() => setFeedbackCount((c) => c + Math.floor(Math.random() * 3)), 5000);
    return () => clearInterval(id);
  }, []);
  /* ======== RENDER ======== */
  return (
    <div style={{ padding: 24, fontFamily: 'Inter, Arial, sans-serif', maxWidth: '100%', margin: '0 auto', color: theme.text, background: theme.bg, minHeight: '100vh' }}>
      <Banner title="ReviveAI — Customer Retention Intelligence" text="Detect silent churn early. Explain the why. Act with context. Protect revenue." />

      {/* Top controls */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <strong>Persona:</strong>
        <button onClick={() => setSelectedIndex((i) => (i - 1 + customers.length) % customers.length)} style={navBtnStyle}>
          ‹
        </button>
        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
          style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text }}
        >
          {customers.map((c, i) => (
            <option key={c.name} value={i}>
              {c.company} — {c.name}
            </option>
          ))}
        </select>
        <button onClick={() => setSelectedIndex((i) => (i + 1) % customers.length)} style={navBtnStyle}>
          ›
        </button>

        <span style={{ marginLeft: 12 }}>
          Test email:&nbsp;
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-test@example.com"
            style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, width: 220 }}
          />
        </span>

        <label style={{ marginLeft: 12, fontSize: 12, color: '#555' }}>
          <input type="checkbox" checked={incidentOn} onChange={() => setIncidentOn((v) => !v)} /> Incident Simulator (P1)
        </label>

        <button onClick={exportCSV} style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text }}>
          Export CSV
        </button>
        <button onClick={startTour} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text }}>
          Play 60s Tour
        </button>
     
        </div>

        {/* Executive Snapshot */}
        <Section title="Executive Snapshot (Pilot Goals)">
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <AnimatedTile
                label="Dormant Reduction (90d)"
                value="15%"
                rightAddon={<Sparkline values={[9,9,8,8,7,7,6,6]} />}
                onClick={()=>openInfo('Dormant Reduction (90d)', explainMetric('Dormant Reduction (90d)','15%'))}
              />
              <AnimatedTile
                label="TTI (Time-to-Intervention)"
                value="< 24 hrs"
                rightAddon={<Sparkline values={[36,30,28,24,22,20,20,18]} />}
                onClick={()=>openInfo('TTI (Time-to-Intervention)', explainMetric('TTI (Time-to-Intervention)','< 24 hrs'))}
              />
              <AnimatedTile
                label="Engagement Lift"
                value="+20%"
                rightAddon={<Sparkline values={[5,6,7,8,9,10,11,12]} />}
                onClick={()=>openInfo('Engagement Lift', explainMetric('Engagement Lift','+20%'))}
              />
              <AnimatedTile
                label="Upsell Uplift"
                value="+10%"
                rightAddon={<Sparkline values={[2,2,3,4,5,7,8,10]} />}
                onClick={()=>openInfo('Upsell Uplift', explainMetric('Upsell Uplift','+10%'))}
              />
            </div>
          </Card>
        </Section>

        {/* KPI trio */}
        <div style={{ display: 'flex', gap: 16, margin: '16px 0' }}>
          <AnimatedTile
            label="Average Risk Score"
            value={avgRisk}
            rightAddon={<Sparkline values={[10,11,12,12,13,14,14,15]} />}
            onClick={()=>openInfo('Average Risk Score', explainMetric('Average Risk Score', String(avgRisk)))}
          />
          <AnimatedTile
            label="% Dormant"
            value={percentDormant}
            rightAddon={<Sparkline values={[30,28,27,26,24,22,21,20]} />}
            onClick={()=>openInfo('% Dormant', explainMetric('% Dormant', percentDormant))}
          />
          <AnimatedTile
            label="Hours Saved via Automation (demo)"
            value={hoursSaved}
            rightAddon={<Sparkline values={[1,1.2,1.3,1.5,1.7,1.8,2.0,2.2]} />}
            onClick={()=>openInfo('Hours Saved via Automation', explainMetric('Hours Saved via Automation', hoursSaved))}
          />
        </div>

        {/* Step 1: Detect */}
        <div ref={refDetect}>
          <Section title="Step 1: Detect — find silent churn early">
            <ChartGrid>
              <ChartCard
                title="Engagement Segments"
                url={PIE_CHART_URL}
                helper="Click a segment to see how we interpret it."
                chips={['Dormant','At Risk','Healthy']}
                onChipClick={(c)=>openSegment(c as Segment)}
              />

              <ChartCard
                title="Ticket / Reason Clusters"
                url={BAR_CHART_URL}
                helper="Click a reason to see suggested next best action."
                chips={['Onboarding Gap','Pricing Confusion','Bug/Incident','Integration Incomplete','Low Feature Adoption']}
                onChipClick={(c)=>openReason(c as Exclude<Reason,'None'>)}
              />

              <ChartCard
                title="Reactivation Trend (Area)"
                url={AREA_CHART_URL}
                helper="Weekly reactivations after outreach. Rising is good."
                chips={['What this shows']}
                onChipClick={()=>openInfo('Reactivation Trend', 'Weekly count of users returning to activity after outreach.')}
              />

              <ChartCard
                title="Login Activity by Week (Column)"
                url={COLUMN_CHART_URL}
                helper="Weekly login spikes can reveal seasonality or incidents."
                chips={['How to use it']}
                onChipClick={()=>openInfo('Login Activity', 'Helps time your outreach and understand macro patterns.')}
              />

              <ChartCard
                title="Plan Fit vs Usage (Donut)"
                url={DOUGHNUT_CHART_URL}
                helper="Highlights potential plan mismatch segments."
                chips={['Interpretation']}
                onChipClick={()=>openInfo('Plan Fit vs Usage', 'If “over-provisioned” is high, a right-size plan review is timely.')}
              />

              <ChartCard
                title="Response Rates by Touch (Bar)"
                url={BAR2_CHART_URL}
                helper="Compares Day 0 / Day 3 / Day 7 response rates."
                chips={['Cadence tips']}
                onChipClick={()=>openInfo('Cadence Tips', 'Keep touchpoints brief; include a single clear ask with calendar options.')}
              />
            </ChartGrid>

            {/* 7th centered chart */}
            <div style={{ maxWidth: 860, margin: '12px auto 0' }}>
              <ChartCard
                title="Engagement Depth Over Time (Line)"
                url={LINE_CHART_URL}
                helper="Tracks average depth of usage across the cohort."
                chips={['Read this chart']}
                onChipClick={()=>openInfo('Engagement Depth', 'Correlate depth changes with major releases or incidents.')}
              />
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <AnimatedTile
                label="Flags this week"
                value={String(incidentOn ? 18 : 12)}
                rightAddon={<Sparkline values={[4,5,6,5,6,7,6,7]} />}
                onClick={()=>openInfo('Flags this week', explainMetric('Flags this week', String(incidentOn?18:12)))}
              />
              <AnimatedTile
                label="Median idle days at flag"
                value={incidentOn ? '18' : '16'}
                rightAddon={<Sparkline values={[18,18,17,17,16,16,16,15]} />}
                onClick={()=>openInfo('Median idle days at flag', explainMetric('Median idle days at flag', incidentOn?'18':'16'))}
              />
            </div>
            <Note text="Signals watched: logins, usage, billing, support. When a customer hasn’t logged in for 14 days, we flag it as potential silent churn." />
          </Section>
        </div>
        {/* Step 2: Understand */}
        <div ref={refUnderstand}>
          <Section title="Step 2: Understand — explain the 'why'">
            <Card title={`Why “${focused.reason}” for ${focused.company}`}>
              {[
                { label:'Inactivity', weight: Math.min(1, focused.days_since_last_login / 28) },
                { label:'Usage Drop', weight: focused.segment !== 'Healthy' ? 0.6 : 0.2 },
                { label:'Support Friction', weight: focused.reason === 'Bug/Incident' ? 0.8 : 0.3 },
                { label:'Pricing Fit', weight: focused.reason === 'Pricing Confusion' ? 0.7 : 0.3 },
                { label:'Integration', weight: focused.reason === 'Integration Incomplete' ? 0.7 : 0.2 },
                { label:'Low Feature Adoption', weight: focused.reason === 'Low Feature Adoption' ? 0.7 : 0.3 },
              ].map((a) => {
                const arr = [a.weight, 1]; const pct = Math.round((a.weight/Math.max(...arr))*100);
                return (
                  <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0' }}>
                    <div style={{ width: 180, fontSize: 12, color:'#555' }}>{a.label}</div>
                    <div
                      style={{ flex: 1, background:'#f3f6fb', border:'1px solid #e6eefb', height:10, borderRadius:6, overflow:'hidden', cursor:'pointer' }}
                      onClick={()=>openInfo(`Attribution — ${a.label}`, `${a.label} currently contributes about ${pct}% to the risk reasoning for this account.`)}
                    >
                      <div style={{ width:`${pct}%`, height:'100%', background:'#0b57d0' }} />
                    </div>
                    <div style={{ width: 38, fontSize:12, textAlign:'right' }}>{pct}%</div>
                  </div>
                );
              })}
            </Card>
          </Section>
        </div>

        {/* Step 3: Tools */}
        <div ref={refTools}>
          <Section title="Step 3: Tools — provide signals to ReviveAI (tool-agnostic)">
            <Card>
              <div>For <strong>{focused.company}</strong> (Owner: {focused.name}), ReviveAI suggests: {requiredToolsFor(focused).map(id=>TOOL_CATALOG.find(t=>t.id===id)?.label).join(' • ')}.</div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                {TOOL_CATALOG.map(t => (
                  <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid #eee`, borderRadius: 8, padding: '6px 10px' }}>
                    <input type="checkbox" checked={availableTools.has(t.id)} onChange={()=>requestToggleTool(t.id)} />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <AnimatedTile
                  label="Signal coverage (focused)"
                  value={`${requiredToolsFor(focused).filter(t => availableTools.has(t)).length}/${requiredToolsFor(focused).length}`}
                  rightAddon={<Sparkline values={[3,3,4,4,5,5,5,6]} />}
                  variant={coverageGlow ? 'glow':'normal'}
                  onClick={()=>openInfo('Signal coverage (focused)', explainMetric('Signal coverage', ''))}
                />
                <AnimatedTile
                  label="Why these tools"
                  value="Context ↑"
                  rightAddon={<Sparkline values={[2,3,3,4,4,5,5,6]} />}
                  onClick={()=>openInfo('Why these tools', explainMetric('Why these tools','Context ↑'))}
                />
              </div>

              <div style={{marginTop:8, color: '#555', fontSize:12}}>
                {Array.from(new Set(requiredToolsFor(focused))).map(id => `${TOOL_CATALOG.find(t=>t.id===id)?.label}: ${explainWhy(id)}`).join(' | ')}
              </div>
              <div style={{marginTop:6, color: '#111', fontSize:13}}>
                Note: ReviveAI is <strong>tool-agnostic</strong> — it keeps working if systems change later.
              </div>
            </Card>
          </Section>
        </div>
        {/* Step 4: Send */}
        <div ref={refSend}>
          <Section title="Step 4: Send — contextual outreach (AI-assisted)">
            <Card>
              {/* Persona + Tone */}
              <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
                <div><strong>AI Persona:</strong>&nbsp;
                  <select value={persona} onChange={e=>setPersona(e.target.value as any)} style={{ padding:'6px 8px', borderRadius:6, border:'1px solid #ddd' }}>
                    <option>Empathetic</option>
                    <option>Data-Driven</option>
                    <option>ROI-Focused</option>
                  </select>
                </div>
                <div><strong>Tone:</strong>&nbsp;
                  <select value={tone} onChange={e=>setTone(e.target.value as any)} style={{ padding:'6px 8px', borderRadius:6, border:'1px solid #ddd' }}>
                    <option>Supportive</option>
                    <option>Direct</option>
                    <option>Executive</option>
                    <option>Consultative</option>
                  </select>
                </div>
              </div>

              <Table
                data={customers}
                focusedName={selectedName}
                availableTools={availableTools}
                onRowNameClick={(row)=>openTimeline(row)}
                onReasonChipClick={(r)=>openReason(r)}
                onEdit={(row)=>handleInlineEdit(row)}
                onAISuggest={(row)=>{ const s = aiSuggest(row, availableTools, tone, persona); alert(`AI suggestion for ${row.company} (Owner: ${row.name}) — ${persona} • ${tone}:\n\n${s}`); }}
                onSend={(row) => sendTestMail(row)}
                onICS={(row)=>downloadICS(row)}
                onSelectRow={toggleRowSelection}
                selectedRows={selectedRows}
                confidenceFor={(row)=>confidenceForRow(row, availableTools)}
                owners={owners}
                setOwner={(name, owner) => setOwners({...owners, [name]: owner})}
                sla={sla}
                setSla={(name, deadlineMs)=> setSla({...sla, [name]: deadlineMs})}
                priority={priority}
                setPriority={(name, p)=> setPriority({...priority, [name]: p})}
                customSla={customSla}
                setCustomSla={setCustomSla}
              />

              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <button onClick={openBatchModal} style={{ padding:'6px 10px', borderRadius:6, border:'1px solid #ddd', background:'#fff' }}>
                  Auto-group & Batch
                </button>
              </div>
            </Card>
            <Note text='Click any metric tile to see what it means. Changing tools or toggling Incident Simulator updates both metrics and their explanations.' />
          </Section>
        </div>
        {/* Future — ROI Simulator, Scenario Compare, Capacity Planner */}
        <div ref={refFuture}>
          <Section title="Future — ROI Simulator, Scenario Compare, Capacity Planner">
            {/* ROI Simulator */}
            <Card>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:10 }}>
                <div>
                  <div
                    style={{ ...lbl, cursor:'pointer', textDecoration:'underline dotted' } as React.CSSProperties}
                    title="What is Cohort size?"
                    onClick={() => openInfo('Cohort size', 'Number of customers in the modeled group. Larger cohorts magnify total impact.')}
                  >
                    Cohort size
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={2000}
                    value={cohort}
                    onChange={(e) => setCohort(parseInt(e.target.value,10) || 200)}
                  />
                  <div style={sub}><strong>{cohort}</strong></div>
                </div>

                <div>
                  <div
                    style={{ ...lbl, cursor: 'pointer', textDecoration: 'underline dotted' } as React.CSSProperties}
                    title="What is ARPA?"
                    onClick={() => openInfo('ARPA ($)','ARPA (Average Revenue Per Account) — the average recurring revenue per customer account. It helps estimate total revenue retained or gained in the ROI simulator.')}
                  >
                    ARPA ($)
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={6000}
                    step={50}
                    value={arpa}
                    onChange={(e) => setArpa(parseInt(e.target.value, 10))}
                  />
                  <div style={sub}>
                    Current: <strong>${arpa.toLocaleString()}</strong>
                  </div>
                </div>

                <div>
                  <div
                    style={{ ...lbl, cursor: 'pointer', textDecoration: 'underline dotted' } as React.CSSProperties}
                    title="What is Baseline churn?"
                    onClick={() => openInfo('Baseline churn','Baseline churn represents your current customer attrition rate before using ReviveAI. It’s the proportion of accounts that would typically cancel or become inactive under existing conditions.')}
                  >
                    Baseline churn
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={0.3}
                    step={0.005}
                    value={baseChurn}
                    onChange={(e) => setBaseChurn(parseFloat(e.target.value))}
                  />
                  <div style={sub}>
                    <strong>{Math.round(baseChurn * 100)}%</strong>
                  </div>
                </div>

                <div>
                  <div
                    style={{ ...lbl, cursor: 'pointer', textDecoration: 'underline dotted' } as React.CSSProperties}
                    title="What is ReviveAI churn reduction?"
                    onClick={() => openInfo('ReviveAI churn reduction','ReviveAI churn reduction models how much the churn rate can decrease thanks to early detection, proactive messaging, and automated follow-ups. Increasing this slider shows the potential uplift from AI-assisted retention.')}
                  >
                    ReviveAI churn reduction
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.3}
                    step={0.005}
                    value={reviveReduction}
                    onChange={(e) => setReviveReduction(parseFloat(e.target.value))}
                  />
                  <div style={sub}>
                    <strong>{Math.round(reviveReduction * 100)}%</strong>
                  </div>
                </div>
              </div>

              {/* Live tiles */}
              <div style={{ display:'flex', gap:16 }}>
                <AnimatedTile
                  label="Retained w/o ReviveAI"
                  value={`${Math.round((cohort)*(1-baseChurn))}`}
                  rightAddon={<Sparkline values={[Math.round(cohort*(1-baseChurn)*0.9), Math.round(cohort*(1-baseChurn)), Math.round(cohort*(1-baseChurn)*1.05)]} />}
                  onClick={()=>openInfo('Retained w/o ReviveAI', explainMetric('Retained w/o ReviveAI', ''))}
                />
                <AnimatedTile
                  label="Retained with ReviveAI"
                  value={`${Math.round((cohort)*(1-Math.max(0, baseChurn - reviveReduction)))}`}
                  rightAddon={<Sparkline values={[Math.round(cohort*(1-baseChurn+reviveReduction*0.8)), Math.round(cohort*(1-baseChurn+reviveReduction)), Math.round(cohort*(1-baseChurn+reviveReduction*1.1))]} />}
                  onClick={()=>openInfo('Retained with ReviveAI', explainMetric('Retained with ReviveAI', ''))}
                />
                <AnimatedTile
                  label="Revenue Retained (Δ)"
                  value={`$${Math.round(cohort*reviveReduction*arpa).toLocaleString()}`}
                  rightAddon={<Sparkline values={[Math.round(cohort*reviveReduction*arpa*0.8), Math.round(cohort*reviveReduction*arpa), Math.round(cohort*reviveReduction*arpa*1.1)]} />}
                  onClick={()=>openInfo('Revenue Retained (Δ)', explainMetric('Revenue Retained (Δ)', ''))}
                />
                <AnimatedTile
                  label="Saves per week (capacity)"
                  value={`${capacity.attainableSavesPerWeek}`}
                  rightAddon={<Sparkline values={[27, 29, 32]} />}
                  onClick={() => openInfo('Saves per week (capacity)', explainMetric('Saves per week (capacity)', ''))}
                />
              </div>
            </Card>

            {/* Scenario Compare & Capacity */}
            <Card>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {/* Without ReviveAI */}
                <div style={{ border:'1px solid #eee', borderRadius:8, padding:10 }}>
                  <h4 style={{margin:'6px 0', display:'flex', alignItems:'center', gap:8}}>
                    Without ReviveAI
                    <button
                      aria-label="Explain: Without ReviveAI"
                      onClick={() => openInfo('Without ReviveAI','Baseline scenario using your current process. Churn remains at the baseline and engagement stays flat; the tiles below show expected outcomes without ReviveAI interventions.')}
                      style={{ border:'1px solid #ddd', background:'#fff', borderRadius:6, padding:'0 6px', cursor:'pointer', fontSize:12 }}
                      title="Explain"
                    >
                      i
                    </button>
                  </h4>
                  <div style={{ display:'flex', gap:12 }}>
                    <AnimatedTile
                      label="Churn"
                      value={`${Math.round(baseChurn*100)}%`}
                      rightAddon={<Sparkline values={[Math.round(baseChurn*100)+1, Math.round(baseChurn*100), Math.round(baseChurn*100)]} />}
                      onClick={()=>openInfo('Churn (Without)', explainMetric('Churn (Without)', `${Math.round(baseChurn*100)}%`))}
                    />
                    <AnimatedTile
                      label="Engagement"
                      value="Baseline"
                      rightAddon={<Sparkline values={[6,6,6,6,6,6]} />}
                      onClick={()=>openInfo('Engagement (Without)', explainMetric('Engagement', 'Baseline'))}
                    />
                  </div>
                </div>

                {/* With ReviveAI */}
                <div style={{ border:'1px solid #eee', borderRadius:8, padding:10 }}>
                  <h4 style={{margin:'6px 0', display:'flex', alignItems:'center', gap:8}}>
                    With ReviveAI
                    <button
                      aria-label="Explain: With ReviveAI"
                      onClick={() => openInfo('With ReviveAI','Scenario applying the ReviveAI reduction slider. Earlier detection + contextual nudges reduce churn and lift engagement; the tiles below show the improved outcomes.')}
                      style={{ border:'1px solid #ddd', background:'#fff', borderRadius:6, padding:'0 6px', cursor:'pointer', fontSize:12 }}
                      title="Explain"
                    >
                      i
                    </button>
                  </h4>
                  <div style={{ display:'flex', gap:12 }}>
                    <AnimatedTile
                      label="Churn"
                      value={`${Math.max(0, Math.round((baseChurn - reviveReduction)*100))}%`}
                      rightAddon={<Sparkline values={[
                        Math.max(0, Math.round((baseChurn - reviveReduction)*100)+2),
                        Math.max(0, Math.round((baseChurn - reviveReduction)*100)+1),
                        Math.max(0, Math.round((baseChurn - reviveReduction)*100))
                      ]} />}
                      onClick={()=>openInfo('Churn (With)', explainMetric('Churn (With)', `${Math.max(0, Math.round((baseChurn - reviveReduction)*100))}%`))}
                    />
                    <AnimatedTile
                      label="Engagement"
                      value="+↑"
                      rightAddon={<Sparkline values={[6,7,7,8,9,10]} />}
                      onClick={()=>openInfo('Engagement (With)', explainMetric('Engagement', '+↑'))}
                    />
                  </div>
                </div>
              </div>

              {/* Capacity Planner */}
              <div style={{ marginTop:12, border:'1px solid #eee', borderRadius:8, padding:10 }}>
                <h4
                  style={{margin:'6px 0', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6}}
                  onClick={()=>openInfo('Capacity Planner', 'This models how many at-risk accounts you can rescue per week based on the team size (CSMs) and weekly capacity per CSM. It helps visualize headroom or backlog versus weekly inflow of risky accounts.')}
                  title="Click for explanation"
                >
                  Capacity Planner
                  <span style={{fontSize:12, color:'#666'}}> (click for explanation)</span>
                </h4>

                <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
                  <div>
                    CSMs:&nbsp;
                    <input type="range" min={1} max={12} value={csms} onChange={e=>setCsms(parseInt(e.target.value,10))} />
                    &nbsp;<strong>{csms}</strong>
                  </div>
                  <div>
                    Weekly capacity / CSM:&nbsp;
                    <input type="range" min={10} max={60} step={5} value={weeklyCap} onChange={e=>setWeeklyCap(parseInt(e.target.value,10))} />
                    &nbsp;<strong>{weeklyCap}</strong>
                  </div>
                </div>

                {(() => {
                  const { riskInflowPerWeek, capacityPerWeek, gap, util } = capacity;
                  const coveragePct = Math.round(util * 100);

                  return (
                    <div style={{ marginTop:10 }}>
                      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                        <div style={{ padding:'8px 10px', border:'1px solid #eee', borderRadius:8 }}>
                          <strong>Risk inflow/week:</strong> {riskInflowPerWeek}
                        </div>
                        <div style={{ padding:'8px 10px', border:'1px solid #eee', borderRadius:8 }}>
                          <strong>Capacity/week:</strong> {capacityPerWeek}
                        </div>
                        <div style={{ padding:'8px 10px', border:'1px solid #eee', borderRadius:8 }}>
                          <strong>{gap >= 0 ? 'Headroom/week' : 'Backlog/week'}:</strong> {Math.abs(gap)}
                        </div>
                        <div style={{ padding:'8px 10px', border:'1px solid #eee', borderRadius:8 }}>
                          <strong>Utilization:</strong> {coveragePct}%
                        </div>
                      </div>

                      <div style={{ marginTop:8, color:'#555' }}>
  With <strong>{csms}</strong> CSMs handling <strong>{weeklyCap}</strong> accounts each per week,
  total capacity is <strong>{capacityPerWeek}</strong>.
  {' '}{gap >= 0
    ? 'You have extra capacity to focus on high-value or strategic accounts.'
    : 'This setup will create backlog — consider more capacity or prioritizing critical accounts.'}
</div>

                    </div>
                  );
                })()}
              </div>
            </Card>

            {/* Summary */}
            <Section title="Summary">
              <Card>
                <ul style={{margin:0,paddingLeft:18,color:'#111'}}>
                  {dynamicSummary.map((line,i)=><li key={i}>{line}</li>)}
                </ul>
                <div style={{marginTop:8,fontSize:12,color:'#666'}}>Tip: updates as you change customer, toggle tools, set SLA/priority, or enable Incident Simulator.</div>
              </Card>
            </Section>
          </Section>
        </div> {/* end refFuture wrapper */}

        {/* Confirm modal */}
        {confirmOpen && (
          <Modal onClose={()=>setConfirmOpen(false)}>
            <h3 style={{marginTop:0}}>{confirmMode==='add' ? 'Add this tool?' : 'Remove required tool?'}</h3>
            <p style={{whiteSpace:'pre-line'}}>{confirmText}</p>
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setConfirmOpen(false)} style={{ padding:'8px 12px', borderRadius:6, border:`1px solid #eee`, background: '#fff', color: '#111' }}>
                {confirmMode==='add' ? 'Cancel' : 'Keep tool'}
              </button>
              <button onClick={confirmChange} style={{ padding:'8px 12px', borderRadius:6, border:'none', background: confirmMode==='add' ? '#0F9D58' : '#F44336', color:'#fff' }}>
                {confirmMode==='add' ? 'Add tool' : 'Still remove'}
              </button>
            </div>
          </Modal>
        )}

        {/* Chart modal */}
        {chartOpen && (
          <Modal onClose={()=>setChartOpen(false)}>
            <h3 style={{ marginTop:0 }}>{chartTitle}</h3>
            <p style={{ whiteSpace:'pre-wrap' }}>{chartBody}</p>
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setChartOpen(false)} style={{ padding:'8px 12px', borderRadius:6, border:`1px solid #eee`, background: '#fff', color: '#111' }}>
                Close
              </button>
            </div>
          </Modal>
        )}

        {/* Info modal */}
        {infoOpen && (
          <Modal onClose={()=>setInfoOpen(false)}>
            <h3 style={{ marginTop:0 }}>{infoTitle}</h3>
            <p style={{ whiteSpace:'pre-wrap' }}>{infoBody}</p>
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setInfoOpen(false)} style={{ padding:'8px 12px', borderRadius:6, border:`1px solid #eee`, background: '#fff', color: '#111' }}>
                Close
              </button>
            </div>
          </Modal>
        )}

        {/* Batch modal */}
        {batchModalOpen && (
          <Modal onClose={()=>setBatchModalOpen(false)}>
            <h3 style={{marginTop:0}}>Auto-group & Batch</h3>
            <p>AI-drafted template based on selected rows. Edit before use.</p>
            <textarea value={batchText} onChange={e=>setBatchText(e.target.value)} style={{ width:'100%', minHeight:140, border:'1px solid #ddd', borderRadius:8, padding:10 }} />
            <div style={{display:'flex', gap:12, marginTop:8}}>
              <button onClick={()=>setBatchModalOpen(false)} style={{ padding:'8px 12px', borderRadius:6, border:'1px solid #ddd', background:'#fff' }}>Close</button>
              <button onClick={()=>{ navigator.clipboard.writeText(batchText); push('Copied batch message'); setBatchModalOpen(false); }} style={{ padding:'8px 12px', borderRadius:6, border:'none', background:'#0b57d0', color:'#fff' }}>Copy</button>
            </div>
          </Modal>
        )}

        {/* Timeline Drawer */}
        <div style={{ position:'fixed', top:0, right: drawerOpen ? 0 : -420, width: 400, height:'100vh', background:'#fff', borderLeft:'1px solid #eee', boxShadow:'-8px 0 20px rgba(0,0,0,0.06)', transition:'right 220ms ease', zIndex: 40, padding: 14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ margin:'6px 0' }}>Timeline</h3>
            <button onClick={()=>setDrawerOpen(false)} style={{ border:'none', background:'transparent', fontSize:22, cursor:'pointer' }}>×</button>
          </div>
          {drawerFor ? (
            <div>
              <div style={{ marginBottom:8, color:'#555' }}><strong>{drawerFor.company}</strong> — Owner: {drawerFor.name} • {drawerFor.segment} ({drawerFor.reason})</div>
              {timelineFor(drawerFor).map((e,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap: 8, margin: '8px 0' }}>
                  <div style={{ width:90, fontSize:12, color:'#555' }}>{e.t}</div>
                  <div style={{ flex:1, background:'#f7f7f7', border:'1px solid #eee', borderRadius:8, padding:'6px 8px', display:'flex', justifyContent:'space-between' }}>
                    <span>{e.d}</span>
                    <span style={{ color:'#555' }}>{e.note}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <div style={{ color:'#777' }}>Select a row name to view recent signals.</div>}
        </div>

        {/* Footer ticker */}
        <div style={{ position:'fixed', left:0, right:0, bottom:0, padding:'6px 10px', background:'#0b1e30', color:'#fff', fontSize:12 }}>
          <div style={{ whiteSpace:'nowrap', overflow:'hidden' }}>
            <div style={{ display:'inline-block', paddingLeft:'100%', animation:'marq 18s linear infinite' }}>
              ReviveAI retrained on {feedbackCount} new interactions · Messaging model v1.3 applied · Safety rails active · Tool-agnostic orchestration · Demo data only
            </div>
          </div>
          <style>{`@keyframes marq { 0%{transform:translateX(0)} 100%{transform:translateX(-100%)} }`}</style>
        </div>

        {/* Toasts */}
        <div style={{ position:'fixed', right:16, bottom:48, display:'flex', flexDirection:'column', gap:8, zIndex:60 }}>
          {toasts.map(t => (
            <div key={t.id} style={{ background: '#0b57d0', color:'#fff', padding:'8px 12px', borderRadius:8, boxShadow:'0 6px 16px rgba(0,0,0,0.18)', transform:'translateY(8px)', animation:'toastIn 180ms ease forwards' }}>
              {t.text}
            </div>
          ))}
          <style>{`@keyframes toastIn{to{transform:translateY(0);opacity:1}}`}</style>
        </div>

        {/* Guided Tour overlay */}
        {tourStep !== null && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:70, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
            <div style={{ background:'#fff', color:'#111', margin:16, padding:'10px 14px', borderRadius:8, border:'1px solid #eee' }}>
              {tourStep===0 && 'Welcome — quick walkthrough'}
              {tourStep===1 && 'Snapshot: targets and KPIs for the pilot'}
              {tourStep===2 && 'Detect: 7 charts highlight risks'}
              {tourStep===3 && 'Understand: clusters & attribution'}
              {tourStep===4 && 'Tools: connect context sources'}
              {tourStep===5 && 'Send: AI messages, safety, .ICS'}
              {tourStep===6 && 'Future: ROI, scenarios, capacity'}
            </div>
          </div>
        )}
      </div>
    );
}

/* ===========================
  CHART GRID & CARD
=========================== */
function ChartGrid({ children }: React.PropsWithChildren<{}>) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
      {children}
    </div>
  );
}

function ChartCard({
  title, url, helper, chips, onChipClick
}: {
  title: string;
  url: string;
  helper?: string;
  chips?: string[];
  onChipClick?: (chip: string) => void;
}) {
  return (
    <Card title={title}>
      <div style={{ position: 'relative', minHeight: 360 }}>
        <div aria-hidden style={{ position:'absolute', inset:0, background: 'linear-gradient(180deg, #fafafa, #fff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#777', fontSize:12 }}>
          {helper || 'Loading chart…'}
        </div>
        <iframe src={url} width="100%" height={360} style={{ border: 0, position:'relative' }} title={title} />
      </div>
      {chips && chips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {chips.map(ch => (
            <button
              key={ch}
              onClick={()=>onChipClick && onChipClick(ch)}
              style={{ padding: '6px 10px', borderRadius: 999, border: `1px solid #ddd`, background: '#fafafa', color: '#111', cursor: 'pointer' }}
              title={`Explain: ${ch}`}
            >
              {ch}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ===========================
  TABLE
=========================== */
function Table({
  data,
  focusedName,
  availableTools,
  onRowNameClick,
  onReasonChipClick,
  onEdit,
  onAISuggest,
  onSend,
  onICS,
  onSelectRow,
  selectedRows,
  confidenceFor,
  owners,
  setOwner,
  sla,
  setSla,
  priority,
  setPriority,
  customSla,
  setCustomSla
}: {
  data: Customer[];
  focusedName: string;
  availableTools: Set<ToolId>;
  onRowNameClick: (row: Customer) => void;
  onReasonChipClick: (r: Exclude<Reason,'None'>) => void;
  onEdit: (row: Customer) => void;
  onAISuggest: (row: Customer) => void;
  onSend: (row: Customer) => void;
  onICS: (row: Customer) => void;
  onSelectRow: (name: string) => void;
  selectedRows: Set<string>;
  confidenceFor: (row: Customer) => 'Low'|'Med'|'High';
  owners: Record<string,string>;
  setOwner: (name: string, owner: string) => void;
  sla: Record<string, number>;
  setSla: (name: string, deadlineMs: number) => void;
  priority: Record<string,'High'|'Medium'|'Low'>;
  setPriority: (name: string, p: 'High'|'Medium'|'Low') => void;
  customSla: Record<string,string>;
  setCustomSla: React.Dispatch<React.SetStateAction<Record<string,string>>>;
}) {
  const tones: Array<'Supportive'|'Direct'|'Executive'|'Consultative'> = ['Supportive','Direct','Executive','Consultative'];
  const ownerOptions = ['Unassigned','CSM — Alex','CSM — Priya','Support — Team','AI Autopilot'];

  return (
    <div style={{ overflowX:'auto' }}>
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse', color: '#111', minWidth: 1200 }}>
        <colgroup>
          <col style={{ width: 32 }} />
          <col style={{ width: 240 }} />
          <col style={{ width: 220 }} />
          <col style={{ width: 110 }} />
          <col style={{ width: 110 }} />
          <col style={{ width: 80 }} />
          <col style={{ width: 180 }} />
          <col style={{ width: 170 }} />
          <col style={{ width: 130 }} />
          <col style={{ width: 160 }} />
          <col />
        </colgroup>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th align="left" style={{ padding:'10px 8px' }}></th>
            <th align="left" style={{ padding:'10px 8px' }}>Account</th>
            <th align="left" style={{ padding:'10px 8px' }}>Owner Name</th>
            <th align="left" style={{ padding:'10px 8px' }}>Segment</th>
            <th align="left" style={{ padding:'10px 8px' }}>Days Silent</th>
            <th align="left" style={{ padding:'10px 8px' }}>Risk</th>
            <th align="left" style={{ padding:'10px 8px' }}>Reason</th>
            <th align="left" style={{ padding:'10px 8px' }}>Owner</th>
            <th align="left" style={{ padding:'10px 8px' }}>SLA</th>
            <th align="left" style={{ padding:'10px 8px' }}>Priority</th>
            <th align="left" style={{ padding:'10px 8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isFocused = row.name === focusedName;
            const conf = confidenceFor(row);
            const countdown = sla[row.name] ? humanizeCountdown(sla[row.name]) : '—';
            return (
              <tr key={row.name} style={{ borderTop: `1px solid #f0f0f0`, background: isFocused ? '#f6faff' : 'transparent' }}>
                <td>
                  <input type="checkbox" checked={selectedRows.has(row.name)} onChange={()=>onSelectRow(row.name)} aria-label={`Select ${row.company}`} />
                </td>
                <td>
                  <button onClick={()=>onRowNameClick(row)} style={{ background:'transparent', border:'none', color:'#0b57d0', cursor:'pointer', textDecoration:'underline' }}>
                    {row.company}
                  </button>
                </td>
                <td>{row.name}</td>
                <td>{row.segment}</td>
                <td>{row.days_since_last_login}</td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {row.risk}
                    <ConfidenceDot level={conf}/>
                  </div>
                </td>
                <td>
                  {row.reason!=='None' ? (
                    <button onClick={()=>onReasonChipClick(row.reason as Exclude<Reason,'None'>)} title={`Why: ${row.reason}`} style={{ padding:'4px 8px', borderRadius:999, border:'1px solid #ddd', background:'#fafafa', cursor:'pointer', fontSize:12 }}>
                      {row.reason}
                    </button>
                  ) : <span style={{ color:'#777' }}>—</span>}
                </td>
                <td>
                  <select value={owners[row.name] || 'Unassigned'} onChange={(e)=>setOwner(row.name, e.target.value)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #ddd', width:'100%' }}>
                    {ownerOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'#555' }}>{countdown}</span>
                    <div>
                      <input
                        type="number"
                        min={5}
                        step={5}
                        placeholder="Minutes"
                        value={customSla[row.name] ?? ''}
                        onChange={e=>setCustomSla({...customSla, [row.name]: e.target.value})}
                        style={{ width:110, padding:'4px 6px', border:'1px solid #ddd', borderRadius:6 }}
                      />
                      <button
                        onClick={()=>{
                          const mins = parseInt((customSla[row.name] || '0') as string, 10);
                          if (!isNaN(mins) && mins>0) setSla(row.name, Date.now() + mins*60000);
                        }}
                        style={{ marginLeft:6, padding:'4px 8px', borderRadius:6, border:'1px solid #ddd', background:'#fff', fontSize:12 }}
                        title="Set SLA (minutes from now)"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    value={priority[row.name] || 'Medium'}
                    onChange={(e)=>setPriority(row.name, e.target.value as 'High'|'Medium'|'Low')}
                    style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #ddd', width:'100%' }}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </td>
                <td style={{ display: 'flex', gap: 6, flexWrap:'wrap' }}>
                  <button
                    onClick={() => onEdit(row)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid #ddd`, cursor: 'pointer', background: '#fff', color: '#111' }}
                    title="Edit & preview"
                  >
                    Edit
                  </button>
                  {tones.map(t => (
                    <button key={t}
                      onClick={() => onAISuggest(row)}
                      style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer', background: '#fff', color: '#111', fontSize:12 }}
                      title={`AI Suggest (${t})`}
                    >
                      AI: {t}
                    </button>
                  ))}
                  <button
                    onClick={() => onSend(row)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#0B57D0', color: '#fff' }}
                    title="Send test email"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => onICS(row)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer', background: '#fff', color: '#111' }}
                    title="Download .ICS invite"
                  >
                    .ICS
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ fontSize:12, color:'#777', marginTop:6 }}>
        Shortcuts: ←/→ switch owner • ↑/↓ move focus • E edit • R reason popup • S send • B batch • ? tour
      </div>
    </div>
  );
}

