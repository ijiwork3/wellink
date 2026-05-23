import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { ErrorState, Skeleton } from '@wellink/ui'
import { mockCampaigns as campaigns } from '../services/mock/campaigns'
import { useQAMode } from '@wellink/ui'
import CampaignDetailContent from '../components/CampaignDetailContent'
import { useApplications } from '../services/userState'

export default function CampaignDetail() {
  const qa = useQAMode()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const applications = useApplications()
  const campaign = campaigns.find((c) => c.id === Number(id))
  // 이미 신청한 캠페인이면 신청 버튼 대신 '신청완료' 표시 (cold-review A3: 단일 store)
  const isAlreadyApplied = campaign ? applications.has(campaign.id) : false

  const location = useLocation()
  // location.key === 'default' → 앱 내에서 진입한 히스토리 없음 (직접 URL 접근 or 새로고침)
  const goBack = () => location.key !== 'default' ? navigate(-1) : navigate('/campaigns/browse')

  if (qa === 'loading') {
    return (
      <Layout showSidebar={false} pageTitle="캠페인 상세" onBack={goBack}>
        <div className="@container">
          {/* 실제 콘텐츠와 동일한 컨테이너 정책: 모바일 풀폭, @[640px] 이상에서만 max-w-3xl + px-6 */}
          <Skeleton shape="rect" height={208} width="100%" className="@[640px]:max-w-3xl @[640px]:mx-auto @[640px]:mt-6 @[640px]:rounded-2xl" />
          <div className="@[640px]:max-w-3xl @[640px]:mx-auto @[640px]:px-6 @[640px]:py-6">
            <div className="px-4 py-5 @[640px]:p-6 @[640px]:bg-white @[640px]:rounded-2xl @[640px]:shadow-sm @[640px]:border @[640px]:border-gray-100 space-y-4">
              <div className="flex gap-2">
                <Skeleton shape="circle" height={16} width="5rem" />
                <Skeleton shape="circle" height={16} width="3rem" />
              </div>
              <Skeleton shape="text" height={24} width="75%" />
              <Skeleton shape="text" height={16} width="100%" />
              <Skeleton shape="text" height={16} width="83%" />
              <div className="grid grid-cols-1 @[640px]:grid-cols-2 gap-3">
                <Skeleton shape="card" height={64} width="100%" />
                <Skeleton shape="card" height={64} width="100%" />
              </div>
              <Skeleton shape="card" height={56} width="100%" />
              <Skeleton shape="card" height={48} width="100%" />
            </div>
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
          <ErrorState
            message="캠페인을 찾을 수 없어요"
            subMessage="이미 삭제됐거나 잘못된 링크일 수 있어요"
            retryLabel="캠페인 탐색으로 이동"
            showRetryIcon={false}
            onRetry={() => navigate('/campaigns/browse')}
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSidebar={false}>
      <CampaignDetailContent
        campaign={campaign}
        forceApplied={qa === 'applied' || isAlreadyApplied}
        forceClosed={qa === 'closed'}
        onBack={goBack}
      />
    </Layout>
  )
}
