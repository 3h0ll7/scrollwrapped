import { useState } from "react";
import { motion } from "motion/react";
import { Calculator, RefreshCw } from "lucide-react";
import { calculateScrollMiles, type CalcInput } from "@/lib/scrollmiles";

interface Props {
  input: CalcInput;
  onChange: (input: CalcInput) => void;
}

export function CalculatorCard({ input, onChange }: Props) {
  const [local, setLocal] = useState(input);

  const update = <K extends keyof CalcInput>(key: K, value: number) => {
    const next = { ...local, [key]: value };
    setLocal(next);
  };

  const apply = () => onChange(local);

  return (
    <section className="rounded-3xl bg-card border border-border shadow-soft p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-blue grid place-items-center shadow-glow-blue text-white">
            <Calculator className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Calculator engine</div>
            <h2 className="text-2xl font-display font-bold tracking-tight">Recalculate your ScrollMiles</h2>
          </div>
        </div>
        <button
          onClick={apply}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition shadow-soft"
        >
          <RefreshCw className="w-4 h-4" />
          Recalculate
        </button>
      </div>

      <div className="mt-7 grid sm:grid-cols-2 gap-5">
        <Slider label="Age" suffix="years" min={10} max={80} step={1} value={local.age} onChange={(v) => update("age", v)} />
        <Slider label="Years owning smartphone" suffix="years" min={0.5} max={Math.min(60, local.age)} step={0.5} value={local.yearsOwningSmartphone} onChange={(v) => update("yearsOwningSmartphone", v)} />
        <Slider label="Daily screen time" suffix="hrs" min={0.5} max={16} step={0.1} value={local.dailyScreenTimeHours} onChange={(v) => update("dailyScreenTimeHours", v)} />
        <Slider label="Daily social media" suffix="hrs" min={0} max={12} step={0.1} value={local.socialMediaHours} onChange={(v) => update("socialMediaHours", v)} />
      </div>

      <Preview input={local} />
    </section>
  );
}

function Slider({
  label, suffix, min, max, step, value, onChange,
}: {
  label: string; suffix: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold">{label}</label>
        <span className="text-sm font-display font-bold text-foreground">
          {value.toFixed(step < 1 ? 1 : 0)} <span className="text-xs font-medium text-muted-foreground">{suffix}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--brand-purple)] h-2"
      />
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function Preview({ input }: { input: CalcInput }) {
  const r = calculateScrollMiles(input);
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      className="mt-7 rounded-2xl bg-gradient-soft p-5 border border-border flex flex-wrap gap-6 justify-around"
    >
      <Mini label="Total scrolls" value={r.totalScrolls.toLocaleString()} />
      <Mini label="Thumb miles" value={r.thumbMiles.toFixed(2)} />
      <Mini label="Content miles" value={r.contentMiles.toFixed(0)} />
      <Mini label="Screen hours" value={r.lifetimeScreenHours.toFixed(0)} />
    </motion.div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-display font-bold tracking-tight">{value}</div>
      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
