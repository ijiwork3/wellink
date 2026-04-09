import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import CampaignBrowse from './pages/CampaignBrowse'
import MyCampaign from './pages/MyCampaign'
import CampaignDetail from './pages/CampaignDetail'
import Profile from './pages/Profile'
import Media from './pages/Media'
import Signup from './pages/Signup'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/campaigns/browse" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/campaigns/browse" element={<CampaignBrowse />} />
        <Route path="/campaigns/my" element={<MyCampaign />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/media" element={<Media />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
