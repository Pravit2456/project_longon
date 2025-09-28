// src/pages/ServerSetup.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FiUpload, FiLock, FiTrash2, FiPlus, FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/* ================= Types ================= */
type ProfessionType =
  | "spray_drone"        // พ่นโดรน
  | "fertilizer_spread"  // ใส่ปุ๋ย (คน/โดรน/รถ)
  | "pruning"            // ตัดแต่งกิ่ง
  | "harvest"            // เก็บเกี่ยว
  | "irrigation"         // รดน้ำ
  | "grass_cutting";     // ตัดหญ้า

type FieldType = "text" | "number" | "select" | "yesno";

type FieldSpec = {
  key: string;
  label: string;
  type: FieldType;
  unit?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

type ProfessionSpec = {
  label: string;
  fields: FieldSpec[];
  related?: FieldSpec[];
};

type ProfessionEntry = {
  id: string;
  type: ProfessionType;
  data: Record<string, any>;
};

type DraftPayload = {
  personal?: {};
  professions: ProfessionEntry[];
  documents?: {
    photo1?: string;
  };
};

/* ================= Catalog ================= */
const CATALOG: Record<ProfessionType, ProfessionSpec> = {
  spray_drone: {
    label: "พ่นโดรน",
    fields: [
      { key: "droneModel", label: "รุ่นโดรน", type: "select", options: ["DJI Agras T30", "DJI Agras T40", "อื่น ๆ"], required: true },
      { key: "tankL", label: "ความจุถัง", type: "number", unit: "ลิตร", placeholder: "เช่น 40", required: true },
      { key: "flowLpm", label: "อัตราการไหล", type: "number", unit: "ลิตร/นาที", placeholder: "เช่น 4.5", required: true },
      { key: "speedRaiMin", label: "ความเร็วทำงาน", type: "number", unit: "ไร่/นาที", placeholder: "เช่น 0.4", required: true },
    ],
  },
  fertilizer_spread: {
    label: "ใส่ปุ๋ย",
    fields: [
      { key: "method", label: "วิธีการ", type: "select", options: ["ใช้แรงงานคน", "โดรน", "รถ/เครื่อง"], required: true },
      { key: "rateKgRai", label: "อัตราใส่", type: "number", unit: "กก./ไร่", required: true },
      { key: "capacityKg", label: "ความจุ/รอบ", type: "number", unit: "กก.", required: true },
    ],
    related: [
      { key: "npk", label: "สูตรปุ๋ย (N-P-K)", type: "text", placeholder: "เช่น 15-15-15" },
      { key: "includeFertilizer", label: "รวมค่าวัสดุปุ๋ย", type: "yesno" },
    ],
  },
  pruning: {
    label: "ตัดแต่งกิ่ง",
    fields: [
      { key: "teamSize", label: "จำนวนคนในทีม", type: "number", unit: "คน", required: true },
      { key: "maxHeight", label: "ความสูงสูงสุด", type: "number", unit: "เมตร" },
    ],
  },
  harvest: {
    label: "เก็บเกี่ยว",
    fields: [
      { key: "teamSize", label: "จำนวนคนในทีม", type: "number", unit: "คน", required: true },
      { key: "capacityKgDay", label: "อัตราทำงาน", type: "number", unit: "กก./วัน", required: true },
    ],
    related: [
      { key: "providePackaging", label: "มีบรรจุภัณฑ์ให้", type: "yesno" },
      { key: "truck", label: "มีรถขนส่ง", type: "yesno" },
    ],
  },
  irrigation: {
    label: "รดน้ำ",
    fields: [
      { key: "method", label: "รูปแบบการรดน้ำ", type: "select",
        options: ["สายยาง/รถเข็นถัง", "สปริงเกอร์เคลื่อนที่", "รถบรรทุกน้ำ", "โดรนพ่นน้ำ"], required: true },
      { key: "waterRateLpm", label: "อัตราการให้น้ำ", type: "number", unit: "ลิตร/นาที", placeholder: "เช่น 60", required: true },
      { key: "coverageRaiHour", label: "พื้นที่ที่รดได้", type: "number", unit: "ไร่/ชั่วโมง", placeholder: "เช่น 1.2" },
      { key: "volumePerPlotL", label: "ปริมาณน้ำต่อแปลง", type: "number", unit: "ลิตร/แปลง", placeholder: "เช่น 500" },
      { key: "durationPerPlotMin", label: "เวลาที่ใช้ต่อแปลง", type: "number", unit: "นาที/แปลง", placeholder: "เช่น 20" },
      { key: "teamSize", label: "จำนวนคนในทีม", type: "number", unit: "คน", required: true },
    ],
    related: [
      { key: "waterSource", label: "แหล่งน้ำ", type: "select", options: ["บ่อ/สระ", "คลอง/ลำธาร", "ประปา", "น้ำบาดาล"] },
      { key: "includeWaterCost", label: "รวมค่าน้ำในราคา", type: "yesno" },
      { key: "nightWork", label: "รับงานกลางคืน", type: "yesno" },
    ],
  },
  grass_cutting: {
    label: "ตัดหญ้า",
    fields: [
      { key: "method", label: "ประเภทงาน", type: "select", options: ["เครื่องสะพายบ่า", "รถตัดหญ้า"], required: true },
      { key: "teamSize", label: "จำนวนคนในทีม", type: "number", unit: "คน", required: true },
      { key: "productivity", label: "อัตราทำงาน", type: "number", unit: "ไร่/วัน", placeholder: "เช่น 5" },
    ],
  },
};

/* ============== util ============== */
const STORAGE_KEY = "providerDraft_v1";
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function loadDraft(): DraftPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DraftPayload) : { professions: [] };
  } catch {
    return { professions: [] };
  }
}
function saveDraft(d: DraftPayload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

/* ============== Page ============== */
export default function ServerSetup() {
  const navigate = useNavigate();

  const [draft, setDraft] = useState<DraftPayload>(() => loadDraft());
  const [currentType, setCurrentType] = useState<ProfessionType | "">("");
  const spec = useMemo(() => (currentType ? CATALOG[currentType] : null), [currentType]);

  const [form, setForm] = useState<Record<string, any>>({});
  const [photo1, setPhoto1] = useState<File | null>(null);

  // เมื่อเปลี่ยนบริการ → เซ็ตฟอร์มตามสเปก
  useEffect(() => {
    if (!spec) return;
    const next: Record<string, any> = {};
    [...spec.fields, ...(spec.related ?? [])].forEach((f) => {
      next[f.key] = f.type === "yesno" ? "no" : "";
    });
    setForm(next);
  }, [spec]);

  const onChangeField = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const resetSelection = () => {
    setCurrentType("");
    setForm({});
  };

  const pushProfession = () => {
    if (!currentType || !spec) return;

    // validate required
    const missing: string[] = [];
    spec.fields.forEach((f) => {
      if (f.required && (form[f.key] === "" || form[f.key] === undefined || form[f.key] === null)) {
        missing.push(f.label);
      }
    });
    if (missing.length > 0) {
      alert("กรอกไม่ครบ: " + missing.join(", "));
      return;
    }

    const entry: ProfessionEntry = { id: makeId(), type: currentType, data: form };
    const next = { ...draft, professions: [...(draft.professions || []), entry] };
    setDraft(next);
    saveDraft(next);
  };

  const removeProfession = (pid: string) => {
    const next = { ...draft, professions: draft.professions.filter((p) => p.id !== pid) };
    setDraft(next);
    saveDraft(next);
  };

  const handleFinish = () => {
    if (photo1) {
      const reader = new FileReader();
      reader.onload = () => {
        const next = { ...draft, documents: { ...(draft.documents || {}), photo1: reader.result as string } };
        setDraft(next);
        saveDraft(next);
        navigate("/serverpage");
      };
      reader.readAsDataURL(photo1);
    } else {
      saveDraft(draft);
      navigate("/serverpage");
    }
  };

  return (
    <div className="min-h-screen bg-[#eef5ec] font-sans font-semibold">
      <div className="h-14 bg-white/70 border-b border-[#d9eadf]" />
      <main className="max-w-5xl mx-auto px-6 py-6">
        <header className="mb-5">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm border border-[#d9eadf]">
            <img src="/images/logo.png" alt="Logo" className="h-15 w-15 object-contain" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#2f6b4f]">
              ลงทะเบียนผู้ให้บริการ <span className="ml-1">🧑‍🌾</span>
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            เลือกบริการ → กรอกช่องเฉพาะทาง → บันทึก แล้วเพิ่มบริการถัดไปได้
          </p>
        </header>

        {/* ====== เลือกบริการ & ฟอร์มเฉพาะ ====== */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#dbeee2] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              เลือกบริการ
              {/* ปุ่ม + ข้างหลังคำว่า เลือกบริการ */}
              <button
                type="button"
                onClick={resetSelection}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                title="เพิ่มบริการที่ต้องการเลือกอีก"
              >
                <FiPlus />
              </button>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">บริการ</label>
              <div className="relative">
                <select
                  value={currentType}
                  onChange={(e) => setCurrentType(e.target.value as ProfessionType)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">— เลือกบริการ —</option>
                  {Object.entries(CATALOG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
              </div>
            </div>
          </div>

          {spec && (
            <>
              <div className="my-4 h-px bg-slate-200" />
              <h3 className="font-semibold text-slate-800 mb-2">ข้อมูลที่ต้องกรอก</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spec.fields.map((f) => (
                  <Field key={f.key} spec={f} value={form[f.key]} onChange={(v) => onChangeField(f.key, v)} />
                ))}
              </div>

              {(spec.related?.length ?? 0) > 0 && (
                <>
                  <div className="my-4 h-px bg-slate-200" />
                  <h3 className="font-semibold text-slate-800 mb-2">ข้อมูลที่เกี่ยวข้อง</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {spec.related!.map((f) => (
                      <Field key={f.key} spec={f} value={form[f.key]} onChange={(v) => onChangeField(f.key, v)} />
                    ))}
                  </div>
                </>
              )}

              {/* ปุ่มเฉพาะ: ยกเลิก / บันทึก */}
              <div className="flex flex-col sm:flex-row gap-2 mt-5">
                <button
                  onClick={resetSelection}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300"
                  title="ยกเลิกและกลับไปเลือกบริการใหม่"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    pushProfession();
                    resetSelection();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                  title="บันทึกบริการนี้"
                >
                  บันทึก
                </button>
              </div>
            </>
          )}
        </section>

        {/* ====== บริการที่บันทึกแล้ว ====== */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#dbeee2] p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">บริการที่เพิ่มแล้ว</h2>
            <button
              onClick={resetSelection}
              className="text-sm text-emerald-700 hover:underline"
            >
            </button>
          </div>

          {draft.professions.length === 0 ? (
            <p className="text-sm text-slate-500">ยังไม่ได้เพิ่มบริการ</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {draft.professions.map((p) => (
                <li key={p.id} className="rounded-xl border bg-[#f7fbf8] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-emerald-800">{CATALOG[p.type].label}</div>
                    <div className="flex items-center gap-2">
                      <button disabled className="text-slate-400 cursor-not-allowed" title="แก้ไข (จะเปิดใช้ภายหลัง)">
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => removeProfession(p.id)}
                        className="text-red-600 hover:text-red-700"
                        title="ลบบริการนี้"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    {Object.entries(p.data).map(([k, v]) => {
                      if (v === "" || v === undefined) return null;
                      const fs = [...(CATALOG[p.type].fields || []), ...(CATALOG[p.type].related || [])].find(
                        (x) => x.key === k
                      );
                      if (!fs) return null;
                      const renderYesNo = fs.type === "yesno" ? (v === "yes" ? "ใช่" : "ไม่") : v;
                      return (
                        <div key={k} className="flex justify-between gap-2 py-0.5">
                          <span className="text-slate-500">{fs.label}</span>
                          <span className="font-semibold text-slate-800">
                            {renderYesNo} {fs.unit || ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ====== เอกสารยืนยันตัวตน ====== */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#dbeee2] p-5 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">เอกสารยืนยันตัวตน</h2>
          <Dropzone label="อัปโหลดรูปถ่าย 1 นิ้ว" onFileSelect={setPhoto1} />
          {photo1 && (
            <div className="mt-3">
              <p className="text-sm text-slate-600">📷 ตัวอย่างรูป:</p>
              <img src={URL.createObjectURL(photo1)} className="mt-2 h-32 rounded-lg border object-cover" />
            </div>
          )}
        </section>

        {/* ====== ปุ่มสรุป ====== */}
        <div className="pb-10 flex flex-wrap gap-2 justify-center">
          <button
            onClick={handleFinish}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#009966] px-8 py-3 text-white font-semibold shadow-sm hover:bg-[#008255]"
          >
            <FiLock className="text-lg" />
            บันทึกข้อมูลทั้งหมด
          </button>
          <button
            onClick={() => {
              saveDraft(draft);
              alert("บันทึกร่างไว้ในเครื่องแล้ว (สามารถกลับมาแก้ต่อได้)");
            }}
            className="rounded-lg border px-6 py-3 text-slate-700 bg-white hover:bg-slate-50"
          >
            บันทึกร่างไว้ก่อน
          </button>
        </div>
      </main>
    </div>
  );
}

/* ====== Field component (dynamic) ====== */
function Field({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">
        {spec.label} {spec.required && <span className="text-red-500">*</span>}
      </label>

      {spec.type === "select" && (
        <div className="relative">
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">— เลือก —</option>
            {spec.options?.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
        </div>
      )}

      {spec.type === "yesno" && (
        <div className="relative">
          <select
            value={value ?? "no"}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="yes">ใช่</option>
            <option value="no">ไม่</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
        </div>
      )}

      {(spec.type === "text" || spec.type === "number") && (
        <div className="flex">
          <input
            type={spec.type === "number" ? "number" : "text"}
            value={value ?? ""}
            onChange={(e) =>
              onChange(spec.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)
            }
            placeholder={spec.placeholder}
            className="w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          {spec.unit && (
            <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 px-3 text-sm text-slate-500">
              {spec.unit}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ====== Dropzone ====== */
interface DropzoneProps {
  label: string;
  onFileSelect: (file: File) => void;
}
function Dropzone({ label, onFileSelect }: DropzoneProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) onFileSelect(e.target.files[0]);
  };
  return (
    <label className="block cursor-pointer">
      <input type="file" className="hidden" onChange={handleChange} />
      <div className="grid place-items-center h-40 rounded-xl border-2 border-dashed border-slate-300 bg-[#f7fbf8] hover:border-emerald-400 transition">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <div className="h-10 w-10 rounded-full grid place-items-center bg-emerald-100 text-emerald-700">
            <FiUpload />
          </div>
          <p className="text-sm">{label}</p>
        </div>
      </div>
    </label>
  );
}
