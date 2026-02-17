import { useState, useEffect } from "react";
import { Navigation } from "@/app/components/Navigation";
import { Dashboard } from "@/app/components/Dashboard";
import { Reports } from "@/app/components/Reports";
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
  const [activeView, setActiveView] = useState<'dashboard' | 'reports'>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

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
        prescribedBy: m.prescribed_by
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
      const newMedication = {
        user_id: user.id,
        name: formData.name,
        dosage: formData.dosage,
        unit: formData.unit,
        times: formData.times,
        start_date: formData.startDate,
        end_date: formData.endDate,
        instructions: formData.instructions,
        condition: formData.condition,
        prescribed_by: formData.prescribedBy
      };

      const { data, error } = await supabase
        .from('medications')
        .insert([newMedication])
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
        prescribedBy: data.prescribed_by
      };

      setMedications([...medications, formattedMed]);
      toast.success(`${formData.name} added to your medications`);

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
              <Dashboard
                medications={medications}
                onAddMedication={() => user ? setShowAddForm(true) : setShowAuth(true)}
                user={userForComponents}
                onSignIn={handleSignInPrompt}
                doseHistory={doseHistory}
                onMarkTaken={handleMarkTaken}
                onMarkMissed={handleMarkMissed}
                lastSyncTime={lastSyncTime}
              />
            ) : (
              <Reports
                medications={medications}
                doseHistory={doseHistory}
                user={userForComponents}
                onSignIn={handleSignInPrompt}
              />
            )}

            {showAddForm && user && (
              <AddMedicationForm
                onClose={() => setShowAddForm(false)}
                onSave={handleSaveMedication}
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

