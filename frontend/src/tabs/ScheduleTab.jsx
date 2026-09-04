import { useState } from 'react';

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const MapPinIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ClockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

export default function ScheduleTab({ data = [], onRefresh }) {
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
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    await fetch(`http://localhost:5000/api/schedules/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div>
      <div className="operations-bar">
        <div className="operations-title">
          <h2>Class Schedules</h2>
          <p>Manage daily timetables and room assignments</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <PlusIcon /> Add Class
        </button>
      </div>

      <div className="card-grid">
        {data.map((item) => (
          <div key={item.id} className="card">
            <div>
              <div className="card-top">
                <span className="badge badge-blue">{item.day}</span>
                <div>
                  <button onClick={() => handleOpenModal(item)} className="btn-icon"><EditIcon /></button>
                  <button onClick={() => handleDelete(item.id)} className="btn-icon danger"><TrashIcon /></button>
                </div>
              </div>
              <h3 className="card-title">{item.course}</h3>
              <div className="card-info">
                <div className="card-info-item"><ClockIcon /> <span>{item.time}</span></div>
                <div className="card-info-item"><MapPinIcon /> <span>Room {item.room}</span></div>
                <div className="card-info-item"><UserIcon /> <span>{item.instructor}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editItem ? 'Edit Class' : 'Add New Class'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text" required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g. CSE321 - Operating Systems"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Day</label>
                  <select value={formData.day} onChange={(e) => setFormData({ ...formData, day: e.target.value })}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <input
                    type="text" required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 09:00 AM - 10:30 AM"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Room</label>
                  <input
                    type="text" required
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. 304"
                  />
                </div>
                <div className="form-group">
                  <label>Instructor</label>
                  <input
                    type="text" required
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="e.g. Dr. Rahman"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}