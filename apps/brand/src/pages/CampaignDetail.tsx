import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Download, Image, BarChart3, Users, UserCheck, FileText, TrendingUp, Eye, Heart, Info, Crown, Share2, Edit2, Trash2, Search, Camera, Copy } from 'lucide-react'
import { Modal, AlertModal, TIMER_MS, CustomSelect } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { ErrorState } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { fmtNumber, CAMPAIGN_STATUS_STYLE, PARTICIPATION_STATUS_STYLE, CONTENT_TYPE_STYLE } from '@wellink/ui'
import { fmtDate } from '../utils/fmtDate'
import { useDeviceMode } from '../qa-mockup-kit'
import { usePlanAccess } from '../hooks/usePlanAccess'

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

// 캠페인 확장 메타 (레퍼런스 PDF 기준)
const campaignMeta: Record<string, {
  location: string
  storeName: string
  recruitPeriod: string  // 'YYYY-MM-DD ~ YYYY-MM-DD'
  announceDate: string
  uploadPeriod: string
  productName: string
  productDetail: string
  productPrice: number
  rewardPoint: number
  campaignType: '방문형' | '택배형'
  postType: string
  precaution: string
  requiredKeywords: string[]
  guideText: string
}> = {
  '1': {
    location: '강남/서초',
    storeName: '봄 요가 스튜디오',
    recruitPeriod: '2026-04-25 ~ 2026-05-25',
    announceDate: '2026-05-30',
    uploadPeriod: '2026-04-25 ~ 2026-05-25',
    productName: '4구 한우 프리미엄 선물세트 1.2kg',
    productDetail: '등심 300g + 안심 300g + 채끝 300g + 특수부위 300g',
    productPrice: 168000,
    rewardPoint: 0,
    campaignType: '방문형',
    postType: '피드, 릴스',
    precaution: '릴스 제작 우대',
    requiredKeywords: ['#봄요가', '#요가스튜디오', '#강남요가'],
    guideText: '구체적인 촬영 가이드나 강조하고 싶은 포인트를 적어주세요.',
  },
  '2': {
    location: '온라인',
    storeName: '비건 뷰티',
    recruitPeriod: '2026-04-10 ~ 2026-05-10',
    announceDate: '2026-05-15',
    uploadPeriod: '2026-05-15 ~ 2026-06-15',
    productName: '비건 스킨케어 3종 세트',
    productDetail: '클렌저 200ml + 토너 150ml + 크림 50ml',
    productPrice: 89000,
    rewardPoint: 30000,
    campaignType: '택배형',
    postType: '피드, 릴스',
    precaution: '실사용 1주일 후 후기 필수',
    requiredKeywords: ['#비건뷰티', '#클린뷰티'],
    guideText: '최소 7일 사용 후 솔직한 리뷰를 작성해주세요.',
  },
}
const fmtKRW = (n: number) => `₩${n.toLocaleString('ko-KR')}`

// 지원자 관리 더미 — 100명 (페이지네이션 적용)
const APPLICANT_NAME_POOL = [
  '최은지', '한준영', '오다은', '김지환', '박서연', '이도윤', '정하늘', '신유리',
  '강민재', '윤채영', '조성훈', '송예린', '백지호', '권나연', '문태진', '서다인',
  '홍은수', '배유나', '노건우', '안소현',
]
const AVATAR_POOL = ['bg-rose-200', 'bg-sky-200', 'bg-amber-200', 'bg-emerald-200', 'bg-violet-200', 'bg-pink-200', 'bg-cyan-200', 'bg-orange-200', 'bg-teal-200', 'bg-indigo-200']
const applicantsData = Array.from({ length: 100 }, (_, i) => {
  const name = APPLICANT_NAME_POOL[i % APPLICANT_NAME_POOL.length]
  const followersN = 5000 + (i * 317 % 40000)
  const followers = followersN >= 10000 ? `${(followersN / 1000).toFixed(1)}K` : `${followersN.toLocaleString()}`
  const engagement = +(2.5 + (i * 7 % 50) / 10).toFixed(1)
  const fitScore = 60 + (i * 13 % 40)
  const month = String(((i * 3) % 30 < 15 ? 3 : 4)).padStart(2, '0')
  const day = String(((i * 7) % 28) + 1).padStart(2, '0')
  return {
    id: 1000 + i,
    name: i < APPLICANT_NAME_POOL.length ? name : `${name}${Math.floor(i / APPLICANT_NAME_POOL.length) + 1}`,
    followers,
    engagement,
    fitScore,
    appliedAt: `2026-${month}-${day}`,
    avatar: AVATAR_POOL[i % AVATAR_POOL.length],
  }
})

// 선정된 지원자 더미 — 100명 (페이지네이션 적용)
const SELECTED_NAME_POOL = [
  '이창민', '김가애', '박리나', '민경완', '서유진', '한지수', '최민호', '윤아름',
  '강태현', '임소희', '구하늘', '나은영', '도성재', '류지원', '명세현', '변하경',
  '심태웅', '엄혜린', '오지훈', '진서영',
]
const selectedApplicantsData = Array.from({ length: 100 }, (_, i) => {
  const name = SELECTED_NAME_POOL[i % SELECTED_NAME_POOL.length]
  const followersN = 6000 + (i * 411 % 50000)
  const followers = followersN >= 10000 ? `${(followersN / 1000).toFixed(1)}K` : `${followersN.toLocaleString()}`
  const engagement = +(3.0 + (i * 9 % 40) / 10).toFixed(1)
  const fitScore = 70 + (i * 11 % 30)
  const month = String(((i * 5) % 30 < 20 ? 4 : 5)).padStart(2, '0')
  const day = String(((i * 3) % 28) + 1).padStart(2, '0')
  return {
    id: 2000 + i,
    name: i < SELECTED_NAME_POOL.length ? name : `${name}${Math.floor(i / SELECTED_NAME_POOL.length) + 1}`,
    followers,
    engagement,
    fitScore,
    selectedAt: `2026-${month}-${day}`,
    avatar: AVATAR_POOL[i % AVATAR_POOL.length],
  }
})

// 등록 콘텐츠 더미 100개 — 검수중/승인/반려 + 0값(reach=0) 엣지케이스 포함
const INFLUENCER_POOL = [
  { name: '이창민', id: '@changmin_fit', thumb: 'bg-gradient-to-br from-pink-200 to-pink-300' },
  { name: '김가애', id: '@gaga_daily',   thumb: 'bg-gradient-to-br from-yellow-200 to-yellow-300' },
  { name: '박리나', id: '@rina_life',    thumb: 'bg-gradient-to-br from-purple-200 to-purple-300' },
  { name: '민경완', id: '@kyeong_w',     thumb: 'bg-gradient-to-br from-blue-200 to-blue-300' },
  { name: '서유진', id: '@yujin_s',      thumb: 'bg-gradient-to-br from-green-200 to-green-300' },
  { name: '한지수', id: '@jisu_han',     thumb: 'bg-gradient-to-br from-rose-200 to-rose-300' },
  { name: '최민호', id: '@minho_choi',   thumb: 'bg-gradient-to-br from-indigo-200 to-indigo-300' },
  { name: '윤아름', id: '@areum_y',      thumb: 'bg-gradient-to-br from-teal-200 to-teal-300' },
  { name: '강태현', id: '@taehyun_k',    thumb: 'bg-gradient-to-br from-orange-200 to-orange-300' },
  { name: '임소희', id: '@sohee_lim',    thumb: 'bg-gradient-to-br from-cyan-200 to-cyan-300' },
]
type ContentPlatform = '인스타그램' | '유튜브' | '네이버 블로그' | '틱톡'
type ContentSubType = '피드' | '릴스' | '스토리' | '영상' | '쇼츠'
// 정책 §8.3 — 플랫폼·서브타입 조합. 네이버 블로그·틱톡은 서브타입 없음(null).
const PLATFORM_SUBTYPES: Array<{ platform: ContentPlatform; sub: ContentSubType | null }> = [
  { platform: '인스타그램', sub: '피드' },
  { platform: '인스타그램', sub: '릴스' },
  { platform: '인스타그램', sub: '스토리' },
  { platform: '유튜브',     sub: '영상' },
  { platform: '유튜브',     sub: '쇼츠' },
  { platform: '네이버 블로그', sub: null },
  { platform: '틱톡',       sub: null },
]
const STATUSES: ContentStatus[] = ['검수중', '승인', '승인', '승인', '반려']
const CAPTION_TEMPLATES = [
  '여름 홈트 30일 챌린지 후기',
  '비건 단백질 먹어본 솔직 리뷰',
  '신상 앰플 일주일 사용기',
  '러닝화 100km 신어보기',
  '다이어트 도시락 일주일 기록',
  '아침 요가 루틴 추천',
  '필라테스 입문 한 달 변화',
  '비타민C 앰플 비교 리뷰',
  '스트레칭 루틴 따라해봤어요',
  '단백질 보충제 솔직 시식',
  '레깅스 코디 추천',
  '저당 디저트 만들기',
  '홈카페 굿즈 언박싱',
  '미니멀 인테리어 챌린지',
  '캠핑 장비 추천템',
]
const registeredContents = Array.from({ length: 100 }, (_, i) => {
  const inf = INFLUENCER_POOL[i % INFLUENCER_POOL.length]
  const status = STATUSES[i % STATUSES.length]
  const isZeroReach = i % 20 === 19
  const reach    = isZeroReach ? 0 : 3000 + (i * 317 % 40000)
  const likes    = isZeroReach ? 0 : Math.floor(reach * (0.04 + (i % 7) * 0.01))
  const comments = isZeroReach ? 0 : Math.floor(reach * (0.003 + (i % 5) * 0.001))
  const saves    = isZeroReach ? 0 : Math.floor(reach * (0.01 + (i % 4) * 0.005))
  const shares   = isZeroReach ? 0 : Math.floor(reach * (0.015 + (i % 6) * 0.003))
  const viralScore = isZeroReach ? 0 : Math.min(99, 30 + (i * 71 % 70))
  const month = String(Math.floor(i / 30) + 3).padStart(2, '0')
  const day   = String((i % 28) + 1).padStart(2, '0')
  const ps = PLATFORM_SUBTYPES[i % PLATFORM_SUBTYPES.length]
  const caption = CAPTION_TEMPLATES[i % CAPTION_TEMPLATES.length]
  return {
    id: i + 1,
    caption: `${caption} #${i + 1}`,
    thumbnail: inf.thumb,
    influencer: inf.name,
    instagramId: inf.id,
    platform: ps.platform,
    type: ps.sub,
    submittedAt: `2026-${month}-${day}`,
    reach, likes, comments, saves, shares, viralScore,
    status,
  }
})

type ContentStatus = '검수중' | '승인' | '반려'
const CONTENT_STATUS_STYLE: Record<ContentStatus, string> = {
  '검수중': 'bg-amber-100 text-amber-700',
  '승인':   'bg-green-100 text-green-700',
  '반려':   'bg-red-100   text-red-600',
}

// 캠페인·참여 상태 스타일은 @wellink/ui 상수 사용
const statusConfig: Record<string, { label: string; cls: string }> = {
  ...Object.fromEntries(
    Object.entries(CAMPAIGN_STATUS_STYLE).map(([k, v]) => [k, { label: k, cls: v }])
  ),
  ...Object.fromEntries(
    Object.entries(PARTICIPATION_STATUS_STYLE).map(([k, v]) => [k, { label: k, cls: v }])
  ),
}

const tabs = ['캠페인 정보', '지원자 관리', '선정 인플루언서', '등록 콘텐츠', '성과 리포트']

/** QA qa 값 → 탭명 변환 */
function tabFromQA(qa: string): string {
  if (qa === 'tab-applicants' || qa === 'tab-applicants-empty' || qa === 'modal-approve' || qa === 'modal-select' || qa === 'modal-reject') return '지원자 관리'
  if (qa === 'tab-selected' || qa === 'tab-selected-empty') return '선정 인플루언서'
  if (qa === 'tab-content' || qa === 'tab-contents' || qa === 'tab-content-empty') return '등록 콘텐츠'
  if (qa === 'tab-report' || qa === 'tab-report-empty') return '성과 리포트'
  return '캠페인 정보'
}

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qa = useQAMode()
  const campaign = campaignsData[id ?? '1'] ?? campaignsData['1']
  const meta = campaignMeta[id ?? '1'] ?? campaignMeta['1']

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
  const [applicantsPage, setApplicantsPage] = useState(1)

  // 선정된 지원자 state
  // QA: tab-selected-empty → 빈 배열
  const [selectedInfluencers, setSelectedInfluencers] = useState(
    qa === 'tab-selected-empty' ? [] : selectedApplicantsData
  )
  const [selectedPage, setSelectedPage] = useState(1)
  const [rankedPage, setRankedPage] = useState(1)
  const PAGE_SIZE = 10
  const [deselectModal, setDeselectModal] = useState<number | null>(null)
  const [deleteCampaignModal, setDeleteCampaignModal] = useState(false)
  const [editConfirmModal, setEditConfirmModal] = useState(false)

  const handleShareCampaign = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (url && navigator.clipboard) {
      navigator.clipboard.writeText(url)
      showToast('캠페인 링크가 복사되었습니다', 'success')
    } else {
      showToast('링크 복사에 실패했습니다', 'error')
    }
  }
  const handleEditCampaign = () => {
    setEditConfirmModal(true)
  }

  const downloadCsv = (rows: (string | number)[][], fileName: string) => {
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = rows.map(r => r.map(escape).join(',')).join('\r\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  const today = () => new Date().toISOString().slice(0, 10)
  const handleExportApplicants = () => {
    if (applicants.length === 0) {
      showToast('다운로드할 지원자가 없습니다.', 'error')
      return
    }
    const headers = ['이름', '팔로워', '참여율(%)', '적합도', '지원일']
    const rows = applicants.map(a => [a.name, a.followers, a.engagement, a.fitScore, a.appliedAt])
    downloadCsv([headers, ...rows], `지원자_${today()}.csv`)
    showToast(`${applicants.length}명의 지원자 리스트를 다운로드했습니다.`, 'success')
  }
  const handleExportSelected = () => {
    if (selectedInfluencers.length === 0) {
      showToast('다운로드할 선정자가 없습니다.', 'error')
      return
    }
    const headers = ['이름', '팔로워', '참여율(%)', '적합도', '선정일']
    const rows = selectedInfluencers.map(s => [s.name, s.followers, s.engagement, s.fitScore, s.selectedAt])
    downloadCsv([headers, ...rows], `선정된_지원자_${today()}.csv`)
    showToast(`${selectedInfluencers.length}명의 선정자 리스트를 다운로드했습니다.`, 'success')
  }
  const confirmEditCampaign = () => {
    setEditConfirmModal(false)
    navigate(`/campaigns/new?edit=${id ?? '1'}`)
  }
  const handleDeleteCampaign = () => {
    setDeleteCampaignModal(false)
    showToast('캠페인이 삭제되었습니다', 'success')
    navigate('/campaigns')
  }

  // 콘텐츠 다운로드 (플랜 권한 기반)
  const { plan, planLabel, canDownloadContent } = usePlanAccess()
  const [downloadModal, setDownloadModal] = useState(false)
  const [selectedContents, setSelectedContents] = useState<Set<number>>(new Set())
  const [isPaying, setIsPaying] = useState(false)

  // 콘텐츠 검수 상태 (등록 콘텐츠 탭)
  const [contentStatuses, setContentStatuses] = useState<Record<number, ContentStatus>>(
    Object.fromEntries(registeredContents.map(c => [c.id, c.status]))
  )
  const [contentFilter, setContentFilter] = useState<'전체' | ContentStatus>('전체')
  const [contentPlatform, setContentPlatform] = useState<'전체' | ContentPlatform>('전체')
  const [contentSort, setContentSort] = useState<'최신순' | '도달순' | '좋아요순'>('최신순')
  const [contentPage, setContentPage] = useState(1)
  const [contentRejectModal, setContentRejectModal] = useState<number | null>(null)
  const [contentRejectFeedback, setContentRejectFeedback] = useState('')
  const [contentDetailModal, setContentDetailModal] = useState<number | null>(null)

  // QA: modal-reject → 첫 번째 인플루언서로 반려 모달 미리 열기
  // 지원자 관리 탭 — 인플루언서 상태 관리 (반려 처리용)
  const [, setApplicantStatuses] = useState<Record<number, string>>(
    Object.fromEntries(campaign.influencers.map(inf => [inf.id, inf.status]))
  )
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
            <ArrowLeft size={18} aria-hidden="true" />
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

  // 선정 취소 — 컨펌 모달 후 실행
  const confirmDeselectInfluencer = (influencerId: number) => {
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
    setDeselectModal(null)
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

  const handleDownload = () => {
    if (isPaying) return
    setIsPaying(true)
    setDownloadModal(false)
    setSelectedContents(new Set())
    showToast('다운로드 준비 중입니다.', 'success')
    setTimeout(() => setIsPaying(false), TIMER_MS.STATE_FEEDBACK)
  }

  const goToSubscription = () => {
    setDownloadModal(false)
    navigate('/subscription')
  }

  // 반려
  const handleReject = () => {
    if (!feedback.trim()) { showToast('피드백 내용을 입력해주세요.', 'error'); return }
    if (rejectModal !== null) {
      setApplicantStatuses(prev => ({ ...prev, [rejectModal]: '반려' }))
      // 지원자 목록에서도 제거
      setApplicants(prev => prev.filter(a => a.id !== rejectModal))
    }
    setRejectModal(null)
    setFeedback('')
    showToast('반려 피드백이 전달되었습니다.', 'info')
  }

  // 성과 리포트는 승인된 콘텐츠만
  const approvedContents = registeredContents.filter(c => contentStatuses[c.id] === '승인')

  // 성과 리포트 데이터
  const approvedReach = approvedContents.reduce((s, c) => s + c.reach, 0)
  const approvedEngagement = approvedContents.reduce((s, c) => s + c.likes + c.comments + c.saves, 0)
  const approvedEngRate = approvedReach > 0 ? (approvedEngagement / approvedReach * 100).toFixed(1) : '0.0'
  const reportKPI = [
    { label: '총 도달', value: fmtNumber(approvedReach), icon: Eye },
    { label: '총 참여', value: fmtNumber(approvedEngagement), icon: Heart },
    { label: '참여율', value: `${approvedEngRate}%`, icon: TrendingUp },
    { label: '콘텐츠 수', value: `${approvedContents.length}건`, icon: FileText },
  ]

  // 콘텐츠별 좋아요 비교 — Top 10
  const CHART_MAX_POINTS = 10
  const chartData = [...approvedContents]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, CHART_MAX_POINTS)
    .map(c => ({ name: c.influencer, caption: c.caption, likes: c.likes }))
  const maxLikes = chartData.length > 0 ? Math.max(...chartData.map(d => d.likes)) : 0
  const safeMaxLikes = maxLikes || 1

  // SVG 라인 차트 계산
  const chartW = 900
  const chartH = 260
  const padL = 50
  const padR = 30
  const padT = 24
  const padB = 70
  const plotW = chartW - padL - padR
  const plotH = chartH - padT - padB
  const points = chartData.map((d, i) => ({
    x: padL + (i / Math.max(1, chartData.length - 1)) * plotW,
    y: padT + plotH - (d.likes / safeMaxLikes) * plotH,
    ...d,
  }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  // 콘텐츠 순위 (승인된 것만, 좋아요 순)
  const rankedContents = [...approvedContents].sort((a, b) => b.likes - a.likes)

  const device = useDeviceMode()
  const isPhone = device === 'phone'
  const isClosed = qa === 'campaign-closed'

  return (
    <div className="space-y-5">
      {/* 페이지 타이틀 + 뒤로가기 */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={() => navigate('/campaigns')}
          aria-label="이전"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <span className="font-medium">캠페인 상세</span>
      </div>

      {/* 헤더 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 @md:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${campaignStatus.cls}`}>{campaignStatus.label}</span>
              <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-600">{meta.campaignType}</span>
              <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-blue-50 text-blue-600">{campaign.category}</span>
            </div>
            <h1 className="text-xl @md:text-2xl font-bold text-gray-900 break-words">[{meta.location}] {campaign.name}</h1>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleShareCampaign} title="공유" aria-label="공유" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Share2 size={16} /></button>
            <button onClick={handleEditCampaign} title="정보 변경" aria-label="정보 변경" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs text-gray-700"><Edit2 size={13} />정보 변경</button>
            <button onClick={() => setDeleteCampaignModal(true)} title="삭제" aria-label="삭제" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs text-red-600"><Trash2 size={13} />삭제</button>
          </div>
        </div>

        {/* 일정 바 */}
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium shrink-0">모집</span>
            <span className="text-gray-600 truncate">{meta.recruitPeriod.split(' ~ ').map(fmtDate).join(' ~ ')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium shrink-0">발표</span>
            <span className="text-gray-600 truncate">{fmtDate(meta.announceDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium shrink-0">업로드</span>
            <span className="text-gray-600 truncate">{meta.uploadPeriod.split(' ~ ').map(fmtDate).join(' ~ ')}</span>
          </div>
        </div>

        {/* KPI 4칸 */}
        <div className="grid grid-cols-2 @md:grid-cols-4 gap-3">
          <KpiCell label="지원자" value={`${applicants.length}`} />
          <KpiCell label="모집 마감" value={(() => {
            const end = meta.recruitPeriod?.split(' ~ ')[1]
            if (!end) return '—'
            const t = new Date(end).getTime()
            if (isNaN(t)) return '—'
            return `D-${Math.max(0, Math.ceil((t - Date.now()) / 86400000))}`
          })()} />
          <KpiCell label="제공 상품" value={meta.productName} small />
          <KpiCell label="리워드" value={fmtKRW(meta.productPrice)} />
        </div>
      </div>

      {/* QA: 캠페인 종료 배너 */}
      {isClosed && (
        <div className="bg-slate-100 border border-slate-200 text-slate-600 text-sm px-4 py-3 rounded-xl">
          이 캠페인은 종료되었습니다.
        </div>
      )}

      {/* 탭 */}
      <div className="overflow-x-auto flex border-b border-gray-200 sticky top-0 bg-gray-50 z-10 -mx-4 @sm:mx-0 px-4 @sm:px-0 scrollbar-hide">
        {tabs.map(tab => {
          const isDisabled = isClosed && tab === '지원자 관리'
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              ref={el => {
                if (el && isActive) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                }
              }}
              onClick={() => { if (!isDisabled) { setActiveTab(tab); setCheckedApplicants(new Set()) } }}
              disabled={isDisabled}
              className={`whitespace-nowrap shrink-0 px-2.5 @sm:px-4 py-2.5 ${isPhone ? 'text-xs' : 'text-sm'} border-b-2 transition-all duration-150 ${
                isDisabled
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : isActive
                    ? 'border-brand-green font-semibold text-gray-900'
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
          {/* 대표 이미지 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
              <Image size={40} className="text-emerald-300" aria-hidden="true" />
            </div>
          </div>

          {/* 캠페인 설명 */}
          <Section title="캠페인 설명" icon={<FileText size={14} />}>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{campaign.description}</p>
          </Section>

          {/* 제공 내역 */}
          <Section title="제공 내역" icon={<Crown size={14} />}>
            <p className="text-sm font-semibold text-gray-900 mb-1">{meta.productName}</p>
            <p className="text-sm text-gray-600 mb-3">{meta.productDetail}</p>
            <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
              <li>제품을 받자마자 보관방법을 확인하여 설명서대로 보관해주세요.</li>
              <li>제품의 자세한 정보는 반드시 상세페이지에서 꼼꼼히 숙지 부탁드립니다.</li>
            </ul>
          </Section>

          {/* 캠페인 미션 — 3카드 */}
          <Section title="캠페인 미션" icon={<TrendingUp size={14} />}>
            <div className="grid grid-cols-1 @sm:grid-cols-3 gap-2.5">
              <MissionCard icon={<Search size={16} />} label="키워드" value="필수 포함" />
              <MissionCard icon={<Camera size={16} />} label="게시 유형" value={meta.postType} />
              <MissionCard icon={<Heart size={16} />} label="유의사항" value={meta.precaution} />
            </div>
          </Section>

          {/* 필수 가이드 */}
          <Section title="필수 가이드" icon={<FileText size={14} />}>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{meta.guideText}</p>
          </Section>

          {/* 필수 키워드 */}
          <Section title="필수 키워드" icon={<Search size={14} />}>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {meta.requiredKeywords.map(k => (
                <span key={k} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{k}</span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(meta.requiredKeywords.join(' '))
                showToast('키워드가 복사되었습니다', 'success')
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Copy size={13} />
              키워드 한 번에 복사하기
            </button>
          </Section>
        </div>
      )}

      {/* ─── B) 지원자 관리 탭 ─── */}
      {activeTab === '지원자 관리' && !isClosed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users size={15} className="text-gray-400" aria-hidden="true" />
              지원자 {applicants.length}명
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleBulkSelect}
                disabled={applicants.length === 0}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UserCheck size={13} aria-hidden="true" />
                일괄 선정
              </button>
              <button
                onClick={handleExportApplicants}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition-colors duration-150"
              >
                <Download size={13} aria-hidden="true" />
                리스트 Export
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th scope="col" className="text-left text-xs font-medium text-gray-500 py-3 px-4 w-10">
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
                    <th key={h} scope="col" className="text-left text-xs font-medium text-gray-500 py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applicants.slice((applicantsPage - 1) * PAGE_SIZE, applicantsPage * PAGE_SIZE).map(a => (
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
                          className="flex items-center gap-1 text-xs bg-brand-green text-white px-3 py-1.5 rounded-xl hover:bg-brand-green-hover transition-colors duration-150"
                        >
                          <Check size={12} aria-hidden="true" /> 선정
                        </button>
                        <button
                          onClick={() => setRejectModal(a.id)}
                          className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors duration-150"
                        >
                          <X size={12} aria-hidden="true" /> 반려
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
            <Pagination total={applicants.length} page={applicantsPage} pageSize={PAGE_SIZE} onChange={setApplicantsPage} />
          </div>
        </div>
      )}

      {/* ─── C) 선정된 지원자 탭 ─── */}
      {activeTab === '선정 인플루언서' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck size={15} className="text-gray-400" aria-hidden="true" />
              선정된 인플루언서 {selectedInfluencers.length}명
            </h2>
            <button
              onClick={handleExportSelected}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition-colors duration-150"
            >
              <Download size={13} aria-hidden="true" />
              리스트 Export
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {['이름', '팔로워', '참여율', 'Fit Score', '선정일', '액션'].map(h => (
                    <th key={h} scope="col" className="text-left text-xs font-medium text-gray-500 py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {selectedInfluencers.slice((selectedPage - 1) * PAGE_SIZE, selectedPage * PAGE_SIZE).map(i => (
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
                        onClick={() => setDeselectModal(i.id)}
                        disabled={isClosed}
                        className={`flex items-center gap-1 text-xs border px-3 py-1.5 rounded-xl transition-colors duration-150 ${
                          isClosed
                            ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                            : 'text-red-500 border-red-200 hover:bg-red-50'
                        }`}
                      >
                        <X size={12} aria-hidden="true" /> 선정 취소
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
            <Pagination total={selectedInfluencers.length} page={selectedPage} pageSize={PAGE_SIZE} onChange={setSelectedPage} />
          </div>
        </div>
      )}

      {/* ─── D) 등록 콘텐츠 탭 ─── */}
      {activeTab === '등록 콘텐츠' && qa === 'tab-content-empty' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Image size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-500">등록된 콘텐츠가 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">인플루언서가 콘텐츠를 제출하면 여기에 표시됩니다.</p>
        </div>
      )}
      {activeTab === '등록 콘텐츠' && qa !== 'tab-content-empty' && (() => {
        const filtered = registeredContents
          .filter(c =>
            (contentFilter === '전체' || contentStatuses[c.id] === contentFilter) &&
            (contentPlatform === '전체' || c.platform === contentPlatform)
          )
          .sort((a, b) => {
            if (contentSort === '도달순') return b.reach - a.reach
            if (contentSort === '좋아요순') return b.likes - a.likes
            return b.id - a.id // 최신순
          })
        const counts = {
          전체: registeredContents.length,
          검수중: registeredContents.filter(c => contentStatuses[c.id] === '검수중').length,
          승인: registeredContents.filter(c => contentStatuses[c.id] === '승인').length,
          반려: registeredContents.filter(c => contentStatuses[c.id] === '반려').length,
        }
        const pageSize = device === 'desktop' ? 12 : device === 'tablet' ? 10 : 6
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
        const safePage = Math.min(contentPage, totalPages)
        const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
        return (
          <div className="space-y-4">
            {/* 검수 대기 알림 */}
            {counts.검수중 > 0 && !isClosed && (
              <button
                onClick={() => { setContentFilter('검수중'); setContentPage(1); setSelectedContents(new Set()) }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">검수 대기 콘텐츠 {counts.검수중}건이 있습니다</p>
                </div>
                <span className="text-xs text-amber-500">검수하기 →</span>
              </button>
            )}

            {/* 헤더 — 건수 + 다운로드 */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-semibold text-gray-900">
                등록 콘텐츠
                <span className="ml-1.5 text-xs font-normal text-gray-400">{filtered.length}건</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const visibleIds = new Set(filtered.map(c => c.id))
                    const allSelected = filtered.every(c => selectedContents.has(c.id))
                    if (allSelected) {
                      setSelectedContents(prev => { const n = new Set(prev); visibleIds.forEach(id => n.delete(id)); return n })
                    } else {
                      setSelectedContents(prev => new Set([...prev, ...visibleIds]))
                    }
                  }}
                  className="text-xs text-gray-600 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  {filtered.every(c => selectedContents.has(c.id)) && filtered.length > 0 ? '선택 해제' : '전체 선택'}
                </button>
                <button
                  onClick={() => {
                    // 권한 없으면 선택 여부와 무관하게 즉시 구독 유도 모달
                    if (!canDownloadContent) { setDownloadModal(true); return }
                    if (selectedContents.size === 0) { showToast('다운로드할 콘텐츠를 선택해주세요.', 'error'); return }
                    setDownloadModal(true)
                  }}
                  className="flex items-center gap-1.5 bg-brand-green text-white px-3 py-1.5 rounded-xl text-xs hover:bg-brand-green-hover transition-colors duration-150"
                >
                  <Download size={13} aria-hidden="true" />
                  다운로드{selectedContents.size > 0 && ` (${selectedContents.size})`}
                </button>
              </div>
            </div>

            {/* 필터 + 정렬 (상태/플랫폼/정렬 단일 행) */}
            <div className="grid grid-cols-3 gap-2 @sm:flex @sm:items-center @sm:gap-2">
              <CustomSelect
                value={contentFilter}
                onChange={v => { setContentFilter(v as typeof contentFilter); setContentPage(1); setSelectedContents(new Set()) }}
                options={(['전체', '검수중', '승인', '반려'] as const).map(f => ({
                  label: `${f} (${counts[f]})`,
                  value: f,
                }))}
                className="@sm:w-36"
              />
              <CustomSelect
                value={contentPlatform}
                onChange={v => { setContentPlatform(v as typeof contentPlatform); setContentPage(1); setSelectedContents(new Set()) }}
                options={(['전체', '인스타그램', '유튜브', '네이버 블로그', '틱톡'] as const).map(p => ({
                  label: p === '전체' ? '플랫폼 전체' : p,
                  value: p,
                }))}
                className="@sm:w-36"
              />
              <CustomSelect
                value={contentSort}
                onChange={v => { setContentSort(v as typeof contentSort); setContentPage(1); setSelectedContents(new Set()) }}
                options={(['최신순', '도달순', '좋아요순'] as const).map(s => ({ label: s, value: s }))}
                className="@sm:ml-auto @sm:w-32"
              />
            </div>


            {/* 콘텐츠 카드 그리드 */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <Image size={32} className="text-gray-200 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-gray-400">
                  {[
                    contentPlatform !== '전체' && contentPlatform,
                    contentFilter !== '전체' && contentFilter,
                  ].filter(Boolean).join(' · ')} 콘텐츠가 없습니다
                </p>
                {(contentFilter !== '전체' || contentPlatform !== '전체') && (
                  <button
                    onClick={() => { setContentFilter('전체'); setContentPlatform('전체'); setContentPage(1) }}
                    className="mt-3 text-xs text-brand-green hover:underline"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid gap-4 ${device === 'desktop' ? 'grid-cols-4' : device === 'tablet' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                {paginated.map(c => {
                  const isChecked = selectedContents.has(c.id)
                  const status = contentStatuses[c.id]
                  const engRate = c.reach > 0
                    ? ((c.likes + c.comments + c.saves) / c.reach * 100).toFixed(1)
                    : '0.0'
                  return (
                    <div
                      key={c.id}
                      className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all duration-150 ${
                        isChecked ? 'border-brand-green' : 'border-gray-100'
                      }`}
                    >
                      {/* 썸네일 */}
                      <div
                        className={`relative w-full aspect-[3/4] ${c.thumbnail} flex items-center justify-center cursor-pointer`}
                        onClick={() => setContentDetailModal(c.id)}
                      >
                        <Image size={36} className="text-white/50" aria-hidden="true" />
                        {/* 선택 체크 — 클릭 독립 */}
                        <div
                          className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                            isChecked ? 'bg-brand-green border-brand-green' : 'bg-white/80 border-gray-300'
                          }`}
                          onClick={e => { e.stopPropagation(); toggleContentCheck(c.id) }}
                        >
                          {isChecked && <Check size={11} className="text-white" strokeWidth={3} aria-hidden="true" />}
                        </div>
                        {/* 플랫폼 + 유형 배지 */}
                        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          c.platform === '인스타그램' ? 'bg-pink-500/90 text-white' :
                          c.platform === '유튜브' ? 'bg-red-500/90 text-white' :
                          c.platform === '틱톡' ? 'bg-black/80 text-white' :
                          'bg-green-600/90 text-white'
                        }`}>{c.platform}</span>
                        {c.type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTENT_TYPE_STYLE[c.type as keyof typeof CONTENT_TYPE_STYLE] ?? 'bg-gray-100 text-gray-600'}`}>
                            {c.type}
                          </span>
                        )}
                        </div>
                        {/* 바이럴 점수 */}
                        <div className={`absolute bottom-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
                          c.viralScore === 0 ? 'bg-white/80 text-gray-400' :
                          c.viralScore >= 80 ? 'bg-green-500/90 text-white' :
                          c.viralScore >= 50 ? 'bg-amber-400/90 text-white' : 'bg-white/80 text-gray-500'
                        }`}>
                          {c.viralScore === 0 ? '—' : `${c.viralScore}점`}
                        </div>
                      </div>

                      {/* 정보 영역 */}
                      <div className="p-4 space-y-3">
                        {/* 인플루언서 + 상태 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs shrink-0">
                              {c.influencer[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{c.influencer}</p>
                              <p className="text-xs text-gray-400 truncate">{c.instagramId}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${CONTENT_STATUS_STYLE[status]}`}>
                            {status}
                          </span>
                        </div>

                        {/* 제출일 */}
                        <p className="text-xs text-gray-400">제출일 {c.submittedAt}</p>

                        {/* 지표 3×2 */}
                        <div className="grid grid-cols-3 gap-y-2 text-center border-t border-gray-50 pt-3">
                          {[
                            { label: '도달', value: fmtNumber(c.reach) },
                            { label: '좋아요', value: fmtNumber(c.likes) },
                            { label: '댓글', value: fmtNumber(c.comments) },
                            { label: '저장', value: fmtNumber(c.saves) },
                            { label: '공유', value: fmtNumber(c.shares) },
                            { label: '참여율', value: `${engRate}%`, highlight: true },
                          ].map(m => (
                            <div key={m.label}>
                              <p className="text-xs text-gray-400 mb-0.5">{m.label}</p>
                              <p className={`text-xs font-bold ${m.highlight ? 'text-brand-green' : 'text-gray-800'}`}>{m.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* 검수 액션 — 검수중만 표시 */}
                        {status === '검수중' && !isClosed && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => {
                                setContentStatuses(prev => ({ ...prev, [c.id]: '승인' }))
                                showToast(`${c.influencer} 콘텐츠를 승인했습니다.`, 'success')
                              }}
                              className="flex-1 flex items-center justify-center gap-1 bg-brand-green text-white py-2 rounded-xl text-xs font-medium hover:bg-brand-green-hover transition-colors"
                            >
                              <Check size={12} aria-hidden="true" /> 승인
                            </button>
                            <button
                              onClick={() => setContentRejectModal(c.id)}
                              className="flex-1 flex items-center justify-center gap-1 border border-red-200 text-red-500 py-2 rounded-xl text-xs font-medium hover:bg-red-50 transition-colors"
                            >
                              <X size={12} aria-hidden="true" /> 반려
                            </button>
                          </div>
                        )}
                        {/* 반려 사유 재제출 안내 */}
                        {status === '반려' && (
                          <div className="flex items-center gap-1.5 bg-red-50 rounded-xl px-3 py-2">
                            <X size={12} className="text-red-400 shrink-0" aria-hidden="true" />
                            <p className="text-xs text-red-500">반려 처리됨 · 인플루언서에게 피드백 전달</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  onClick={() => setContentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 text-xs flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...'
                      ? <span key={`e${i}`} className="w-8 text-center text-xs text-gray-400">…</span>
                      : <button
                          key={p}
                          onClick={() => setContentPage(p as number)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                            safePage === p ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >{p}</button>
                  )}
                <button
                  onClick={() => setContentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 text-xs flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )
      })()}

      {/* ─── E) 성과 리포트 탭 — 빈 상태 ─── */}
      {activeTab === '성과 리포트' && qa === 'tab-report-empty' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <BarChart3 size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-500">성과 데이터가 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">캠페인이 진행되면 성과 리포트가 자동으로 생성됩니다.</p>
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
                <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 @sm:p-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Icon size={13} className="text-gray-400" aria-hidden="true" />
                    <span className="text-xs text-gray-500">{k.label}</span>
                  </div>
                  <div className="text-2xl @sm:text-3xl font-bold text-gray-900 tracking-tight">{k.value}</div>
                </div>
              )
            })}
          </div>

          {/* 중요 콘텐츠 TOP 3 — 바이럴 점수 기준 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown size={16} className="text-amber-500" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-gray-900">중요 콘텐츠 TOP 3</h3>
              <span className="text-xs text-gray-400">· 바이럴 점수 기준</span>
            </div>
            <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3">
              {[...approvedContents]
                .sort((a, b) => b.viralScore - a.viralScore)
                .slice(0, 3)
                .map((c, idx) => {
                  const medals = ['🥇', '🥈', '🥉']
                  const scoreColor = c.viralScore >= 80 ? 'text-brand-green' : c.viralScore >= 50 ? 'text-amber-500' : 'text-gray-400'
                  const borderColor = idx === 0 ? 'border-amber-200' : 'border-gray-100'
                  const engRate = c.reach > 0 ? ((c.likes + c.comments + c.saves) / c.reach * 100).toFixed(1) : '0.0'
                  return (
                    <div key={c.id} className={`rounded-xl border ${borderColor} p-4 flex flex-col gap-3`}>
                      {/* 상단: 순위 + 점수 */}
                      <div className="flex items-center justify-between">
                        <span className="text-base" aria-hidden="true">{medals[idx]}</span>
                        <span className={`text-sm font-bold ${scoreColor}`}>{c.viralScore}점</span>
                      </div>
                      {/* 콘텐츠 제목 */}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{c.caption}</p>
                        <p className="text-xs text-gray-400 mt-1">@{c.influencer} · {c.type ?? '-'}</p>
                      </div>
                      {/* 지표 */}
                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-50 text-center">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">도달</p>
                          <p className="text-sm font-bold text-gray-800">{fmtNumber(c.reach)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">좋아요</p>
                          <p className="text-sm font-bold text-gray-800">{fmtNumber(c.likes)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">참여율</p>
                          <p className="text-sm font-bold text-brand-green">{engRate}%</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* 콘텐츠별 좋아요 비교 그래프 */}
          {(() => {
            const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">콘텐츠별 좋아요 비교</h3>
                  {approvedContents.length > CHART_MAX_POINTS && (
                    <span className="text-xs text-gray-400">좋아요 Top {CHART_MAX_POINTS} (전체 {approvedContents.length}건 중)</span>
                  )}
                </div>
                <div className="relative">
                  <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
                    {[0, 0.25, 0.5, 0.75, 1].map(r => {
                      const y = padT + plotH - r * plotH
                      const val = Math.round(r * safeMaxLikes)
                      return (
                        <g key={r}>
                          <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                          <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#9ca3af">{val.toLocaleString()}</text>
                        </g>
                      )
                    })}
                    <path d={linePath} fill="none" stroke="var(--color-brand-green)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (
                      <g key={i}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 6 : 4} fill="var(--color-brand-green)" />
                        <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 10 : 6} fill="var(--color-brand-green)" fillOpacity={0.15} />
                        {/* 히트 영역 */}
                        <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
                        <text
                          x={p.x}
                          y={chartH - padB + 16}
                          textAnchor="end"
                          transform={`rotate(-40 ${p.x} ${chartH - padB + 16})`}
                          fontSize={11}
                          fill="#6b7280"
                        >
                          {p.name.length > 6 ? `${p.name.slice(0, 6)}…` : p.name}
                        </text>
                        {/* 호버 툴팁 */}
                        {hoveredIdx === i && (
                          <g>
                            <rect
                              x={p.x - 70}
                              y={p.y - 52}
                              width={140}
                              height={44}
                              rx={6}
                              fill="#1f2937"
                              fillOpacity={0.92}
                            />
                            <text x={p.x} y={p.y - 34} textAnchor="middle" fontSize={10} fill="#d1d5db">
                              {p.caption.length > 18 ? `${p.caption.slice(0, 18)}…` : p.caption}
                            </text>
                            <text x={p.x} y={p.y - 16} textAnchor="middle" fontSize={12} fill="white" fontWeight="600">
                              ♥ {p.likes.toLocaleString()}
                            </text>
                          </g>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            )
          })()}

          {/* 콘텐츠 순위 테이블 */}
          {(() => {
            const pagedRanked = rankedContents.slice((rankedPage - 1) * PAGE_SIZE, rankedPage * PAGE_SIZE)
            const rankOffset = (rankedPage - 1) * PAGE_SIZE
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">콘텐츠 순위</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        {['순위', '콘텐츠', '인플루언서', '유형', '도달', '좋아요', '참여율'].map(h => (
                          <th key={h} scope="col" className="text-left text-xs font-medium text-gray-500 py-3 px-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pagedRanked.map((c, idx) => {
                        const rank = rankOffset + idx + 1
                        const engRate = c.reach > 0 ? ((c.likes + c.comments + c.saves) / c.reach * 100).toFixed(1) : '0.0'
                        return (
                          <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-3 px-4">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                rank === 1 ? 'bg-yellow-100 text-yellow-700' : rank === 2 ? 'bg-gray-100 text-gray-600' : rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'
                              }`}>
                                {rank}
                              </span>
                            </td>
                            <td className="py-3 px-4 max-w-[180px]">
                              <p className="text-sm font-medium text-gray-900 truncate">{c.caption}</p>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{c.influencer}</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTENT_TYPE_STYLE[c.type as keyof typeof CONTENT_TYPE_STYLE] ?? 'bg-gray-100 text-gray-600'}`}>
                                {c.type ?? '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{fmtNumber(c.reach)}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{c.likes.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-semibold text-brand-green">{engRate}%</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination total={rankedContents.length} page={rankedPage} pageSize={PAGE_SIZE} onChange={setRankedPage} />
              </div>
            )
          })()}
        </div>
      )}

      {/* 콘텐츠 상세 모달 */}
      {(() => {
        const dc = registeredContents.find(c => c.id === contentDetailModal)
        if (!dc) return null
        const dcStatus = contentStatuses[dc.id]
        const dcEngRate = dc.reach > 0
          ? ((dc.likes + dc.comments + dc.saves) / dc.reach * 100).toFixed(1)
          : '0.0'
        return (
          <Modal
            open={contentDetailModal !== null}
            onClose={() => setContentDetailModal(null)}
            title="콘텐츠 상세"
            footer={
              <>
                {dcStatus === '검수중' && !isClosed && (
                  <>
                    <button
                      onClick={() => { setContentStatuses(prev => ({ ...prev, [dc.id]: '승인' })); showToast(`${dc.influencer} 콘텐츠를 승인했습니다.`, 'success'); setContentDetailModal(null) }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
                    ><Check size={13} /> 승인</button>
                    <button
                      onClick={() => { setContentDetailModal(null); setContentRejectModal(dc.id) }}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                    ><X size={13} /> 반려</button>
                  </>
                )}
                <button
                  onClick={() => { setContentDetailModal(null); toggleContentCheck(dc.id); setDownloadModal(true) }}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                ><Download size={13} /> 다운로드</button>
              </>
            }
          >
            <div className="space-y-3">
              {/* 썸네일 */}
              <div className={`w-full h-40 rounded-xl ${dc.thumbnail} flex items-center justify-center`}>
                <Image size={36} className="text-white/40" aria-hidden="true" />
              </div>
              {/* 인플루언서 + 배지 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs shrink-0">
                    {dc.influencer[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{dc.influencer}</p>
                    <p className="text-xs text-gray-400">{dc.instagramId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    dc.platform === '인스타그램' ? 'bg-pink-100 text-pink-700' :
                    dc.platform === '유튜브' ? 'bg-red-100 text-red-700' :
                    dc.platform === '틱톡' ? 'bg-gray-200 text-gray-800' :
                    'bg-green-100 text-green-700'
                  }`}>{dc.type ? `${dc.platform} · ${dc.type}` : dc.platform}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONTENT_STATUS_STYLE[dcStatus]}`}>{dcStatus}</span>
                </div>
              </div>
              {/* 제출일 + 바이럴 */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>제출일 {dc.submittedAt}</span>
                {dc.viralScore > 0 && (
                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                    dc.viralScore >= 80 ? 'bg-green-100 text-green-700' :
                    dc.viralScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}>바이럴 {dc.viralScore}점</span>
                )}
              </div>
              {/* 지표 */}
              <div className="grid grid-cols-6 gap-1 text-center bg-gray-50 rounded-xl py-2.5 px-2">
                {[
                  { label: '도달', value: fmtNumber(dc.reach) },
                  { label: '좋아요', value: fmtNumber(dc.likes) },
                  { label: '댓글', value: fmtNumber(dc.comments) },
                  { label: '저장', value: fmtNumber(dc.saves) },
                  { label: '공유', value: fmtNumber(dc.shares) },
                  { label: '참여율', value: `${dcEngRate}%`, highlight: true },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-[10px] text-gray-400 mb-0.5">{m.label}</p>
                    <p className={`text-xs font-bold ${m.highlight ? 'text-brand-green' : 'text-gray-800'}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )
      })()}

      {/* 콘텐츠 다운로드 모달 — 플랜 권한 기반 */}
      <Modal
        open={downloadModal}
        onClose={() => setDownloadModal(false)}
        title="콘텐츠 다운로드"
        footer={canDownloadContent ? (
          <button
            onClick={handleDownload}
            disabled={isPaying || selectedContents.size === 0}
            className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            다운로드
          </button>
        ) : (
          <>
            <button onClick={() => setDownloadModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">취소</button>
            <button onClick={goToSubscription} className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-green-hover transition-colors">플랜 업그레이드</button>
          </>
        )}
      >
        {canDownloadContent ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">선택한 콘텐츠를 다운로드합니다.</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">현재 플랜</span>
                <span className="text-gray-900 font-medium">{planLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">선택 콘텐츠</span>
                <span className="text-gray-900 font-medium">{selectedContents.size}건</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">다운로드한 콘텐츠는 계약된 SNS 채널 및 광고 활용 범위 내에서만 사용 가능합니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
              <Crown size={18} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900">유료 플랜 구독 시 이용 가능합니다</p>
                <p className="text-xs text-amber-700">
                  현재 <span className="font-semibold">{planLabel}</span> {plan ? '플랜' : ''} 상태에서는 콘텐츠 다운로드를 이용할 수 없습니다.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">선택 콘텐츠</span>
                <span className="text-gray-900 font-medium">{selectedContents.size}건</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 등록 콘텐츠 반려 모달 */}
      <Modal
        open={contentRejectModal !== null}
        onClose={() => { setContentRejectModal(null); setContentRejectFeedback('') }}
        size="sm"
        title="콘텐츠 반려"
        footer={
          <>
            <button onClick={() => { setContentRejectModal(null); setContentRejectFeedback('') }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">취소</button>
            <button
              onClick={() => {
                if (contentRejectModal === null) return
                if (!contentRejectFeedback.trim()) { showToast('반려 사유를 입력해주세요.', 'error'); return }
                setContentStatuses(prev => ({ ...prev, [contentRejectModal]: '반려' }))
                const name = registeredContents.find(c => c.id === contentRejectModal)?.influencer ?? ''
                showToast(`${name} 콘텐츠를 반려했습니다.`, 'error')
                setContentRejectModal(null)
                setContentRejectFeedback('')
              }}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm hover:bg-red-600 transition-colors"
            >반려 전송</button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">반려 사유를 입력해주세요. 인플루언서에게 전달됩니다.</p>
          <textarea
            value={contentRejectFeedback}
            onChange={e => setContentRejectFeedback(e.target.value)}
            placeholder="예) 브랜드 로고가 누락되었습니다. 수정 후 재제출해 주세요."
            rows={4}
            maxLength={500}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-400"
          />
          <div className="text-right text-xs text-gray-400">{contentRejectFeedback.length}/500</div>
        </div>
      </Modal>

      {/* 선정 취소 컨펌 모달 */}
      <AlertModal
        open={deselectModal !== null}
        onClose={() => setDeselectModal(null)}
        title="선정을 취소할까요?"
        confirmLabel="선정 취소"
        cancelLabel="아니요"
        variant="danger"
        onConfirm={() => deselectModal !== null && confirmDeselectInfluencer(deselectModal)}
      >
        <p className="text-xs text-gray-500">
          {(() => {
            const target = selectedInfluencers.find(i => i.id === deselectModal)
            return target ? <><strong className="text-gray-700">{target.name}</strong>님의 선정을 취소합니다.</> : '선정을 취소합니다.'
          })()}{' '}
          해당 인플루언서는 다시 "검토중" 지원자 목록으로 돌아가며, 언제든 다시 선정할 수 있습니다.
        </p>
      </AlertModal>

      {/* 캠페인 정보 변경 경고 모달 */}
      <AlertModal
        open={editConfirmModal}
        onClose={() => setEditConfirmModal(false)}
        title="정보를 변경하시겠습니까?"
        confirmLabel="변경하기"
        cancelLabel="취소"
        variant="default"
        onConfirm={confirmEditCampaign}
      >
        <p className="text-xs text-gray-500 whitespace-pre-line">
          {`이미 ${applicants.length}명의 지원자가 있습니다.\n내용을 수정하면 모든 지원자에게 [조건 변경 알림]이 발송됩니다.\n\n빈번한 수정은 브랜드 신뢰도를 떨어뜨릴 수 있습니다.`}
        </p>
      </AlertModal>

      {/* 캠페인 삭제 확인 모달 */}
      <AlertModal
        open={deleteCampaignModal}
        onClose={() => setDeleteCampaignModal(false)}
        title="캠페인을 삭제할까요?"
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDeleteCampaign}
      >
        <p className="text-xs text-gray-500">
          <strong className="text-gray-700">{campaign.name}</strong> 캠페인을 삭제합니다. 모집·콘텐츠·정산 데이터가 함께 사라지며 이 작업은 되돌릴 수 없습니다.
        </p>
      </AlertModal>

      {/* 반려 모달 */}
      <Modal
        open={rejectModal !== null}
        onClose={() => { setRejectModal(null); setFeedback('') }}
        title="지원자 반려"
        size="sm"
        footer={
          <>
            <button onClick={() => { setRejectModal(null); setFeedback('') }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">취소</button>
            <button onClick={handleReject} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm hover:bg-red-600 transition-colors">반려 전송</button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">반려 이유를 입력해주세요. 인플루언서에게 전달됩니다.</p>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="예) 브랜드 로고가 누락되었습니다. 수정 후 재제출해 주세요."
            rows={4}
            maxLength={500}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
          />
          <div className="text-right text-xs text-gray-400">{feedback.length}/500</div>
        </div>
      </Modal>
    </div>
  )
}

function KpiCell({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`font-bold text-gray-900 truncate ${small ? 'text-sm' : 'text-base @md:text-lg'}`}>{value}</p>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 @md:p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
        <span className="text-gray-500">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  )
}

function MissionCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-gray-100 rounded-xl px-3 py-3 text-center">
      <div className="text-gray-400 mb-1.5 flex justify-center">{icon}</div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}

/** 공통 페이지네이션 — 캠페인 목록과 동일한 UI */
function Pagination({ total, page, pageSize, onChange }: { total: number; page: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  if (total <= pageSize) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
    .reduce<(number | '…')[]>((acc, p) => {
      if (acc.length && p - (acc[acc.length - 1] as number) > 1) acc.push('…')
      acc.push(p)
      return acc
    }, [])
  return (
    <div className="flex items-center justify-between gap-2 px-3 @sm:px-5 py-3 border-t border-gray-100 flex-wrap">
      <span className="text-xs text-gray-500 shrink-0">
        총 {total}개 · {safePage} / {totalPages}
      </span>
      <div className="flex items-center gap-1 flex-wrap justify-end">
        <button
          onClick={() => onChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >이전</button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="text-xs text-gray-400 px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                safePage === p
                  ? 'bg-gray-100 text-gray-900'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >{p}</button>
          )
        )}
        <button
          onClick={() => onChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >다음</button>
      </div>
    </div>
  )
}
