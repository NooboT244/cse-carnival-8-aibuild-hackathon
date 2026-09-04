import { useState, useEffect, useCallback } from 'react';
import './App.css';

import ScheduleTab from './tabs/ScheduleTab';
import RoomsTab from './tabs/RoomsTab';
import EventsTab from './tabs/EventsTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';
import AssignmentsTab from './tabs/AssignmentsTab';

const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const DoorIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><circle cx="14" cy="12" r="1"/></svg>;
const TicketIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>;
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const CheckSquareIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;

export default function App() {
  const [activeTab, setActiveTab] = useState('schedules');
  const [data, setData] = useState({
    schedules: [],
    rooms: [],
    events: [],
    announcements: [],
    assignments: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [schedulesRes, roomsRes, eventsRes, announcementsRes, assignmentsRes] = await Promise.all([
        fetch('http://localhost:5000/api/schedules').catch(() => ({ json: () => [] })),
        fetch('http://localhost:5000/api/rooms').catch(() => ({ json: () => [] })),
        fetch('http://localhost:5000/api/events').catch(() => ({ json: () => [] })),
        fetch('http://localhost:5000/api/announcements').catch(() => ({ json: () => [] })),
        fetch('http://localhost:5000/api/assignments').catch(() => ({ json: () => [] })),
      ]);

      const [schedules, rooms, events, announcements, assignments] = await Promise.all([
        schedulesRes.json(),
        roomsRes.json(),
        eventsRes.json(),
        announcementsRes.json(),
        assignmentsRes.json(),
      ]);

      setData({
        schedules: Array.isArray(schedules) ? schedules : [],
        rooms: Array.isArray(rooms) ? rooms : [],
        events: Array.isArray(events) ? events : [],
        announcements: Array.isArray(announcements) ? announcements : [],
        assignments: Array.isArray(assignments) ? assignments : [],
      });
    } catch (err) {
      console.error('Error loading dashboard dataset:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs = [
    { id: 'schedules', label: 'Schedules', icon: <CalendarIcon /> },
    { id: 'rooms', label: 'Rooms & Labs', icon: <DoorIcon /> },
    { id: 'events', label: 'Events', icon: <TicketIcon /> },
    { id: 'announcements', label: 'Notice Board', icon: <BellIcon /> },
    { id: 'assignments', label: 'Assignments', icon: <CheckSquareIcon /> },
  ];

  return (
    <div>
      <header className="app-header">
        <div className="brand">
          <div className="brand-badge">CS</div>
          <div className="brand-info">
            <h1>CampusOS</h1>
            <p>Academic Dashboard & Operational Management</p>
          </div>
        </div>

        <nav className="tab-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '1.2rem' }}>
            Loading dashboard context...
          </div>
        ) : (
          <>
            {activeTab === 'schedules' && <ScheduleTab data={data.schedules} onRefresh={fetchData} />}
            {activeTab === 'rooms' && <RoomsTab data={data.rooms} onRefresh={fetchData} />}
            {activeTab === 'events' && <EventsTab data={data.events} onRefresh={fetchData} />}
            {activeTab === 'announcements' && <AnnouncementsTab data={data.announcements} onRefresh={fetchData} />}
            {activeTab === 'assignments' && <AssignmentsTab data={data.assignments} onRefresh={fetchData} />}
          </>
        )}
      </main>
    </div>
  );
}