import { useState } from 'react';

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const UsersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 1 3-3.87"/><circle cx="9" cy="7" r="4"/></svg>;

export default function RoomsTab({ data = [], onRefresh }) {
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
    const url = `http://localhost:5000/api/rooms/${room.id}/${room.is_booked ? 'cancel' : 'book'}`;
    await fetch(url, { method: 'POST' });
    onRefresh();
  };

  return (
    <div>
      <div className="operations-bar">
        <div className="operations-title">
          <h2>Campus Rooms & Labs</h2>
          <p>Monitor room capacities, equipment, and manage bookings</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <PlusIcon /> Add Room
        </button>
      </div>

      <div className="card-grid">
        {data.map((room) => {
          const equipmentList = Array.isArray(room.equipment) 
            ? room.equipment 
            : room.equipment ? room.equipment.split(',') : [];

          return (
            <div key={room.id} className="card">
              <div>
                <div className="card-top">
                  <h3 className="card-title">Room {room.room_number}</h3>
                  <div>
                    <button onClick={() => handleOpenModal(room)} className="btn-icon"><EditIcon /></button>
                    <button onClick={() => handleDelete(room.id)} className="btn-icon danger"><TrashIcon /></button>
                  </div>
                </div>

                <div className="card-info">
                  <div className="card-info-item"><UsersIcon /> <span>Capacity: <strong>{room.capacity} seats</strong></span></div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>Equipment</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {equipmentList.length > 0 ? (
                        equipmentList.map((item, idx) => (
                          <span key={idx} className="badge badge-gray">{item.trim()}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.9rem', color: '#94a3b8', italic: 'true' }}>No equipment listed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <span className={`badge ${room.is_booked ? 'badge-red' : 'badge-green'}`}>
                  {room.is_booked ? 'Occupied' : 'Available'}
                </span>
                <button onClick={() => handleToggleBooking(room)} className="btn-secondary">
                  {room.is_booked ? 'Cancel Booking' : 'Book Room'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editItem ? 'Edit Room' : 'Add New Room'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Room Number</label>
                <input
                  type="text" required
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  placeholder="e.g. 7A01"
                />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number" required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 40"
                />
              </div>
              <div className="form-group">
                <label>Equipment (Comma separated)</label>
                <input
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  placeholder="e.g. Projector, Whiteboard, AC"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}