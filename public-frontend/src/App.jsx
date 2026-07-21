import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ArticlePage from './pages/ArticlePage';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <Routes>
          {/* Root maps to the "home" slug managed in the CMS */}
          <Route path="/" element={<ArticlePage />} />
          {/* Any other path is treated as a CMS page slug */}
          <Route path="/:slug" element={<ArticlePage />} />
        </Routes>
      </main>
    </div>
  );
}
