import { useState } from 'react';

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;

export default function AssignmentsTab({ data = [], onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ course: '', title: '', deadline: '', status: 'Pending' });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData(item);
    } else {
      setEditItem(null);
      setFormData({ course: '', title: '', deadline: '', status: 'Pending' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editItem 
      ? `http://localhost:5000/api/assignments/${editItem.id}` 
      : 'http://localhost:5000/api/assignments';
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
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    await fetch(`http://localhost:5000/api/assignments/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  const toggleStatus = async (item) => {
    const nextStatus = item.status === 'Submitted' ? 'Pending' : 'Submitted';
    await fetch(`http://localhost:5000/api/assignments/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, status: nextStatus }),
    });
    onRefresh();
  };

  return (
    <div>
      <div className="operations-bar">
        <div className="operations-title">
          <h2>Assignments & Tasks</h2>
          <p>Track homework deadlines and submission statuses</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <PlusIcon /> Add Task
        </button>
      </div>

      <div className="card-grid">
        {data.map((item) => {
          const isSubmitted = item.status === 'Submitted';

          return (
            <div key={item.id} className="card">
              <div>
                <div className="card-top">
                  <span className="badge badge-gray">{item.course}</span>
                  <div>
                    <button onClick={() => handleOpenModal(item)} className="btn-icon"><EditIcon /></button>
                    <button onClick={() => handleDelete(item.id)} className="btn-icon danger"><TrashIcon /></button>
                  </div>
                </div>

                <h3 className="card-title">{item.title}</h3>

                <div className="card-info">
                  <div>Deadline: <strong>{item.deadline}</strong></div>
                </div>
              </div>

              <div className="card-footer">
                <span className={`badge ${isSubmitted ? 'badge-green' : 'badge-amber'}`}>
                  {isSubmitted ? 'Submitted' : 'Pending'}
                </span>
                <button onClick={() => toggleStatus(item)} className="btn-secondary">
                  Mark as {isSubmitted ? 'Pending' : 'Submitted'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editItem ? 'Edit Assignment' : 'Add Assignment'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Code</label>
                <input
                  type="text" required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g. CSE321"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Process Scheduling Report"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="text" required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    placeholder="e.g. Tomorrow 11:59 PM"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}