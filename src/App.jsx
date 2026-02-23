import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { initializeData } from './utils/storage';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Browse from './pages/Browse/Browse';
import Departments from './pages/Departments/Departments';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

// Initialize default data on first load
initializeData();

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
