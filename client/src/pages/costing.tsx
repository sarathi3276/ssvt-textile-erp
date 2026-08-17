import { useState } from "react";

type Ingredient = {
  id: number;
  name: string;
  qty: number;
  rate: number;
};

const defaultIngredients: Ingredient[] = [
  { id: 1, name: "maize", qty: 75, rate: 35 },
  { id: 2, name: "s.maize", qty: 3, rate: 48 },
  { id: 3, name: "binder", qty: 0.9, rate: 183 },
  { id: 4, name: "slu", qty: 1, rate: 150 },
  { id: 5, name: "softner", qty: 2, rate: 90 },
  { id: 6, name: "oil", qty: 1, rate: 80 },
  { id: 7, name: "super fin ec", qty: 1, rate: 250 },
];

function fmt(n: number, d = 2): string {
  if (!isFinite(n)) return "–";
  return n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function Field({ label, unit, children }: { label: string; unit?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label} {unit && <span className="font-normal normal-case text-stone-400">{unit}</span>}
      </label>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, step }: { value: number; onChange: (value: number) => void; step?: string }) {
  return (
    <input
      type="number"
      step={step || "any"}
      value={value}
      onChange={(e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
      className="w-full rounded border border-stone-300 bg-white px-3 py-2 font-mono text-sm text-stone-800 focus:border-stone-600 focus:outline-none"
    />
  );
}

function TextInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-stone-300 bg-white px-3 py-2 font-mono text-sm text-stone-800 focus:border-stone-600 focus:outline-none"
    />
  );
}

function Panel({ title, tag, children }: { title: string; tag?: string; children: React.ReactNode }) {
  return (
    <div className="mx-2 my-3 rounded border border-stone-300 bg-stone-50 p-5">
      <div className="mb-4 flex items-baseline justify-between border-b-2 border-stone-900 pb-2">
        <h2 className="font-serif text-sm font-bold uppercase tracking-wide text-stone-900">{title}</h2>
        {tag && <span className="font-mono text-[10px] tracking-wide" style={{ color: "#800000" }}>{tag}</span>}
      </div>
      {children}
    </div>
  );
}

function Out({ label, value, hero = false }: { label: string; value: string; hero?: boolean }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-stone-500">{label}</span>
      <span
        className={"font-mono font-semibold " + (hero ? "text-base" : "text-stone-900")}
        style={hero ? { color: "#800000" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export default function LoomCosting() {
  // Warp state
  const [wCount, setWCount] = useState(30);
  const [wMill, setWMill] = useState("SM");
  const [wEnds, setWEnds] = useState(3270);
  const [wTape, setWTape] = useState(43);
  const [wYarn, setWYarn] = useState(60);
  const [wKgRate, setWKgRate] = useState(260);
  const [wCoolie, setWCoolie] = useState(20);

  // Weft state
  const [fCount, setFCount] = useState(40);
  const [fMill, setFMill] = useState("Sect");
  const [fWidth, setFWidth] = useState(50);
  const [fPick, setFPick] = useState(46);
  const [fRateIn, setFRateIn] = useState(220);
  const [fCooliePct, setFCooliePct] = useState(9);

  // Sizing recipe
  const [ingredients, setIngredients] = useState(defaultIngredients);
  const [nextId, setNextId] = useState(defaultIngredients.length + 1);

  // Overheads
  const [mixRate, setMixRate] = useState(50);
  const [fwQty, setFwQty] = useState(600);
  const [fwRate, setFwRate] = useState(1.2);
  const [fwDays, setFwDays] = useState(4);
  const [salary, setSalary] = useState(3000);
  const [warping, setWarping] = useState(1000);
  const [rent, setRent] = useState(0);
  const [extra, setExtra] = useState(0);

  function updateIngredient(id: number, field: string, value: any) {
    setIngredients((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }
  function removeIngredient(id: number) {
    setIngredients((rows) => rows.filter((r) => r.id !== id));
  }
  function addIngredient() {
    setIngredients((rows) => [...rows, { id: nextId, name: "", qty: 0, rate: 0 }]);
    setNextId((n) => n + 1);
  }

  // --- Calculations (mirrors the spreadsheet formulas) ---
  const wMtrs = wEnds ? (((1848 * wCount * wYarn) / wEnds) * 36 / (wTape || 1)) * 102 / 100 : 0;
  const wGram = wMtrs ? (wYarn / wMtrs) * 1000 : 0;
  const wRate = wMtrs ? ((wKgRate + wCoolie) * wYarn) / wMtrs : 0;

  const fMtrBag = fPick && fWidth ? (84000 * fCount) / fPick / (fWidth + fWidth / 16) : 0;
  const fGram = fMtrBag ? 50000 / fMtrBag : 0;
  const fRate = ((fRateIn * 50) / 50000) * fGram;
  const fCoolie = fPick * (fCooliePct / 100);

  const sizingTotal = ingredients.reduce((sum, r) => sum + (r.qty || 0) * (r.rate || 0), 0);

  const mixCost = (sizingTotal / 40) * mixRate;
  const fwCost = fwQty * fwRate * fwDays;
  const ohTotal = mixCost + fwCost + salary + warping + rent + extra;

  const finalCost = wRate + fRate + fCoolie;

  return (
    <div className="min-h-screen bg-white pb-16">
      <header className="px-5 pb-6 pt-9 text-center text-stone-900">
        <div className="mb-2 font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: "#800000" }}>
          Sizing &amp; Weaving Ledger
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Warp &amp; Weft Costing</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
          Fill in yarn, mill and rate details below — every cost updates as you type.
        </p>
      </header>

      <div className="mx-auto max-w-2xl px-3">
        <div className="rounded bg-stone-100 p-1 shadow-2xl">
          <Panel title="Warp Costing" tag="column A / B">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Count"><NumInput value={wCount} onChange={setWCount} step="0.1" /></Field>
              <Field label="Mill name"><TextInput value={wMill} onChange={setWMill} /></Field>
              <Field label="Ends"><NumInput value={wEnds} onChange={setWEnds} /></Field>
              <Field label="Tape length"><NumInput value={wTape} onChange={setWTape} step="0.1" /></Field>
              <Field label="Consumed yarn" unit="(kg)"><NumInput value={wYarn} onChange={setWYarn} /></Field>
              <Field label="Kg rate" unit="(₹/kg)"><NumInput value={wKgRate} onChange={setWKgRate} /></Field>
              <Field label="Siz coolie"><NumInput value={wCoolie} onChange={setWCoolie} /></Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-dashed border-stone-300 pt-3 sm:grid-cols-2">
              <Out label="Mtrs produced" value={fmt(wMtrs, 1)} />
              <Out label="Gram / mtr" value={fmt(wGram) + " g"} />
              <Out label="Warp rate / mtr" value={"₹ " + fmt(wRate)} hero />
            </div>
          </Panel>

          <Panel title="Weft Costing" tag="column D / E">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Count"><NumInput value={fCount} onChange={setFCount} step="0.1" /></Field>
              <Field label="Mill name"><TextInput value={fMill} onChange={setFMill} /></Field>
              <Field label="Width"><NumInput value={fWidth} onChange={setFWidth} /></Field>
              <Field label="Pick"><NumInput value={fPick} onChange={setFPick} /></Field>
              <Field label="Rate" unit="(₹/kg)"><NumInput value={fRateIn} onChange={setFRateIn} /></Field>
              <Field label="Coolie %"><NumInput value={fCooliePct} onChange={setFCooliePct} step="0.5" /></Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-dashed border-stone-300 pt-3 sm:grid-cols-2">
              <Out label="Mtr bag" value={fmt(fMtrBag, 1)} />
              <Out label="Gram" value={fmt(fGram) + " g"} />
              <Out label="Coolie" value={"₹ " + fmt(fCoolie)} />
              <Out label="Weft rate / mtr" value={"₹ " + fmt(fRate)} hero />
            </div>
          </Panel>

          <Panel title="Sizing Chemicals" tag="column K–O">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-300 text-left text-[10px] uppercase tracking-wide text-stone-400">
                  <th className="w-[38%] pb-2 font-semibold">Ingredient</th>
                  <th className="w-[20%] pb-2 font-semibold">Qty</th>
                  <th className="w-[20%] pb-2 font-semibold">Rate</th>
                  <th className="w-[16%] pb-2 font-semibold">Cost</th>
                  <th className="w-[6%]"></th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((r) => (
                  <tr key={r.id} className="border-b border-stone-200">
                    <td className="py-1.5 pr-1">
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => updateIngredient(r.id, "name", e.target.value)}
                        className="w-full border-b border-transparent bg-transparent px-1 py-1 text-sm text-stone-800 focus:border-stone-600 focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-1">
                      <input
                        type="number"
                        value={r.qty}
                        onChange={(e) => updateIngredient(r.id, "qty", parseFloat(e.target.value) || 0)}
                        className="w-full border-b border-transparent bg-transparent px-1 py-1 font-mono text-sm text-stone-800 focus:border-stone-600 focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-1">
                      <input
                        type="number"
                        value={r.rate}
                        onChange={(e) => updateIngredient(r.id, "rate", parseFloat(e.target.value) || 0)}
                        className="w-full border-b border-transparent bg-transparent px-1 py-1 font-mono text-sm text-stone-800 focus:border-stone-600 focus:outline-none"
                      />
                    </td>
                    <td className="whitespace-nowrap py-1.5 text-right font-mono text-sm text-stone-900">
                      {fmt((r.qty || 0) * (r.rate || 0))}
                    </td>
                    <td className="py-1.5 text-center text-stone-300">
                      <button
                        onClick={() => removeIngredient(r.id)}
                        className="text-lg leading-none hover:text-red-600"
                        aria-label="Remove ingredient"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addIngredient}
              className="mt-3 rounded border border-dashed border-stone-300 px-3 py-1.5 font-mono text-xs text-stone-900 hover:border-stone-600 hover:bg-stone-100"
            >
              + add ingredient
            </button>
            <div className="mt-3 flex justify-end gap-2 border-t border-stone-300 pt-2 text-sm">
              <span className="text-stone-500">Sizing total</span>
              <span className="font-mono font-bold" style={{ color: "#800000" }}>₹ {fmt(sizingTotal)}</span>
            </div>
          </Panel>

          <Panel title="Overheads" tag="mixing · fuel · labour">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mixing rate" unit="(₹, per 40)"><NumInput value={mixRate} onChange={setMixRate} /></Field>
              <Field label="Firewood" unit="(qty × rate × days)">
                <div className="flex gap-1.5">
                  <NumInput value={fwQty} onChange={setFwQty} />
                  <NumInput value={fwRate} onChange={setFwRate} step="0.1" />
                  <NumInput value={fwDays} onChange={setFwDays} />
                </div>
              </Field>
              <Field label="Sizing salary"><NumInput value={salary} onChange={setSalary} /></Field>
              <Field label="Warping"><NumInput value={warping} onChange={setWarping} /></Field>
              <Field label="Rent"><NumInput value={rent} onChange={setRent} /></Field>
              <Field label="Extra"><NumInput value={extra} onChange={setExtra} /></Field>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-dashed border-stone-300 pt-3 sm:grid-cols-2">
              <Out label="Mixing cost" value={"₹ " + fmt(mixCost)} />
              <Out label="Firewood cost" value={"₹ " + fmt(fwCost)} />
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t border-stone-300 pt-2 text-sm">
              <span className="text-stone-500">Overheads total</span>
              <span className="font-mono font-bold" style={{ color: "#800000" }}>₹ {fmt(ohTotal)}</span>
            </div>
          </Panel>

          <div
            className="mx-2 mb-2 mt-4 rounded border-2 bg-white px-5 py-7 text-center text-stone-900 shadow-lg"
            style={{ borderColor: "#800000" }}
          >
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "#800000" }}>
              Total fabric cost / metre
            </div>
            <div className="font-serif text-4xl font-bold sm:text-5xl">
              <sup className="mr-0.5 text-lg font-normal opacity-70">₹</sup>
              {fmt(finalCost)}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-5 font-mono text-xs text-stone-500">
              <span>
                Warp <b className="text-stone-900">₹{fmt(wRate)}</b>
              </span>
              <span>
                Weft <b className="text-stone-900">₹{fmt(fRate)}</b>
              </span>
              <span>
                Coolie <b className="text-stone-900">₹{fmt(fCoolie)}</b>
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center font-mono text-[11px] text-stone-400">
          recalculates live · figures in ₹ unless noted
        </p>
      </div>
    </div>
  );
}