import { Calendar, TrendingUp, Clock, AlertCircle, BarChart3 } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';

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

interface ReportsProps {
  medications: Medication[];
  doseHistory: DoseHistory[];
  user: { email: string } | null;
  onSignIn: () => void;
}

export function Reports({ medications, doseHistory, user, onSignIn }: ReportsProps) {
  // If not logged in, show auth prompt
  if (!user) {
    return (
      <div className="max-w-[1200px] mx-auto px-8 py-10">
        <section className="mb-10">
          <h1 className="mb-3" style={{ color: '#0F172A' }}>
            Medication Reports & Insights
          </h1>
        </section>

        <div
          className="rounded-[18px] p-12 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0px 8px 24px rgba(2, 6, 23, 0.08)'
          }}
        >
          <BarChart3 className="w-16 h-16 mx-auto mb-6" style={{ color: '#6B9080' }} />
          <h2 className="mb-3">Sign in to view reports</h2>
          <p style={{ color: '#475569', maxWidth: '420px', margin: '0 auto 32px', lineHeight: '1.6' }}>
            Track adherence trends and medication history.
          </p>
          <button
            onClick={onSignIn}
            className="h-11 px-8 rounded-lg"
            style={{ backgroundColor: '#0F766E', color: 'white', fontWeight: 600 }}
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  // Calculate adherence metrics
  const totalDoses = medications.reduce((acc, med) => acc + med.times.length, 0);
  const activeMedications = medications.length;

  // Calculate adherence rate from history
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const adherenceData = last7Days.map(date => {
    const scheduled = totalDoses;
    // Only count doses that were actually taken (not missed)
    const taken = doseHistory.filter(h => h.date === date && h.status === 'taken').length;
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      adherence: scheduled > 0 ? Math.round((taken / scheduled) * 100) : 0,
      taken,
      scheduled
    };
  });

  // Calculate overall adherence (only taken doses)
  const takenDosesCount = doseHistory.filter(h => h.status === 'taken').length;
  const overallAdherence = doseHistory.length > 0
    ? Math.round((takenDosesCount / (totalDoses * 7)) * 100)
    : 0;

  const currentStreak = calculateStreak(doseHistory);

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-10">
      {/* Header */}
      <section className="mb-10">
        <h1 className="mb-3" style={{ color: '#0F172A' }}>
          Medication Reports & Insights
        </h1>
      </section>

      {/* Overview Stats */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Active Medications"
            value={activeMedications.toString()}
            subtitle="Currently tracking"
            icon={<Calendar className="w-6 h-6" style={{ color: '#0F766E' }} />}
            color="#0F766E"
          />
          <StatCard
            title="Daily Doses"
            value={totalDoses.toString()}
            subtitle="Scheduled per day"
            icon={<Clock className="w-6 h-6" style={{ color: '#6B9080' }} />}
            color="#6B9080"
          />
          <StatCard
            title="7-Day Adherence"
            value={overallAdherence > 0 ? `${overallAdherence}%` : "—"}
            subtitle={currentStreak > 0 ? `${currentStreak} day streak` : "Start tracking"}
            icon={<TrendingUp className="w-6 h-6" style={{ color: '#4D7C6F' }} />}
            color="#4D7C6F"
          />
        </div>
      </section>

      {/* Adherence Chart */}
      {doseHistory.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-6">Adherence Timeline</h2>
          <div
            className="rounded-[18px] p-8"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0px 8px 24px rgba(2, 6, 23, 0.08)'
            }}
          >
            <div className="mb-6">
              <h3 className="mb-2">7-Day Adherence Rate</h3>
              <p style={{ fontSize: '12px', color: '#475569' }}>
                Percentage of scheduled doses taken each day
              </p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={adherenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#475569' }}
                  stroke="#E6EAF0"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#475569' }}
                  stroke="#E6EAF0"
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E6EAF0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'adherence') return [`${value}%`, 'Adherence'];
                    return [value, name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="adherence"
                  stroke="#0F766E"
                  strokeWidth={3}
                  dot={{ fill: '#0F766E', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Medication List */}
      <section className="mb-10">
        <h2 className="mb-6">All Medications</h2>
        <div
          className="rounded-[18px] p-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0px 8px 24px rgba(2, 6, 23, 0.08)'
          }}
        >
          {medications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F7FAF9' }}>
                <AlertCircle className="w-8 h-8" style={{ color: '#6B9080' }} />
              </div>
              <p style={{ color: '#475569' }}>
                No medications added yet. Start tracking to see detailed reports.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((med) => (
                <MedicationCard key={med.id} medication={med} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="p-6 rounded-[16px]"
      style={{
        backgroundColor: 'white',
        border: '1px solid #E6EAF0'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F7FAF9' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 600, color: color, marginBottom: '4px' }}>
        {value}
      </div>
      <h4 className="mb-1">{title}</h4>
      <p style={{ fontSize: '12px', color: '#475569' }}>{subtitle}</p>
    </div>
  );
}

function MedicationCard({ medication }: { medication: Medication }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ backgroundColor: '#F7FAF9', borderColor: '#E6EAF0' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="mb-1">{medication.name}</h3>
          <p style={{ fontSize: '14px', color: '#475569' }}>
            {medication.dosage} {medication.unit}
          </p>
        </div>
        {medication.condition && (
          <span
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: '#E6EAF0',
              color: '#0F172A',
              fontSize: '12px'
            }}
          >
            {medication.condition}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Schedule</p>
          <p style={{ fontSize: '14px', color: '#0F172A' }}>
            {medication.times.join(', ')}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Duration</p>
          <p style={{ fontSize: '14px', color: '#0F172A' }}>
            {formatDate(medication.startDate)} - {medication.endDate ? formatDate(medication.endDate) : 'Ongoing'}
          </p>
        </div>
      </div>

      {medication.instructions && (
        <div className="pt-4 border-t" style={{ borderColor: '#E6EAF0' }}>
          <p style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Instructions</p>
          <p style={{ fontSize: '14px', color: '#0F172A' }}>{medication.instructions}</p>
        </div>
      )}

      {medication.prescribedBy && (
        <div className="pt-4 mt-4 border-t" style={{ borderColor: '#E6EAF0' }}>
          <p style={{ fontSize: '12px', color: '#475569' }}>
            Prescribed by {medication.prescribedBy}
          </p>
        </div>
      )}
    </div>
  );
}

function calculateStreak(doseHistory: DoseHistory[]): number {
  const today = new Date();
  let streak = 0;

  // Only consider taken doses for streak
  const takenDoses = doseHistory.filter(h => h.status === 'taken');

  // Sort by date descending (newest first)
  takenDoses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (takenDoses.length === 0) return 0;

  // Get unique dates where meds were taken
  const takenDates = Array.from(new Set(takenDoses.map(d => d.date)));

  // Check if today or yesterday was taken to start the streak
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!takenDates.includes(todayStr) && !takenDates.includes(yesterdayStr)) {
    return 0;
  }

  // Calculate streak logic: consecutive days backwards
  let currentCheckDate = new Date(today);

  // If not taken today, start checking from yesterday
  if (!takenDates.includes(todayStr)) {
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
  }

  while (true) {
    const checkDateStr = currentCheckDate.toISOString().split('T')[0];
    if (takenDates.includes(checkDateStr)) {
      streak++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}