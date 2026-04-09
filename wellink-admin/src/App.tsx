import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { ToastProvider } from './components/Toast'
import Dashboard from './pages/Dashboard'
import ProfileInsight from './pages/ProfileInsight'
import AdPerformance from './pages/AdPerformance'
import InfluencerList from './pages/InfluencerList'
import InfluencerManage from './pages/InfluencerManage'
import DMManage from './pages/DMManage'
import AIListup from './pages/AIListup'
import Campaigns from './pages/Campaigns'
import CampaignNew from './pages/CampaignNew'
import CampaignDetail from './pages/CampaignDetail'
import Library from './pages/Library'
import Subscription from './pages/Subscription'
import ViralMetrics from './pages/ViralMetrics'
import MyPage from './pages/MyPage'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics/profile" element={<ProfileInsight />} />
            <Route path="/analytics/ads" element={<AdPerformance />} />
            <Route path="/analytics/viral" element={<ViralMetrics />} />
            <Route path="/influencers/list" element={<InfluencerList />} />
            <Route path="/influencers/manage" element={<InfluencerManage />} />
            <Route path="/influencers/dm" element={<DMManage />} />
            <Route path="/influencers/ai" element={<AIListup />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/new" element={<CampaignNew />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/library" element={<Library />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
