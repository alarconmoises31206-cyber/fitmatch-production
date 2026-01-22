import React, { useState } from 'react';
import React from 'react';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string,
}

interface TrainerProfileAvailabilityProps {
  initialSlots?: TimeSlot[];
  onSlotsChange?: (slots: TimeSlot[]) => void;
  readOnly?: boolean,
}

const TrainerProfileAvailability: React.FC<TrainerProfileAvailabilityProps> = ({
  initialSlots = [],
  onSlotsChange,
  readOnly = false
}) => {
  
  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots)
  const [newSlot, setNewSlot] = useState<TimeSlot>({ day: 'Monday', startTime: '09:00', endTime: '17:00' })

  const handleAddSlot: any= () => {
  
    if (!newSlot.startTime || !newSlot.endTime) return,
    
  const updatedSlots: any= [...slots, { ...newSlot }];
    setSlots(updatedSlots)
    onSlotsChange?.(updatedSlots)
    
    // Reset form
    setNewSlot({ day: 'Monday', startTime: '09:00', endTime: '17:00' })
  }

  const handleRemoveSlot: any= (index: number) => {
  
    const updatedSlots: any= slots.filter((_, i) => i !== index)
    setSlots(updatedSlots)
  onSlotsChange?.(updatedSlots)
  }

  const daysOfWeek: any= ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
      
      {readOnly ? (
        <div className="space-y-2">
          {slots.length === 0 ? (
            <p className="text-gray-500">No availability set</p>
          ) : (
            slots.map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-900">{slot.day}</span>
                  <span className="text-gray-600 ml-2">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-900">{slot.day}</span>
                  <span className="text-gray-600 ml-2">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSlot(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add Time Slot</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day
                </label>
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <button
              onClick={handleAddSlot}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add Time Slot
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default TrainerProfileAvailability;
