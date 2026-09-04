import { useState } from 'react';

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;

export default function AnnouncementsTab({ data = [], onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', body: '', priority: 'Medium', date: '' });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData(item);
    } else {
      setEditItem(null);
      setFormData({ title: '', body: '', priority: 'Medium', date: new Date().toISOString().split('T')[0] });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editItem 
      ? `http://localhost:5000/api/announcements/${editItem.id}` 
      : 'http://localhost:5000/api/announcements';
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
    if (!confirm('Are you sure you want to delete this notice?')) return;
    await fetch(`http://localhost:5000/api/announcements/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'badge-red';
      case 'medium': return 'badge-amber';
      default: return 'badge-blue';
    }
  };

  return (
    <div>
      <div className="operations-bar">
        <div className="operations-title">
          <h2>Campus Notice Board</h2>
          <p>Official university announcements and urgent alerts</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <PlusIcon /> Post Notice
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {data.map((item) => (
          <div key={item.id} className="card">
            <div className="card-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge ${getPriorityBadgeClass(item.priority)}`}>
                  {item.priority} Priority
                </span>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{item.date}</span>
              </div>
              <div>
                <button onClick={() => handleOpenModal(item)} className="btn-icon"><EditIcon /></button>
                <button onClick={() => handleDelete(item.id)} className="btn-icon danger"><TrashIcon /></button>
              </div>
            </div>

            <h3 className="card-title">{item.title}</h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '1.05rem', lineHeight: '1.6' }}>
              {item.body}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editItem ? 'Edit Announcement' : 'Post Announcement'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Midterm Examination Schedule Released"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date" required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Body Text</label>
                <textarea
                  required rows={4}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Write notice details here..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Post Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}