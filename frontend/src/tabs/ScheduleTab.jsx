import { useState } from 'react';
import { Plus, Trash2, Edit3, MapPin, User, Clock, Calendar } from 'lucide-react';

export default function ScheduleTab({ data, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ course: '', day: 'Monday', time: '', room: '', instructor: '' });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData(item);
    } else {
      setEditItem(null);
      setFormData({ course: '', day: 'Monday', time: '', room: '', instructor: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editItem 
      ? `http://localhost:5000/api/schedules/${editItem.id}` 
      : 'http://localhost:5000/api/schedules';
    const method = editItem ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setShowModal(false);
    onRefresh();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class schedule?')) return;
    await fetch(`http://localhost:5000/api/schedules/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Class Schedules</h2>
          <p className="text-sm text-gray-500">Manage daily class timetables and room assignments</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} /> Add Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition relative group">
            <div className="flex justify-between items-start mb-3">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-md text-xs uppercase">
                {item.day}
              </span>
              <div className="flex gap-1 opacity-90 group-hover:opacity-100 transition">
                <button onClick={() => handleOpenModal(item)} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">{item.course}</h3>

            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-gray-400" />
                <span>{item.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-gray-400" />
                <span>Room {item.room}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={15} className="text-gray-400" />
                <span>{item.instructor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">{editItem ? 'Edit Class' : 'Add New Class'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. CSE321 - Operating Systems"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Time Slot</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm outline-none"
                    placeholder="e.g. 09:00 AM - 10:30 AM"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Room</label>
                  <input
                    type="text"
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm outline-none"
                    placeholder="e.g. 304"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Instructor</label>
                  <input
                    type="text"
                    required
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm outline-none"
                    placeholder="e.g. Dr. Rahman"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}