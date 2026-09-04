import { useState } from 'react';

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;

export default function EventsTab({ data = [], onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', date: '', time: '', capacity: 50 });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData(item);
    } else {
      setEditItem(null);
      setFormData({ name: '', date: '', time: '', capacity: 50 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editItem 
      ? `http://localhost:5000/api/events/${editItem.id}` 
      : 'http://localhost:5000/api/events';
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
    if (!confirm('Are you sure you want to delete this event?')) return;
    await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  const handleToggleRegister = async (event) => {
    const url = `http://localhost:5000/api/events/${event.id}/${event.is_registered ? 'cancel' : 'register'}`;
    await fetch(url, { method: 'POST' });
    onRefresh();
  };

  return (
    <div>
      <div className="operations-bar">
        <div className="operations-title">
          <h2>Campus Events</h2>
          <p>Discover upcoming seminars, workshops, and student activities</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <PlusIcon /> Create Event
        </button>
      </div>

      <div className="card-grid">
        {data.map((item) => {
          const registeredCount = item.attendees_count || 0;
          const isFull = registeredCount >= item.capacity;

          return (
            <div key={item.id} className="card">
              <div>
                <div className="card-top">
                  <h3 className="card-title">{item.name}</h3>
                  <div>
                    <button onClick={() => handleOpenModal(item)} className="btn-icon"><EditIcon /></button>
                    <button onClick={() => handleDelete(item.id)} className="btn-icon danger"><TrashIcon /></button>
                  </div>
                </div>

                <div className="card-info">
                  <div>Date: <strong>{item.date}</strong></div>
                  <div>Time: <strong>{item.time}</strong></div>
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>Attendees</span>
                      <span>{registeredCount} / {item.capacity}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className={`progress-bar-fill ${isFull ? 'full' : ''}`}
                        style={{ width: `${Math.min(100, (registeredCount / item.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-footer" style={{ justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleToggleRegister(item)}
                  disabled={!item.is_registered && isFull}
                  className={item.is_registered ? 'btn-secondary' : 'btn-primary'}
                >
                  {item.is_registered ? 'Registered' : isFull ? 'Event Full' : 'Register Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editItem ? 'Edit Event' : 'Create New Event'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. AI Hackathon Workshop"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date" required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="text" required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 03:00 PM"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number" required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}