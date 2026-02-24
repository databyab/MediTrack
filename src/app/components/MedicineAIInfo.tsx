import { useState, useEffect } from "react";
import { ShieldAlert, BookOpen, Clock, Activity, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "@/supabase";

interface MedicineAIInfoProps {
    medicationName: string;
}

interface MedicineDetails {
    description: string;
    uses: string[];
    sideEffects: string[];
    precautions: string[];
    dosageInfo: string;
}

export function MedicineAIInfo({ medicationName }: MedicineAIInfoProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [details, setDetails] = useState<MedicineDetails | null>(null);

    useEffect(() => {
        async function fetchMedicineInfo() {
            setLoading(true);
            setError(null);

            try {
                // Call Supabase Edge Function instead of direct Gemini SDK
                const { data, error: functionError } = await supabase.functions.invoke('get-medicine-info', {
                    body: { medicationName }
                });

                if (functionError) {
                    console.error("Supabase function error:", functionError);
                    throw new Error("Failed to fetch medicine info from secure service.");
                }

                if (data.error) {
                    throw new Error(data.error);
                }

                setDetails(data);
            } catch (err: any) {
                console.error("MediTrack AI Error:", err);
                const errorMessage = err.message || "";
                if (errorMessage.includes("location") || errorMessage.includes("supported")) {
                    setError("Region Not Supported.");
                } else if (errorMessage.includes("Key")) {
                    setError("Security Configuration Issue.");
                } else {
                    setError("AI service unavailable.");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchMedicineInfo();
    }, [medicationName]);

    if (loading) {
        return (
            <div className="py-8 flex flex-col items-center justify-center text-center bg-teal-50/30 rounded-2xl border border-teal-100/50 mt-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-3 border-teal-100 border-t-teal-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-teal-600 animate-pulse" />
                    </div>
                </div>
                <p className="mt-4 text-sm text-teal-700 font-medium">Analyzing {medicationName}...</p>
                <div className="flex items-center gap-1.5 mt-1">
                    <Sparkles className="w-3 h-3 text-teal-500" />
                    <span className="text-[10px] text-teal-600/70 font-semibold uppercase tracking-wider">AI Insight Engine</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mt-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
        );
    }

    if (!details) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
        >
            <div className="bg-white rounded-2xl border border-teal-100/50 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-teal-50/50 to-emerald-50/50 px-4 py-2 border-b border-teal-100/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">AI Analysis</span>
                    </div>
                    <span className="text-[9px] text-slate-400 italic">For educational purposes</span>
                </div>

                <div className="p-4 space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-teal-200 pl-3">
                        "{details.description}"
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/50">
                            <div className="flex items-center gap-1.5 mb-2 text-emerald-700">
                                <BookOpen className="w-3.5 h-3.5" />
                                <h4 className="text-[11px] font-bold uppercase tracking-wide">Common Uses</h4>
                            </div>
                            <ul className="space-y-1.5">
                                {details.uses.slice(0, 3).map((use, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                        {use}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-amber-50/30 p-3 rounded-xl border border-amber-100/50">
                            <div className="flex items-center gap-1.5 mb-2 text-amber-700">
                                <Activity className="w-3.5 h-3.5" />
                                <h4 className="text-[11px] font-bold uppercase tracking-wide">Side Effects</h4>
                            </div>
                            <ul className="space-y-1.5">
                                {details.sideEffects.slice(0, 3).map((effect, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                        {effect}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-sky-50/30 p-3 rounded-xl border border-sky-100/50">
                            <div className="flex items-center gap-1.5 mb-2 text-sky-700">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <h4 className="text-[11px] font-bold uppercase tracking-wide">Important Precautions</h4>
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                                {details.precautions.slice(0, 4).map((precaution, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                                        <div className="w-1 h-1 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                                        {precaution}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
                            <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Dosage Guidance</h4>
                                <p className="text-xs text-slate-600 leading-tight">{details.dosageInfo}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-[9px] text-slate-400 text-center px-4 leading-tight">
                AI reflection of medical data. Consult a professional for medical advice.
            </p>
        </motion.div>
    );
}
