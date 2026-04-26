import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { ErrorState } from '@wellink/ui'
import { mockCampaigns as campaigns } from '../services/mock/campaigns'
import { useQAMode } from '@wellink/ui'
import CampaignDetailContent from '../components/CampaignDetailContent'

export default function CampaignDetail() {
  const qa = useQAMode()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const campaign = campaigns.find((c) => c.id === Number(id))

  const goBack = () => window.history.length > 1 ? navigate(-1) : navigate('/campaigns/browse')

  if (qa === 'loading') {
    return (
      <Layout showSidebar={false} pageTitle="캠페인 상세" onBack={goBack}>
        <div className="max-w-3xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-52 bg-gray-100 rounded-2xl mb-4" />
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex gap-2"><div className="h-4 bg-gray-100 rounded-full w-20" /><div className="h-4 bg-gray-100 rounded-full w-12" /></div>
            <div className="h-6 bg-gray-100 rounded-xl w-3/4" />
            <div className="h-4 bg-gray-100 rounded-xl w-full" />
            <div className="h-4 bg-gray-100 rounded-xl w-5/6" />
            <div className="grid grid-cols-2 gap-3"><div className="h-16 bg-gray-100 rounded-xl" /><div className="h-16 bg-gray-100 rounded-xl" /></div>
            <div className="h-14 bg-gray-100 rounded-xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout showSidebar={false} pageTitle="캠페인 상세" onBack={goBack}>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState message="캠페인 정보를 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  if (!campaign) {
    return (
      <Layout showSidebar={false} pageTitle="캠페인 상세" onBack={goBack}>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState message="캠페인을 찾을 수 없어요" onRetry={() => navigate('/campaigns/browse')} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSidebar={false} pageTitle={campaign.name} onBack={goBack}>
      <CampaignDetailContent campaign={campaign} />
    </Layout>
  )
}
