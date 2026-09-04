import { useState } from 'react';

const initialFormState = {
  id: '',
  title: '',
  body: '',
  date: '',
  priority: 'high',
  posted_by: '',
  expires: '',
};

export default function AnnouncementTab({ data = [], onRefresh }) {
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const priorities = ['All', 'high', 'medium', 'low'];

  // Filter announcements by priority
  const filteredData = priorityFilter === 'All'
    ? data
    : data.filter((item) => item.priority?.toLowerCase() === priorityFilter.toLowerCase());

  // Open Modal for Create
  const handleOpenAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingItem(null);
    setFormData({
      ...initialFormState,
      id: `ann-${Date.now().toString().slice(-6)}`,
      date: today,
      expires: today,
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id || '',
      title: item.title || '',
      body: item.body || '',
      date: item.date || '',
      priority: item.priority || 'high',
      posted_by: item.posted_by || '',
      expires: item.expires || '',
    });
    setIsModalOpen(true);
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form Submit Handler (POST or PATCH)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetId = editingItem ? editingItem.id : formData.id;
    const url = editingItem
      ? `http://localhost:5000/api/announcements/${targetId}`
      : 'http://localhost:5000/api/announcements';
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
        alert(`Error: ${err.message || 'Failed to save announcement'}`);
      }
    } catch (error) {
      console.error('Announcement save error:', error);
      alert('Failed to connect to backend server.');
    }
  };

  // Delete Announcement Handler
  const handleDelete = async (item) => {
    if (!item.id) {
      alert('Error: Announcement ID is missing.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/announcements/${item.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to delete announcement'}`);
      }
    } catch (error) {
      console.error('Announcement delete error:', error);
      alert('Failed to connect to backend server.');
    }
  };

  // Helper for Priority Badges
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { bg: '#fee2e2', color: '#b91c1c', label: '🔥 High Priority' };
      case 'medium':
        return { bg: '#fef3c7', color: '#b45309', label: '⚡ Medium Priority' };
      case 'low':
        return { bg: '#e0f2fe', color: '#0369a1', label: 'ℹ️ Low Priority' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: priority || 'Normal' };
    }
  };

  return (
    <div>
      {/* Operations Bar */}
      <div className="operations-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Notice Board & Announcements</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Important updates, class reschedules, and official departmental notices
          </p>
        </div>

        <button className="btn-primary" onClick={handleOpenAdd}>
          + Post Announcement
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {priorities.map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              background: priorityFilter === p ? 'var(--primary)' : 'var(--bg-card)',
              color: priorityFilter === p ? '#fff' : 'var(--text-main)',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Announcement Cards List */}
      {filteredData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No announcements found with priority "{priorityFilter}".
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredData.map((item) => {
            const badge = getPriorityBadge(item.priority);

            return (
              <div
                key={item.id || item._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderLeft: `4px solid ${badge.color}`,
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', flex: 1 }}>
                    {item.title}
                  </h3>
                  <span
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.color,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Body Content */}
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {item.body}
                </p>

                {/* Footer Metadata & Actions */}
                <div
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>👤 <strong>Posted by:</strong> {item.posted_by || 'Faculty'}</span>
                    <span>📅 <strong>Date:</strong> {item.date}</span>
                    <span>⏳ <strong>Expires:</strong> {item.expires}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        background: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #fee2e2',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>{editingItem ? 'Edit Announcement' : 'Post Announcement'}</h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                name="title"
                placeholder="Title (e.g. CSE 4113 Class Rescheduled — Sunday 7 Sep)"
                value={formData.title}
                onChange={handleChange}
                required
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
              />

              <textarea
                name="body"
                placeholder="Announcement body text..."
                rows={5}
                value={formData.body}
                onChange={handleChange}
                required
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)', resize: 'vertical' }}
              />

              <input
                type="text"
                name="posted_by"
                placeholder="Posted By (e.g. Prof. Dr. Md. Shahriar Mahbub)"
                value={formData.posted_by}
                onChange={handleChange}
                required
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Posted Date</label>
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiration Date</label>
                  <input
                    type="date"
                    name="expires"
                    value={formData.expires}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Priority Level</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)', marginTop: '4px' }}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}