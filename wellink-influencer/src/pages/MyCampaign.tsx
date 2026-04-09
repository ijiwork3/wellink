import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import Layout from '../components/Layout'

type CampaignStatus = '신청완료' | '진행중' | '게시완료' | '포인트지급'

interface Campaign {
  id: string
  name: string
  channel: string
  appliedAt: string
  status: CampaignStatus
  progress: string
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: '프로틴 파워 챌린지', channel: '인스타그램', appliedAt: '2026-03-15', status: '진행중', progress: '콘텐츠 제작 중' },
  { id: '2', name: '필라테스 스튜디오 체험', channel: '인스타그램', appliedAt: '2026-03-10', status: '신청완료', progress: '검토 중' },
  { id: '3', name: '아웃도어 장비 리뷰', channel: '네이버 블로그', appliedAt: '2026-02-28', status: '게시완료', progress: '게시 확인 중' },
  { id: '4', name: '헬스 보충제 캠페인', channel: '인스타그램', appliedAt: '2026-02-10', status: '포인트지급', progress: '완료' },
]

const STATUS_TABS = ['전체', '신청완료', '진행중', '게시완료', '포인트지급'] as const

const statusBadgeClass: Record<CampaignStatus, string> = {
  '신청완료': 'bg-blue-100 text-blue-700',
  '진행중': 'bg-yellow-100 text-yellow-700',
  '게시완료': 'bg-green-100 text-green-700',
  '포인트지급': 'bg-purple-100 text-purple-700',
}

export default function MyCampaign() {
  const navigate = useNavigate()
  const [activeStatus, setActiveStatus] = useState<string>('전체')

  const filtered = activeStatus === '전체'
    ? MOCK_CAMPAIGNS
    : MOCK_CAMPAIGNS.filter((c) => c.status === activeStatus)

  const countByStatus = (status: string) =>
    status === '전체' ? MOCK_CAMPAIGNS.length : MOCK_CAMPAIGNS.filter((c) => c.status === status).length

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">나의 캠페인</h2>
          <span className="text-sm text-gray-400">전체 {MOCK_CAMPAIGNS.length}개</span>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {STATUS_TABS.map((status) => {
            const count = countByStatus(status)
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                  activeStatus === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    activeStatus === status
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* 테이블 */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-5 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
            <span>캠페인명</span>
            <span>채널</span>
            <span>신청일</span>
            <span>상태</span>
            <span>진행상황</span>
          </div>

          {filtered.length === 0 ? (
            /* 빈 상태 */
            <div className="py-16 flex flex-col items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: '#f0fce8' }}
              >
                <Search size={28} style={{ color: '#8CC63F' }} />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">신청한 캠페인이 없어요</p>
              <p className="text-xs text-gray-400 mb-4">원하는 캠페인에 신청해 보세요</p>
              <button
                onClick={() => navigate('/campaigns/browse')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
                style={{ backgroundColor: '#8CC63F' }}
              >
                캠페인 찾아보기
              </button>
            </div>
          ) : (
            filtered.map((campaign) => (
              <div
                key={campaign.id}
                className="grid grid-cols-5 px-4 py-3.5 text-sm border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors duration-100"
              >
                <span className="font-medium text-gray-900 truncate pr-2">{campaign.name}</span>
                <span className="text-gray-600">{campaign.channel}</span>
                <span className="text-gray-500">{campaign.appliedAt}</span>
                <span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass[campaign.status]}`}>
                    {campaign.status}
                  </span>
                </span>
                <span className="text-gray-500 text-xs">{campaign.progress}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
