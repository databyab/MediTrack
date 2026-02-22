import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface AddMedicationFormProps {
  onClose: () => void;
  onSave: (medication: MedicationFormData) => void;
  initialData?: MedicationFormData;
}

export interface MedicationFormData {
  name: string;
  dosage: number;
  unit: string;
  times: string[];
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  instructions?: string;
  condition?: string;
  prescribedBy?: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'every-other-day';
  selectedDays: string[];
}

export function AddMedicationForm({ onClose, onSave, initialData }: AddMedicationFormProps) {
  const [formData, setFormData] = useState<MedicationFormData>(initialData || {
    name: '',
    dosage: 0,
    unit: 'mg',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    isOngoing: false,
    instructions: '',
    condition: '',
    prescribedBy: '',
    frequency: 'daily',
    selectedDays: []
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.dosage <= 0) {
      newErrors.dosage = 'Dosage must be greater than 0';
    }

    if (!formData.isOngoing && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }

    if (formData.frequency === 'weekly' && formData.selectedDays.length === 0) {
      newErrors.selectedDays = 'Please select at least one day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const addTime = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '12:00']
    }));
  };

  const removeTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateTime = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((time, i) => i === index ? value : time)
    }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => {
      const days = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day];
      return { ...prev, selectedDays: days };
    });
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
      <div
        className="w-full max-w-[640px] rounded-[18px] p-8 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0px 8px 24px rgba(2, 6, 23, 0.08)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2>{initialData ? 'Edit Medication' : 'Add Medication'}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#475569' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medicine Name */}
          <div>
            <Label htmlFor="name">Medicine Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Antibiotics"
              required
              className="mt-2 h-11"
              style={{ backgroundColor: 'white' }}
            />
          </div>

          {/* Dosage and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dosage">Dosage Strength *</Label>
              <Input
                id="dosage"
                type="number"
                value={formData.dosage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: parseFloat(e.target.value) }))}
                placeholder="1"
                required
                className={`mt-2 h-11 ${errors.dosage ? 'border-red-500' : ''}`}
                style={{ backgroundColor: 'white' }}
              />
              {errors.dosage && <p className="text-red-500 text-xs mt-1">{errors.dosage}</p>}
            </div>
            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger className="mt-2 h-11" style={{ backgroundColor: 'white' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg">mg (milligrams)</SelectItem>
                  <SelectItem value="ml">ml (milliliters)</SelectItem>
                  <SelectItem value="IU">IU (international units)</SelectItem>
                  <SelectItem value="tablets">tablets</SelectItem>
                  <SelectItem value="capsules">capsules</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <Label>Frequency *</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger className="mt-2 h-11" style={{ backgroundColor: 'white' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="every-other-day">Every Other Day</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly (Every 2 weeks)</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weekly Schedule */}
          {formData.frequency === 'weekly' && (
            <div>
              <Label>Select Days *</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {weekDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`h-10 w-10 rounded-full text-sm font-medium transition-colors ${formData.selectedDays.includes(day)
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {day.charAt(0)}
                  </button>
                ))}
              </div>
              {errors.selectedDays && <p className="text-red-500 text-xs mt-1">{errors.selectedDays}</p>}
            </div>
          )}

          {/* Reminder Times */}
          <div>
            <Label>Reminder Times *</Label>
            <div className="mt-2 space-y-2">
              {formData.times.map((time, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(index, e.target.value)}
                    className="h-11"
                    style={{ backgroundColor: 'white' }}
                  />
                  {formData.times.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeTime(index)}
                      className="h-11 w-11"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addTime}
                className="w-full h-11"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Time
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
                className="mt-2 h-11"
                style={{ backgroundColor: 'white' }}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value, isOngoing: false }))}
                disabled={formData.isOngoing}
                className={`mt-2 h-11 ${errors.endDate ? 'border-red-500' : ''}`}
                style={{ backgroundColor: 'white' }}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ongoing"
              checked={formData.isOngoing}
              onChange={(e) => setFormData(prev => ({ ...prev, isOngoing: e.target.checked, endDate: undefined }))}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#0F766E' }}
            />
            <Label htmlFor="ongoing" className="cursor-pointer">
              Ongoing medication (no end date)
            </Label>
          </div>

          {/* Optional Fields */}
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="e.g., Take with food"
              className="mt-2 min-h-[80px]"
              style={{ backgroundColor: 'white' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="condition">Condition Tag</Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                placeholder="e.g., Infection"
                className="mt-2 h-11"
                style={{ backgroundColor: 'white' }}
              />
            </div>
            <div>
              <Label htmlFor="prescribedBy">Prescribed By</Label>
              <Input
                id="prescribedBy"
                value={formData.prescribedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, prescribedBy: e.target.value }))}
                placeholder="e.g., Dr. Bhatt"
                className="mt-2 h-11"
                style={{ backgroundColor: 'white' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11"
              style={{ backgroundColor: '#0F766E' }}
            >
              {initialData ? 'Update Medication' : 'Save Medication'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
