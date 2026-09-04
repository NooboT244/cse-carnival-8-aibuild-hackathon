import { useState } from 'react';

const initialFormState = {
  id: '',
  room_number: '',
  type: 'classroom',
  capacity: 40,
  equipment: 'whiteboard, projector, AC',
  floor: 1,
  status: 'available',
};

export default function RoomsTab({ data = [], onRefresh }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const statuses = ['All', 'available', 'booked', 'maintenance'];

  const filteredData = statusFilter === 'All'
    ? data
    : data.filter((item) => item.status?.toLowerCase() === statusFilter.toLowerCase());

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ ...initialFormState, id: `room-${Date.now().toString().slice(-6)}` });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id || '',
      room_number: item.room_number || '',
      type: item.type || 'classroom',
      capacity: item.capacity || 40,
      equipment: Array.isArray(item.equipment) ? item.equipment.join(', ') : item.equipment || '',
      floor: item.floor || 1,
      status: item.status || 'available',
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetId = editingItem ? editingItem.id : formData.id;
    const url = editingItem
      ? `http://localhost:5000/api/rooms/${targetId}`
      : 'http://localhost:5000/api/rooms';
    const method = editingItem ? 'PATCH' : 'POST';

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      floor: Number(formData.floor),
      equipment: typeof formData.equipment === 'string'
        ? formData.equipment.split(',').map((s) => s.trim()).filter(Boolean)
        : formData.equipment,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to save room'}`);
      }
    } catch (error) {
      console.error('Save room error:', error);
      alert('Failed to connect to backend server.');
    }
  };

  const handleDelete = async (item) => {
    if (!item.id) {
      alert('Error: Item does not have a custom id field.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete Room ${item.room_number}?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${item.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to delete room'}`);
      }
    } catch (error) {
      console.error('Delete room error:', error);
      alert('Failed to connect to backend server.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return { bg: '#dcfce7', color: '#15803d', label: 'Available' };
      case 'booked':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'Booked' };
      case 'maintenance':
        return { bg: '#fef3c7', color: '#b45309', label: 'Maintenance' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: status || 'Unknown' };
    }
  };

  return (
    <div>
      <div className="operations-bar">
        <div className="operations-title">
          <h2>Rooms & Labs</h2>
          <p>Manage classroom allocations and room availability</p>
        </div>

        <button className="btn-primary" onClick={handleOpenAdd}>
          + Add Room
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              background: statusFilter === status ? 'var(--primary)' : 'var(--bg-card)',
              color: statusFilter === status ? '#fff' : 'var(--text-main)',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No rooms found matching status "{statusFilter}".
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredData.map((item) => {
            const badge = getStatusBadge(item.status);
            const equipmentList = Array.isArray(item.equipment) ? item.equipment : [];

            return (
              <div key={item.id || item._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>
                    Room {item.room_number}
                  </h3>
                  <span
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.color,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      textTransform: 'capitalize',
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{item.type}</span></div>
                  <div><strong>Floor:</strong> Floor {item.floor}</div>
                  <div><strong>Capacity:</strong> {item.capacity} Seats</div>
                </div>

                {equipmentList.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {equipmentList.map((eq, i) => (
                      <span
                        key={i}
                        style={{
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-main)',
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        ⚡ {eq}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #fee2e2', background: '#fef2f2', color: '#dc2626', fontWeight: '600', cursor: 'pointer' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editingItem ? 'Edit Room' : 'Add New Room'}</h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  name="room_number"
                  placeholder="Room Number (e.g. 7A01)"
                  value={formData.room_number}
                  onChange={handleChange}
                  required
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                >
                  <option value="classroom">Classroom</option>
                  <option value="lab">Lab</option>
                  <option value="auditorium">Auditorium</option>
                  <option value="conference">Conference Room</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="number"
                  name="capacity"
                  placeholder="Capacity (e.g. 40)"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
                <input
                  type="number"
                  name="floor"
                  placeholder="Floor (e.g. 7)"
                  value={formData.floor}
                  onChange={handleChange}
                  required
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
              </div>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Equipment (comma-separated)</label>
                <input
                  type="text"
                  name="equipment"
                  placeholder="whiteboard, projector, AC"
                  value={formData.equipment}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}