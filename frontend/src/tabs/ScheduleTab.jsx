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
  course: '',
  title: '',
  day: 'Sunday',
  start_time: '',
  end_time: '',
  room: '',
  instructor: '',
  section: '',
};

export default function ScheduleTab({ data = [], onRefresh }) {
  const [selectedDay, setSelectedDay] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const days = ['All', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const filteredData = selectedDay === 'All'
    ? data
    : data.filter((item) => item.day?.toLowerCase() === selectedDay.toLowerCase());

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ ...initialFormState, id: `sch-${Date.now().toString().slice(-6)}` });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id || '',
      course: item.course || '',
      title: item.title || '',
      day: item.day || 'Sunday',
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      room: item.room || '',
      instructor: item.instructor || '',
      section: item.section || '',
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure custom string id is used
    const targetId = editingItem ? editingItem.id : formData.id;
    const url = editingItem
      ? `http://localhost:5000/api/schedules/${targetId}`
      : 'http://localhost:5000/api/schedules';
    const method = editingItem ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Action failed'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to connect to backend server.');
    }
  };

  const handleDelete = async (item) => {
    if (!item.id) {
      alert('Error: Item does not have a custom id field.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${item.course}?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/schedules/${item.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to delete'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to connect to backend server.');
    }
  };

  return (
    <div>
      <div className="operations-bar">
        <div className="operations-title">
          <h2>Class Schedules</h2>
          <p>View, add, edit, or delete lecture routines</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd}>
          + Add Schedule
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              background: selectedDay === day ? 'var(--primary)' : 'var(--bg-card)',
              color: selectedDay === day ? '#fff' : 'var(--text-main)',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {filteredData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No schedules found for {selectedDay}.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredData.map((item) => {
            const timeDisplay = item.start_time && item.end_time
              ? `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`
              : item.time || 'Time Not Specified';

            return (
              <div key={item.id || item._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--primary)',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                    }}
                  >
                    {item.course} {item.section ? `(Sec ${item.section})` : ''}
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Room {item.room}
                  </span>
                </div>

                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>
                  {item.title || item.course}
                </h3>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-light)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  <div><strong>Instructor:</strong> {item.instructor || 'N/A'}</div>
                  <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', fontWeight: '600' }}>
                    <span>🗓️ {item.day}</span>
                    <span>⏰ {timeDisplay}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-light)' }}>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', fontWeight: '600' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid #fee2e2', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editingItem ? 'Edit Schedule' : 'Add New Schedule'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  name="course"
                  placeholder="Course Code (e.g. CSE 4113)"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
                <input
                  type="text"
                  name="section"
                  placeholder="Section (e.g. B)"
                  value={formData.section}
                  onChange={handleChange}
                  style={{ width: '100px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
              </div>

              <input
                type="text"
                name="title"
                placeholder="Course Title"
                value={formData.title}
                onChange={handleChange}
                required
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                >
                  {days.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <input
                  type="text"
                  name="room"
                  placeholder="Room (e.g. 7A07)"
                  value={formData.room}
                  onChange={handleChange}
                  required
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
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
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  />
                </div>
              </div>

              <input
                type="text"
                name="instructor"
                placeholder="Instructor Name"
                value={formData.instructor}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}