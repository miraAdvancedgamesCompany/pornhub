import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import BottomNav from './components/Layout/BottomNav'
import FeedPage from './pages/Feed/FeedPage'
import ReelsPage from './pages/Reels/ReelsPage'
import VideosPage from './pages/Videos/VideosPage'
import VideoPlayer from './pages/Videos/VideoPlayer'

// Dach pages
import DachLogin from './pages/Dach/DachLogin'
import DachLayout from './pages/Dach/DachLayout'
import DachHome from './pages/Dach/DachHome'
import VideoManager from './pages/Dach/VideoManager'
import CategoryManager from './pages/Dach/CategoryManager'
import StorageManager from './pages/Dach/StorageManager'

import './App.css'

export default function App() {
  return (
    <div className="app-layout" id="app">
      <Sidebar />

      <main className="app-main">
        <div className="app-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<FeedPage />} />
            <Route path="/reels" element={<ReelsPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/watch/:id" element={<VideoPlayer />} />

            {/* Dach (Dashboard) Routes */}
            <Route path="/dach/login" element={<DachLogin />} />
            <Route path="/dach" element={<DachLayout />}>
              <Route index element={<DachHome />} />
              <Route path="videos" element={<VideoManager />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="storage" element={<StorageManager />} />
            </Route>
          </Routes>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
