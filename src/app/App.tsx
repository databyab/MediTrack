import { useState, useEffect } from "react";
import { Plus, Pill, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Navigation } from "@/app/components/Navigation";
import { DashboardView } from "@/app/components/DashboardView";
import { ReportsView } from "@/app/components/ReportsView";
import { AddMedicationForm, MedicationFormData } from "@/app/components/AddMedicationForm";
import { AuthScreen } from "@/app/components/AuthScreen";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from "sonner";
import { supabase } from "@/supabase";

interface Medication {
  id: string;
  name: string;
  dosage: number;
  unit: string;
  times: string[];
  startDate: string;
  endDate?: string;
  instructions?: string;
  condition?: string;
  prescribedBy?: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'every-other-day';
  selectedDays: string[];
}

interface DoseHistory {
  id?: string;
  medicationId: string;
  scheduledTime: string;
  takenAt: string;
  date: string;
  status?: 'taken' | 'missed';
}

export default function App() {
  const { user, loading, signOut, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'reports' | 'manage'>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  // Load user data when user logs in
  useEffect(() => {
    if (user) {
      fetchUserData(user.id);
      setShowAuth(false);
    } else {
      setMedications([]);
      setDoseHistory([]);
      setLastSyncTime('');
    }
  }, [user]);

  // Update sync time whenever data changes
  useEffect(() => {
    if (user && (medications.length > 0 || doseHistory.length > 0)) {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setLastSyncTime(`Synced at ${time}`);
    }
  }, [medications, doseHistory, user]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch medications
      const { data: medsData, error: medsError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId);

      if (medsError) throw medsError;

      // Map DB snake_case to frontend camelCase
      const formattedMeds: Medication[] = (medsData || []).map(m => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        unit: m.unit,
        times: m.times,
        startDate: m.start_date,
        endDate: m.end_date,
        instructions: m.instructions,
        condition: m.condition,
        prescribedBy: m.prescribed_by,
        frequency: m.frequency as any || 'daily',
        selectedDays: m.selected_days || []
      }));

      setMedications(formattedMeds);

      // Fetch dose history
      const { data: historyData, error: historyError } = await supabase
        .from('dose_history')
        .select('*')
        .eq('user_id', userId);

      if (historyError) throw historyError;

      // Map DB snake_case to frontend camelCase
      const formattedHistory: DoseHistory[] = (historyData || []).map(h => ({
        id: h.id,
        medicationId: h.medication_id,
        scheduledTime: h.scheduled_time,
        takenAt: h.taken_at,
        date: h.date,
        status: h.status
      }));

      setDoseHistory(formattedHistory);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(`Failed to load your data: ${error.message || 'Unknown error'}`);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back to MediTrack');
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    const { error } = await signUpWithEmail(email, password);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Account created successfully! Check your email to confirm.');
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setActiveView('dashboard');
    toast.success('Logged out successfully');
  };

  const handleSaveMedication = async (formData: MedicationFormData) => {
    if (!user) {
      toast.error('Please sign in to add medications');
      return;
    }

    try {
      const medicationData = {
        user_id: user.id,
        name: formData.name,
        dosage: formData.dosage,
        unit: formData.unit,
        times: formData.times,
        start_date: formData.startDate,
        end_date: formData.endDate,
        instructions: formData.instructions,
        condition: formData.condition,
        prescribed_by: formData.prescribedBy,
        frequency: formData.frequency,
        selected_days: formData.selectedDays
      };

      if (editingMedication) {
        const { data, error } = await supabase
          .from('medications')
          .update(medicationData)
          .eq('id', editingMedication.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        const formattedMed: Medication = {
          id: data.id,
          name: data.name,
          dosage: data.dosage,
          unit: data.unit,
          times: data.times,
          startDate: data.start_date,
          endDate: data.end_date,
          instructions: data.instructions,
          condition: data.condition,
          prescribedBy: data.prescribed_by,
          frequency: data.frequency as any,
          selectedDays: data.selected_days || []
        };

        setMedications(medications.map(m => m.id === editingMedication.id ? formattedMed : m));
        toast.success(`${formData.name} updated successfully`);
        setEditingMedication(null);
      } else {
        const { data, error } = await supabase
          .from('medications')
          .insert([medicationData])
          .select()
          .single();

        if (error) throw error;

        const formattedMed: Medication = {
          id: data.id,
          name: data.name,
          dosage: data.dosage,
          unit: data.unit,
          times: data.times,
          startDate: data.start_date,
          endDate: data.end_date,
          instructions: data.instructions,
          condition: data.condition,
          prescribedBy: data.prescribed_by,
          frequency: data.frequency as any,
          selectedDays: data.selected_days || []
        };

        setMedications([...medications, formattedMed]);
        toast.success(`${formData.name} added to your medications`);
      }

    } catch (error: any) {
      console.error('Error saving medication:', error);
      toast.error(`Failed to save medication: ${error.message || 'Unknown error'}`);
    }
  };

  const handleMarkTaken = async (medicationId: string, scheduledTime: string) => {
    if (!user) {
      toast.error('Please sign in to track doses');
      return;
    }

    const now = new Date();
    const todayDate = now.toISOString().split('T')[0];

    try {
      const newDose = {
        user_id: user.id,
        medication_id: medicationId,
        scheduled_time: scheduledTime,
        taken_at: now.toISOString(),
        date: todayDate,
        status: 'taken'
      };

      const { data, error } = await supabase
        .from('dose_history')
        .insert([newDose])
        .select()
        .single();

      if (error) throw error;

      const formattedDose: DoseHistory = {
        id: data.id,
        medicationId: data.medication_id,
        scheduledTime: data.scheduled_time,
        takenAt: data.taken_at,
        date: data.date,
        status: data.status
      };

      setDoseHistory([...doseHistory, formattedDose]);

      const medication = medications.find(m => m.id === medicationId);
      toast.success(`${medication?.name} marked as taken`);

    } catch (error: any) {
      console.error('Error recording dose:', error);
      toast.error(`Failed to record dose: ${error.message || 'Unknown error'}`);
    }
  };

  const handleMarkMissed = async (medicationId: string, scheduledTime: string) => {
    if (!user) {
      toast.error('Please sign in to track doses');
      return;
    }

    const now = new Date();
    const todayDate = now.toISOString().split('T')[0];

    try {
      const newDose = {
        user_id: user.id,
        medication_id: medicationId,
        scheduled_time: scheduledTime,
        taken_at: now.toISOString(),
        date: todayDate,
        status: 'missed'
      };

      const { data, error } = await supabase
        .from('dose_history')
        .insert([newDose])
        .select()
        .single();

      if (error) throw error;

      const formattedDose: DoseHistory = {
        id: data.id,
        medicationId: data.medication_id,
        scheduledTime: data.scheduled_time,
        takenAt: data.taken_at,
        date: data.date,
        status: data.status
      };

      setDoseHistory([...doseHistory, formattedDose]);

      const medication = medications.find(m => m.id === medicationId);
      toast.error(`${medication?.name} marked as missed`);

    } catch (error: any) {
      console.error('Error recording missed dose:', error);
      toast.error(`Failed to record missed dose: ${error.message || 'Unknown error'}`);
    }
  };



  const handleDeleteMedication = async (medicationId: string) => {
    if (!user) {
      toast.error('Please sign in to delete medications');
      return;
    }

    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setMedications(medications.filter(m => m.id !== medicationId));
      toast.success('Medication deleted successfully');

    } catch (error: any) {
      console.error('Error deleting medication:', error);
      toast.error(`Failed to delete medication: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSignInPrompt = () => {
    setShowAuth(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7FAF9' }}>
        <div className="text-center">
          <div
            className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }}
          />
          <p style={{ color: '#475569', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const userForComponents = user ? { email: user.email ?? '' } : null;

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: '#F7FAF9' }}>
        {showAuth && !user ? (
          <AuthScreen
            onLogin={handleLogin}
            onSignUp={handleSignUp}
            onGoogleSignIn={handleGoogleSignIn}
          />
        ) : (
          <>
            <Navigation
              onAddMedication={() => {
                if (!user) {
                  setShowAuth(true);
                  toast.error('Please sign in to add medications');
                } else {
                  setShowAddForm(true);
                }
              }}
              activeView={activeView}
              onViewChange={setActiveView}
              user={userForComponents}
              onLogout={handleLogout}
            />

            {activeView === 'dashboard' ? (
              <DashboardView
                medications={medications}
                onAddMedication={() => user ? setShowAddForm(true) : setShowAuth(true)}
                user={userForComponents}
                onSignIn={handleSignInPrompt}
                doseHistory={doseHistory}
                onMarkTaken={handleMarkTaken}
                onMarkMissed={handleMarkMissed}
                lastSyncTime={lastSyncTime}
              />
            ) : activeView === 'reports' ? (
              <ReportsView
                medications={medications}
                doseHistory={doseHistory}
                user={userForComponents}
                onSignIn={handleSignInPrompt}
              />
            ) : (
              <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                  <h1 style={{ color: '#0F172A' }}>Manage Medications</h1>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    style={{ backgroundColor: '#0F766E' }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {medications.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                      <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No medications found. Add one to get started.</p>
                    </div>
                  ) : (
                    medications.map(med => (
                      <div
                        key={med.id}
                        className="bg-white p-6 rounded-2xl border transition-all hover:shadow-md"
                        style={{ borderColor: '#E6EAF0' }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F7FAF9' }}>
                            <Pill className="w-6 h-6" style={{ color: '#0F766E' }} />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingMedication(med);
                                setShowAddForm(true);
                              }}
                              className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${med.name}?`)) {
                                  handleDeleteMedication(med.id);
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{med.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{med.dosage} {med.unit} • {med.frequency}</p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Schedule</span>
                            <span className="font-medium text-gray-700">{med.times.join(', ')}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Started</span>
                            <span className="font-medium text-gray-700">{med.startDate}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {showAddForm && user && (
              <AddMedicationForm
                onClose={() => {
                  setShowAddForm(false);
                  setEditingMedication(null);
                }}
                onSave={handleSaveMedication}
                initialData={editingMedication ? {
                  name: editingMedication.name,
                  dosage: editingMedication.dosage,
                  unit: editingMedication.unit,
                  times: editingMedication.times,
                  startDate: editingMedication.startDate,
                  endDate: editingMedication.endDate,
                  isOngoing: !editingMedication.endDate,
                  instructions: editingMedication.instructions,
                  condition: editingMedication.condition,
                  prescribedBy: editingMedication.prescribedBy,
                  frequency: editingMedication.frequency,
                  selectedDays: editingMedication.selectedDays
                } : undefined}
              />
            )}
          </>
        )}
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            color: '#0F172A',
            border: '1px solid #E6EAF0',
            fontSize: '14px'
          },
          duration: 3000
        }}
      />
    </>
  );
}

