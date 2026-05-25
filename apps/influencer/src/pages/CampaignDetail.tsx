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
        <div className="pt-8 pb-28 lg:pb-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* 좌열: 타이틀 → 이미지 → 섹션들 */}
                <div className="flex-1 min-w-0 space-y-8">
                  {/* 타이틀 섹션 */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <Skeleton shape="circle" height={20} width="4rem" />
                      <Skeleton shape="text" height={14} width="8rem" />
                    </div>
                    <Skeleton shape="text" height={32} width="80%" className="mb-3" />
                    <Skeleton shape="text" height={16} width="50%" />
                  </div>
                  {/* 이미지 — aspect-video */}
                  <Skeleton shape="rect" className="w-full aspect-video rounded-2xl" />
                  {/* 캠페인 설명·제공 내역 섹션 */}
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-4">
                      <Skeleton shape="text" height={20} width="7rem" />
                      <Skeleton shape="card" height={100} width="100%" />
                    </div>
                  ))}
                  {/* 캠페인 미션 — 3열 카드 */}
                  <div className="space-y-4">
                    <Skeleton shape="text" height={20} width="8rem" />
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} shape="card" height={80} width="100%" />)}
                    </div>
                  </div>
                </div>
                {/* 우사이드바 */}
                <div className="lg:w-72 lg:shrink-0">
                  <Skeleton shape="card" height={300} width="100%" />
                </div>
              </div>
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
