import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Download,
  Menu,
  X,
  Smartphone,
  CheckCircle2,
  Lock,
  Scale,
  FileText,
  Check,
  Moon,
  Sun,
  AlertCircle,
  Mail,
  Plus,
  Trash2,
  ShoppingCart,
  BookOpen,
  Search,
  ExternalLink,
  Laptop
} from "lucide-react";
import {
  APPLICATION_INFO,
  PRIVACY_POLICY,
  TERMS_OF_SERVICE
} from "./data";
import Logo from "./Logo";

type Medicine = {
  name: string;
  pricePublic: number;
  priceMugefci: number;
  cmuCovered: boolean;
};

type CartItem = { medicine: Medicine; quantity: number };

type Prescription = {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  insurance: string;
};

const MOCK_MEDICINES: Medicine[] = [
  { name: "Paracétamol 500mg", pricePublic: 1200, priceMugefci: 360, cmuCovered: true },
  { name: "Amoxicilline 500g", pricePublic: 2800, priceMugefci: 840, cmuCovered: true },
  { name: "Ibuprofène 400mg", pricePublic: 1500, priceMugefci: 450, cmuCovered: false },
  { name: "Spasfon Lyoc", pricePublic: 3100, priceMugefci: 930, cmuCovered: true },
  { name: "Vogalène 10mg", pricePublic: 2400, priceMugefci: 720, cmuCovered: false },
  { name: "Doliprane 1g", pricePublic: 1400, priceMugefci: 420, cmuCovered: true }
];

export default function App() {
  // Mobile navigation menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compliance Modals states
  const [activeModal, setActiveModal] = useState<"privacy" | "cgu" | null>(null);

  // APK Download process simulation state
  const [downloadStep, setDownloadStep] = useState<"idle" | "preparing" | "scanning" | "downloading" | "completed">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Download counter state
  const [downloadCount, setDownloadCount] = useState<number>(() => {
    const stored = localStorage.getItem("gardepharma_download_count");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 0; // Commencer à 0 pour ne pas inventer de données
  });

  // Theme state: "light" | "dark" | "system"
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Contact form submission state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });

  // Interactive demo states for the features showcase
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("Toutes");
  const [selectedFeatureTab, setSelectedFeatureTab] = useState<string>("pharmacies");

  // Cart / Panier states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [useInsurance, setUseInsurance] = useState<"none" | "mugefci" | "cmu">("none");

  // Saved Prescriptions / Bibliothèque d'ordonnances
  const [savedPrescriptions, setSavedPrescriptions] = useState<Prescription[]>([
    {
      id: "ORD-9842",
      date: "02/07/2026 à 11:30",
      insurance: "CMU",
      total: 1200,
      items: [
        { medicine: MOCK_MEDICINES[0], quantity: 2 },
        { medicine: MOCK_MEDICINES[5], quantity: 1 }
      ]
    }
  ]);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<string[]>([]);

  // Local Storage persistence for interactive demo (basket/prescriptions)
  useEffect(() => {
    const stored = localStorage.getItem("gardepharma_prescriptions");
    if (stored) {
      try {
        setSavedPrescriptions(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const savePrescriptionsToLocalStorage = useCallback((newPrescriptions: Prescription[]) => {
    setSavedPrescriptions(newPrescriptions);
    localStorage.setItem("gardepharma_prescriptions", JSON.stringify(newPrescriptions));
  }, []);

  // Theme application logic
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System adaptive
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [theme]);

  // Handle Direct APK Download & Instant State Update
  const APK_DOWNLOAD_URL = "https://github.com/gabimarulevide13-ctrl/gardepharma-ci/releases/latest/download/GardePharmaCI.apk";

  const triggerApkDownload = () => {
    const alreadyDownloaded = localStorage.getItem("gardepharma_already_downloaded") === "true";

    if (!alreadyDownloaded) {
      const newCount = downloadCount + 1;
      setDownloadCount(newCount);
      localStorage.setItem("gardepharma_download_count", newCount.toString());
      localStorage.setItem("gardepharma_already_downloaded", "true");
    }

    try {
      const link = document.createElement("a");
      link.href = APK_DOWNLOAD_URL;
      link.download = "GardePharmaCI.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Direct download failed", e);
    }

    setDownloadStep("completed");
    setDownloadProgress(100);
  };

  // Helper to scroll to the download section and initiate the APK download process automatically
  const initiateApkDownload = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById("telechargement");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    // Start simulation & real download immediately if idle
    if (downloadStep === "idle") {
      triggerApkDownload();
    }
  };

  // Reset download state to try again
  const resetDownload = () => {
    setDownloadStep("idle");
    setDownloadProgress(0);
  };

  // Handle Contact Form Submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  // Cart operations
  const addToCart = useCallback((med: Medicine) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.medicine.name === med.name);
      if (existing) {
        return prevCart.map(item => item.medicine.name === med.name ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { medicine: med, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((medName: string) => {
    setCart(prevCart => prevCart.filter(item => item.medicine.name !== medName));
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      let price = item.medicine.pricePublic;
      if (useInsurance === "mugefci") {
        price = item.medicine.priceMugefci;
      } else if (useInsurance === "cmu") {
        price = item.medicine.cmuCovered ? item.medicine.pricePublic * 0.3 : item.medicine.pricePublic;
      }
      return total + (price * item.quantity);
    }, 0);
  }, [cart, useInsurance]);

  // Validate cart to Prescription Library
  const validateCart = () => {
    if (cart.length === 0) return;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} à ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newOrd = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: formattedDate,
      items: [...cart],
      total: cartTotal,
      insurance: useInsurance === "none" ? "Aucune" : useInsurance === "mugefci" ? "MUGEFCI" : "CMU"
    };
    
    const updated = [newOrd, ...savedPrescriptions];
    savePrescriptionsToLocalStorage(updated);
    setCart([]);
    setSelectedFeatureTab("prescription"); // Switch view to library to show saved item
  };

  // Handle single or multiple prescription deletion
  const toggleSelectPrescription = (id: string) => {
    if (selectedPrescriptions.includes(id)) {
      setSelectedPrescriptions(selectedPrescriptions.filter(pId => pId !== id));
    } else {
      setSelectedPrescriptions([...selectedPrescriptions, id]);
    }
  };

  const deleteSelectedPrescriptions = () => {
    const updated = savedPrescriptions.filter(p => !selectedPrescriptions.includes(p.id));
    savePrescriptionsToLocalStorage(updated);
    setSelectedPrescriptions([]);
  };

  const deleteSinglePrescription = (id: string) => {
    const updated = savedPrescriptions.filter(p => p.id !== id);
    savePrescriptionsToLocalStorage(updated);
    setSelectedPrescriptions(selectedPrescriptions.filter(pId => pId !== id));
  };

  // Filter medicines based on search in dictionnaire demo
  const filteredMedicines = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return MOCK_MEDICINES;
    return MOCK_MEDICINES.filter(m => m.name.toLowerCase().includes(normalizedQuery));
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200 bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <Logo size={44} className="shadow-md shadow-emerald-500/10 transform group-hover:scale-105 transition-all" />
            <div>
              <div className="flex items-center gap-1">
                <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">GardePharma</span>
                <span className="font-mono text-xs font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-sm">CI</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">Votre santé, notre priorité ! 💚</p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#accueil" className="font-medium text-sm text-slate-600 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors">Accueil</a>
            <a href="#fonctionnalites" className="font-medium text-sm text-slate-600 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors">Fonctionnalités</a>
            <a href="#choisir" className="font-medium text-sm text-slate-600 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors">Pourquoi nous ?</a>
            <a href="#contact" className="font-medium text-sm text-slate-600 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors">Contact</a>
          </nav>

          {/* Theme Selector + CTA Header Button */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Theme Toggle Button */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-md transition-all ${theme === "light" ? "bg-white text-emerald-500 shadow-xs dark:bg-slate-700" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                title="Mode clair"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-md transition-all ${theme === "dark" ? "bg-white text-emerald-500 shadow-xs dark:bg-slate-700" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                title="Mode sombre"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-md transition-all ${theme === "system" ? "bg-white text-emerald-500 shadow-xs dark:bg-slate-700" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                title="Mode système adaptatif"
              >
                <Laptop className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={initiateApkDownload}
              className="px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 shadow-xs transition-all flex items-center gap-2 transform active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Télécharger l'APK
            </button>
          </div>

          {/* Mobile Menu Toggle & Theme Toggle for Small Screens */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-20 inset-x-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl z-30 px-6 py-6 flex flex-col gap-4"
          >
            <a
              href="#accueil"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors py-1"
            >
              Accueil
            </a>
            <a
              href="#fonctionnalites"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors py-1"
            >
              Fonctionnalités
            </a>
            <a
              href="#choisir"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors py-1"
            >
              Pourquoi nous ?
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors py-1"
            >
              Contact
            </a>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-xs text-slate-400 block mb-2">Préférence thème</span>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setTheme("light")} className={`py-1.5 rounded-md text-xs font-bold ${theme === "light" ? "bg-white text-emerald-500 shadow-xs dark:bg-slate-700" : "text-slate-500"}`}>Clair</button>
                <button onClick={() => setTheme("dark")} className={`py-1.5 rounded-md text-xs font-bold ${theme === "dark" ? "bg-white text-emerald-500 shadow-xs dark:bg-slate-700" : "text-slate-500"}`}>Sombre</button>
                <button onClick={() => setTheme("system")} className={`py-1.5 rounded-md text-xs font-bold ${theme === "system" ? "bg-white text-emerald-500 shadow-xs dark:bg-slate-700" : "text-slate-500"}`}>Adaptatif</button>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                initiateApkDownload();
              }}
              className="w-full text-center py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors mt-2 cursor-pointer"
            >
              <Download className="w-5 h-5" /> Télécharger l'APK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISKLAIMER BAR */}
      <div className="bg-amber-50 border-y border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 py-3 px-4 text-xs font-medium text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span><strong>Pas d'affiliation</strong> : GardePharma CI n'est affiliée à aucun organisme officiel et n'est reliée à aucune pharmacie physique.</span>
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="accueil" className="relative pt-12 pb-20 md:py-24 overflow-hidden bg-gradient-to-b from-emerald-50/20 via-white to-slate-50 dark:from-slate-900/10 dark:via-slate-950 dark:to-slate-950">
        
        {/* Background ambient light */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left: Text Context */}
            <div className="lg:col-span-7 text-center lg:text-left flex flex-col justify-center">
              
              <div className="inline-flex items-center gap-2 self-center lg:self-start bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 px-4 py-1.5 rounded-full mb-6">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold tracking-wide uppercase">Application Mobile 100% Gratuite</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-6">
                <span className="text-emerald-500">GardePharma CI</span> — Pharmacies de garde en Côte d'Ivoire
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
                {APPLICATION_INFO.description} Conçue spécialement pour les Ivoiriens, elle permet de s'orienter en urgence, de consulter le prix des médicaments et de simuler la gestion de vos ordonnances localement et en toute sécurité.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <button
                  onClick={initiateApkDownload}
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-base rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-3 transform active:scale-98 cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Télécharger l'APK Gratuit
                </button>
                <a
                  href="#fonctionnalites"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  Découvrir les Fonctionnalités
                </a>
              </div>

              {/* Quick stats / Highlights */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">Gratuit</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Aucun frais d'accès</div>
                </div>
                <div className="text-center lg:text-left border-x border-slate-200 dark:border-slate-800 px-4">
                  <div className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">Sécurisé</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Stockage Local / Privé</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-display font-extrabold text-2xl text-emerald-500 dark:text-emerald-400 font-mono">
                    {downloadCount.toLocaleString("fr-FR")}+
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Téléchargements</div>
                </div>
              </div>

            </div>

            {/* Hero Right: Application Showcase Mockup */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              <div className="absolute w-72 h-72 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 animate-ping pointer-events-none" style={{ animationDuration: "3s" }}></div>
              
              {/* Outer Phone Frame */}
              <div className="relative mx-auto border-[10px] border-slate-900 dark:border-slate-800 rounded-[44px] h-[540px] w-[260px] shadow-2xl bg-slate-950 overflow-hidden">
                {/* Speaker pill */}
                <div className="absolute top-0 inset-x-0 h-4 bg-slate-900 dark:bg-slate-800 flex justify-center items-center z-30">
                  <div className="w-16 h-3 bg-black rounded-b-lg"></div>
                </div>

                {/* Screen Content Mockup */}
                <div className="absolute inset-0 bg-slate-900 text-slate-100 p-4 pt-8 flex flex-col justify-between overflow-hidden">
                  
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>GardePharma CI</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      100% Hors-ligne
                    </span>
                  </div>

                  {/* Simulated App Header */}
                  <div className="mt-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Logo size={32} />
                    <div>
                      <h4 className="text-xs font-bold leading-none text-white">GardePharma CI</h4>
                      <span className="text-[9px] text-slate-400">Pharmacies & Ordonnances</span>
                    </div>
                  </div>

                  {/* Simulated screen components */}
                  <div className="flex-1 mt-4 space-y-3 overflow-y-auto pr-1 select-none">
                    
                    {/* Feature 1 block */}
                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <span>🏥</span> Pharmacies de garde
                        </span>
                        <span className="text-[8px] bg-slate-700 text-slate-300 px-1 py-0.5 rounded">Cocody</span>
                      </div>
                      <p className="text-[11px] font-semibold text-white">Pharmacie du Boulevard de Garde</p>
                      <p className="text-[9px] text-slate-400">Boulevard Latrille • Ouvert 24h/24</p>
                    </div>

                    {/* Feature 2 block */}
                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                          <span>💊</span> Dictionnaire & Prix
                        </span>
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded">CMU Ok</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white">Paracétamol 500mg</span>
                        <span className="text-[10px] font-bold text-emerald-400">1 200 FCFA</span>
                      </div>
                      <div className="text-[8px] text-slate-400 mt-1 flex justify-between">
                        <span>Tarif CMU : 360 FCFA</span>
                        <span>MUGEFCI : -70%</span>
                      </div>
                    </div>

                    {/* Feature 3 block */}
                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                      <span className="text-[10px] font-bold text-purple-400 block mb-1">
                        <span>📋</span> Ordonnances Validées
                      </span>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-white font-mono">ORD-9842</span>
                        <span className="text-slate-400">2 médicaments</span>
                        <span className="text-emerald-400 font-bold">1 560 FCFA</span>
                      </div>
                    </div>

                  </div>

                  {/* Simulated App Footer */}
                  <div className="border-t border-slate-800 pt-3 text-center text-[9px] text-slate-500">
                    Application non-officielle d'orientation
                  </div>

                </div>
              </div>

              {/* Float Badge */}
              <div className="absolute -bottom-6 right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl max-w-xs text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Mise à jour périodique
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Organisé par cycles de 7 jours pour un suivi impeccable.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* DYNAMIC AND INTERACTIVE FEATURE SHOWCASE */}
      <section id="fonctionnalites" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
              ✨ Fonctionnalités principales
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
              Six modules clés dans votre poche
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              Explorez ci-dessous la présentation détaillée de nos fonctionnalités et utilisez notre simulateur interactif pour tester l'application directement.
            </p>
          </div>

          {/* Interactive Feature Grid / Tabs system */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side: Feature Navigation and descriptions */}
            <div className="lg:col-span-5 space-y-3">
              {APPLICATION_INFO.features.map((feat) => {
                const isSelected = selectedFeatureTab === feat.id;
                return (
                  <button
                    key={feat.id}
                    onClick={() => {
                      setSelectedFeatureTab(feat.id);
                      // Clear search query when changing tabs
                      setSearchQuery("");
                    }}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                      isSelected
                        ? "bg-white dark:bg-slate-900 border-emerald-500 shadow-lg shadow-slate-200/50 dark:shadow-none"
                        : "bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                      {feat.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center justify-between">
                        {feat.title}
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {feat.items.slice(0, 1).map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item}</li>
                        ))}
                      </ul>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-2 inline-block hover:underline">
                        Tester ce module →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right side: Functional Simulator of the selected module */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl relative min-h-[480px] flex flex-col justify-between">
              
              {/* Simulator Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 font-mono">
                      DÉMO INTERACTIVE CLIENT-SIDE
                    </span>
                    <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-1">
                      {APPLICATION_INFO.features.find(f => f.id === selectedFeatureTab)?.title}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-lg">
                    {APPLICATION_INFO.features.find(f => f.id === selectedFeatureTab)?.icon}
                  </div>
                </div>

                {/* Info Bulletins */}
                <div className="mb-6 space-y-1.5">
                  {APPLICATION_INFO.features.find(f => f.id === selectedFeatureTab)?.items.map((bullet, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-emerald-500 mt-0.5 font-bold shrink-0">✓</span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIMULATOR SCREEN CONTAINER */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                
                {/* 1. Pharmacies de Garde Interactive Demo */}
                {selectedFeatureTab === "pharmacies" && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-2">SIMULER LA RECHERCHE</span>
                      
                      {/* Commune Selection Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {["Toutes", "Cocody", "Plateau", "Adjamé", "Yopougon"].map((comm) => (
                          <button
                            key={comm}
                            onClick={() => setSelectedCommune(comm)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              selectedCommune === comm
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {comm}
                          </button>
                        ))}
                      </div>

                      {/* Search Bar */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Rechercher une officine ou une rue (ex: Boulevard Latrille)..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Simulatated Result List */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2 py-6">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto text-blue-500">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Géolocalisation & Recherche active</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-normal">
                        {selectedCommune === "Toutes" 
                          ? "L'application affiche en temps réel les officines ouvertes par cycle de 7 jours."
                          : `Filtre en cours : Affichage des pharmacies disponibles à ${selectedCommune}.`}
                      </p>
                      <div className="pt-2">
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-2 py-1 rounded">
                          Cycle de garde : 7 Jours Glissants
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Dictionnaire & 3. Prix & 4. Panier Demo (All combined into a gorgeous interactive flow) */}
                {(selectedFeatureTab === "dictionary" || selectedFeatureTab === "prices" || selectedFeatureTab === "cart") && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400">DICTIONNAIRE & TARIFICATEUR CMU / MUGEFCI</span>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                          </span>
                        </div>
                      </div>

                      {/* Medication Search Input */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Rechercher par nom (ex: Paracétamol, Spasfon...)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-hidden text-slate-800 dark:text-white"
                        />
                      </div>

                      {/* Medicine List */}
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {filteredMedicines.map((med) => (
                          <div key={med.name} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                            <div>
                              <p className="font-bold text-slate-950 dark:text-white">{med.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                <span>Public: {med.pricePublic} F</span>
                                <span>MUGEFCI: {med.priceMugefci} F</span>
                                {med.cmuCovered && <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded-[3px]">CMU OK</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => addToCart(med)}
                              className="px-2 py-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Ajouter
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Basket & Calculation Block */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400">PANIER DE SIMULATION</span>
                        
                        {/* Insurance selection pills */}
                        <div className="flex bg-slate-50 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[9px]">
                          <button onClick={() => setUseInsurance("none")} className={`px-2 py-0.5 rounded-md font-bold ${useInsurance === "none" ? "bg-slate-900 text-white dark:bg-slate-800" : "text-slate-400"}`}>Sans</button>
                          <button onClick={() => setUseInsurance("mugefci")} className={`px-2 py-0.5 rounded-md font-bold ${useInsurance === "mugefci" ? "bg-slate-900 text-white dark:bg-slate-800" : "text-slate-400"}`}>MUGEFCI</button>
                          <button onClick={() => setUseInsurance("cmu")} className={`px-2 py-0.5 rounded-md font-bold ${useInsurance === "cmu" ? "bg-slate-900 text-white dark:bg-slate-800" : "text-slate-400"}`}>CMU</button>
                        </div>
                      </div>

                      {cart.length > 0 ? (
                        <div className="space-y-2">
                          <div className="max-h-[80px] overflow-y-auto space-y-1.5 pr-1">
                            {cart.map((item) => (
                              <div key={item.medicine.name} className="flex justify-between items-center text-[11px]">
                                <span className="text-slate-600 dark:text-slate-300">
                                  {item.quantity}x {item.medicine.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">
                                    {(useInsurance === "mugefci" ? item.medicine.priceMugefci : useInsurance === "cmu" && item.medicine.cmuCovered ? item.medicine.pricePublic * 0.3 : item.medicine.pricePublic) * item.quantity} FCFA
                                  </span>
                                  <button onClick={() => removeFromCart(item.medicine.name)} className="text-rose-500 hover:text-rose-700">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Totals & Validate button */}
                          <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase">Total calculé ({useInsurance === "none" ? "Standard" : useInsurance})</span>
                              <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{cartTotal} FCFA</p>
                            </div>
                            <button
                              onClick={validateCart}
                              className="px-3 py-1.5 bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold text-[10px] rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-400 transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Confirmer panier
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 text-center py-4">
                          Votre panier est vide. Ajoutez des médicaments ci-dessus pour simuler le calcul automatique.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Bibliothèque d'Ordonnances Interactive Demo */}
                {selectedFeatureTab === "prescription" && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400">SAUVEGARDE EN LOCAL SUR TÉLÉPHONE</span>
                        
                        {/* Multiple deletion trigger */}
                        {selectedPrescriptions.length > 0 && (
                          <button
                            onClick={deleteSelectedPrescriptions}
                            className="text-xs text-rose-500 font-bold flex items-center gap-1 hover:underline"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Supprimer sélection ({selectedPrescriptions.length})
                          </button>
                        )}
                      </div>

                      {/* Saved prescriptions list */}
                      {savedPrescriptions.length > 0 ? (
                        <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                          {savedPrescriptions.map((pres) => {
                            const isChecked = selectedPrescriptions.includes(pres.id);
                            return (
                              <div
                                key={pres.id}
                                className={`p-3 rounded-xl border text-xs transition-all bg-white dark:bg-slate-900 ${
                                  isChecked ? "border-emerald-500 dark:border-emerald-500" : "border-slate-100 dark:border-slate-800"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleSelectPrescription(pres.id)}
                                      className="rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">{pres.id}</span>
                                    <span className="text-[9px] text-slate-400">{pres.date}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                      {pres.insurance}
                                    </span>
                                    <button
                                      onClick={() => deleteSinglePrescription(pres.id)}
                                      className="text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1">
                                  {pres.items.map(it => `${it.quantity}x ${it.medicine.name}`).join(", ")}
                                </div>
                                <div className="text-right text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                  Total : {pres.total} FCFA
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 text-center py-8">
                          Aucune ordonnance sauvegardée pour le moment. Allez sur le module "Panier" pour en valider une.
                        </p>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 italic text-center">
                      Sélection multiple possible pour supprimer l'historique complet.
                    </div>
                  </div>
                )}

                {/* 6. Mode Sombre Showcase */}
                {selectedFeatureTab === "darkmode" && (
                  <div className="space-y-4 flex-1 flex flex-col justify-center text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center mx-auto mb-2 text-xl shadow-inner">
                      {theme === "dark" ? "🌙" : "☀️"}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Thème Dynamique Actif</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-normal">
                      Ce simulateur s'adapte en temps réel à votre préférence. Vous pouvez configurer l'application GardePharma CI pour qu'elle suive les paramètres système ou forcer le mode sombre.
                    </p>
                    
                    {/* Inline Theme Changer */}
                    <div className="flex justify-center gap-2 mt-2">
                      <button
                        onClick={() => setTheme("light")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${theme === "light" ? "bg-white text-emerald-500 shadow-sm dark:bg-slate-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
                      >
                        ☀️ Mode Clair
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${theme === "dark" ? "bg-white text-emerald-500 shadow-sm dark:bg-slate-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
                      >
                        🌙 Mode Sombre
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Simulator Footer Disclaimer */}
              <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                GardePharma CI sauvegarde l'intégralité des ordonnances sur votre stockage local.
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECURE & TRUST (SÉCURITÉ ET CONFIANCE) */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
              🔒 Sécurité et confiance
            </span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
              Vos données de santé restent privées
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {APPLICATION_INFO.securityAndTrust.map((item, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {item.title === "Politique de confidentialité" && (
                  <button
                    onClick={() => setActiveModal("privacy")}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline self-start mt-4 flex items-center gap-1"
                  >
                    Lire la charte de confidentialité <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* WHY CHOOSE US (POURQUOI CHOISIR GARDEPHARMA CI) */}
      <section id="choisir" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
              🎯 Pourquoi choisir GardePharma CI ?
            </span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
              Simple, direct, et hautement optimisé
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-center">
            {APPLICATION_INFO.whyChooseUs.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-display font-extrabold text-base mx-auto mb-4">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* DOWNLOAD MODAL SIMULATION */}
      <section id="telechargement" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xs">
            <Smartphone className="w-8 h-8" />
          </div>

          <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Prêt à installer GardePharma CI ?
          </h2>

          {/* Live Download Counter Badge */}
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20 font-bold text-xs shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{downloadCount.toLocaleString("fr-FR")} téléchargements enregistrés</span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 max-w-lg mx-auto">
            Téléchargez le paquet d'installation APK direct. Notre package est analysé par Google Play Protect et 100% sans virus ni publicité invasive.
          </p>

          <div className="mt-8 max-w-md mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-inner">
            
            {/* Simulation of APK download progress */}
            {downloadStep === "idle" && (
              <div className="space-y-4">
                <button
                  onClick={triggerApkDownload}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Obtenir l'APK (GardePharmaCI.apk)
                </button>
                <p className="text-[10px] text-slate-400">Compatible avec tous les smartphones Android (v8.0+)</p>
              </div>
            )}

            {downloadStep === "completed" && (
              <div className="py-4 space-y-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-lg">✓</div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Fichier APK téléchargé avec succès !</p>
                  <p className="text-[10px] text-slate-400 mt-1">Vous pouvez ouvrir le fichier GardePharmaCI.apk sur votre téléphone pour lancer l'installation.</p>
                </div>
                <button
                  onClick={resetDownload}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Télécharger à nouveau
                </button>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* CONTACT & SUPPORT (CONTACT ET SUPPORT) */}
      <section id="contact" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact Info (Left) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                  📞 Contact et support
                </span>
                <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
                  Discutons ensemble
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                  {APPLICATION_INFO.contact.description} Que vous ayez repéré un bug, que vous vouliez soumettre des suggestions d'amélioration ou nous faire un retour d'expérience :
                </p>

                <div className="mt-8 space-y-4">
                  
                  {/* Email contact row */}
                  <a
                    href={`mailto:${APPLICATION_INFO.contact.email}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-400 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Nous écrire par Email</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{APPLICATION_INFO.contact.email}</span>
                    </div>
                  </a>

                  {/* WhatsApp contact row */}
                  <a
                    href={`https://wa.me/${APPLICATION_INFO.contact.whatsApp.replace(/[\s+]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-400 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                      💬
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Support WhatsApp direct</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{APPLICATION_INFO.contact.whatsApp}</span>
                    </div>
                  </a>

                </div>
              </div>

              <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
                <span className="text-xs text-slate-400">GardePharma CI s'engage à vous répondre sous 24h. Votre santé est notre priorité.</span>
              </div>
            </div>

            {/* Quick Contact Form (Right) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mb-6">
                Envoyer un message de suggestion ou signalement
              </h3>

              {formSubmitted ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 p-6 rounded-2xl text-center space-y-2">
                  <p className="text-sm font-bold">Message envoyé avec succès !</p>
                  <p className="text-xs">Merci pour votre précieuse collaboration. Nous étudierons votre message très rapidement.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Votre Nom</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white"
                        placeholder="Ex: Kouassi Jean"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Votre Email</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white"
                        placeholder="Ex: jean@mail.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Objet du message</label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white"
                      placeholder="Ex: Proposition de pharmacie manquante"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Votre Message</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white resize-none"
                      placeholder="Décrivez votre suggestion ou signalez un bug ici..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-emerald-400 transition-colors"
                  >
                    Envoyer le Message
                  </button>
                </form>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Column 1: App identity & details */}
            <div className="md:col-span-5 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <Logo size={32} />
                <span className="font-display font-extrabold text-lg text-white">GardePharma CI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                GardePharma CI est une application d'orientation santé publique à usage entièrement gratuit. Nous ne sommes affiliés à aucune pharmacie physique ou organisme officiel de l'État.
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                Code ID : a5d5e775-3f64-4343-9fd9-edfe5367f897
              </div>
            </div>

            {/* Column 2: Legal compliance links */}
            <div className="md:col-span-4 space-y-4 text-left">
              <h5 className="font-bold text-white text-xs uppercase tracking-widest">Conformité Légale</h5>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setActiveModal("privacy")}
                  className="text-slate-400 hover:text-emerald-400 transition-colors text-xs flex items-center gap-1.5 self-start"
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" /> Politique de Confidentialité
                </button>
                <button
                  onClick={() => setActiveModal("cgu")}
                  className="text-slate-400 hover:text-emerald-400 transition-colors text-xs flex items-center gap-1.5 self-start"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" /> Conditions Générales d'Utilisation
                </button>
              </div>
            </div>

            {/* Column 3: Contact quick information */}
            <div className="md:col-span-3 space-y-4 text-left">
              <h5 className="font-bold text-white text-xs uppercase tracking-widest">Support de l'app</h5>
              <p className="text-xs leading-normal">
                GardePharma CI Support Team<br />
                Email : {APPLICATION_INFO.contact.email}<br />
                WhatsApp : {APPLICATION_INFO.contact.whatsApp}
              </p>
              <p className="text-[11px] text-slate-500 italic">
                Toutes les données de vos ordonnances restent stockées de manière strictement confidentielle sur votre téléphone.
              </p>
            </div>

          </div>

          {/* Copyright block */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-8 border-t border-slate-850">
            <p>
              Copyright © 2026 GardePharma CI. Tous droits réservés.
            </p>
            <p className="flex items-center gap-1">
              Votre santé, notre priorité ! 💚 🇨🇮
            </p>
          </div>

        </div>
      </footer>

      {/* REGULATORY LEGAL COMPLIANCE MODALS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-left"
            >
              
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-850">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  {activeModal === "privacy" && <Lock className="w-5 h-5" />}
                  {activeModal === "cgu" && <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                    {activeModal === "privacy" && "Politique de Confidentialité"}
                    {activeModal === "cgu" && "Conditions Générales d'Utilisation"}
                  </h4>
                  <p className="text-xs text-slate-500">GardePharma CI • Document d'information</p>
                </div>
              </div>

              {/* Content formatted with clean CSS */}
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed whitespace-pre-line prose dark:prose-invert">
                {activeModal === "privacy" && PRIVACY_POLICY}
                {activeModal === "cgu" && TERMS_OF_SERVICE}
              </div>

              {/* Footer Modal */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Dernière révision : Juillet 2026</span>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-400 transition-colors"
                >
                  Fermer
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
