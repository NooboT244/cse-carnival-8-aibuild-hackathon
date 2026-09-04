import { useState } from 'react';

const initialFormState = {
  id: '',
  course: '',
  course_title: '',
  title: '',
  description: '',
  assigned_date: '',
  deadline: '',
  submission_platform: '',
  status: 'pending',
  marks: 10,
};

export default function AssignmentTab({ data = [], onRefresh }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const statuses = ['All', 'pending', 'submitted', 'graded', 'overdue'];

  // Filter assignments by status
  const filteredData = statusFilter === 'All'
    ? data
    : data.filter((item) => item.status?.toLowerCase() === statusFilter.toLowerCase());

  // Open Modal for Create
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ...initialFormState,
      id: `asgn-${Date.now().toString().slice(-6)}`,
      assigned_date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id || '',
      course: item.course || '',
      course_title: item.course_title || '',
      title: item.title || '',
      description: item.description || '',
      assigned_date: item.assigned_date || '',
      deadline: item.deadline || '',
      submission_platform: item.submission_platform || '',
      status: item.status || 'pending',
      marks: item.marks || 10,
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
      ? `http://localhost:5000/api/assignments/${targetId}`
      : 'http://localhost:5000/api/assignments';
    const method = editingItem ? 'PATCH' : 'POST';

    const payload = {
      ...formData,
      marks: Number(formData.marks),
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
        alert(`Error: ${err.message || 'Failed to save assignment'}`);
      }
    } catch (error) {
      console.error('Assignment save error:', error);
      alert('Failed to connect to backend server.');
    }
  };

  // Delete Assignment Handler
  const handleDelete = async (item) => {
    if (!item.id) {
      alert('Error: Assignment ID is missing.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/assignments/${item.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to delete assignment'}`);
      }
    } catch (error) {
      console.error('Assignment delete error:', error);
      alert('Failed to connect to backend server.');
    }
  };

  // Helper for Status Badges
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: '#fef3c7', color: '#b45309', label: 'Pending' };
      case 'submitted':
        return { bg: '#dbeafe', color: '#1e40af', label: 'Submitted' };
      case 'graded':
        return { bg: '#dcfce7', color: '#15803d', label: 'Graded' };
      case 'overdue':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'Overdue' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: status || 'Unknown' };
    }
  };

  // Calculate days remaining until deadline
  const getDeadlineStatus = (deadlineStr) => {
    if (!deadlineStr) return null;
    const today = new Date('2026-09-04'); // Current reference date
    const deadlineDate = new Date(deadlineStr);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `(${Math.abs(diffDays)} days overdue)`, color: '#dc2626' };
    if (diffDays === 0) return { text: '(Due Today!)', color: '#dc2626' };
    if (diffDays === 1) return { text: '(Due Tomorrow)', color: '#d97706' };
    return { text: `(${diffDays} days left)`, color: 'var(--text-muted)' };
  };

  return (
    <div>
      {/* Operations Bar */}
      <div className="operations-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Assignments & Coursework</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Manage active tasks, project deadlines, and submission platforms
          </p>
        </div>

        <button className="btn-primary" onClick={handleOpenAdd}>
          + Add Assignment
        </button>
      </div>

      {/* Filter Tabs */}
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

      {/* Assignment Grid */}
      {filteredData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No assignments found matching status "{statusFilter}".
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredData.map((item) => {
            const badge = getStatusBadge(item.status);
            const deadlineInfo = getDeadlineStatus(item.deadline);

            return (
              <div
                key={item.id || item._id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}
              >
                {/* Top Row: Course Code & Status Badge */}
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
                    {item.course}
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

                {/* Title & Course Name */}
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {item.course_title}
                  </div>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', fontWeight: '700' }}>
                    {item.title}
                  </h3>
                </div>

                {/* Description */}
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4',
                  }}
                >
                  {item.description}
                </p>

                {/* Metadata Details */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '0.86rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div>📤 <strong>Platform:</strong> {item.submission_platform || 'N/A'}</div>
                  <div>📅 <strong>Assigned:</strong> {item.assigned_date}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    ⏰ <strong>Deadline:</strong> <span style={{ color: '#dc2626', fontWeight: '600' }}>{item.deadline}</span>
                    {deadlineInfo && (
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: deadlineInfo.color }}>
                        {deadlineInfo.text}
                      </span>
                    )}
                  </div>
                  <div>⭐ <strong>Total Marks:</strong> {item.marks}</div>
                </div>

                {/* Actions: Edit & Delete */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '4px',
                    paddingTop: '10px',
                    borderTop: '1px dashed var(--border-light)',
                  }}
                >
                  <button
                    onClick={() => handleOpenEdit(item)}
                    style={{
                      flex: 1,
                      padding: '8px',
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
                      padding: '8px 14px',
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
            <h3 style={{ marginBottom: '16px' }}>{editingItem ? 'Edit Assignment' : 'Add New Assignment'}</h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  type="number"
                  name="marks"
                  placeholder="Marks"
                  value={formData.marks}
                  onChange={handleChange}
                  required
                  style={{ width: '110px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
              </div>

              <input
                type="text"
                name="course_title"
                placeholder="Course Title (e.g. Pattern Recognition and Machine Learning)"
                value={formData.course_title}
                onChange={handleChange}
                required
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
              />

              <input
                type="text"
                name="title"
                placeholder="Assignment Title (e.g. Assignment 1: Bayes Classifier)"
                value={formData.title}
                onChange={handleChange}
                required
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
              />

              <textarea
                name="description"
                placeholder="Assignment description, requirements, and instructions..."
                rows={4}
                value={formData.description}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)', resize: 'vertical' }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Date</label>
                  <input
                    type="date"
                    name="assigned_date"
                    value={formData.assigned_date}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  name="submission_platform"
                  placeholder="Submission Platform (e.g. Google Classroom)"
                  value={formData.submission_platform}
                  onChange={handleChange}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                >
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="graded">Graded</option>
                  <option value="overdue">Overdue</option>
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
                  {editingItem ? 'Save Changes' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}