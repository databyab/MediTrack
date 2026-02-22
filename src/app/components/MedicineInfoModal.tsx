import { useState, useEffect } from "react";
import { X, Pill, ShieldAlert, BookOpen, Clock, Activity, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface MedicineInfoModalProps {
    medicationName: string;
    onClose: () => void;
}

interface MedicineDetails {
    description: string;
    uses: string[];
    sideEffects: string[];
    precautions: string[];
    dosageInfo: string;
}

export function MedicineInfoModal({ medicationName, onClose }: MedicineInfoModalProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [details, setDetails] = useState<MedicineDetails | null>(null);

    useEffect(() => {
        async function fetchMedicineInfo() {
            setLoading(true);
            setError(null);

            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                setError("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
                setLoading(false);
                return;
            }

            try {
                const prompt = `Provide detailed information about the medication "${medicationName}". 
        Return the response in JSON format with the following structure:
        {
          "description": "Brief overview of what the medicine is",
          "uses": ["use 1", "use 2"],
          "sideEffects": ["effect 1", "effect 2"],
          "precautions": ["precaution 1", "precaution 2"],
          "dosageInfo": "General dosage information"
        }
        Important: Provide only the JSON object, no other text. Be concise and accurate. Mention it's for informational purposes only.`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch from Gemini API');
                }

                const data = await response.json();
                const textResponse = data.candidates[0].content.parts[0].text;

                // Extract JSON from the response (sometimes Gemini wraps it in code blocks)
                const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedData = JSON.parse(jsonMatch[0]);
                    setDetails(parsedData);
                } else {
                    throw new Error('Could not parse AI response');
                }
            } catch (err) {
                console.error("Error fetching medicine info:", err);
                setError("Couldn't retrieve information for this medication. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        fetchMedicineInfo();
    }, [medicationName]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl"
                style={{ border: '1px solid rgba(15, 118, 110, 0.1)' }}
            >
                {/* Header */}
                <div className="p-6 sm:p-8 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-200">
                            <Pill className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                                {medicationName}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Sparkles className="w-3 h-3 text-teal-600" />
                                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">AI-Powered Insights</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/80 text-slate-400 hover:text-slate-600 transition-all shadow-sm"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-teal-600 animate-pulse" />
                                </div>
                            </div>
                            <p className="mt-6 text-slate-600 font-medium">Consulting medical database...</p>
                            <p className="text-xs text-slate-400 mt-2 italic">Using Gemini AI for real-time information</p>
                        </div>
                    ) : error ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                                <ShieldAlert className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-slate-800 font-semibold mb-2">{error}</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    ) : (
                        details && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Description */}
                                <section>
                                    <p className="text-slate-600 leading-relaxed text-lg italic">
                                        "{details.description}"
                                    </p>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Uses */}
                                    <section className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-3 text-emerald-700">
                                            <BookOpen className="w-5 h-5" />
                                            <h3 className="font-bold">Common Uses</h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {details.uses.map((use, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                                    {use}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    {/* Side Effects */}
                                    <section className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                                        <div className="flex items-center gap-2 mb-3 text-amber-700">
                                            <Activity className="w-5 h-5" />
                                            <h3 className="font-bold">Potential Side Effects</h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {details.sideEffects.map((effect, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                                    {effect}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </div>

                                {/* Precautions */}
                                <section className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100 text-sky-900">
                                    <div className="flex items-center gap-2 mb-3 text-sky-700 font-bold">
                                        <ShieldAlert className="w-5 h-5" />
                                        <h3>Important Precautions</h3>
                                    </div>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {details.precautions.map((precaution, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-sky-800">
                                                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                                                {precaution}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                {/* Dosage */}
                                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Clock className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dosage Guidance</h4>
                                        <p className="text-sm text-slate-700">{details.dosageInfo}</p>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-[10px] text-slate-400 text-center leading-normal">
                                        DISCLAIMER: This information is AI-generated for educational purposes only and does not constitute medical advice. Always consult with a healthcare professional before making any changes to your medication or treatment plan.
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </motion.div>
        </div>
    );
}
