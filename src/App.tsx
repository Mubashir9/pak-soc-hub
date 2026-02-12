import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Events from './pages/Events/Events';
import EventDetail from './pages/Events/EventDetail';
import Tasks from './pages/Tasks/Tasks';
import Team from './pages/Team/Team';
import Budget from './pages/Budget/Budget';
import Meetings from './pages/Meetings';
import MeetingDetail from './pages/MeetingDetail';
import Sponsors from './pages/Sponsors';
import Archive from './pages/Archive';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="team" element={<Team />} />
          <Route path="budget" element={<Budget />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="meetings/:id" element={<MeetingDetail />} />
          <Route path="sponsors" element={<Sponsors />} />
          <Route path="archive" element={<Archive />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
