import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Download, Image, BarChart3, Users, UserCheck, FileText, TrendingUp, Eye, Heart, MessageCircle, Info } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import ErrorState from '../components/ErrorState'
import { useQAMode } from '../utils/useQAMode'
import { fmtDate } from '../utils/fmtDate'

/* ─── 더미 데이터 ─── */
const campaignsData: Record<string, {
  name: string
  status: string
  category: string
  budget: string
  period: string
  headcount: number
  description: string
  influencers: { id: number; name: string; status: string; content: string; deadline: string; avatar: string; dday: number }[]
}> = {
  '1': {
    name: '봄 요가 프로모션',
    status: '모집중',
    category: '피트니스',
    budget: '2,000,000원',
    period: '2026-03-25 ~ 2026-04-25',
    headcount: 15,
    description: '봄 시즌을 맞아 요가·필라테스 인플루언서와 함께하는 브랜드 캠페인입니다. 제품 체험 후 솔직한 후기 콘텐츠를 제작합니다.',
    influencers: [
      { id: 1, name: '이창민', status: '진행중', content: '인스타그램 피드 1건', deadline: '2026-04-20', avatar: 'bg-pink-200', dday: 4 },
      { id: 2, name: '김가애', status: '검수중', content: '인스타그램 릴스 1건', deadline: '2026-05-08', avatar: 'bg-yellow-200', dday: 22 },
      { id: 3, name: '박리나', status: '완료', content: '인스타그램 피드 2건', deadline: '2026-04-18', avatar: 'bg-purple-200', dday: 2 },
      { id: 4, name: '민경완', status: '콘텐츠대기', content: '인스타그램 스토리 3건', deadline: '2026-04-22', avatar: 'bg-blue-200', dday: 6 },
    ],
  },
  '2': {
    name: '비건 신제품 론칭',
    status: '대기중',
    category: '뷰티/웰니스',
    budget: '1,500,000원',
    period: '2026-04-10 ~ 2026-05-10',
    headcount: 10,
    description: '비건 스킨케어 신제품 론칭을 알리는 캠페인입니다. 뷰티/웰니스 카테고리 인플루언서 대상.',
    influencers: [
      { id: 5, name: '장영훈', status: '대기중', content: '미정', deadline: '2026-04-18', avatar: 'bg-green-200', dday: 14 },
    ],
  },
}

// 지원자 관리 더미
const applicantsData = [
  { id: 101, name: '최은지', followers: '12.3K', engagement: 4.2, fitScore: 92, appliedAt: '2026-04-17', avatar: 'bg-rose-200' },
  { id: 102, name: '한준영', followers: '8.7K', engagement: 5.1, fitScore: 87, appliedAt: '2026-04-18', avatar: 'bg-sky-200' },
  { id: 103, name: '오다은', followers: '22.1K', engagement: 3.8, fitScore: 78, appliedAt: '2026-04-20', avatar: 'bg-amber-200' },
]

// 선정된 지원자 더미
const selectedApplicantsData = [
  { id: 201, name: '이창민', followers: '8.7K', engagement: 4.1, fitScore: 92, selectedAt: '2026-04-21', avatar: 'bg-pink-200' },
  { id: 202, name: '김가애', followers: '18.9K', engagement: 4.2, fitScore: 88, selectedAt: '2026-04-22', avatar: 'bg-yellow-200' },
]

// 등록 콘텐츠 더미
const registeredContents = [
  { id: 1, thumbnail: 'bg-gradient-to-br from-pink-100 to-pink-200', influencer: '이창민', type: '릴스', reach: 12400, likes: 890, comments: 42, saves: 156 },
  { id: 2, thumbnail: 'bg-gradient-to-br from-yellow-100 to-yellow-200', influencer: '김가애', type: '피드', reach: 8100, likes: 540, comments: 28, saves: 89 },
  { id: 3, thumbnail: 'bg-gradient-to-br from-purple-100 to-purple-200', influencer: '박리나', type: '스토리', reach: 5200, likes: 380, comments: 15, saves: 62 },
  { id: 4, thumbnail: 'bg-gradient-to-br from-blue-100 to-blue-200', influencer: '민경완', type: '피드', reach: 6700, likes: 420, comments: 31, saves: 78 },
]

const typeColors: Record<string, string> = {
  '이미지': 'bg-sky-100 text-sky-700',
  '릴스': 'bg-pink-100 text-pink-700',
  '스토리': 'bg-purple-100 text-purple-700',
  '영상': 'bg-orange-100 text-orange-700',
  '피드': 'bg-blue-100 text-blue-700',
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  '모집중': { label: '모집중', cls: 'bg-[#8CC63F]/10 text-[#5a8228]' },
  '대기중': { label: '대기중', cls: 'bg-amber-50 text-amber-700' },
  '진행중': { label: '진행중', cls: 'bg-amber-50 text-amber-700' },
  '검수중': { label: '검수중', cls: 'bg-gray-100 text-gray-600' },
  '완료': { label: '완료', cls: 'bg-[#8CC63F]/10 text-[#5a8228]' },
  '반려': { label: '반려', cls: 'bg-red-50 text-red-600' },
  '콘텐츠대기': { label: '콘텐츠대기', cls: 'bg-gray-100 text-gray-600' },
}

const tabs = ['캠페인 정보', '지원자 관리', '선정 인플루언서', '등록 콘텐츠', '성과 리포트']

/** QA qa 값 → 탭명 변환 */
function tabFromQA(qa: string): string {
  if (qa === 'tab-applicants' || qa === 'tab-applicants-empty' || qa === 'modal-approve' || qa === 'modal-reject') return '지원자 관리'
  if (qa === 'tab-selected' || qa === 'tab-selected-empty') return '선정 인플루언서'
  if (qa === 'tab-content' || qa === 'tab-content-empty') return '등록 콘텐츠'
  if (qa === 'tab-report' || qa === 'tab-report-empty') return '성과 리포트'
  return '캠페인 정보'
}

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qa = useQAMode()
  const campaign = campaignsData[id ?? '1'] ?? campaignsData['1']

  const [activeTab, setActiveTab] = useState(() => tabFromQA(qa))

  // qa 파라미터 변경 시 탭 동기화
  useEffect(() => {
    setActiveTab(tabFromQA(qa))
  }, [qa])

  // 탭 전환 시 스크롤 초기화
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab])

  // 지원자 관리 state
  // QA: tab-applicants-empty → 빈 배열, 대기중 캠페인(id=2) → 빈 배열, 그 외 → 정상 데이터
  const [applicants, setApplicants] = useState(
    qa === 'tab-applicants-empty' || campaign.status === '대기중' ? [] : applicantsData
  )
  const [checkedApplicants, setCheckedApplicants] = useState<Set<number>>(new Set())

  // 선정된 지원자 state
  // QA: tab-selected-empty → 빈 배열
  const [selectedInfluencers, setSelectedInfluencers] = useState(
    qa === 'tab-selected-empty' ? [] : selectedApplicantsData
  )

  // 콘텐츠 다운로드 모달
  const [downloadModal, setDownloadModal] = useState(false)
  const [selectedContents, setSelectedContents] = useState<Set<number>>(new Set())
  const [isPaying, setIsPaying] = useState(false)

  // 콘텐츠검수 (기존 기능 유지)
  const [, setStatuses] = useState<Record<number, string>>(
    Object.fromEntries(campaign.influencers.map(inf => [inf.id, inf.status]))
  )
  // QA: modal-reject → 첫 번째 인플루언서로 반려 모달 미리 열기
  const [rejectModal, setRejectModal] = useState<number | null>(
    qa === 'modal-reject' ? campaign.influencers[0]?.id ?? null : null
  )
  const [feedback, setFeedback] = useState('')

  // QA: 로딩 상태 — 스켈레톤 전체 레이아웃
  if (qa === 'loading') {
    return (
      <div className="space-y-5 animate-pulse">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-200" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 rounded-full" />
            <div className="h-3 w-24 bg-gray-100 rounded-full" />
          </div>
        </div>
        {/* 탭 바 스켈레톤 */}
        <div className="flex gap-1 border-b border-gray-200 pb-0">
          {[80, 72, 88, 72, 72].map((w, i) => (
            <div key={i} className="pb-2.5 px-2">
              <div className={`h-4 bg-gray-200 rounded-full`} style={{ width: w }} />
            </div>
          ))}
        </div>
        {/* 콘텐츠 영역 스켈레톤 */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <div className="h-4 w-32 bg-gray-200 rounded-full" />
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex gap-4 py-2 border-b border-gray-50 last:border-0">
                <div className="h-3 w-20 bg-gray-100 rounded-full" />
                <div className="h-3 w-28 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded-full" />
            <div className="h-3 w-full bg-gray-100 rounded-full" />
            <div className="h-3 w-4/5 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  // QA: 에러 상태
  if (qa === 'error') {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/campaigns')} aria-label="이전" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">캠페인 상세</h1>
        </div>
        <ErrorState message="캠페인 정보를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
      </div>
    )
  }

  const campaignStatus = statusConfig[campaign.status] ?? { label: campaign.status, cls: 'bg-gray-100 text-gray-600' }

  // 지원자 관리 핸들러
  const handleSelectApplicant = (applicantId: number) => {
    const applicant = applicants.find(a => a.id === applicantId)
    if (applicant) {
      setSelectedInfluencers(prev => [
        ...prev,
        {
          id: applicant.id,
          name: applicant.name,
          followers: applicant.followers,
          engagement: applicant.engagement,
          fitScore: applicant.fitScore,
          selectedAt: new Date().toISOString().slice(0, 10),
          avatar: applicant.avatar,
        },
      ])
    }
    setApplicants(prev => prev.filter(a => a.id !== applicantId))
    showToast('선정 완료! DM으로 가이드를 전달해 보세요.', 'success')
  }

  const handleBulkSelect = () => {
    if (checkedApplicants.size === 0) {
      showToast('선정할 지원자를 선택해주세요.', 'error')
      return
    }
    const toSelect = applicants.filter(a => checkedApplicants.has(a.id))
    setSelectedInfluencers(prev => [
      ...prev,
      ...toSelect.map(a => ({
        id: a.id,
        name: a.name,
        followers: a.followers,
        engagement: a.engagement,
        fitScore: a.fitScore,
        selectedAt: new Date().toISOString().slice(0, 10),
        avatar: a.avatar,
      })),
    ])
    setApplicants(prev => prev.filter(a => !checkedApplicants.has(a.id)))
    setCheckedApplicants(new Set())
    showToast(`선정 완료! DM으로 가이드를 전달해 보세요.`, 'success')
  }

  const toggleCheck = (applicantId: number) => {
    setCheckedApplicants(prev => {
      const next = new Set(prev)
      if (next.has(applicantId)) next.delete(applicantId)
      else next.add(applicantId)
      return next
    })
  }

  // 선정 취소
  const handleDeselectInfluencer = (influencerId: number) => {
    const influencer = selectedInfluencers.find(i => i.id === influencerId)
    if (influencer) {
      setApplicants(prev => [
        ...prev,
        {
          id: influencer.id,
          name: influencer.name,
          handle: influencer.name,
          followers: influencer.followers,
          fitScore: influencer.fitScore,
          appliedAt: new Date().toISOString().slice(0, 10),
          status: '검토중',
          engagement: influencer.engagement,
          avatar: influencer.avatar,
        },
      ])
    }
    setSelectedInfluencers(prev => prev.filter(i => i.id !== influencerId))
    showToast('선정이 취소되었습니다.', 'info')
  }

  // 콘텐츠 다운로드
  const toggleContentCheck = (contentId: number) => {
    setSelectedContents(prev => {
      const next = new Set(prev)
      if (next.has(contentId)) next.delete(contentId)
      else next.add(contentId)
      return next
    })
  }

  const handleDownloadPayment = () => {
    if (isPaying) return
    setIsPaying(true)
    setDownloadModal(false)
    setSelectedContents(new Set())
    showToast('다운로드 준비 중입니다.', 'success')
    setTimeout(() => setIsPaying(false), 1500)
  }

  // 반려
  const handleReject = () => {
    if (!feedback.trim()) { showToast('피드백 내용을 입력해주세요.', 'error'); return }
    if (rejectModal !== null) {
      setStatuses(prev => ({ ...prev, [rejectModal]: '반려' }))
      // 지원자 목록에서도 제거
      setApplicants(prev => prev.filter(a => a.id !== rejectModal))
    }
    setRejectModal(null)
    setFeedback('')
    showToast('반려 피드백이 전달되었습니다.', 'info')
  }

  // 성과 리포트 데이터
  const reportKPI = [
    { label: '총 도달', value: '32.4K', icon: Eye },
    { label: '총 참여', value: '2,731', icon: Heart },
    { label: '참여율', value: '8.4%', icon: TrendingUp },
    { label: '콘텐츠 수', value: '4', icon: FileText },
  ]

  const chartData = registeredContents.map(c => ({ name: c.influencer, likes: c.likes }))
  const maxLikes = chartData.length > 0 ? Math.max(...chartData.map(d => d.likes)) : 0

  // SVG 라인 차트 계산
  const chartW = 500
  const chartH = 200
  const padL = 50
  const padR = 30
  const padT = 20
  const padB = 40
  const plotW = chartW - padL - padR
  const plotH = chartH - padT - padB
  const points = chartData.map((d, i) => ({
    x: padL + (i / Math.max(1, chartData.length - 1)) * plotW,
    y: padT + plotH - (d.likes / maxLikes) * plotH,
    ...d,
  }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  // 콘텐츠 순위 (좋아요 순)
  const rankedContents = [...registeredContents].sort((a, b) => b.likes - a.likes)

  const isClosed = qa === 'campaign-closed'

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/campaigns')}
          aria-label="이전"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{campaign.name}</h1>
            <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${campaignStatus.cls}`}>
              {campaignStatus.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{campaign.category} · {campaign.period.split(' ~ ').map(fmtDate).join(' ~ ')}</p>
        </div>
      </div>

      {/* QA: 캠페인 종료 배너 */}
      {isClosed && (
        <div className="bg-slate-100 border border-slate-200 text-slate-600 text-sm px-4 py-3 rounded-xl mb-4">
          이 캠페인은 종료되었습니다.
        </div>
      )}

      {/* 탭 */}
      <div className="overflow-x-auto flex border-b border-gray-200 sticky top-0 bg-white z-10">
        {tabs.map(tab => {
          const isDisabled = isClosed && tab === '지원자 관리'
          return (
            <button
              key={tab}
              onClick={() => { if (!isDisabled) { setActiveTab(tab); setCheckedApplicants(new Set()) } }}
              disabled={isDisabled}
              className={`whitespace-nowrap px-4 py-2.5 text-sm border-b-2 transition-all duration-150 ${
                isDisabled
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : activeTab === tab
                    ? 'border-[#8CC63F] font-semibold text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* ─── A) 캠페인 정보 탭 ─── */}
      {activeTab === '캠페인 정보' && (
        <div className="space-y-4">
          {/* DM 안내 배너 — 선정된 인플루언서가 있을 때만 표시 */}
          {selectedInfluencers.length > 0 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#8CC63F]/10 border border-[#8CC63F]/30">
              <p className="text-sm text-[#5a8228] font-medium">인플루언서가 선정되었습니다. DM을 발송해 보세요.</p>
              <button
                onClick={() => navigate('/influencers/dm')}
                className="shrink-0 text-xs bg-[#8CC63F] text-white px-3 py-1.5 rounded-xl hover:bg-[#7AB535] transition-colors duration-150"
              >
                DM 이동
              </button>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={15} className="text-gray-400" />
              캠페인 기본 정보
            </h2>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {[
                { label: '캠페인명', value: campaign.name },
                { label: '상태', value: campaign.status, badge: true },
                { label: '카테고리', value: campaign.category },
                { label: '예산', value: campaign.budget },
                { label: '기간', value: campaign.period.split(' ~ ').map(fmtDate).join(' ~ ') },
                { label: '모집인원', value: `${campaign.headcount}명` },
              ].map((row, idx, arr) => (
                <div
                  key={row.label}
                  className={`flex gap-4 px-4 py-3 ${idx < arr.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <span className="text-xs text-gray-500 w-24 shrink-0">{row.label}</span>
                  {row.badge ? (
                    <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${campaignStatus.cls}`}>
                      {campaignStatus.label}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-900 font-medium">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">설명</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{campaign.description}</p>
          </div>
        </div>
      )}

      {/* ─── B) 지원자 관리 탭 ─── */}
      {activeTab === '지원자 관리' && !isClosed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users size={15} className="text-gray-400" />
              지원자 {applicants.length}명
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleBulkSelect}
                disabled={applicants.length === 0}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UserCheck size={13} />
                일괄 선정
              </button>
              <button
                onClick={() => showToast('리스트를 CSV로 내보냅니다.', 'info')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition-colors duration-150"
              >
                <Download size={13} />
                리스트 Export
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      aria-label="전체 선택"
                      checked={checkedApplicants.size === applicants.length && applicants.length > 0}
                      onChange={() => {
                        if (checkedApplicants.size === applicants.length) setCheckedApplicants(new Set())
                        else setCheckedApplicants(new Set(applicants.map(a => a.id)))
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  {['이름', '팔로워', '참여율', 'Fit Score', '신청일', '액션'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applicants.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        aria-label={`${a.name} 선택`}
                        checked={checkedApplicants.has(a.id)}
                        onChange={() => toggleCheck(a.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${a.avatar} flex items-center justify-center text-gray-700 font-semibold text-sm shrink-0`}>
                          {a.name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[100px]">{a.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{a.followers}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{a.engagement}%</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-gray-900">{a.fitScore}</span>
                      <span className="text-xs text-gray-400 ml-0.5">점</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{fmtDate(a.appliedAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleSelectApplicant(a.id)}
                          className="flex items-center gap-1 text-xs bg-[#8CC63F] text-white px-3 py-1.5 rounded-xl hover:bg-[#7AB535] transition-colors duration-150"
                        >
                          <Check size={12} /> 선정
                        </button>
                        <button
                          onClick={() => setRejectModal(a.id)}
                          className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors duration-150"
                        >
                          <X size={12} /> 반려
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {applicants.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                      지원자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── C) 선정된 지원자 탭 ─── */}
      {activeTab === '선정 인플루언서' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck size={15} className="text-gray-400" />
              선정된 인플루언서 {selectedInfluencers.length}명
            </h2>
            <button
              onClick={() => showToast('리스트를 CSV로 내보냅니다.', 'info')}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition-colors duration-150"
            >
              <Download size={13} />
              리스트 Export
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {['이름', '팔로워', '참여율', 'Fit Score', '선정일', '액션'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {selectedInfluencers.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${i.avatar} flex items-center justify-center text-gray-700 font-semibold text-sm shrink-0`}>
                          {i.name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{i.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{i.followers}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{i.engagement}%</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-gray-900">{i.fitScore}</span>
                      <span className="text-xs text-gray-400 ml-0.5">점</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{fmtDate(i.selectedAt)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeselectInfluencer(i.id)}
                        disabled={isClosed}
                        className={`flex items-center gap-1 text-xs border px-3 py-1.5 rounded-xl transition-colors duration-150 ${
                          isClosed
                            ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                            : 'text-red-500 border-red-200 hover:bg-red-50'
                        }`}
                      >
                        <X size={12} /> 선정 취소
                      </button>
                    </td>
                  </tr>
                ))}
                {selectedInfluencers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                      선정된 인플루언서가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── D) 등록 콘텐츠 탭 ─── */}
      {activeTab === '등록 콘텐츠' && qa === 'tab-content-empty' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Image size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">등록된 콘텐츠가 없습니다</p>
          <p className="text-xs text-gray-300 mt-1">인플루언서가 콘텐츠를 제출하면 여기에 표시됩니다.</p>
        </div>
      )}
      {activeTab === '등록 콘텐츠' && qa !== 'tab-content-empty' && (
        <div className="space-y-4">
          {/* 유료 다운로드 안내 배너 */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
            <Info size={15} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">💡 콘텐츠 다운로드는 건당 5,000원이 부과됩니다.</p>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Image size={15} className="text-gray-400" />
              등록된 콘텐츠 {registeredContents.length}건
            </h2>
            <button
              onClick={() => {
                if (selectedContents.size === 0) {
                  showToast('다운로드할 콘텐츠를 선택해주세요.', 'error')
                  return
                }
                setDownloadModal(true)
              }}
              className="flex items-center gap-2 bg-[#8CC63F] text-white px-3 py-1.5 rounded-xl text-xs hover:bg-[#7AB535] transition-colors duration-150"
            >
              <Download size={13} />
              콘텐츠 다운로드
            </button>
          </div>

          {/* 콘텐츠 카드 그리드 */}
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
            {registeredContents.map(c => {
              const isChecked = selectedContents.has(c.id)
              const engRate = c.reach > 0
                ? ((c.likes + c.comments + c.saves) / c.reach * 100).toFixed(1)
                : '0.0'
              return (
                <div
                  key={c.id}
                  onClick={() => toggleContentCheck(c.id)}
                  className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-150 shadow-sm ${
                    isChecked ? 'border-[#8CC63F]' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* 썸네일 */}
                  <div className={`relative w-full aspect-[4/3] ${c.thumbnail} flex items-center justify-center`}>
                    <Image size={32} className="text-white/60" />
                    {/* 선택 체크 */}
                    <div className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                      isChecked ? 'bg-[#8CC63F] border-[#8CC63F]' : 'bg-white/80 border-gray-300'
                    }`}>
                      {isChecked && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                    {/* 유형 배지 */}
                    <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[c.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {c.type}
                    </span>
                  </div>

                  {/* 정보 영역 */}
                  <div className="p-4">
                    {/* 인플루언서 */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs shrink-0">
                        {c.influencer[0]}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{c.influencer}</span>
                    </div>

                    {/* 지표 4개 */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 mb-0.5">도달</p>
                        <p className="text-xs font-bold text-gray-800">{c.reach >= 1000 ? `${(c.reach / 1000).toFixed(1)}K` : c.reach}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 mb-0.5 flex items-center justify-center gap-0.5">
                          <Heart size={9} className="text-red-400" />좋아요
                        </p>
                        <p className="text-xs font-bold text-gray-800">{c.likes.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 mb-0.5 flex items-center justify-center gap-0.5">
                          <MessageCircle size={9} className="text-gray-400" />댓글
                        </p>
                        <p className="text-xs font-bold text-gray-800">{c.comments}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 mb-0.5">참여율</p>
                        <p className="text-xs font-bold text-[#8CC63F]">{engRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── E) 성과 리포트 탭 — 빈 상태 ─── */}
      {activeTab === '성과 리포트' && qa === 'tab-report-empty' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <BarChart3 size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">성과 데이터가 없습니다</p>
          <p className="text-xs text-gray-300 mt-1">캠페인이 진행되면 성과 리포트가 자동으로 생성됩니다.</p>
        </div>
      )}

      {/* ─── E) 성과 리포트 탭 ─── */}
      {activeTab === '성과 리포트' && qa !== 'tab-report-empty' && (
        <div className="space-y-5">
          {/* KPI 카드 4개 */}
          <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
            {reportKPI.map(k => {
              const Icon = k.icon
              return (
                <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">{k.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{k.value}</div>
                </div>
              )
            })}
          </div>

          {/* 콘텐츠 성과 추세 그래프 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">콘텐츠 성과 추세</h3>
            <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
              {/* Y축 그리드 */}
              {[0, 0.25, 0.5, 0.75, 1].map(r => {
                const y = padT + plotH - r * plotH
                const val = Math.round(r * maxLikes)
                return (
                  <g key={r}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                    <text x={padL - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400">{val}</text>
                  </g>
                )
              })}
              {/* 라인 */}
              <path d={linePath} fill="none" stroke="#8CC63F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {/* 포인트 + 라벨 */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={4} fill="#8CC63F" />
                  <circle cx={p.x} cy={p.y} r={6} fill="#8CC63F" fillOpacity={0.2} />
                  <text x={p.x} y={chartH - 8} textAnchor="middle" className="text-[10px] fill-gray-500">{p.name}</text>
                  <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] fill-gray-700 font-medium">{p.likes}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* 콘텐츠 순위 테이블 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">콘텐츠 순위</h3>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {['순위', '인플루언서', '유형', '도달', '좋아요', '참여율'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rankedContents.map((c, idx) => {
                  const engRate = c.reach > 0 ? ((c.likes + c.comments + c.saves) / c.reach * 100).toFixed(1) : '0.0'
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{c.influencer}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[c.type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{c.reach.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{c.likes.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-[#8CC63F]">{engRate}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* 콘텐츠 다운로드 결제 모달 */}
      <Modal open={downloadModal} onClose={() => setDownloadModal(false)} title="콘텐츠 다운로드">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">등록된 콘텐츠를 다운로드하려면 결제가 필요합니다.</p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">단가</span>
              <span className="text-gray-900 font-medium">1건당 5,000원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">선택 콘텐츠</span>
              <span className="text-gray-900 font-medium">{selectedContents.size}건</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">총 금액</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{(selectedContents.size * 5000).toLocaleString()}원</span>
                  <span className="text-xs text-gray-400 ml-1">(VAT 포함)</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">다운로드한 콘텐츠는 계약된 SNS 채널 및 광고 활용 범위 내에서만 사용 가능합니다.</p>
          <button
            onClick={handleDownloadPayment}
            disabled={isPaying}
            className="w-full bg-[#8CC63F] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#7AB535] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            결제하기
          </button>
        </div>
      </Modal>

      {/* 반려 모달 */}
      <Modal open={rejectModal !== null} onClose={() => { setRejectModal(null); setFeedback('') }} title="콘텐츠 반려">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">반려 이유를 입력해주세요. 인플루언서에게 전달됩니다.</p>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="예) 브랜드 로고가 누락되었습니다. 수정 후 재제출해 주세요."
            rows={4}
            maxLength={500}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-150"
          />
          <div className="text-right text-xs text-gray-400 mt-0.5">{feedback.length}/500</div>
          <div className="flex gap-2">
            <button
              onClick={() => { setRejectModal(null); setFeedback('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors duration-150"
            >취소</button>
            <button
              onClick={handleReject}
              className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm hover:bg-red-600 transition-colors duration-150"
            >반려 전송</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
