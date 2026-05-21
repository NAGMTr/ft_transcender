import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile.tsx';
import Notfound from './components/NotFound';
import Footer from './components/Footer';

export default function App() {
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users/:user" element={<Profile />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}
