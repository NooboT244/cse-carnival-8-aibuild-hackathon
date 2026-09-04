import { useState } from 'react';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minutes.padStart(2, '0')} ${ampm}`;
};

const initialFormState = {
  id: '',
  name: '',
  description: '',
  date: '',
  start_time: '',
  end_time: '',
  end_date: '',
  venue: '',
  organizer: '',
  capacity: 50,
  registered: 0,
  status: 'upcoming',
};

export default function EventsTab({ data = [], onRefresh }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const statuses = ['All', 'upcoming', 'ongoing', 'completed', 'cancelled'];

  const filteredData = statusFilter === 'All'
    ? data
    : data.filter((item) => item.status?.toLowerCase() === statusFilter.toLowerCase());

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ...initialFormState,
      id: `evt-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id || '',
      name: item.name || '',
      description: item.description || '',
      date: item.date || '',
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      end_date: item.end_date || '',
      venue: item.venue || '',
      organizer: item.organizer || '',
      capacity: item.capacity || 0,
      registered: item.registered || 0,
      status: item.status || 'upcoming',
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
      ? `http://localhost:5000/api/events/${targetId}`
      : 'http://localhost:5000/api/events';
    const method = editingItem ? 'PATCH' : 'POST';

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      registered: Number(formData.registered),
      registrations: editingItem?.registrations || [],
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
        alert(`Error: ${err.message || 'Failed to save event'}`);
      }
    } catch (error) {
      console.error('Save event error:', error);
      alert('Failed to connect to backend server.');
    }
  };

  const handleDelete = async (item) => {
    if (!item.id) {
      alert('Error: Item does not have a custom id field.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/events/${item.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to delete event'}`);
      }
    } catch (error) {
      console.error('Delete event error:', error);
      alert('Failed to connect to backend server.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return { bg: '#dbeafe', color: '#1e40af', label: 'Upcoming' };
      case 'ongoing':
        return { bg: '#dcfce7', color: '#15803d', label: 'Ongoing' };
      case 'completed':
        return { bg: '#f1f5f9', color: '#475569', label: 'Completed' };
      case 'cancelled':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: status || 'Unknown' };
    }
  };

  return (
    <div>
      <div className="operations-bar">
        <div className="operations-title">
          <h2>Events & Workshops</h2>
          <p>Organize hackathons, seminars, and campus tech events</p>
        </div>

        <button className="btn-primary" onClick={handleOpenAdd}>
          + Add Event
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
          No events found with status "{statusFilter}".
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredData.map((item) => {
            const badge = getStatusBadge(item.status);
            const isMultiDay = item.end_date && item.end_date !== item.date;

            return (
              <div key={item.id || item._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <span
                    style={{
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--primary)',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {item.organizer || 'Event'}
                  </span>
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

                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
                  {item.name}
                </h3>

                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-light)', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>📍 <strong>Venue:</strong> Room {item.venue}</div>
                  <div>
                    🗓️ <strong>Date:</strong> {item.date} {isMultiDay ? `to ${item.end_date}` : ''}
                  </div>
                  {item.start_time && (
                    <div>⏰ <strong>Time:</strong> {formatTime(item.start_time)} {item.end_time ? `- ${formatTime(item.end_time)}` : ''}</div>
                  )}
                  <div>
                    👥 <strong>Seats:</strong> {item.registered || 0} / {item.capacity} Registered
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-light)' }}>
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
          <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editingItem ? 'Edit Event' : 'Add New Event'}</h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <input
                type="text"
                name="name"
                placeholder="Event Name (e.g. AI Build Hackathon)"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  name="organizer"
                  placeholder="Organizer (e.g. AUSTPIC)"
                  value={formData.organizer}
                  onChange={handleChange}
                  required
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
                <input
                  type="text"
                  name="venue"
                  placeholder="Venue (e.g. 7C01)"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
              </div>

              <textarea
                name="description"
                placeholder="Event Description..."
                rows={3}
                value={formData.description}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)', resize: 'vertical' }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    placeholder="Capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Count</label>
                  <input
                    type="number"
                    name="registered"
                    placeholder="Registered"
                    value={formData.registered}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)', marginTop: '4px' }}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
                  {editingItem ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}