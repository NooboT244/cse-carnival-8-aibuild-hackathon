import { useState } from 'react';

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const UsersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 1 3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="11" r="2"/></svg>;
const MonitorIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const BookmarkIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;

export default function RoomsTab({ data, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ room_number: '', capacity: 30, equipment: '' });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        room_number: item.room_number,
        capacity: item.capacity,
        equipment: Array.isArray(item.equipment) ? item.equipment.join(', ') : item.equipment || '',
      });
    } else {
      setEditItem(null);
      setFormData({ room_number: '', capacity: 30, equipment: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      equipment: typeof formData.equipment === 'string' 
        ? formData.equipment.split(',').map((s) => s.trim()).filter(Boolean) 
        : formData.equipment
    };

    const url = editItem 
      ? `http://localhost:5000/api/rooms/${editItem.id}` 
      : 'http://localhost:5000/api/rooms';
    const method = editItem ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setShowModal(false);
    onRefresh();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    await fetch(`http://localhost:5000/api/rooms/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  const handleToggleBooking = async (room) => {
    const isBooked = room.is_booked;
    const url = `http://localhost:5000/api/rooms/${room.id}/${isBooked ? 'cancel' : 'book'}`;
    await fetch(url, { method: 'POST' });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Campus Rooms & Labs</h2>
          <p className="text-sm text-gray-500">Monitor room capacity, equipment, and manage room reservations</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <PlusIcon /> Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((room) => {
          const equipmentList = Array.isArray(room.equipment) 
            ? room.equipment 
            : room.equipment ? room.equipment.split(',') : [];

          return (
            <div key={room.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-900">Room {room.room_number}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(room)} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                      <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(room.id)} className="p-1 hover:bg-red-50 rounded text-red-600">
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="text-blue-500"><UsersIcon /></span>
                  <span>Capacity: <strong className="text-gray-800">{room.capacity} seats</strong></span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-400 mb-1.5">
                    <MonitorIcon /> Equipment
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {equipmentList.length > 0 ? (
                      equipmentList.map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                          {item.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No equipment listed</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-between items-center">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  room.is_booked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {room.is_booked ? 'Occupied / Booked' : 'Available'}
                </span>

                <button
                  onClick={() => handleToggleBooking(room)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                    room.is_booked 
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-100' 
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <BookmarkIcon />
                  {room.is_booked ? 'Cancel Booking' : 'Book Room'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">{editItem ? 'Edit Room' : 'Add New Room'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm outline-none"
                  placeholder="e.g. 7A01"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg p-2.5 text-sm outline-none"
                  placeholder="e.g. 40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Equipment (Comma separated)</label>
                <input
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm outline-none"
                  placeholder="e.g. Projector, Whiteboard, AC"
                />
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
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}