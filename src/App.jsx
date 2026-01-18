import React, { useState } from 'react';
import { Calendar, Pill, Clock, TrendingUp, Plus, Check, X, BarChart3, Trash2, Sparkles, Bell, Home, FileText, Settings } from 'lucide-react';

const MediTrack = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [medications, setMedications] = useState([]);
  const [intakeLog, setIntakeLog] = useState([]);

  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    unit: 'mg',
    times: ['08:00'],
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    form: 'tablet',
    ongoing: true
  });

  const getTodaySchedule = () => {
    const today = new Date().toISOString().split('T')[0];
    const schedule = [];
    
    medications.forEach(med => {
      med.times.forEach(time => {
        const log = intakeLog.find(
          l => l.medicationId === med.id && l.time === time && l.date === today
        );
        
        schedule.push({
          time,
          medication: med,
          status: log ? log.status : 'pending',
          logId: log ? log.id : null
        });
      });
    });

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  };

  const markAsTaken = (medication, time) => {
    const today = new Date().toISOString().split('T')[0];
    const newLog = {
      id: Date.now(),
      medicationId: medication.id,
      time,
      date: today,
      status: 'taken',
      timestamp: new Date().toISOString()
    };
    setIntakeLog([...intakeLog, newLog]);
  };

  const markAsSkipped = (medication, time) => {
    const today = new Date().toISOString().split('T')[0];
    const newLog = {
      id: Date.now(),
      medicationId: medication.id,
      time,
      date: today,
      status: 'skipped',
      timestamp: new Date().toISOString()
    };
    setIntakeLog([...intakeLog, newLog]);
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = intakeLog.filter(l => l.date === today);
    const taken = todayLogs.filter(l => l.status === 'taken').length;
    
    const totalToday = medications.reduce((acc, med) => acc + med.times.length, 0);
    const remaining = totalToday - taken;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekLogs = intakeLog.filter(l => new Date(l.date) >= weekAgo);
    const weekTaken = weekLogs.filter(l => l.status === 'taken').length;
    const weekTotal = medications.reduce((acc, med) => acc + med.times.length, 0) * 7;
    const adherence = weekTotal > 0 ? Math.round((weekTaken / weekTotal) * 100) : 0;

    return { taken, remaining, adherence };
  };

  const addMedication = () => {
    if (!newMed.name || !newMed.dosage) return;

    const medication = {
      id: Date.now(),
      name: newMed.name,
      dosage: `${newMed.dosage}${newMed.unit}`,
      times: newMed.times,
      instructions: newMed.instructions,
      startDate: newMed.startDate,
      endDate: newMed.ongoing ? null : newMed.endDate,
      form: newMed.form
    };

    setMedications([...medications, medication]);
    setNewMed({
      name: '',
      dosage: '',
      unit: 'mg',
      times: ['08:00'],
      instructions: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      form: 'tablet',
      ongoing: true
    });
    setCurrentView('dashboard');
  };

  const deleteMedication = (id) => {
    setMedications(medications.filter(m => m.id !== id));
    setIntakeLog(intakeLog.filter(l => l.medicationId !== id));
  };

  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = intakeLog.filter(l => l.date === dateStr);
      const taken = dayLogs.filter(l => l.status === 'taken').length;
      const total = medications.reduce((acc, med) => acc + med.times.length, 0);
      const percentage = total > 0 ? (taken / total) * 100 : 0;
      
      data.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        percentage: Math.round(percentage)
      });
    }
    
    return data;
  };

  const stats = calculateStats();
  const schedule = getTodaySchedule();
  const weeklyData = getWeeklyData();

  const Navigation = () => (
    <header className="bg-white/80 backdrop-blur-lg border-b border-purple-100 px-4 md:px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
            MediTrack
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`hidden md:block text-sm font-semibold transition-colors ${currentView === 'dashboard' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-800'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('reports')}
            className={`hidden md:block text-sm font-semibold transition-colors ${currentView === 'reports' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-800'}`}
          >
            Reports
          </button>
          <button
            onClick={() => setCurrentView('add')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Medication</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Good Day! 👋</h2>
            <p className="text-base md:text-lg text-gray-600">
              {medications.length === 0 ? (
                <span>Start by adding your first medication to begin tracking.</span>
              ) : (
                <>You have <span className="text-purple-600 font-bold">{stats.remaining} meds</span> left for today.</>
              )}
            </p>
          </div>

          {medications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center shadow-xl border border-purple-100">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Pill className="w-10 h-10 md:w-12 md:h-12 text-purple-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">No medications yet</h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto">
                Get started by adding your first medication. Track your doses, set reminders, and monitor your health journey.
              </p>
              <button
                onClick={() => setCurrentView('add')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Medication
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              <div className="lg:col-span-8 space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2.5 md:p-3 rounded-xl shadow-md">
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base md:text-lg">Taken</h3>
                        <p className="text-xs md:text-sm text-gray-600">{stats.taken} doses completed</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-2.5 md:p-3 rounded-xl shadow-md">
                        <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base md:text-lg">Remaining</h3>
                        <p className="text-xs md:text-sm text-gray-600">{stats.remaining} doses left</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-2.5 md:p-3 rounded-xl shadow-md">
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base md:text-lg">Adherence</h3>
                        <p className="text-xs md:text-sm text-gray-600">{stats.adherence}% this week</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">Today's Schedule</h3>
                  </div>
                  <div className="overflow-x-auto">
                    {schedule.length === 0 ? (
                      <div className="p-8 md:p-12 text-center text-gray-500">
                        <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm md:text-base">No medications scheduled for today</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                          <tr>
                            <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Time</th>
                            <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Medication</th>
                            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Instructions</th>
                            <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Status</th>
                            <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100">
                          {schedule.map((item, idx) => (
                            <tr key={idx} className={item.status === 'taken' ? 'bg-green-50/50 opacity-60' : 'bg-white/50 hover:bg-purple-50/50 transition-colors'}>
                              <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-gray-800">{item.time}</td>
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <div className={item.status === 'taken' ? 'line-through' : ''}>
                                  <div className="font-bold text-gray-800 text-sm md:text-base">{item.medication.name}</div>
                                  <div className="text-xs text-gray-600">{item.medication.dosage}</div>
                                </div>
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-600">{item.medication.instructions}</td>
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                {item.status === 'taken' && (
                                  <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm">
                                    Taken
                                  </span>
                                )}
                                {item.status === 'skipped' && (
                                  <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-sm">
                                    Skipped
                                  </span>
                                )}
                                {item.status === 'pending' && (
                                  <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 shadow-sm">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                {item.status === 'pending' && (
                                  <div className="flex gap-1 md:gap-2">
                                    <button
                                      onClick={() => markAsTaken(item.medication, item.time)}
                                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-semibold hover:shadow-md hover:scale-105 transition-all flex items-center gap-1"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span className="hidden sm:inline">Take</span>
                                    </button>
                                    <button
                                      onClick={() => markAsSkipped(item.medication, item.time)}
                                      className="border-2 border-gray-300 text-gray-600 p-1.5 md:px-3 md:py-2 rounded-lg text-xs hover:bg-red-50 hover:border-red-300 transition-all"
                                    >
                                      <X className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4 md:space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base">Weekly Progress</h3>
                    <span className="px-2 md:px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm">
                      {stats.adherence >= 80 ? 'On Track' : 'Needs Attention'}
                    </span>
                  </div>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{stats.adherence}%</span>
                    <span className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">adherence</span>
                  </div>
                  <div className="h-2 md:h-3 bg-gray-200 rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.adherence}%` }}
                    />
                  </div>
                  <button
                    onClick={() => setCurrentView('reports')}
                    className="w-full bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 py-2 md:py-2.5 rounded-xl font-semibold hover:shadow-md transition-all text-sm"
                  >
                    View Full Report
                  </button>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-purple-100">
                  <h3 className="font-bold text-gray-800 mb-4 text-sm md:text-base">Your Medications</h3>
                  <div className="space-y-3">
                    {medications.map(med => (
                      <div key={med.id} className="flex items-start justify-between p-3 md:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-800 text-sm md:text-base truncate">{med.name}</div>
                          <div className="text-xs text-gray-600">{med.dosage} - {med.times.length}x daily</div>
                        </div>
                        <button
                          onClick={() => deleteMedication(med.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (currentView === 'add') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Navigation />

        <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Add New Medication</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    placeholder="e.g., Antibiotics"
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Dosage Strength *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      placeholder="500"
                      className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm md:text-base"
                    />
                    <select
                      value={newMed.unit}
                      onChange={(e) => setNewMed({ ...newMed, unit: e.target.value })}
                      className="w-20 md:w-24 px-2 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
                    >
                      <option value="mg">mg</option>
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                      <option value="mcg">pill</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Reminder Times
                </label>
                {newMed.times.map((time, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...newMed.times];
                        newTimes[idx] = e.target.value;
                        setNewMed({ ...newMed, times: newTimes });
                      }}
                      className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm md:text-base"
                    />
                    {newMed.times.length > 1 && (
                      <button
                        onClick={() => {
                          const newTimes = newMed.times.filter((_, i) => i !== idx);
                          setNewMed({ ...newMed, times: newTimes });
                        }}
                        className="px-3 py-3 border-2 border-purple-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewMed({ ...newMed, times: [...newMed.times, '12:00'] })}
                  className="text-purple-600 text-sm font-semibold hover:text-purple-800 flex items-center gap-1 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Time
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Instructions (Optional)
                </label>
                <textarea
                  value={newMed.instructions}
                  onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                  placeholder="e.g., Take with food, Avoid alcohol"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm md:text-base resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newMed.startDate}
                    onChange={(e) => setNewMed({ ...newMed, startDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newMed.endDate}
                    onChange={(e) => setNewMed({ ...newMed, endDate: e.target.value })}
                    disabled={newMed.ongoing}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-400 transition-all text-sm md:text-base"
                  />
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={newMed.ongoing}
                      onChange={(e) => setNewMed({ ...newMed, ongoing: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-xs md:text-sm text-gray-600">No end date (Ongoing)</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="flex-1 px-6 py-3 border-2 border-purple-200 text-gray-700 rounded-xl font-semibold hover:bg-purple-50 transition-all text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={addMedication}
                  disabled={!newMed.name || !newMed.dosage}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm md:text-base"
                >
                  <Check className="w-4 h-4" />
                  Save Medication
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (currentView === 'reports') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Medication Reports</h2>
            <p className="text-sm md:text-base text-gray-600">Track your progress and medication history</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-sm md:text-base">Weekly Adherence</h3>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">{stats.adherence}%</div>
              <p className="text-xs md:text-sm text-gray-600">Average for the past 7 days</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-sm md:text-base">Total Doses</h3>
                <Pill className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                {intakeLog.filter(l => l.status === 'taken').length}
              </div>
              <p className="text-xs md:text-sm text-gray-600">Completed doses all time</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-sm md:text-base">Active Medications</h3>
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent mb-2">{medications.length}</div>
              <p className="text-xs md:text-sm text-gray-600">Currently tracking</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-purple-100 mb-6 md:mb-8">
            <h3 className="font-bold text-gray-800 mb-4 md:mb-6 text-base md:text-lg">7-Day Adherence Trend</h3>
            {medications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm md:text-base">Add medications to see your adherence trend</p>
              </div>
            ) : (
              <div className="flex items-end justify-between h-40 md:h-48 gap-1 md:gap-2">
                {weeklyData.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gradient-to-t from-purple-100 to-blue-100 rounded-t-lg relative" style={{ height: '130px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(day.percentage / 100) * 130}px` }}
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-600">{day.day}</div>
                    <div className="text-xs font-bold text-gray-800">{day.percentage}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-purple-100">
            <h3 className="font-bold text-gray-800 mb-4 text-base md:text-lg">Recent Activity</h3>
            {intakeLog.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm md:text-base">No activity recorded yet</p>
                <p className="text-xs md:text-sm text-gray-400 mt-2">Start taking your medications to see your history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {intakeLog.slice(-10).reverse().map(log => {
                  const med = medications.find(m => m.id === log.medicationId);
                  if (!med) return null;
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${log.status === 'taken' ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-pink-500'}`}>
                          {log.status === 'taken' ? (
                            <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          ) : (
                            <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-800 text-sm md:text-base truncate">{med.name}</div>
                          <div className="text-xs text-gray-600">{log.date} at {log.time}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 md:px-3 py-1 rounded-full whitespace-nowrap ${log.status === 'taken' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {log.status === 'taken' ? 'Taken' : 'Skipped'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default MediTrack;
