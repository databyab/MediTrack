import { Clock, Pill, TrendingUp, Calendar, CheckCircle2, Heart, Activity, Shield, ArrowRight, Lock, XCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

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
  medicationId: string;
  scheduledTime: string;
  takenAt: string;
  date: string;
  status?: 'taken' | 'missed';
}

interface DashboardProps {
  medications: Medication[];
  onAddMedication: () => void;
  user: { email: string } | null;
  onSignIn: () => void;
  doseHistory: DoseHistory[];
  onMarkTaken: (medicationId: string, scheduledTime: string) => void;
  onMarkMissed: (medicationId: string, scheduledTime: string) => void;
  lastSyncTime?: string;
}

export function Dashboard({ medications, onAddMedication, user, onSignIn, doseHistory, onMarkTaken, onMarkMissed, lastSyncTime }: DashboardProps) {
  const lastCheckedRef = useRef<string>('');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const todayDate = new Date().toISOString().split('T')[0];

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      if (lastCheckedRef.current === currentTime) return; // Already checked this minute
      lastCheckedRef.current = currentTime;

      medications.forEach(med => {
        if (med.times.includes(currentTime)) {
          // Check if already taken today
          const isTakenOrMissed = doseHistory.some(h =>
            h.medicationId === med.id &&
            h.scheduledTime === currentTime &&
            h.date === todayDate
          );

          if (!isTakenOrMissed) {
            // Show toast
            toast.info(`Reminder: Take ${med.name} (${med.dosage} ${med.unit})`, {
              duration: 10000,
              action: {
                label: 'Mark Taken',
                onClick: () => onMarkTaken(med.id, currentTime)
              }
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [medications, doseHistory, todayDate, onMarkTaken]);

  // Get today's scheduled medications
  const todaysMedications = medications.flatMap(med =>
    med.times.map(time => ({
      ...med,
      scheduledTime: time,
      isTaken: doseHistory.some(
        h => h.medicationId === med.id && h.scheduledTime === time && h.date === todayDate && (h.status === 'taken' || !h.status)
      ),
      isMissed: doseHistory.some(
        h => h.medicationId === med.id && h.scheduledTime === time && h.date === todayDate && h.status === 'missed'
      )
    }))
  ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  // Calculate today's progress
  const totalDosesToday = todaysMedications.length;
  const takenDosesToday = todaysMedications.filter(m => m.isTaken).length;

  // If not logged in, show preview mode
  if (!user) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
        {/* Hero */}
        <section className="mb-8">
          <h1 className="mb-3" style={{ color: '#0F172A', fontSize: '28px', fontWeight: 700 }}>
            Your health, on track.
          </h1>
          <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6', maxWidth: '520px' }}>
            Smart medication tracking that keeps you healthy and on schedule. Sign in to get started.
          </p>
        </section>

        {/* Medicine Tracking Visual */}
        <div
          className="rounded-2xl p-6 lg:p-8 mb-6"
          style={{
            background: 'linear-gradient(135deg, #0F766E 0%, #134E4A 100%)',
            boxShadow: '0 20px 40px rgba(15, 118, 110, 0.25)'
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: '#99F6E4' }} />
              <span style={{ color: '#CCFBF1', fontSize: '14px', fontWeight: 600 }}>Today's Schedule</span>
            </div>
            <span style={{ color: '#99F6E4', fontSize: '13px' }}>3 of 4 taken</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div className="h-full rounded-full" style={{ width: '75%', background: 'linear-gradient(90deg, #5EEAD4, #99F6E4)' }} />
          </div>

          {/* Mock medication items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(153, 246, 228, 0.2)' }}>
                <Pill className="w-5 h-5" style={{ color: '#99F6E4' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Vitamin D3</p>
                <p style={{ color: '#99F6E4', fontSize: '12px' }}>1000 IU · 8:00 AM</p>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#34D399' }}>
                <span style={{ color: 'white', fontSize: '13px' }}>✓</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(153, 246, 228, 0.2)' }}>
                <Heart className="w-5 h-5" style={{ color: '#99F6E4' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Omega-3</p>
                <p style={{ color: '#99F6E4', fontSize: '12px' }}>500 mg · 12:00 PM</p>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#34D399' }}>
                <span style={{ color: 'white', fontSize: '13px' }}>✓</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(153, 246, 228, 0.3)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(153, 246, 228, 0.2)' }}>
                <Clock className="w-5 h-5" style={{ color: '#99F6E4' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Melatonin</p>
                <p style={{ color: '#99F6E4', fontSize: '12px' }}>5 mg · 9:00 PM</p>
              </div>
              <span style={{ color: '#FBBF24', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>Upcoming</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'white', border: '1px solid #E6EAF0' }}>
            <div className="w-9 h-9 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F0FDF4' }}>
              <Shield className="w-4 h-4" style={{ color: '#16A34A' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>98%</p>
            <p style={{ fontSize: '12px', color: '#475569' }}>Adherence</p>
          </div>
          <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'white', border: '1px solid #E6EAF0' }}>
            <div className="w-9 h-9 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
              <Calendar className="w-4 h-4" style={{ color: '#EA580C' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>14</p>
            <p style={{ fontSize: '12px', color: '#475569' }}>Day Streak</p>
          </div>
          <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'white', border: '1px solid #E6EAF0' }}>
            <div className="w-9 h-9 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
              <Pill className="w-4 h-4" style={{ color: '#2563EB' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>4</p>
            <p style={{ fontSize: '12px', color: '#475569' }}>Active Meds</p>
          </div>
        </div>

        {/* Sign In CTA */}
        <div className="text-center">
          <Button
            onClick={onSignIn}
            className="h-12 px-8 gap-2"
            style={{ backgroundColor: '#0F766E', fontSize: '15px' }}
          >
            Sign In or Create Account
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="mt-3" style={{ fontSize: '13px', color: '#475569' }}>
            Start tracking your medications today
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
      {/* Hero Section */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="mb-3" style={{ color: '#0F172A' }}>
              Track your medications, doses, and schedule.
            </h1>
          </div>
          {lastSyncTime && (
            <div className="sm:text-right">
              <p style={{ fontSize: '12px', color: '#4D7C6F', fontWeight: 600 }}>✓ Progress synced</p>
              <p style={{ fontSize: '12px', color: '#475569' }}>{lastSyncTime}</p>
            </div>
          )}
        </div>
      </section>

      {/* Today's Progress Bar */}
      {totalDosesToday > 0 && (
        <section className="mb-6">
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ backgroundColor: 'white', border: '1px solid #E6EAF0' }}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  Today's Progress
                </p>
                <p style={{ fontSize: '14px', color: '#475569' }}>
                  {takenDosesToday} of {totalDosesToday} doses
                </p>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: '#F7FAF9' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    backgroundColor: '#4D7C6F',
                    width: `${totalDosesToday > 0 ? (takenDosesToday / totalDosesToday) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
            {takenDosesToday === totalDosesToday && totalDosesToday > 0 && (
              <CheckCircle2 className="w-6 h-6" style={{ color: '#4D7C6F' }} />
            )}
          </div>
        </section>
      )}

      {/* Today's Medications Panel */}
      <section className="mb-10">
        <div
          className="rounded-[18px] p-6 lg:p-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0px 8px 24px rgba(2, 6, 23, 0.08)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="mb-1">Today's Medications</h2>
              <p style={{ fontSize: '12px', color: '#475569' }}>{today}</p>
            </div>
            <Clock className="w-6 h-6" style={{ color: '#6B9080' }} />
          </div>

          {todaysMedications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F7FAF9' }}>
                <Pill className="w-8 h-8" style={{ color: '#6B9080' }} />
              </div>
              <p style={{ color: '#0F172A', marginBottom: '4px', fontWeight: 600 }}>
                No doses scheduled yet
              </p>
              <p style={{ fontSize: '12px', color: '#475569', marginBottom: '24px' }}>
                Add a medication to get started
              </p>
              <Button
                onClick={onAddMedication}
                variant="outline"
              >
                Add Your First Medication
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysMedications.map((med, idx) => (
                <div
                  key={`${med.id}-${idx}`}
                  className="flex items-center justify-between p-4 rounded-xl border"
                  style={{
                    backgroundColor: med.isTaken ? '#F0F9F4' : med.isMissed ? '#FEF2F2' : '#F7FAF9',
                    borderColor: med.isTaken ? '#4D7C6F' : med.isMissed ? '#FCA5A5' : '#E6EAF0'
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex flex-shrink-0 items-center justify-center"
                      style={{ backgroundColor: med.isTaken ? '#4D7C6F' : med.isMissed ? '#EF4444' : 'white' }}
                    >
                      {med.isTaken ? (
                        <CheckCircle2 className="w-6 h-6" style={{ color: 'white' }} />
                      ) : med.isMissed ? (
                        <XCircle className="w-6 h-6" style={{ color: 'white' }} />
                      ) : (
                        <Pill className="w-6 h-6" style={{ color: '#0F766E' }} />
                      )}
                    </div>
                    <div>
                      <h3 className="mb-1">{med.name}</h3>
                      <p style={{ fontSize: '12px', color: '#475569' }}>
                        {med.dosage} {med.unit} • {med.scheduledTime}
                      </p>
                    </div>
                  </div>
                  {!med.isTaken && !med.isMissed ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onMarkTaken(med.id, med.scheduledTime)}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: '#0F766E', color: 'white' }}
                      >
                        Taken
                      </button>
                      <button
                        onClick={() => onMarkMissed(med.id, med.scheduledTime)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border"
                        style={{ borderColor: '#FCA5A5', color: '#EF4444', backgroundColor: 'white' }}
                      >
                        Missed
                      </button>
                    </div>
                  ) : (
                    <div style={{ color: med.isTaken ? '#4D7C6F' : '#EF4444', fontSize: '14px', fontWeight: 600 }}>
                      {med.isTaken ? '✓ Completed' : '✕ Missed'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="mb-10">
        <h2 className="mb-6">What MediTrack helps you with</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="p-6 rounded-[16px]"
            style={{
              backgroundColor: 'white',
              border: '1px solid #E6EAF0'
            }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#F7FAF9' }}>
              <Pill className="w-6 h-6" style={{ color: '#0F766E' }} />
            </div>
            <h3 className="mb-2">Track every dose</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Log doses as you take them
            </p>
          </div>

          <div
            className="p-6 rounded-[16px]"
            style={{
              backgroundColor: 'white',
              border: '1px solid #E6EAF0'
            }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#F7FAF9' }}>
              <Calendar className="w-6 h-6" style={{ color: '#4D7C6F' }} />
            </div>
            <h3 className="mb-2">Monitor adherence</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              See how consistently you take medications
            </p>
          </div>

          <div
            className="p-6 rounded-[16px]"
            style={{
              backgroundColor: 'white',
              border: '1px solid #E6EAF0'
            }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#F7FAF9' }}>
              <TrendingUp className="w-6 h-6" style={{ color: '#6B9080' }} />
            </div>
            <h3 className="mb-2">Identify patterns</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Understand missed-dose trends
            </p>
          </div>
        </div>
      </section>

      {/* Health Insights Section (Locked) */}
      <section>
        <h2 className="mb-6">Health Insights</h2>
        <div
          className="rounded-[18px] p-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0px 8px 24px rgba(2, 6, 23, 0.08)'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LockedInsightCard
              title="Adherence Score"
              description="Overall medication compliance"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <LockedInsightCard
              title="Missed Dose Patterns"
              description="When you're most likely to miss doses"
              icon={<Clock className="w-5 h-5" />}
            />
            <LockedInsightCard
              title="Consistency Streaks"
              description="Days of perfect adherence"
              icon={<Calendar className="w-5 h-5" />}
            />
          </div>

          <div className="mt-6 pt-6 border-t" style={{ borderColor: '#E6EAF0' }}>
            <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center' }}>
              Available after 7 days of tracking
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function LockedInsightCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div
      className="p-6 rounded-xl relative"
      style={{
        backgroundColor: '#F7FAF9',
        border: '1px solid #E6EAF0',
        opacity: 0.6
      }}
    >
      <div className="absolute top-4 right-4">
        <Lock className="w-4 h-4" style={{ color: '#475569' }} />
      </div>
      <div className="mb-3" style={{ color: '#6B9080' }}>
        {icon}
      </div>
      <h4 className="mb-1">{title}</h4>
      <p style={{ fontSize: '12px', color: '#475569' }}>{description}</p>
    </div>
  );
}