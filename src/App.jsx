import { useState, useEffect, useRef } from "react";

// ── Constants ──────────────────────────────────────────────
const CATEGORIES = {
  expense: [
    { id: "food", label: "Makan & Minum", emoji: "🍜" },
    { id: "transport", label: "Transportasi", emoji: "🚗" },
    { id: "utilities", label: "Rumah & Utilitas", emoji: "🏠" },
    { id: "shopping", label: "Belanja & Kebutuhan", emoji: "🛒" },
    { id: "entertainment", label: "Hiburan & Lifestyle", emoji: "🎮" },
    { id: "health", label: "Kesehatan", emoji: "💊" },
    { id: "fashion", label: "Fashion", emoji: "👗" },
    { id: "education", label: "Pendidikan", emoji: "📚" },
    { id: "selfcare", label: "Perawatan Diri", emoji: "💆" },
    { id: "gifts", label: "Hadiah & Donasi", emoji: "🎁" },
    { id: "cicilan", label: "Cicilan", emoji: "💳" },
    { id: "other_expense", label: "Lain-lain", emoji: "🔧" },
  ],
  income: [
    { id: "salary", label: "Gaji", emoji: "💼" },
    { id: "freelance", label: "Freelance / Side Income", emoji: "💻" },
    { id: "investment_return", label: "Hasil Investasi", emoji: "📈" },
    { id: "bonus", label: "Bonus / THR", emoji: "🎉" },
    { id: "transfer_in", label: "Transfer Masuk", emoji: "🔄" },
    { id: "other_income", label: "Lain-lain", emoji: "🌟" },
  ],
  saving: [
    { id: "emergency", label: "Tabungan Darurat", emoji: "🛡️" },
    { id: "goal", label: "Tabungan Tujuan", emoji: "🎯" },
    { id: "investment", label: "Investasi Rutin", emoji: "💹" },
  ],
};

const ALL_CATS = [...CATEGORIES.expense, ...CATEGORIES.income, ...CATEGORIES.saving];
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

const formatRp = (n) => "Rp " + Math.abs(n || 0).toLocaleString("id-ID");
const formatShort = (n) => {
  const a = Math.abs(n || 0);
  if (a >= 1000000) return "Rp " + (a / 1000000).toFixed(1) + "jt";
  if (a >= 1000) return "Rp " + (a / 1000).toFixed(0) + "rb";
  return "Rp " + a;
};
const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const getCat = (id) => ALL_CATS.find(c => c.id === id) || { emoji: "💸", label: "Lainnya" };

const Wordmark = ({ size = 24, gradientId = "dompetWordmarkGrad" }) => (
  <svg
    width={Math.round(size * 3.2)}
    height={size}
    viewBox="0 0 320 100"
    role="img"
    aria-label="dompet."
    style={{ display: "block" }}
  >
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6366f1" />
        <stop offset="0.55" stopColor="#a78bfa" />
        <stop offset="1" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
    <text
      x="0"
      y="76"
      fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Arial"
      fontWeight="800"
      fontSize="78"
      fill={`url(#${gradientId})`}
      letterSpacing="-2"
    >
      dompet.
    </text>
  </svg>
);

const AccordionSection = ({ title, subtitle, open, onToggle, right, children }) => (
  <div style={{background:"#111118",border:"1px solid #1c1c2e",borderRadius:16,marginBottom:10,overflow:"hidden"}}>
    <button
      onClick={onToggle}
      style={{
        width:"100%",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        gap:10,
        padding:"12px 14px",
        background:"transparent",
      }}
    >
      <div style={{textAlign:"left"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#e8e8f0"}}>{title}</div>
        {subtitle && <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{subtitle}</div>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {right}
        <div style={{fontSize:14,color:"#9ca3af",transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>⌄</div>
      </div>
    </button>
    {open && <div style={{padding:"0 14px 14px"}}>{children}</div>}
  </div>
);

const useRecharts = (enabled) => {
  const [mod, setMod] = useState(null);

  useEffect(() => {
    if (!enabled || mod) return;

    let cancelled = false;
    import("recharts")
      .then((m) => {
        if (!cancelled) setMod(m);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [enabled, mod]);

  return mod;
};

// ── Local parser fallback ──────────────────────────────────
const localParse = (text) => {
  const t = text.toLowerCase();
  const jt = t.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
  const rb = t.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k)\b/);
  const pl = t.match(/\b(\d{4,})\b/);
  const amount = jt ? Math.round(parseFloat(jt[1].replace(",",".")) * 1000000)
    : rb ? Math.round(parseFloat(rb[1].replace(",",".")) * 1000)
    : pl ? parseInt(pl[1]) : null;

  const rules = [
    { keys:["gaji","gajian","salary","upah","honor"], cat:"salary", type:"income" },
    { keys:["freelance","side job","sidejob","side hustle","project","klien","client","fee","foto","fotografi","photography","videografi","video","desain","design","nulis","artikel","konten","content","ngoding","coding","ngajar","les privat","ojol","jualan","endorse","commission","komisi","bayaran"], cat:"freelance", type:"income" },
    { keys:["bonus","thr","insentif","reward","cashback","menang","lomba","hadiah","prize","juara","kompetisi","contest"], cat:"bonus", type:"income" },
    { keys:["transfer masuk","terima transfer","dikirim","kiriman","dapet duit"], cat:"transfer_in", type:"income" },
    { keys:["dividen","return","hasil investasi","kupon"], cat:"investment_return", type:"income" },
    { keys:["tabungan darurat","dana darurat","emergency fund"], cat:"emergency", type:"saving" },
    { keys:["nabung","tabungan","saving","menabung","celengan"], cat:"goal", type:"saving" },
    { keys:["investasi","reksadana","saham","reksa","crypto","emas","logam mulia"], cat:"investment", type:"saving" },
    { keys:["cicilan","kredit","angsuran","nyicil","kpr","dp","pinjaman"], cat:"cicilan", type:"expense" },
    { keys:["makan","minum","kopi","coffee","lunch","sarapan","dinner","brunch","resto","warung","cafe","bakso","nasi","ayam","pizza","burger","soto","bebek","seafood","sushi","boba","milk tea","jus","mie","indomie","warteg","kantin"], cat:"food", type:"expense" },
    { keys:["grab","gojek","ojek","bensin","bbm","parkir","pakir","tol","bus","krl","mrt","lrt","taxi","uber","transjakarta","kereta","pesawat","tiket"], cat:"transport", type:"expense" },
    { keys:["listrik","pln","air","pdam","wifi","internet","indihome","gas","ipl","kontrakan","kos","sewa","token"], cat:"utilities", type:"expense" },
    { keys:["belanja","indomaret","alfamart","shopee","tokopedia","supermarket","groceries","sayur","buah"], cat:"shopping", type:"expense" },
    { keys:["netflix","spotify","games","game","bioskop","cinema","nonton","hiburan","youtube","disney","prime","hbo","karaoke"], cat:"entertainment", type:"expense" },
    { keys:["dokter","obat","apotek","rumah sakit","klinik","bpjs","vitamin","suplemen"], cat:"health", type:"expense" },
    { keys:["baju","sepatu","fashion","celana","tas","tshirt","kemeja","dress","jaket"], cat:"fashion", type:"expense" },
    { keys:["kursus","buku","sekolah","kuliah","pendidikan","udemy","les","workshop"], cat:"education", type:"expense" },
    { keys:["salon","spa","perawatan","skincare","barbershop","potong rambut","gym","fitness","pilates","yoga"], cat:"selfcare", type:"expense" },
    { keys:["hadiah","kado","donasi","sedekah","zakat","infaq","sumbangan"], cat:"gifts", type:"expense" },
  ];

  for (const r of rules) {
    if (r.keys.some(k => t.includes(k))) return { categoryId: r.cat, type: r.type, amount };
  }
  return { categoryId: "other_expense", type: "expense", amount };
};

// ── Main App ───────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [geminiKey, setGeminiKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [healthTarget, setHealthTarget] = useState(20);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [cBudget, setCBudget] = useState(0);
  const [cBudgetInput, setCBudgetInput] = useState("");
  const [dashOpen, setDashOpen] = useState("allocation");
  const [chatMsgs, setChatMsgs] = useState([{ role:"assistant", text:"Hei! Catat transaksi lo dengan natural.\n\nContoh:\n• \"makan siang 45rb\"\n• \"gajian 8jt\"\n• \"side job foto 1.8jt\"\n• \"cicilan HP 1.2jt\" 💸" }]);
  const [chatInput, setChatInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [form, setForm] = useState({ type:"expense", categoryId:"food", amount:"", note:"", date:todayStr() });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const chatEnd = useRef(null);

  useEffect(() => {
    const key = localStorage.getItem("dompet_gemini_key");
    const model = localStorage.getItem("dompet_gemini_model");
    const target = localStorage.getItem("dompet_health_target");
    const txs = localStorage.getItem("dompet_transactions");
    if (key) setGeminiKey(key);
    if (model) setGeminiModel(model);
    if (target) {
      const n = parseInt(target, 10);
      if (!Number.isNaN(n) && n > 0) setHealthTarget(Math.min(Math.max(n, 5), 90));
    }
    if (txs) { try { setTransactions(JSON.parse(txs)); } catch(e){} }
    setTimeout(() => setScreen(key ? "app" : "onboarding"), 1200);
  }, []);

  useEffect(() => {
    localStorage.setItem("dompet_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMsgs]);

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k) return;
    localStorage.setItem("dompet_gemini_key", k);
    setGeminiKey(k);
    setScreen("app");
  };

  const saveModel = (m) => {
    localStorage.setItem("dompet_gemini_model", m);
    setGeminiModel(m);
  };

  const saveHealthTarget = (n) => {
    const v = Math.min(Math.max(parseInt(n, 10) || 0, 5), 90);
    localStorage.setItem("dompet_health_target", String(v));
    setHealthTarget(v);
  };

  const budgetKey = (year, monthIndex) => `dompet_budget_c_${year}-${pad2(monthIndex + 1)}`;
  useEffect(() => {
    const raw = localStorage.getItem(budgetKey(selectedYear, selectedMonth));
    const n = parseInt(raw || "0", 10);
    const val = Number.isFinite(n) ? Math.max(n, 0) : 0;
    setCBudget(val);
    setCBudgetInput(val ? String(val) : "");
  }, [selectedYear, selectedMonth]);

  const saveCBudget = () => {
    const n = parseInt((cBudgetInput || "").trim(), 10);
    const val = Number.isFinite(n) ? Math.max(n, 0) : 0;
    localStorage.setItem(budgetKey(selectedYear, selectedMonth), String(val));
    setCBudget(val);
    if (!val) setCBudgetInput("");
  };
  const clearCBudget = () => {
    localStorage.removeItem(budgetKey(selectedYear, selectedMonth));
    setCBudget(0);
    setCBudgetInput("");
  };

  // Stats
  const yr = selectedYear;
  const monthTxs = transactions.filter(t => { const d = new Date(t.date); return d.getMonth()===selectedMonth && d.getFullYear()===yr; });
  const totalY = monthTxs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const totalC = monthTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const totalS = monthTxs.filter(t=>t.type==="saving"&&t.categoryId!=="investment").reduce((s,t)=>s+t.amount,0);
  const totalI = monthTxs.filter(t=>t.categoryId==="investment").reduce((s,t)=>s+t.amount,0);
  const balance = totalY - totalC - totalS - totalI;
  const healthScore = totalY > 0 ? Math.round(((totalS+totalI)/totalY)*100) : 0;
  const midTarget = Math.max(10, Math.round(healthTarget * 0.5));
  const cBudgetPct = cBudget > 0 ? Math.min((totalC / cBudget) * 100, 100) : 0;
  const cBudgetLeft = cBudget > 0 ? Math.max(cBudget - totalC, 0) : 0;
  const cBudgetOver = cBudget > 0 ? Math.max(totalC - cBudget, 0) : 0;

  const monthScore = (year, monthIndex) => {
    const txs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth()===monthIndex && d.getFullYear()===year;
    });
    const y = txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
    if (!y) return 0;
    const c = txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
    const s = txs.filter(t=>t.type==="saving"&&t.categoryId!=="investment").reduce((sum,t)=>sum+t.amount,0);
    const i = txs.filter(t=>t.categoryId==="investment").reduce((sum,t)=>sum+t.amount,0);
    return Math.round(((s+i)/y)*100);
  };
  const last3 = [0,1,2].map((off) => {
    const d = new Date(yr, selectedMonth - off, 1);
    const sc = monthScore(d.getFullYear(), d.getMonth());
    return { y:d.getFullYear(), m:d.getMonth(), score:sc };
  });
  const consistency3 = last3.filter(x => x.score >= healthTarget).length;

  // Chat send
  const sendChat = async () => {
    if (!chatInput.trim() || parsing) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMsgs(p => [...p, { role:"user", text:msg }]);
    setParsing(true);

    let parsed = null;

    if (geminiKey) {
      try {
        const prompt = `You are a personal finance parser for Indonesian users. Parse the transaction message and return ONLY a JSON object.

Message: "${msg}"
Today: ${todayStr()}

Categories:
EXPENSE: food, transport, utilities, shopping, entertainment, health, fashion, education, selfcare, gifts, cicilan, other_expense
INCOME: salary, freelance, investment_return, bonus, transfer_in, other_income
SAVING: emergency, goal, investment

Use common sense to categorize. Examples:
- "makan", "kopi", "lunch", "bakso" → food (expense)
- "gaji", "gajian", "salary" → salary (income)
- "grab", "gojek", "bensin", "tol", "parkir" → transport (expense)
- "foto", "desain", "freelance", "project", "side job" → freelance (income)
- "menang lomba", "prize", "juara", "hadiah uang" → bonus (income)
- "nabung", "tabungan" → goal (saving)
- "investasi", "reksadana", "saham", "emas" → investment (saving)
- "cicilan", "kredit", "angsuran" → cicilan (expense)
- "netflix", "spotify", "game", "nonton" → entertainment (expense)
- "listrik", "wifi", "kos", "kontrakan" → utilities (expense)
Amount: 45rb=45000, 1.5jt=1500000, 25jt=25000000, 500k=500000, 25 juta=25000000

Return ONLY this JSON (no markdown, no explanation):
{"type":"income|expense|saving","categoryId":"<id>","amount":<number>,"note":"<short description>","date":"${todayStr()}"}`;

        console.log("🔵 Gemini: sending request...");
        const model = geminiModel || "gemini-2.5-flash";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const res = await fetch(endpoint, {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
        });
        console.log("🔵 Gemini: status", res.status);
        const data = await res.json().catch(() => null);
        console.log("🔵 Gemini: response", JSON.stringify(data).slice(0, 300));
        if (!res.ok) {
          const msg = data?.error?.message || `HTTP ${res.status}`;
          throw new Error(msg);
        }
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log("🔵 Gemini: raw text", raw);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in: " + raw);
        parsed = JSON.parse(jsonMatch[0]);
        console.log("✅ Gemini: parsed", parsed);
      } catch(e) { 
        const em = String(e?.message || "Unknown error");
        console.error("❌ Gemini failed:", em);
        const hint =
          em.toLowerCase().includes("api key not valid") ? "API key invalid. Pastikan key dari Google AI Studio, nggak ada typo/spasi, dan masih aktif."
          : em.toLowerCase().includes("permission") || em.toLowerCase().includes("denied") || em.includes("403") ? "403/Permission denied: biasanya key dibatasi (HTTP referrer restrictions) atau ada issue project/quota."
          : em.toLowerCase().includes("quota") || em.toLowerCase().includes("rate") ? "Kena limit/quota. Coba tunggu atau cek quota di Google AI Studio."
          : em.toLowerCase().includes("not found") || em.includes("404") ? `Model "${geminiModel}" nggak tersedia. Coba ganti model di Settings.`
          : "Cek koneksi internet + pastikan key benar. Kalau tetap gagal, parsing lokal tetap jalan.";

        setChatMsgs(p => [...p, { role:"assistant", text:`⚠️ Gemini error: ${em}\n${hint}\nFallback ke local parser...`, isDebug:true }]);
        parsed = null; 
      }
    } else {
      console.log("⚠️ No Gemini key, using local parser");
    }

    if (!parsed || !parsed.amount) {
      const local = localParse(msg);
      if (!local.amount) {
        setChatMsgs(p => [...p, { role:"assistant", text:"Nominal-nya ga ketangkep 🤔\nCoba: \"makan 45rb\" atau \"gaji 8jt\"" }]);
        setParsing(false);
        return;
      }
      parsed = { type:local.type, categoryId:local.categoryId, amount:local.amount, note:msg, date:todayStr() };
    }

    const cat = getCat(parsed.categoryId);
    setChatMsgs(p => [...p, {
      role:"assistant",
      text:`Ini yang gue tangkap:\n\n${cat.emoji} **${cat.label}**\n💰 ${formatRp(parsed.amount)}\n📅 ${parsed.date}\n📝 ${parsed.note||msg}\n\nBener ga?`,
      isPending:true,
      pendingData:{ ...parsed, note: parsed.note||msg }
    }]);
    setParsing(false);
  };

  const confirmTx = (yes, pendingData) => {
    setChatMsgs(p => p.map(m => ({...m, isPending:false})));
    if (yes && pendingData) {
      setTransactions(p => [{ ...pendingData, id:Date.now() }, ...p]);
      setTimeout(() => setChatMsgs(p => [...p, { role:"assistant", text:"✅ Tersimpan! Mau catat yang lain?" }]), 100);
    } else {
      setTimeout(() => setChatMsgs(p => [...p, { role:"assistant", text:"Oke dibatalin. Coba ketik ulang!" }]), 100);
    }
  };

  // Form
  const saveForm = () => {
    if (!form.amount || !form.date) return;
    const tx = { ...form, amount:parseInt(form.amount) };
    if (editId) {
      setTransactions(p => p.map(t => t.id===editId ? {...tx,id:editId} : t));
      setEditId(null);
    } else {
      setTransactions(p => [{ ...tx, id:Date.now() }, ...p]);
    }
    setForm({ type:"expense", categoryId:"food", amount:"", note:"", date:todayStr() });
  };

  const startEdit = (tx) => {
    setForm({ type:tx.type, categoryId:tx.categoryId, amount:String(tx.amount), note:tx.note||"", date:tx.date });
    setEditId(tx.id);
    setActiveTab("form");
  };

  // Export
  const pad2 = (n) => String(n).padStart(2, "0");
  const csvCell = (value) => {
    const s = String(value ?? "");
    const escaped = s.replace(/"/g, '""');
    return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
  };
  const downloadText = (filename, text, mime = "text/plain") => {
    const blob = new Blob([text], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const exportCSV = (txs, filename) => {
    const header = ["Tanggal","Tipe","CategoryId","Kategori","Nominal","Catatan"];
    const rows = txs.map(t => ([
      t.date,
      t.type,
      t.categoryId,
      getCat(t.categoryId).label,
      t.amount,
      t.note || "",
    ].map(csvCell).join(",")));
    const bom = "\uFEFF"; // helps Excel read UTF-8 (emoji/ID text)
    downloadText(filename, bom + header.join(",") + "\n" + rows.join("\n"), "text/csv;charset=utf-8");
  };
  const exportCSVAll = () => {
    exportCSV(transactions, "dompet-all.csv");
  };
  const exportCSVMonth = () => {
    exportCSV(monthTxs, `dompet-${yr}-${pad2(selectedMonth + 1)}.csv`);
  };

  const backupFilename = () => {
    const d = new Date();
    const stamp = `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}`;
    return `dompet-backup-${stamp}.json`;
  };

  const buildBackup = () => ({
    version: 1,
    exportedAt: new Date().toISOString(),
    app: "dompet",
    data: {
      transactions,
      geminiModel,
      healthTarget,
    },
  });

  const backupJSON = async () => {
    const json = JSON.stringify(buildBackup(), null, 2);
    const filename = backupFilename();
    const file = new File([json], filename, { type: "application/json" });

    // Web Share API: lets user send file to Google Drive (or any target) on mobile
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share({
          title: "dompet. backup",
          text: "Backup data dompet (JSON). Simpan ke Google Drive biar aman.",
          files: [file],
        });
        return;
      }
    } catch (e) {
      // fall back to download
    }

    downloadText(filename, json, "application/json;charset=utf-8");
  };

  const restoreFromBackupObject = (obj) => {
    const txs = obj?.data?.transactions;
    if (!Array.isArray(txs)) throw new Error("Format backup tidak valid (transactions tidak ditemukan).");

    const cleaned = txs
      .filter((t) => t && typeof t === "object")
      .map((t) => ({
        id: typeof t.id === "number" ? t.id : Date.now(),
        date: typeof t.date === "string" ? t.date : todayStr(),
        type: t.type === "income" || t.type === "expense" || t.type === "saving" ? t.type : "expense",
        categoryId: typeof t.categoryId === "string" ? t.categoryId : "other_expense",
        amount: typeof t.amount === "number" ? t.amount : parseInt(t.amount, 10) || 0,
        note: typeof t.note === "string" ? t.note : "",
      }))
      .filter((t) => t.amount);

    setTransactions(cleaned);

    const model = obj?.data?.geminiModel;
    if (typeof model === "string" && model) saveModel(model);

    const target = obj?.data?.healthTarget;
    if (target !== undefined) saveHealthTarget(target);
  };

  const importBackup = async (file) => {
    if (!file) return;
    const text = await file.text();
    const obj = JSON.parse(text);
    if (!window.confirm("Restore backup akan menimpa data transaksi yang ada. Lanjut?")) return;
    restoreFromBackupObject(obj);
  };

  const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
  const printMonthlyReport = () => {
    const monthLabel = `${MONTHS[selectedMonth]} ${yr}`;
    const txs = monthTxs.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const incomeTotal = totalY;
    const expenseTotal = totalC;
    const savingTotal = totalS;
    const investTotal = totalI;
    const netBalance = balance;
    const score = healthScore;

    const topExpense = catBreakdown.slice(0, 10);

    const html = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>dompet. laporan ${escapeHtml(monthLabel)}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; color: #111; }
    h1 { margin: 0 0 4px; font-size: 22px; }
    .sub { color: #555; font-size: 12px; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 12px 0 18px; }
    .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
    .k { font-size: 11px; color: #555; }
    .v { font-size: 16px; font-weight: 700; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border-bottom: 1px solid #eee; padding: 8px 6px; text-align: left; font-size: 12px; vertical-align: top; }
    th { font-size: 11px; color: #555; }
    .muted { color: #666; }
    @media print {
      body { margin: 12mm; }
      .no-print { display: none; }
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body>
  <h1>dompet. — Laporan Bulanan</h1>
  <div class="sub">${escapeHtml(monthLabel)} · ${txs.length} transaksi</div>

  <div class="grid">
    <div class="card"><div class="k">Pemasukan (Y)</div><div class="v">Rp ${incomeTotal.toLocaleString("id-ID")}</div></div>
    <div class="card"><div class="k">Konsumsi (C)</div><div class="v">Rp ${expenseTotal.toLocaleString("id-ID")}</div></div>
    <div class="card"><div class="k">Tabungan (S)</div><div class="v">Rp ${savingTotal.toLocaleString("id-ID")}</div></div>
    <div class="card"><div class="k">Investasi (I)</div><div class="v">Rp ${investTotal.toLocaleString("id-ID")}</div></div>
    <div class="card"><div class="k">Saldo Bersih</div><div class="v">Rp ${netBalance.toLocaleString("id-ID")}</div></div>
    <div class="card"><div class="k">Health Score</div><div class="v">${score}%</div></div>
  </div>

  ${topExpense.length ? `
    <div class="card">
      <div style="font-weight:700;margin-bottom:6px;">Top Pengeluaran</div>
      <table>
        <thead><tr><th>Kategori</th><th>Total</th></tr></thead>
        <tbody>
          ${topExpense.map(c => `<tr><td>${escapeHtml(`${c.emoji} ${c.label}`)}</td><td>Rp ${Number(c.total||0).toLocaleString("id-ID")}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  ` : ""}

  <div class="card" style="margin-top:10px;">
    <div style="font-weight:700;margin-bottom:6px;">Detail Transaksi</div>
    <table>
      <thead><tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Nominal</th><th>Catatan</th></tr></thead>
      <tbody>
        ${txs.map(t => {
          const cat = getCat(t.categoryId);
          const sign = t.type === "income" ? "+" : "-";
          return `<tr>
            <td>${escapeHtml(t.date)}</td>
            <td class="muted">${escapeHtml(t.type)}</td>
            <td>${escapeHtml(`${cat.emoji} ${cat.label}`)}</td>
            <td>${escapeHtml(`${sign}Rp ${Number(t.amount||0).toLocaleString("id-ID")}`)}</td>
            <td>${escapeHtml(t.note||"")}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
    <div class="no-print" style="margin-top:10px;color:#666;font-size:12px;">Tip: di dialog print pilih “Save as PDF”.</div>
  </div>

  <script>setTimeout(() => window.print(), 250);</script>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) {
      alert("Popup diblokir browser. Coba allow popups lalu klik lagi.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
  };

  // Filtered txs
  const filteredTxs = transactions.filter(t => {
    const matchType = filterType==="all" || t.type===filterType;
    const matchSearch = !search || (t.note||"").toLowerCase().includes(search.toLowerCase()) || getCat(t.categoryId).label.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  }).sort((a,b) => new Date(b.date)-new Date(a.date));

  const pieData = [
    {name:"Konsumsi",value:totalC,color:"#f97316"},
    {name:"Tabungan",value:totalS,color:"#22d3ee"},
    {name:"Investasi",value:totalI,color:"#a78bfa"},
    {name:"Saldo",value:Math.max(balance,0),color:"#94a3b8"},
  ].filter(d=>d.value>0);

  const barData = MONTHS.map((m,i) => {
    const txs = transactions.filter(t=>new Date(t.date).getMonth()===i&&new Date(t.date).getFullYear()===yr);
    return { name:m, Y:txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0), C:txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0) };
  });

  const catBreakdown = CATEGORIES.expense.map(cat => ({
    ...cat, total:monthTxs.filter(t=>t.categoryId===cat.id).reduce((s,t)=>s+t.amount,0)
  })).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);

  const shouldLoadCharts = activeTab === "dashboard" && (dashOpen==="allocation" || dashOpen==="cashflow") && (pieData.length > 0 || transactions.length > 0);
  const recharts = useRecharts(shouldLoadCharts);

  const S = {
    card: { background:"#111118", border:"1px solid #1c1c2e", borderRadius:16, padding:16, marginBottom:10 },
    input: { width:"100%", padding:"11px 14px", background:"#14141f", border:"1px solid #2a2a3e", borderRadius:12, color:"#e8e8f0", fontSize:14 },
    btn: { padding:13, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"white", fontWeight:700, fontSize:15, width:"100%", border:"none", cursor:"pointer" },
    lbl: { fontSize:11, color:"#9ca3af", marginBottom:5, display:"block" },
  };

  const CSS = `
    html,body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;}
    *{font-synthesis:none;}
    *{box-sizing:border-box;margin:0;padding:0;}
    button{cursor:pointer;border:none;}
    input,select{outline:none;}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-thumb{background:#222;border-radius:2px;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    .fade{animation:fadeIn 0.25s ease forwards}
    select option{background:#14141f;}
  `;

  // SPLASH
  if (screen==="splash") return (
    <div style={{minHeight:"100vh",background:"#08080f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <style>{CSS}</style>
      <div style={{transform:"translateY(-2px)"}}><Wordmark size={44} gradientId="wmSplash" /></div>
      <div style={{color:"#9ca3af",fontSize:13,marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>personal finance tracker</div>
    </div>
  );

  // ONBOARDING
  if (screen==="onboarding") return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#e8e8f0",fontFamily:"'DM Sans','Segoe UI',sans-serif",maxWidth:480,margin:"0 auto",padding:24}}>
      <style>{CSS}</style>
      <div style={{marginTop:50}}>
        <div style={{marginBottom:8}}><Wordmark size={34} gradientId="wmOnboarding" /></div>
        <div style={{fontSize:19,fontWeight:700,marginBottom:6}}>Setup AI Parsing 🤖</div>
        <div style={{fontSize:13,color:"#a1a1aa",lineHeight:1.7,marginBottom:24}}>
          Pakai <strong style={{color:"#4ade80"}}>Gemini API</strong> dari Google —{" "}
          ada <strong style={{color:"#4ade80"}}>free tier</strong> (limit mengikuti akun/quota Google).
        </div>

        <div style={{...S.card,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:600,color:"#8b5cf6",marginBottom:10}}>Cara dapat API Key (gratis):</div>
          {["Buka aistudio.google.com","Login akun Google","Klik 'Get API Key'","Copy & paste di bawah"].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"center"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,color:"white"}}>{i+1}</div>
              <div style={{fontSize:13,color:"#cbd5e1"}}>{s}</div>
            </div>
          ))}
        </div>

        <label style={S.lbl}>Gemini Model</label>
        <select value={geminiModel} onChange={e=>saveModel(e.target.value)} style={{...S.input,marginBottom:12}}>
          {["gemini-2.5-flash","gemini-2.0-flash"].map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <label style={S.lbl}>Gemini API Key</label>
        <input value={keyInput} onChange={e=>setKeyInput(e.target.value)} placeholder="AIza..." style={{...S.input,fontFamily:"monospace",fontSize:12,marginBottom:12}} />
        <button onClick={saveKey} style={{...S.btn,marginBottom:10}}>Simpan & Mulai →</button>
        <button onClick={()=>setScreen("app")} style={{width:"100%",padding:13,borderRadius:12,background:"transparent",border:"1px solid #1c1c2e",color:"#9ca3af",fontSize:13,cursor:"pointer"}}>
          Lewati, pakai parsing lokal
        </button>
        <div style={{fontSize:11,color:"#52525b",textAlign:"center",marginTop:12}}>API key/model hanya tersimpan di browser lo.</div>
      </div>
    </div>
  );

  // MAIN APP
  return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#e8e8f0",fontFamily:"'DM Sans','Segoe UI',sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:80}}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{padding:"16px 16px 12px",position:"sticky",top:0,background:"#08080f",zIndex:10,borderBottom:"1px solid #141420"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{transform:"translateY(-1px)"}}><Wordmark size={22} gradientId="wmHeader" /></div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:"#a1a1aa"}}>saldo {MONTHS[selectedMonth]} {yr}</div>
              <div style={{fontSize:17,fontWeight:700,color:balance>=0?"#4ade80":"#f87171"}}>{formatShort(balance)}</div>
            </div>
          </div>
        </div>

      <div style={{padding:"12px 14px 0"}}>

        {/* DASHBOARD */}
        {activeTab==="dashboard" && (
          <div className="fade">
            {/* Year controls */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:11,color:"#52525b"}}>Periode</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={()=>setSelectedYear(y=>y-1)} style={{padding:"6px 10px",borderRadius:10,background:"#111118",border:"1px solid #1c1c2e",color:"#cbd5e1",fontSize:12}}>‹</button>
                <div style={{fontSize:12,fontWeight:700,color:"#e8e8f0",minWidth:46,textAlign:"center"}}>{yr}</div>
                <button onClick={()=>setSelectedYear(y=>y+1)} style={{padding:"6px 10px",borderRadius:10,background:"#111118",border:"1px solid #1c1c2e",color:"#cbd5e1",fontSize:12}}>›</button>
                <button onClick={()=>{const d=new Date();setSelectedYear(d.getFullYear());setSelectedMonth(d.getMonth());}} style={{padding:"6px 10px",borderRadius:10,background:"transparent",border:"1px solid #2a2a3e",color:"#9ca3af",fontSize:12}}>Now</button>
              </div>
            </div>
            {/* Month picker */}
            <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:10,marginBottom:8}}>
              {MONTHS.map((m,i)=>(
                <button key={i} onClick={()=>setSelectedMonth(i)} style={{
                  padding:"5px 12px",borderRadius:50,fontSize:11,fontWeight:500,whiteSpace:"nowrap",flexShrink:0,
                  background:selectedMonth===i?"linear-gradient(135deg,#6366f1,#8b5cf6)":"#111118",
                  color:selectedMonth===i?"white":"#9ca3af",
                  border:"1px solid "+(selectedMonth===i?"transparent":"#1c1c2e"),
                }}>{m}</button>
              ))}
            </div>

            {/* YCIS cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {[
                {label:"Pemasukan (Y)",value:totalY,color:"#4ade80"},
                {label:"Konsumsi (C)",value:totalC,color:"#f97316"},
                {label:"Tabungan (S)",value:totalS,color:"#22d3ee"},
                {label:"Investasi (I)",value:totalI,color:"#a78bfa"},
              ].map((item,i)=>(
                <div key={i} style={{...S.card,marginBottom:0,padding:14,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:item.color}} />
                  <div style={{fontSize:10,color:"#a1a1aa",marginBottom:3}}>{item.label}</div>
                  <div style={{fontSize:16,fontWeight:700,color:item.color}}>{formatShort(item.value)}</div>
                </div>
              ))}
            </div>

            {/* Health score */}
            <div style={{...S.card,background:"linear-gradient(135deg,#111118,#16102a)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{fontSize:11,color:"#9ca3af"}}>Financial Health Score</div>
                  <div style={{fontSize:10,color:"#a1a1aa"}}>% income ditabung + investasi</div>
                </div>
                <div style={{fontSize:28,fontWeight:800,fontFamily:"'DM Sans','Segoe UI',sans-serif",color:healthScore>=healthTarget?"#4ade80":healthScore>=midTarget?"#fbbf24":"#f87171"}}>{healthScore}%</div>
              </div>
              <div style={{height:5,background:"#1c1c2e",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(healthScore,100)}%`,background:healthScore>=healthTarget?"linear-gradient(90deg,#22d3ee,#4ade80)":healthScore>=midTarget?"linear-gradient(90deg,#fbbf24,#f97316)":"#f87171",borderRadius:3,transition:"width 0.6s ease"}} />
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:10}}>
                <span style={{color:"#a1a1aa"}}>Target: {healthTarget}%+</span>
                <span style={{color:healthScore>=healthTarget?"#4ade80":healthScore>=midTarget?"#fbbf24":"#f87171"}}>
                  {healthScore>=healthTarget?"🔥 On Track!":healthScore>=midTarget?"⚡ Lumayan":"⚠️ Perlu Ditingkatkan"}
                </span>
              </div>
              <div style={{marginTop:8,fontSize:10,color:"#a1a1aa",display:"flex",justifyContent:"space-between",gap:10}}>
                <span>Konsistensi 3 bulan: <span style={{color:consistency3>=2?"#4ade80":consistency3===1?"#fbbf24":"#f87171",fontWeight:700}}>{consistency3}/3</span></span>
                <span style={{color:"#52525b"}}>{last3.map(x=>MONTHS[x.m]).reverse().join(" · ")}</span>
              </div>
            </div>

            {/* Budget C */}
            <div style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontSize:11,color:"#9ca3af"}}>Budget Konsumsi (C)</div>
                  <div style={{fontSize:10,color:"#a1a1aa",marginTop:2}}>{MONTHS[selectedMonth]} {yr}</div>
                </div>
                {cBudget>0 && (
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:"#9ca3af"}}>Sisa</div>
                    <div style={{fontSize:13,fontWeight:800,color:cBudgetOver>0?"#f87171":"#4ade80"}}>
                      {cBudgetOver>0?`-${formatShort(cBudgetOver)}`:formatShort(cBudgetLeft)}
                    </div>
                  </div>
                )}
              </div>
              {cBudget>0 && (
                <div style={{height:6,background:"#1c1c2e",borderRadius:4,overflow:"hidden",marginBottom:10}}>
                  <div style={{height:"100%",width:`${Math.min(cBudgetPct,100)}%`,background:cBudgetOver>0?"#f87171":"linear-gradient(90deg,#f97316,#fb923c)",borderRadius:4,transition:"width 0.4s ease"}} />
                </div>
              )}
              <div style={{display:"flex",gap:8}}>
                <input
                  type="number"
                  value={cBudgetInput}
                  onChange={e=>setCBudgetInput(e.target.value)}
                  placeholder="Set budget C (Rp)"
                  style={{...S.input,flex:1,padding:"10px 12px"}}
                />
                <button onClick={saveCBudget} style={{padding:"10px 12px",borderRadius:12,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"white",fontWeight:800,fontSize:12}}>
                  Simpan
                </button>
              </div>
              {cBudget>0 && (
                <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:10,color:"#a1a1aa"}}>
                  <span>Terpakai: <span style={{fontWeight:700,color:"#f97316"}}>{formatShort(totalC)}</span> / {formatShort(cBudget)}</span>
                  <button onClick={clearCBudget} style={{background:"transparent",color:"#9ca3af",textDecoration:"underline"}}>Reset</button>
                </div>
              )}
            </div>

            {/* Insight */}
            {totalY>0 && (
              <div style={{...S.card,background:"#0e0e1a",borderColor:"#6366f122"}}>
                <div style={{fontSize:11,color:"#6366f1",marginBottom:5,fontWeight:600}}>💡 Insight</div>
                <div style={{fontSize:12,color:"#cbd5e1",lineHeight:1.6}}>
                  {totalC>totalY*0.7?`Konsumsi lo ${Math.round((totalC/totalY)*100)}% dari income. Coba kurangi pengeluaran non-esensial.`
                  :healthScore>=healthTarget?`Keren! Lo udah nabung ${healthScore}% dari income bulan ini. Keep it up! 💪`
                  :`Lo masih punya sisa ${formatShort(balance)}. Pertimbangkan untuk ditabung atau diinvestasikan.`}
                </div>
              </div>
            )}

            {/* Empty state */}
            {transactions.length===0 && (
              <div style={{...S.card,textAlign:"center",padding:32}}>
                <div style={{fontSize:36,marginBottom:10}}>💸</div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Belum ada transaksi</div>
                <div style={{fontSize:12,color:"#a1a1aa",marginBottom:16}}>Mulai catat pemasukan & pengeluaran lo</div>
                <button onClick={()=>setActiveTab("chat")} style={{...S.btn,width:"auto",padding:"10px 24px",fontSize:13}}>Catat Sekarang</button>
              </div>
            )}

            {/* Details accordion */}
            {pieData.length>0 && (
              <AccordionSection
                title="Alokasi"
                subtitle={`Ringkasan pengeluaran & alokasi · ${MONTHS[selectedMonth]} ${yr}`}
                open={dashOpen==="allocation"}
                onToggle={()=>setDashOpen(p=>p==="allocation"?"":"allocation")}
              >
                <div style={{display:"flex",alignItems:"center",gap:12,marginTop:6}}>
                  {recharts ? (() => {
                    const { PieChart, Pie, Cell, ResponsiveContainer } = recharts;
                    return (
                      <ResponsiveContainer width={110} height={110}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="value" paddingAngle={4}>
                            {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })() : (
                    <div style={{width:110,height:110,borderRadius:16,background:"#0e0e16",border:"1px solid #1c1c2e"}} />
                  )}
                  <div style={{flex:1}}>
                    {pieData.map((d,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:7,height:7,borderRadius:"50%",background:d.color}}/>
                          <span style={{fontSize:11,color:"#cbd5e1"}}>{d.name}</span>
                        </div>
                        <span style={{fontSize:11,fontWeight:600,color:d.color}}>{formatShort(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionSection>
            )}

            {transactions.length>0 && (
              <AccordionSection
                title="Cashflow"
                subtitle={`Income vs Expense · ${yr}`}
                open={dashOpen==="cashflow"}
                onToggle={()=>setDashOpen(p=>p==="cashflow"?"":"cashflow")}
              >
                {recharts ? (() => {
                  const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = recharts;
                  return (
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={barData} barSize={7}>
                        <XAxis dataKey="name" tick={{fontSize:9,fill:"#a1a1aa"}} axisLine={false} tickLine={false}/>
                        <YAxis hide/>
                        <Tooltip contentStyle={{background:"#14141f",border:"1px solid #2a2a3e",borderRadius:8,fontSize:11}} formatter={v=>formatShort(v)}/>
                        <Bar dataKey="Y" fill="#4ade80" radius={[3,3,0,0]}/>
                        <Bar dataKey="C" fill="#f97316" radius={[3,3,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })() : (
                  <div style={{height:140,borderRadius:12,background:"#0e0e16",border:"1px solid #1c1c2e"}} />
                )}
                <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:6}}>
                  {[["#4ade80","Income"],["#f97316","Expense"]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:7,height:7,borderRadius:2,background:c}}/>
                      <span style={{fontSize:10,color:"#a1a1aa"}}>{l}</span>
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}

            {catBreakdown.length>0 && (
              <AccordionSection
                title="Top Pengeluaran"
                subtitle={`Kategori terbesar · ${MONTHS[selectedMonth]} ${yr}`}
                open={dashOpen==="top"}
                onToggle={()=>setDashOpen(p=>p==="top"?"":"top")}
              >
                {catBreakdown.slice(0,8).map((cat,i)=>(
                  <div key={i} style={{marginTop:i===0?6:0,marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12}}>{cat.emoji} {cat.label}</span>
                      <span style={{fontSize:12,fontWeight:600,color:"#f97316"}}>{formatShort(cat.total)}</span>
                    </div>
                    <div style={{height:3,background:"#1c1c2e",borderRadius:2}}>
                      <div style={{height:"100%",width:`${Math.min((cat.total/Math.max(totalC,1))*100,100)}%`,background:"linear-gradient(90deg,#f97316,#fb923c)",borderRadius:2}}/>
                    </div>
                  </div>
                ))}
              </AccordionSection>
            )}

            {transactions.length>0 && (
              <AccordionSection
                title="Export & Laporan"
                subtitle="CSV backup + laporan PDF"
                open={dashOpen==="export"}
                onToggle={()=>setDashOpen(p=>p==="export"?"":"export")}
              >
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6}}>
                  <button onClick={exportCSVMonth} style={{padding:12,borderRadius:12,background:"#111118",border:"1px solid #1c1c2e",color:"#cbd5e1",fontSize:12,cursor:"pointer"}}>
                    📥 CSV {MONTHS[selectedMonth]}
                  </button>
                  <button onClick={exportCSVAll} style={{padding:12,borderRadius:12,background:"#111118",border:"1px solid #1c1c2e",color:"#cbd5e1",fontSize:12,cursor:"pointer"}}>
                    📥 CSV Semua
                  </button>
                </div>
                <button onClick={printMonthlyReport} style={{width:"100%",padding:12,borderRadius:12,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",color:"white",fontSize:13,fontWeight:700,marginTop:8,cursor:"pointer"}}>
                  🖨️ Cetak / Save PDF ({MONTHS[selectedMonth]})
                </button>
                <div style={{fontSize:10,color:"#a1a1aa",marginTop:8,lineHeight:1.5}}>
                  PDF = pakai fitur Print browser (Save as PDF). CSV = buat backup/olah data.
                </div>
              </AccordionSection>
            )}
          </div>
        )}

        {/* CHAT */}
        {activeTab==="chat" && (
          <div className="fade" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 160px)"}}>
            {!geminiKey && (
              <div style={{background:"#1a1208",border:"1px solid #f9741644",borderRadius:12,padding:"9px 14px",marginBottom:10,fontSize:12,color:"#f97316"}}>
                ⚡ Parsing lokal aktif.{" "}
                <span onClick={()=>setScreen("onboarding")} style={{textDecoration:"underline",cursor:"pointer"}}>Setup Gemini API gratis</span> buat lebih akurat.
              </div>
            )}
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:8}}>
              {chatMsgs.map((msg,i)=>(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:msg.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{
                    maxWidth:"85%",padding:"10px 14px",
                    borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                    background:msg.role==="user"?"linear-gradient(135deg,#6366f1,#8b5cf6)":"#111118",
                    border:msg.role==="assistant"?"1px solid #1c1c2e":"none",
                    fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"
                  }}>
                    {msg.text.split("**").map((p,j)=>j%2===1?<strong key={j}>{p}</strong>:p)}
                    {msg.isPending && (
                      <div style={{display:"flex",gap:8,marginTop:10}}>
                        <button onClick={()=>confirmTx(true,msg.pendingData)} style={{flex:1,padding:"9px",borderRadius:10,background:"linear-gradient(135deg,#22d3ee,#4ade80)",color:"#08080f",fontWeight:700,fontSize:13}}>✓ Bener!</button>
                        <button onClick={()=>confirmTx(false,msg.pendingData)} style={{padding:"9px 14px",borderRadius:10,background:"#1a1a2e",color:"#cbd5e1",fontSize:13,border:"1px solid #2a2a3e"}}>✗ Batal</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {parsing && (
                <div style={{display:"flex",gap:5,padding:"10px 14px",background:"#111118",border:"1px solid #1c1c2e",borderRadius:"16px 16px 16px 4px",width:"fit-content"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#6366f1",animation:"pulse 1.2s ease infinite",animationDelay:`${i*0.2}s`}}/>)}
                </div>
              )}
              <div ref={chatEnd}/>
            </div>
            <div style={{paddingTop:8,borderTop:"1px solid #141420"}}>
              <div style={{display:"flex",gap:8}}>
                <input
                  value={chatInput}
                  onChange={e=>setChatInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendChat()}
                  placeholder='"makan siang 45rb"'
                  style={{flex:1,padding:"12px 16px",background:"#111118",border:"1px solid #1c1c2e",borderRadius:50,color:"#e8e8f0",fontSize:13}}
                />
                <button onClick={sendChat} disabled={parsing} style={{width:44,height:44,borderRadius:"50%",background:parsing?"#1c1c2e":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"white",fontSize:18,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
              </div>
            </div>
          </div>
        )}

        {/* FORM */}
        {activeTab==="form" && (
          <div className="fade">
            <div style={S.card}>
              <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>{editId?"✏️ Edit Transaksi":"✏️ Input Manual"}</div>

              <label style={S.lbl}>Tipe</label>
              <div style={{display:"flex",gap:6,marginBottom:12}}>
                {[["income","💰 Masuk"],["expense","💸 Keluar"],["saving","🐷 Tabungan"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setForm(f=>({...f,type:v,categoryId:v==="income"?"salary":v==="saving"?"emergency":"food"}))} style={{
                    flex:1,padding:"9px 4px",borderRadius:10,fontSize:11,fontWeight:500,
                    background:form.type===v?"linear-gradient(135deg,#6366f1,#8b5cf6)":"#14141f",
                    color:form.type===v?"white":"#555",
                    border:"1px solid "+(form.type===v?"transparent":"#2a2a3e"),
                  }}>{l}</button>
                ))}
              </div>

              <label style={S.lbl}>Kategori</label>
              <select value={form.categoryId} onChange={e=>setForm(f=>({...f,categoryId:e.target.value}))} style={{...S.input,marginBottom:12}}>
                {CATEGORIES[form.type==="income"?"income":form.type==="saving"?"saving":"expense"].map(c=>(
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>

              <label style={S.lbl}>Nominal (Rp)</label>
              <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0" style={{...S.input,fontSize:20,fontWeight:700,marginBottom:12}}/>

              <label style={S.lbl}>Catatan</label>
              <input type="text" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Opsional..." style={{...S.input,marginBottom:12}}/>

              <label style={S.lbl}>Tanggal</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{...S.input,marginBottom:16}}/>

              <button onClick={saveForm} style={S.btn}>{editId?"Update":"Simpan"}</button>
              {editId && (
                <button onClick={()=>{setEditId(null);setForm({type:"expense",categoryId:"food",amount:"",note:"",date:todayStr()});}} style={{width:"100%",padding:12,borderRadius:12,background:"transparent",border:"1px solid #1c1c2e",color:"#9ca3af",fontSize:13,marginTop:8,cursor:"pointer"}}>Batal Edit</button>
              )}
            </div>
          </div>
        )}

        {/* RIWAYAT */}
        {activeTab==="transactions" && (
          <div className="fade">
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cari..." style={{...S.input,flex:1,padding:"9px 14px"}}/>
              <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{...S.input,width:"auto",padding:"9px 10px",flexShrink:0,fontSize:12}}>
                <option value="all">Semua</option>
                <option value="income">Masuk</option>
                <option value="expense">Keluar</option>
                <option value="saving">Tabungan</option>
              </select>
            </div>
            {filteredTxs.length===0?(
              <div style={{textAlign:"center",padding:40,color:"#a1a1aa",fontSize:13}}>Belum ada transaksi</div>
            ):filteredTxs.map(tx=>{
              const cat=getCat(tx.categoryId);
              return (
                <div key={tx.id} style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"center",padding:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"#14141f",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{cat.emoji}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:500}}>{tx.note||cat.label}</div>
                      <div style={{fontSize:10,color:"#a1a1aa",marginTop:2}}>{cat.label} · {tx.date}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:13,fontWeight:700,color:tx.type==="income"?"#4ade80":tx.type==="saving"?"#22d3ee":"#f97316"}}>
                      {tx.type==="income"?"+":"-"}{formatShort(tx.amount)}
                    </div>
                    <button onClick={()=>startEdit(tx)} style={{background:"transparent",color:"#a1a1aa",fontSize:13,padding:4}}>✏️</button>
                    <button onClick={()=>setTransactions(p=>p.filter(t=>t.id!==tx.id))} style={{background:"transparent",color:"#a1a1aa",fontSize:13,padding:4}}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab==="settings" && (
          <div className="fade">
            <div style={S.card}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>🤖 Gemini API Key</div>
              <div style={{fontSize:12,color:geminiKey?"#4ade80":"#f97316",marginBottom:10}}>
                {geminiKey?"✅ AI parsing aktif (Gemini)":"⚠️ Belum ada key — pakai parsing lokal"}
              </div>
              <div style={{fontSize:11,color:"#9ca3af",marginBottom:6}}>Model</div>
              <select value={geminiModel} onChange={e=>saveModel(e.target.value)} style={{...S.input,marginBottom:10}}>
                {["gemini-2.5-flash","gemini-2.0-flash"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input value={keyInput} onChange={e=>setKeyInput(e.target.value)} placeholder="AIza..." style={{...S.input,fontFamily:"monospace",fontSize:12,marginBottom:10}}/>
              <button onClick={saveKey} style={{...S.btn,marginBottom:8}}>Simpan API Key</button>
              {geminiKey&&<button onClick={()=>{localStorage.removeItem("dompet_gemini_key");setGeminiKey("");}} style={{width:"100%",padding:12,borderRadius:12,background:"transparent",border:"1px solid #2a1a1a",color:"#f87171",fontSize:13,cursor:"pointer"}}>Hapus API Key</button>}
              <div style={{fontSize:10,color:"#a1a1aa",marginTop:10,lineHeight:1.6}}>
                Kalau Gemini gagal: cek API key benar, quota free tier, dan pastikan key tidak dibatasi (HTTP referrer restrictions).
              </div>
            </div>

            <div style={S.card}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>🎯 Target Health Score</div>
              <div style={{fontSize:12,color:"#9ca3af",marginBottom:10}}>Target % pemasukan yang masuk tabungan + investasi.</div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                {[10,15,20,30].map(v => (
                  <button key={v} onClick={()=>saveHealthTarget(v)} style={{
                    flex:1,padding:"9px 4px",borderRadius:10,fontSize:12,fontWeight:600,
                    background:healthTarget===v?"linear-gradient(135deg,#6366f1,#8b5cf6)":"#14141f",
                    color:healthTarget===v?"white":"#555",
                    border:"1px solid "+(healthTarget===v?"transparent":"#2a2a3e"),
                  }}>{v}%</button>
                ))}
              </div>
              <label style={S.lbl}>Custom (5–90)</label>
              <input type="number" min="5" max="90" value={healthTarget} onChange={e=>saveHealthTarget(e.target.value)} style={{...S.input}} />
            </div>

            <div style={S.card}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>💾 Data</div>
              <div style={{fontSize:12,color:"#9ca3af",marginBottom:12}}>{transactions.length} transaksi tersimpan di browser ini.</div>
              <button onClick={exportCSVMonth} style={{width:"100%",padding:12,borderRadius:12,background:"#111118",border:"1px solid #1c1c2e",color:"#cbd5e1",fontSize:13,marginBottom:8,cursor:"pointer"}}>📥 Export CSV (Bulan Dipilih)</button>
              <button onClick={exportCSVAll} style={{width:"100%",padding:12,borderRadius:12,background:"#111118",border:"1px solid #1c1c2e",color:"#cbd5e1",fontSize:13,marginBottom:8,cursor:"pointer"}}>📥 Export CSV (Semua)</button>
              <button onClick={printMonthlyReport} style={{width:"100%",padding:12,borderRadius:12,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",color:"white",fontSize:13,fontWeight:700,marginBottom:8,cursor:"pointer"}}>🖨️ Cetak / Save PDF (Bulan Dipilih)</button>
              <button onClick={backupJSON} style={{width:"100%",padding:12,borderRadius:12,background:"#0e0e1a",border:"1px solid #6366f122",color:"#cbd5e1",fontSize:13,marginBottom:8,cursor:"pointer"}}>☁️ Backup JSON (Drive/Download)</button>
              <label style={{display:"block"}}>
                <input
                  type="file"
                  accept="application/json"
                  style={{display:"none"}}
                  onChange={async (e)=>{
                    try { await importBackup(e.target.files?.[0]); }
                    catch(err) { alert("Restore gagal: " + (err?.message||err)); }
                    finally { e.target.value=''; }
                  }}
                />
                <span style={{display:"block",width:"100%",padding:12,borderRadius:12,background:"#111118",border:"1px solid #1c1c2e",color:"#cbd5e1",fontSize:13,marginBottom:8,cursor:"pointer",textAlign:"center"}}>📤 Restore JSON</span>
              </label>
              <button onClick={()=>{if(window.confirm("Hapus semua data transaksi?")){setTransactions([]);localStorage.removeItem("dompet_transactions");}}} style={{width:"100%",padding:12,borderRadius:12,background:"transparent",border:"1px solid #2a1a1a",color:"#f87171",fontSize:13,cursor:"pointer"}}>🗑️ Reset Semua Data</button>
            </div>

            <div style={{...S.card,fontSize:12,color:"#a1a1aa",lineHeight:1.9}}>
              <div style={{fontWeight:600,color:"#a1a1aa",marginBottom:4}}>dompet. v2</div>
              Framework: Y = C + I + S<br/>
              Data: localStorage (per browser)<br/>
              AI: {geminiKey ? `Gemini (${geminiModel})` : "Parsing lokal"}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#0a0a12",borderTop:"1px solid #141420",display:"flex",padding:"8px 0 14px",zIndex:100}}>
        {[
          {id:"dashboard",label:"Dashboard",icon:"📊"},
          {id:"chat",label:"Catat",icon:"💬"},
          {id:"form",label:"Form",icon:"✏️"},
          {id:"transactions",label:"Riwayat",icon:"📋"},
          {id:"settings",label:"Settings",icon:"⚙️"},
        ].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",padding:"4px 0"}}>
            <div style={{fontSize:tab.id===activeTab?19:16,transition:"all 0.2s"}}>{tab.icon}</div>
            <div style={{fontSize:9,color:tab.id===activeTab?"#8b5cf6":"#333",fontWeight:tab.id===activeTab?600:400}}>{tab.label}</div>
            {tab.id===activeTab&&<div style={{width:14,height:2,background:"linear-gradient(90deg,#6366f1,#a78bfa)",borderRadius:1}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
