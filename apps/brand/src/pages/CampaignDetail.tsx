import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Download, Image, BarChart3, Users, UserCheck, FileText, TrendingUp, Eye, Heart, Info, Crown, Share2, Edit2, Trash2, Search, Camera, Copy, ChevronDown, FolderOpen, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Modal, AlertModal, CustomSelect, PlatformBadge, Tooltip, Pagination } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { ErrorState } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { fmtNumber, CAMPAIGN_STATUS_STYLE, PARTICIPATION_STATUS_STYLE, CONTENT_TYPE_STYLE, getDDay } from '@wellink/ui'
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
    period: '2026-03-25 ~ 2026-04-28',
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
    productName: '요가매트 세트 (프리미엄 6mm + 스트랩)',
    productDetail: '요가매트 6mm + 논슬립 스트랩 2개 + 세척 스프레이',
    productPrice: 58000,
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
// 활동분야 풀 — 원본 ApplicantList의 activityFieldList 대응
const ACTIVITY_FIELD_POOL = [
  ['뷰티', '뷰티/코스메틱'],
  ['피트니스', '운동'],
  ['푸드', '맛집'],
  ['패션', '데일리룩'],
  ['여행'],
  ['육아', '가족'],
  ['라이프스타일'],
  ['홈인테리어'],
  ['헬스/웰니스'],
  ['반려동물'],
]
// 신청 답변 풀 — 원본 questionVo + answers 대응 (객관식 + 단답)
const PRIMARY_ANSWER_POOL = [
  '인스타그램 피드 + 릴스 동시 제작 가능합니다',
  '평소 브랜드 가치관에 깊이 공감해 신청합니다',
  '제품 사용 후 솔직한 후기 콘텐츠 강점입니다',
  '월 평균 4건 이상 콘텐츠 업로드 가능합니다',
  '협찬 경험 다수, 광고 가이드 준수 자신 있습니다',
]
const SECONDARY_QUESTIONS = [
  { question: '주력 콘텐츠 유형은?', answers: ['릴스', '피드 카드뉴스', '스토리 시리즈', '롱폼 영상'] },
  { question: '월 평균 광고 협찬 건수는?', answers: ['1건 이하', '2~3건', '4~6건', '7건 이상'] },
  { question: '촬영 가능 시간대는?', answers: ['평일 오전', '평일 오후', '주말 오전', '주말 오후'] },
]
// 휴대폰·이메일·주소 — 원본의 formatPhoneNumber, address, addressDetail 대응
const PHONE_PREFIX = ['010-1234', '010-5678', '010-9012', '010-3456', '010-7890']
const ADDRESS_POOL = [
  '서울특별시 강남구 테헤란로 123',
  '서울특별시 마포구 양화로 45',
  '경기도 성남시 분당구 판교역로 235',
  '서울특별시 송파구 올림픽로 300',
  '서울특별시 용산구 한강대로 50',
]
const FEED_GRADIENTS = [
  'from-pink-200 to-rose-300',
  'from-blue-200 to-indigo-300',
  'from-green-200 to-emerald-300',
  'from-amber-200 to-orange-300',
  'from-violet-200 to-purple-300',
  'from-emerald-200 to-teal-300',
]
const REELS_GRADIENTS = [
  'from-rose-200 to-pink-300',
  'from-sky-200 to-blue-300',
  'from-lime-200 to-green-300',
  'from-orange-200 to-amber-300',
  'from-fuchsia-200 to-violet-300',
]
const applicantsData = Array.from({ length: 100 }, (_, i) => {
  const name = APPLICANT_NAME_POOL[i % APPLICANT_NAME_POOL.length]
  const followersN = 5000 + (i * 317 % 40000)
  const followers = followersN >= 10000 ? `${(followersN / 1000).toFixed(1)}K` : `${followersN.toLocaleString()}`
  const engagement = +(2.5 + (i * 7 % 50) / 10).toFixed(1)
  const fitScore = 60 + (i * 13 % 40)
  const month = String(((i * 3) % 30 < 15 ? 3 : 4)).padStart(2, '0')
  const day = String(((i * 7) % 28) + 1).padStart(2, '0')
  // 추가 필드 — 원본 ApplicantList 컬럼 보강
  const postsCount = 30 + (i * 11) % 250        // 게시물수
  const avgLikes = Math.floor(followersN * (0.02 + (i % 5) * 0.005))  // 평균 좋아요
  const avgComments = Math.floor(avgLikes * (0.04 + (i % 4) * 0.01))  // 평균 댓글
  const recentDays = (i * 2) % 30 + 1           // 최근 활동 일수 전
  const activityFields = ACTIVITY_FIELD_POOL[i % ACTIVITY_FIELD_POOL.length]
  const primaryAnswer = PRIMARY_ANSWER_POOL[i % PRIMARY_ANSWER_POOL.length]
  const phoneNumber = `${PHONE_PREFIX[i % PHONE_PREFIX.length]}-${String(1000 + (i * 7) % 9000).padStart(4, '0')}`
  const email = `${name.toLowerCase().replace(/[가-힣]/g, '')}user${i + 1}@example.com`
  const address = ADDRESS_POOL[i % ADDRESS_POOL.length]
  const addressDetail = `${100 + (i % 30)}동 ${String((i * 13) % 1500 + 101).padStart(4, '0')}호`
  // 답변 (객관식 3문항) — questionVo 대응
  const allAnswers = [
    { question: '주요 콘텐츠 유형', answer: primaryAnswer, orderNumber: 1 },
    { question: SECONDARY_QUESTIONS[0].question, answer: SECONDARY_QUESTIONS[0].answers[i % SECONDARY_QUESTIONS[0].answers.length], orderNumber: 2 },
    { question: SECONDARY_QUESTIONS[1].question, answer: SECONDARY_QUESTIONS[1].answers[(i + 1) % SECONDARY_QUESTIONS[1].answers.length], orderNumber: 3 },
    { question: SECONDARY_QUESTIONS[2].question, answer: SECONDARY_QUESTIONS[2].answers[(i + 2) % SECONDARY_QUESTIONS[2].answers.length], orderNumber: 4 },
  ]
  return {
    id: 1000 + i,
    name: i < APPLICANT_NAME_POOL.length ? name : `${name}${Math.floor(i / APPLICANT_NAME_POOL.length) + 1}`,
    instagramId: `${name.toLowerCase().replace(/[가-힣]/g, '')}_ig${i + 1}`, // 인스타그램 username (정책서 § 6-3)
    followers,
    followerCount: followersN,
    engagement,
    fitScore,
    appliedAt: `2026-${month}-${day}`,
    avatar: AVATAR_POOL[i % AVATAR_POOL.length],
    // 신규 필드 — 원본 ApplicantList 보강
    postsCount,
    avgLikes,
    avgComments,
    recentActivityDays: recentDays,
    activityFields,
    primaryAnswer,
    allAnswers,
    phoneNumber,
    email,
    address,
    addressDetail,
    // 인라인 미리보기 — 최근 피드 1장 + 릴스 1개 (정책서 § 6-3-1)
    previewFeed: i % 7 === 0 ? null : FEED_GRADIENTS[i % FEED_GRADIENTS.length],
    previewReels: i % 5 === 0 ? null : REELS_GRADIENTS[i % REELS_GRADIENTS.length],
    isPrivate: i % 13 === 0,
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
  // 신규 필드 — 원본 SELECTED 타입 보강 (업로드 상태·주소·연락처·답변)
  const postsCount = 50 + (i * 13) % 200
  const avgLikes = Math.floor(followersN * (0.025 + (i % 5) * 0.005))
  const avgComments = Math.floor(avgLikes * (0.04 + (i % 4) * 0.01))
  const activityFields = ACTIVITY_FIELD_POOL[(i + 3) % ACTIVITY_FIELD_POOL.length]
  const phoneNumber = `${PHONE_PREFIX[(i + 1) % PHONE_PREFIX.length]}-${String(2000 + (i * 11) % 8000).padStart(4, '0')}`
  const email = `${name.toLowerCase().replace(/[가-힣]/g, '')}selected${i + 1}@example.com`
  const address = ADDRESS_POOL[(i + 2) % ADDRESS_POOL.length]
  const addressDetail = `${200 + (i % 20)}동 ${String((i * 17) % 1500 + 201).padStart(4, '0')}호`
  // 업로드 상태 — i % 3 == 0 미등록, i % 3 == 1 등록(1건), i % 3 == 2 등록(2건)
  const uploadedPostCount = i % 3 === 0 ? 0 : (i % 3 === 1 ? 1 : 2)
  // 최초 등록일 (정책서 § 7-2 — "최근" → "최초"로 변경)
  const firstUploadedAt = uploadedPostCount > 0 ? `2026-${String(((i * 7) % 30 < 20 ? 5 : 6)).padStart(2, '0')}-${String(((i * 11) % 28) + 1).padStart(2, '0')}` : null
  const latestPostUrl = uploadedPostCount > 0 ? `https://www.instagram.com/p/sample-${1000 + i}/` : null
  const allAnswers = [
    { question: '주요 콘텐츠 유형', answer: PRIMARY_ANSWER_POOL[(i + 2) % PRIMARY_ANSWER_POOL.length], orderNumber: 1 },
    { question: SECONDARY_QUESTIONS[0].question, answer: SECONDARY_QUESTIONS[0].answers[(i + 1) % SECONDARY_QUESTIONS[0].answers.length], orderNumber: 2 },
    { question: SECONDARY_QUESTIONS[1].question, answer: SECONDARY_QUESTIONS[1].answers[(i + 3) % SECONDARY_QUESTIONS[1].answers.length], orderNumber: 3 },
    { question: SECONDARY_QUESTIONS[2].question, answer: SECONDARY_QUESTIONS[2].answers[(i + 4) % SECONDARY_QUESTIONS[2].answers.length], orderNumber: 4 },
  ]
  return {
    id: 2000 + i,
    name: i < SELECTED_NAME_POOL.length ? name : `${name}${Math.floor(i / SELECTED_NAME_POOL.length) + 1}`,
    instagramId: `${name.toLowerCase().replace(/[가-힣]/g, '')}_sel${i + 1}`,
    followers,
    followerCount: followersN,
    engagement,
    fitScore,
    selectedAt: `2026-${month}-${day}`,
    avatar: AVATAR_POOL[i % AVATAR_POOL.length],
    postsCount,
    avgLikes,
    avgComments,
    activityFields,
    phoneNumber,
    email,
    address,
    addressDetail,
    uploadedPostCount,
    firstUploadedAt,
    latestPostUrl,
    allAnswers,
  }
})

// 등록 콘텐츠 더미 100개 — 검수중/승인/반려 + 0값(reach=0) 엣지케이스 포함
const INFLUENCER_POOL = [
  { name: '이창민', id: 'changmin_fit', thumb: 'bg-gradient-to-br from-pink-200 to-pink-300' },
  { name: '김가애', id: 'gaga_daily',   thumb: 'bg-gradient-to-br from-yellow-200 to-yellow-300' },
  { name: '박리나', id: 'rina_life',    thumb: 'bg-gradient-to-br from-purple-200 to-purple-300' },
  { name: '민경완', id: 'kyeong_w',     thumb: 'bg-gradient-to-br from-blue-200 to-blue-300' },
  { name: '서유진', id: 'yujin_s',      thumb: 'bg-gradient-to-br from-green-200 to-green-300' },
  { name: '한지수', id: 'jisu_han',     thumb: 'bg-gradient-to-br from-rose-200 to-rose-300' },
  { name: '최민호', id: 'minho_choi',   thumb: 'bg-gradient-to-br from-indigo-200 to-indigo-300' },
  { name: '윤아름', id: 'areum_y',      thumb: 'bg-gradient-to-br from-teal-200 to-teal-300' },
  { name: '강태현', id: 'taehyun_k',    thumb: 'bg-gradient-to-br from-orange-200 to-orange-300' },
  { name: '임소희', id: 'sohee_lim',    thumb: 'bg-gradient-to-br from-cyan-200 to-cyan-300' },
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
  // 선정 예정 단계 (정책서 § 6-4) — 신청 → [선정 예정 (내부 전용)] → 선정 확정 (인플루언서 노출)
  const [pendingApplicants, setPendingApplicants] = useState<Set<number>>(new Set())
  // 콘텐츠 인라인 미리보기 모달 (정책서 § 6-3-1) — 리스트에서 바로 피드/릴스 확인
  const [previewModal, setPreviewModal] = useState<{ applicantId: number; type: 'feed' | 'reels' } | null>(null)
  // 선정 확정 알림 모달
  const [confirmSelectionModal, setConfirmSelectionModal] = useState<{ ids: number[]; name?: string } | null>(null)
  const [applicantsPage, setApplicantsPage] = useState(1)
  // 신규 — 검색·정렬·답변 모달 (원본 ApplicantList 보강)
  const [applicantsSearch, setApplicantsSearch] = useState('')
  type ApplicantSortKey = 'followerCount' | 'postsCount' | 'avgLikes' | 'avgComments' | 'engagement' | 'fitScore' | 'recentActivity'
  const [applicantsSortKey, setApplicantsSortKey] = useState<ApplicantSortKey>('followerCount')
  const [applicantsSortDesc, setApplicantsSortDesc] = useState(true)
  const [answersModalId, setAnswersModalId] = useState<number | null>(null)
  // 캠페인 정보 — 대표 이미지 라이트박스
  const [campaignImageOpen, setCampaignImageOpen] = useState(false)
  // 객관식 질문별 동적 옵션 필터 (원본 selectedFilters)
  const [answerFilters, setAnswerFilters] = useState<Record<string, string>>({})
  // 옵션 필터 펼침/접힘 — 질문 많을 때 화면 절약
  const [optionFilterOpen, setOptionFilterOpen] = useState(false)
  // 선정 예정만 보기 필터
  const [pendingOnlyFilter, setPendingOnlyFilter] = useState(false)

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
  const [cancelCampaignModal, setCancelCampaignModal] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const [editConfirmModal, setEditConfirmModal] = useState(false)
  // 신규 — 선정된 지원자 업로드 필터 + 업로드 현황 모달 (원본 page.tsx + ApplicantList 'SELECTED' 보강)
  type UploadFilter = 'all' | 'uploaded' | 'not-uploaded'
  const [selectedUploadFilter, setSelectedUploadFilter] = useState<UploadFilter>('all')
  const [uploadOverviewOpen, setUploadOverviewOpen] = useState(false)
  const [uploadOverviewDetailId, setUploadOverviewDetailId] = useState<number | null>(null)

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
  // CSV export — 원본 ApplicantList downloadRows 동등 (이름/인스타/연락처/이메일/팔로워/상태/주소/포스트URL/질문답변 동적)
  const handleExportApplicants = () => {
    if (applicants.length === 0) {
      showToast('다운로드할 지원자가 없습니다.', 'error')
      return
    }
    const questionCount = applicants.reduce((max, a) => Math.max(max, a.allAnswers?.length ?? 0), 0)
    const headers = [
      '이름', '연락처', '이메일', '팔로워', '게시물수', '평균좋아요', '평균댓글',
      '참여율(%)', '적합도', '활동분야', '주소', '상세주소', '지원일',
      ...Array.from({ length: questionCount }, (_, idx) => [`질문${idx + 1}`, `답변${idx + 1}`]).flat(),
    ]
    const rows = applicants.map(a => {
      const answerCells = Array.from({ length: questionCount }, (_, idx) => {
        const ans = a.allAnswers?.[idx]
        return [ans?.question ?? '', ans?.answer ?? '']
      }).flat()
      return [
        a.name, a.phoneNumber, a.email, a.followers, a.postsCount, a.avgLikes, a.avgComments,
        a.engagement, a.fitScore, a.activityFields.join(', '), a.address, a.addressDetail, a.appliedAt,
        ...answerCells,
      ]
    })
    downloadCsv([headers, ...rows], `지원자_${today()}.csv`)
    showToast(`${applicants.length}명의 지원자 리스트를 다운로드했습니다.`, 'success')
  }
  const handleExportSelected = () => {
    if (selectedInfluencers.length === 0) {
      showToast('다운로드할 선정자가 없습니다.', 'error')
      return
    }
    const questionCount = selectedInfluencers.reduce((max, s) => Math.max(max, (s as { allAnswers?: unknown[] }).allAnswers?.length ?? 0), 0)
    const headers = [
      '이름', '연락처', '이메일', '팔로워', '게시물수', '평균좋아요', '평균댓글',
      '참여율(%)', '적합도', '활동분야', '주소', '상세주소', '업로드상태', '등록게시글수', '최초등록일', '게시글URL', '선정일',
      ...Array.from({ length: questionCount }, (_, idx) => [`질문${idx + 1}`, `답변${idx + 1}`]).flat(),
    ]
    const rows = selectedInfluencers.map(s => {
      const sx = s as typeof selectedApplicantsData[number]
      const answerCells = Array.from({ length: questionCount }, (_, idx) => {
        const ans = sx.allAnswers?.[idx]
        return [ans?.question ?? '', ans?.answer ?? '']
      }).flat()
      return [
        sx.name, sx.phoneNumber ?? '-', sx.email ?? '-', sx.followers, sx.postsCount ?? '-', sx.avgLikes ?? '-', sx.avgComments ?? '-',
        sx.engagement, sx.fitScore, sx.activityFields?.join(', ') ?? '-', sx.address ?? '-', sx.addressDetail ?? '-',
        (sx.uploadedPostCount ?? 0) > 0 ? '등록 완료' : '미등록', sx.uploadedPostCount ?? 0, sx.firstUploadedAt ?? '-', sx.latestPostUrl ?? '-',
        sx.selectedAt,
        ...answerCells,
      ]
    })
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
  const { planLabel, canDownloadContent, isGated } = usePlanAccess()
  const [downloadModal, setDownloadModal] = useState(false)
  const [selectedContents, setSelectedContents] = useState<Set<number>>(new Set())
  const [isPaying, setIsPaying] = useState(false)
  // 결제 완료된 콘텐츠 id 목록 (서버 연동 전 세션 메모리로 관리) — 서버 연동 시 읽기 값 활용 예정
  const [_downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set())
  // 미구독자 다운로드 흐름 — 플랜 선택 → 결제 단계 (모달 내 다단계)
  type DownloadStep = 'plan-select' | 'payment'
  const [downloadStep, setDownloadStep] = useState<DownloadStep>('plan-select')
  const [pickedPlan, setPickedPlan] = useState<'focus' | 'scale' | 'enterprise'>('scale')

  // 등록 콘텐츠 탭 — 인플루언서 찜하기
  const [contentInfluencerBookmarks, setContentInfluencerBookmarks] = useState<Set<string>>(new Set())
  const toggleContentInfluencerBookmark = (name: string) => {
    setContentInfluencerBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(name)) { next.delete(name) } else { next.add(name) }
      return next
    })
  }

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
  const [hoveredChartIdx, setHoveredChartIdx] = useState<number | null>(null)

  // QA: modal-reject → 첫 번째 인플루언서로 반려 모달 미리 열기
  // 지원자 관리 탭 — 인플루언서 상태 관리 (반려 처리용)
  const [, setApplicantStatuses] = useState<Record<number, string>>(
    Object.fromEntries(campaign.influencers.map(inf => [inf.id, inf.status]))
  )
  const [rejectModal, setRejectModal] = useState<number | null>(
    qa === 'modal-reject' ? campaign.influencers[0]?.id ?? null : null
  )
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const device = useDeviceMode()
  const isPhone = device === 'phone'

  // 탭 바 스크롤
  const tabScrollRef = useRef<HTMLDivElement>(null)
  const [canTabScrollLeft, setCanTabScrollLeft] = useState(false)
  const [canTabScrollRight, setCanTabScrollRight] = useState(false)

  // 지원자 관리 테이블 스크롤
  const applicantTableScrollRef = useRef<HTMLDivElement>(null)
  const applicantTableWrapperRef = useRef<HTMLDivElement>(null)
  const applicantTableRef = useRef<HTMLTableElement>(null)
  const [canApplicantScrollLeft, setCanApplicantScrollLeft] = useState(false)
  const [canApplicantScrollRight, setCanApplicantScrollRight] = useState(false)
  const [applicantBtnTop, setApplicantBtnTop] = useState<number | null>(null)

  // 선정 인플루언서 테이블 스크롤
  const selectedTableScrollRef = useRef<HTMLDivElement>(null)
  const selectedTableWrapperRef = useRef<HTMLDivElement>(null)
  const selectedTableRef = useRef<HTMLTableElement>(null)
  const [canSelectedScrollLeft, setCanSelectedScrollLeft] = useState(false)
  const [canSelectedScrollRight, setCanSelectedScrollRight] = useState(false)
  const [selectedBtnTop, setSelectedBtnTop] = useState<number | null>(null)

  // 탭 바 스크롤 상태
  useEffect(() => {
    const el = tabScrollRef.current
    if (!el) return
    const update = () => {
      setCanTabScrollLeft(el.scrollLeft > 0)
      setCanTabScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  // 지원자 관리 테이블 스크롤 상태
  useEffect(() => {
    const el = applicantTableScrollRef.current
    if (!el) return
    const update = () => {
      setCanApplicantScrollLeft(el.scrollLeft > 0)
      setCanApplicantScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  useEffect(() => {
    const update = () => {
      const el = applicantTableRef.current ?? applicantTableWrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const visTop = Math.max(rect.top, 0)
      const visBottom = Math.min(rect.bottom, window.innerHeight)
      setApplicantBtnTop(visBottom > visTop + 40 ? (visTop + visBottom) / 2 : null)
    }
    update()
    const scrollTarget: EventTarget = ((): EventTarget => {
      let p = applicantTableRef.current?.parentElement
      while (p) {
        const ov = getComputedStyle(p).overflowY
        if (ov === 'auto' || ov === 'scroll') return p
        p = p.parentElement
      }
      return window
    })()
    scrollTarget.addEventListener('scroll', update, { passive: true } as AddEventListenerOptions)
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    if (applicantTableRef.current) ro.observe(applicantTableRef.current)
    return () => { scrollTarget.removeEventListener('scroll', update); window.removeEventListener('resize', update); ro.disconnect() }
  }, [])

  // 선정 인플루언서 테이블 스크롤 상태
  useEffect(() => {
    const el = selectedTableScrollRef.current
    if (!el) return
    const update = () => {
      setCanSelectedScrollLeft(el.scrollLeft > 0)
      setCanSelectedScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  useEffect(() => {
    const update = () => {
      const el = selectedTableRef.current ?? selectedTableWrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const visTop = Math.max(rect.top, 0)
      const visBottom = Math.min(rect.bottom, window.innerHeight)
      setSelectedBtnTop(visBottom > visTop + 40 ? (visTop + visBottom) / 2 : null)
    }
    update()
    const scrollTarget: EventTarget = ((): EventTarget => {
      let p = selectedTableRef.current?.parentElement
      while (p) {
        const ov = getComputedStyle(p).overflowY
        if (ov === 'auto' || ov === 'scroll') return p
        p = p.parentElement
      }
      return window
    })()
    scrollTarget.addEventListener('scroll', update, { passive: true } as AddEventListenerOptions)
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    if (selectedTableRef.current) ro.observe(selectedTableRef.current)
    return () => { scrollTarget.removeEventListener('scroll', update); window.removeEventListener('resize', update); ro.disconnect() }
  }, [])

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
          <h1 className="text-2xl font-bold text-gray-900">캠페인 상세</h1>
        </div>
        <ErrorState message="캠페인 정보를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
      </div>
    )
  }

  // 마감임박 자동 파생 (모집중 + D-3 이내) — 목록과 동일 정책
  const recruitEnd = (campaignMeta[id ?? '']?.recruitPeriod ?? '').split(' ~ ')[1]
  const displayStatus = (() => {
    if (isCancelled) return '취소'
    if (campaign.status === '모집중' && recruitEnd) {
      const d = getDDay(recruitEnd)
      if (d.label === 'D-Day' || (d.label.startsWith('D-') && Number(d.label.slice(2)) <= 3)) {
        return '마감임박'
      }
    }
    return campaign.status
  })()
  const campaignStatus = statusConfig[displayStatus] ?? { label: displayStatus, cls: 'bg-gray-100 text-gray-600' }

  // 지원자 → 선정 인플루언서 변환 (모든 필드 보존, 업로드 초기값 0)
  const applicantToSelected = (a: typeof applicantsData[number]): typeof selectedApplicantsData[number] => ({
    id: a.id,
    name: a.name,
    instagramId: a.instagramId,
    followers: a.followers,
    followerCount: a.followerCount,
    engagement: a.engagement,
    fitScore: a.fitScore,
    selectedAt: new Date().toISOString().slice(0, 10),
    avatar: a.avatar,
    postsCount: a.postsCount,
    avgLikes: a.avgLikes,
    avgComments: a.avgComments,
    activityFields: a.activityFields,
    phoneNumber: a.phoneNumber,
    email: a.email,
    address: a.address,
    addressDetail: a.addressDetail,
    uploadedPostCount: 0,
    firstUploadedAt: null,
    latestPostUrl: null,
    allAnswers: a.allAnswers,
  })

  // 지원자 관리 핸들러
  /** 인플루언서 자동 알림 mock — 클라 정책 §54-59
   *  실제 발송은 BE 책임. 광고주 측에는 토스트로 발송 사실을 명시해 인플루언서 인지 보장.
   *  트리거: 검토중→콘텐츠대기(선정) / 콘텐츠대기→검토중(선정 취소) / 검토중→미선정(반려) / 검수중→완료·반려 */
  const sendNotificationMock = (
    kind: 'select' | 'select-cancel' | 'reject' | 'content-approve' | 'content-reject',
    targetCount: number,
  ) => {
    const labels: Record<typeof kind, string> = {
      'select':         '선정 알림',
      'select-cancel':  '선정 취소 알림',
      'reject':         '미선정 안내',
      'content-approve':'콘텐츠 승인 알림',
      'content-reject': '콘텐츠 반려 안내',
    }
    // BE 연동 자리. 현재는 mock — 실제 구현 시 인플루언서 알림센터 + 푸시·이메일 연동
    if (typeof console !== 'undefined') {
      console.info('[mock notification]', kind, `to ${targetCount}명`)
    }
    return labels[kind]
  }

  // 선정 예정 — 내부 전용, 인플루언서에게 알림 미발송 (정책서 § 6-4)
  const handlePendApplicant = (applicantId: number) => {
    setPendingApplicants(prev => new Set(prev).add(applicantId))
    showToast('선정 예정 처리되었습니다. 확정 시 인플루언서에게 알림이 갑니다.', 'info')
  }

  const handleUnpendApplicant = (applicantId: number) => {
    setPendingApplicants(prev => {
      const next = new Set(prev)
      next.delete(applicantId)
      return next
    })
    showToast('선정 예정이 취소되었습니다. 인플루언서에게는 영향이 없습니다.', 'info')
  }

  // 선정 확정 — AlertModal 확인 후 실행 (단방향)
  const handleConfirmSelection = async (applicantIds: number[]) => {
    if (isLoading) return
    const toSelect = applicants.filter(a => applicantIds.includes(a.id))
    if (toSelect.length === 0) return
    setIsLoading(true)
    try {
      setSelectedInfluencers(prev => [
        ...prev,
        ...toSelect.map(applicantToSelected),
      ])
      setApplicants(prev => prev.filter(a => !applicantIds.includes(a.id)))
      setPendingApplicants(prev => {
        const next = new Set(prev)
        applicantIds.forEach(id => next.delete(id))
        return next
      })
      setCheckedApplicants(new Set())
      setConfirmSelectionModal(null)
      sendNotificationMock('select', toSelect.length)
      showToast(`${toSelect.length}명 선정이 확정되었습니다. 인플루언서에게 알림이 발송되었습니다.`, 'success')
    } finally {
      setIsLoading(false)
    }
  }

  // 일괄 선정 예정 (구. 일괄 선정)
  const handleBulkPend = () => {
    if (checkedApplicants.size === 0) {
      showToast('선정 예정 처리할 지원자를 선택해주세요.', 'error')
      return
    }
    setPendingApplicants(prev => {
      const next = new Set(prev)
      checkedApplicants.forEach(id => next.add(id))
      return next
    })
    const count = checkedApplicants.size
    setCheckedApplicants(new Set())
    showToast(`${count}명 선정 예정 처리되었습니다.`, 'info')
  }

  const toggleCheck = (applicantId: number) => {
    setCheckedApplicants(prev => {
      const next = new Set(prev)
      if (next.has(applicantId)) next.delete(applicantId)
      else next.add(applicantId)
      return next
    })
  }

  // 선정 취소 — 컨펌 모달 후 실행 (모든 필드 보존)
  const confirmDeselectInfluencer = (influencerId: number) => {
    const influencer = selectedInfluencers.find(i => i.id === influencerId)
    if (influencer) {
      const inf = influencer as typeof selectedApplicantsData[number]
      setApplicants(prev => [
        ...prev,
        {
          id: inf.id,
          name: inf.name,
          instagramId: inf.instagramId,
          followers: inf.followers,
          followerCount: inf.followerCount ?? 0,
          fitScore: inf.fitScore,
          appliedAt: new Date().toISOString().slice(0, 10),
          engagement: inf.engagement,
          avatar: inf.avatar,
          postsCount: inf.postsCount ?? 0,
          avgLikes: inf.avgLikes ?? 0,
          avgComments: inf.avgComments ?? 0,
          recentActivityDays: 0,
          activityFields: inf.activityFields ?? [],
          primaryAnswer: inf.allAnswers?.[0]?.answer ?? '',
          allAnswers: inf.allAnswers ?? [],
          phoneNumber: inf.phoneNumber ?? '',
          email: inf.email ?? '',
          address: inf.address ?? '',
          addressDetail: inf.addressDetail ?? '',
          previewFeed: null,
          previewReels: null,
          isPrivate: false,
        },
      ])
    }
    setSelectedInfluencers(prev => prev.filter(i => i.id !== influencerId))
    setDeselectModal(null)
    sendNotificationMock('select-cancel', 1)
    showToast('선정이 취소되었습니다. 인플루언서에게 알림이 발송되었습니다.', 'info')
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

  const closeDownloadModal = () => {
    if (isPaying) return
    setDownloadModal(false)
    setDownloadStep('plan-select')
  }

  // 구독자 건당 결제 — Library 패턴과 동일
  // TODO: 다운로드 단가 미확정 — 현재 임의값(3,000원), 클라이언트 확정 후 반영 필요
  const PRICE_PER_DOWNLOAD = 3000 // 단가 임시값 (정책 확정 후 교체)

  const handleDownload = () => {
    if (isPaying) return
    setIsPaying(true)
    showToast('PG 결제 진행 중입니다... (mock)', 'info')
    setTimeout(() => {
      setDownloadedIds(prev => new Set([...prev, ...selectedContents]))
      setDownloadModal(false)
      setSelectedContents(new Set())
      setIsPaying(false)
      showToast(`${selectedContents.size}건 결제 완료. 다운로드를 시작합니다.`, 'success')
    }, 1200)
  }

  const handlePayAndDownload = () => {
    if (isPaying) return
    setIsPaying(true)
    showToast('PG 결제 진행 중입니다... (mock)', 'info')
    setTimeout(() => {
      // 결제 성공 mock — 실제로는 PG 응답 후 plan 활성화 + 다운로드 트리거
      closeDownloadModal()
      setSelectedContents(new Set())
      setIsPaying(false)
      const planName = pickedPlan === 'focus' ? 'Focus' : pickedPlan === 'scale' ? 'Scale' : 'Enterprise'
      showToast(`${planName} 플랜 결제가 완료되었습니다. 다운로드를 시작합니다.`, 'success')
    }, 1500)
  }

  // 반려
  const handleReject = async () => {
    if (isLoading) return
    if (!feedback.trim()) { showToast('피드백 내용을 입력해주세요.', 'error'); return }
    setIsLoading(true)
    try {
      if (rejectModal !== null) {
        setApplicantStatuses(prev => ({ ...prev, [rejectModal]: '반려' }))
        // 지원자 목록에서도 제거
        setApplicants(prev => prev.filter(a => a.id !== rejectModal))
      }
      setRejectModal(null)
      setFeedback('')
      sendNotificationMock('reject', 1)
      showToast('반려 피드백이 전달되었습니다. 인플루언서에게 알림이 발송되었습니다.', 'info')
    } finally {
      setIsLoading(false)
    }
  }

  // 성과 리포트는 승인된 콘텐츠만
  const approvedContents = registeredContents.filter(c => contentStatuses[c.id] === '승인')

  // 성과 리포트 데이터 — 원본 ReportView summary 보강
  const approvedReach = approvedContents.reduce((s, c) => s + c.reach, 0)
  const approvedLikes = approvedContents.reduce((s, c) => s + c.likes, 0)
  const approvedComments = approvedContents.reduce((s, c) => s + c.comments, 0)
  const approvedShares = approvedContents.reduce((s, c) => s + c.shares, 0)
  // 비디오 재생수 — 영상 유형(릴스/영상/쇼츠/스토리)만 reach를 view_count로 대체
  const approvedViews = approvedContents.reduce((s, c) => {
    const isVideo = c.type === '릴스' || c.type === '영상' || c.type === '쇼츠' || c.type === '스토리'
    return s + (isVideo ? c.reach : 0)
  }, 0)
  const approvedEngagement = approvedLikes + approvedComments + approvedShares
  // 평균 참여율 — 원본: (좋아요 + 댓글 + 공유) / 비디오 재생수 × 100
  const approvedEngRate = approvedViews > 0
    ? (approvedEngagement / approvedViews * 100).toFixed(1)
    : (approvedReach > 0 ? (approvedEngagement / approvedReach * 100).toFixed(1) : '0.0')
  // KPI 6개 — 정책서 § 9-1 (평균 참여율 통합 / 누적 조회수 = 총 비디오 재생수와 동일하므로 통합)
  const reportKPI: { label: string; value: string; icon: typeof FileText; tooltip?: string }[] = [
    { label: '총 콘텐츠', value: `${approvedContents.length}건`, icon: FileText },
    { label: '총 좋아요', value: fmtNumber(approvedLikes), icon: Heart },
    { label: '총 비디오 재생수', value: fmtNumber(approvedViews), icon: Eye },
    { label: '총 공유 수', value: fmtNumber(approvedShares), icon: Share2 },
    { label: '총 댓글 수', value: fmtNumber(approvedComments), icon: Info },
    { label: '평균 참여율 (릴스)', value: `${approvedEngRate}%`, icon: TrendingUp, tooltip: '피드는 조회수가 비공개라 릴스 콘텐츠의 (좋아요 + 댓글 + 공유) ÷ 조회수로 산출합니다.' },
  ]
  // TOP 인플루언서 (정책서 § 9-4) — 산식 변경: 좋아요+댓글+공유+저장 (재생수 제외)
  // 사유: 비디오 재생수는 릴스 전용 지표로 피드 중심 인플루언서가 부당하게 평가절하됨
  const topInfluencers = (() => {
    const map = new Map<string, { instagramId: string; name: string; likes: number; comments: number; shares: number; saves: number; contents: number }>()
    for (const c of approvedContents) {
      const key = c.instagramId || c.influencer
      const ex = map.get(key) ?? { instagramId: c.instagramId, name: c.influencer, likes: 0, comments: 0, shares: 0, saves: 0, contents: 0 }
      ex.likes += c.likes
      ex.comments += c.comments
      ex.shares += c.shares ?? 0
      ex.saves += c.saves ?? 0
      ex.contents += 1
      map.set(key, ex)
    }
    return Array.from(map.values())
      .sort((a, b) => (b.likes + b.comments + b.shares + b.saves) - (a.likes + a.comments + a.shares + a.saves))
      .slice(0, 5)
  })()
  // 시계열 — uploadPeriod 종료일 + 2주 범위 고정, 일간 집계
  const trendData = (() => {
    if (approvedContents.length === 0) return []
    // uploadPeriod: 'YYYY-MM-DD ~ YYYY-MM-DD' 형식
    const periodEnd = meta.uploadPeriod.split(' ~ ')[1]
    const rangeEnd = periodEnd ? (() => {
      const d = new Date(periodEnd)
      d.setDate(d.getDate() + 14)
      d.setHours(23, 59, 59, 999)
      return d
    })() : null
    const fmtDay = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
    const buckets = new Map<string, { label: string; sortKey: number; likes: number; comments: number; shares: number; views: number }>()
    for (const c of approvedContents) {
      const d = new Date(c.submittedAt)
      d.setHours(0, 0, 0, 0)
      if (rangeEnd && d > rangeEnd) continue
      const label = fmtDay(d)
      const isVideo = c.type === '릴스' || c.type === '영상' || c.type === '쇼츠' || c.type === '스토리'
      const ex = buckets.get(label) ?? { label, sortKey: d.getTime(), likes: 0, comments: 0, shares: 0, views: 0 }
      ex.likes += c.likes; ex.comments += c.comments; ex.shares += c.shares; ex.views += isVideo ? c.reach : 0
      buckets.set(label, ex)
    }
    return Array.from(buckets.values()).sort((a, b) => a.sortKey - b.sortKey)
  })()

  // 콘텐츠별 좋아요 비교 — Top 10
  const CHART_MAX_POINTS = 10
  const chartData = [...approvedContents]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, CHART_MAX_POINTS)
    .map(c => ({ name: c.influencer, caption: c.caption, likes: c.likes }))
  const maxLikes = chartData.length > 0 ? Math.max(...chartData.map(d => d.likes)) : 0
  const safeMaxLikes = maxLikes || 1

  // SVG 막대 차트 계산
  const chartW = 900
  const chartH = 260
  const padL = 55
  const padR = 20
  const padT = 24
  const padB = 60
  const plotW = chartW - padL - padR
  const plotH = chartH - padT - padB
  const barGap = 6
  const barW = Math.floor(plotW / Math.max(chartData.length, 1)) - barGap
  const bars = chartData.map((d, i) => ({
    x: padL + i * (barW + barGap),
    barH: (d.likes / safeMaxLikes) * plotH,
    ...d,
  }))

  // 콘텐츠 순위 (승인된 것만, 좋아요 순)
  const rankedContents = [...approvedContents].sort((a, b) => b.likes - a.likes)

  const isClosed = qa === 'campaign-closed' || isCancelled

  // 취소·삭제 가능 여부 (목록 정책과 동일)
  // - 취소: 종료/완료 status는 불가
  // - 삭제: 지원자 0명일 때만 가능 (원본 정책)
  const canCancelCampaign = !isCancelled && !isClosed && campaign.status !== '완료' && campaign.status !== '종료'
  const canDeleteCampaign = applicants.length === 0

  return (
    <div className="space-y-5">
      {/* 페이지 타이틀 + 뒤로가기 */}
      <div className="flex items-center gap-2 text-base text-gray-600">
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
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span className={`text-base font-medium rounded-full px-3 py-1 ${campaignStatus.cls}`}>{campaignStatus.label}</span>
                <span className="text-base font-medium rounded-full px-3 py-1 bg-gray-100 text-gray-600">{meta.campaignType}</span>
                <span className="text-base font-medium rounded-full px-3 py-1 bg-brand-green-bg text-brand-green-text">{campaign.category}</span>
              </div>
              <h1 className="text-xl @md:text-2xl font-bold text-gray-900 line-clamp-2">[{meta.location}] {campaign.name}</h1>
            </div>
            <Tooltip content="공유"><button onClick={handleShareCampaign} aria-label="공유" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0"><Share2 size={16} /></button></Tooltip>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={handleEditCampaign} aria-label="정보 변경" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-base text-gray-700"><Edit2 size={13} />정보 변경</button>
            {canCancelCampaign && (
              <button onClick={() => setCancelCampaignModal(true)} aria-label="캠페인 취소" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-base text-orange-700"><X size={13} />캠페인 취소</button>
            )}
            {canDeleteCampaign ? (
              <button onClick={() => setDeleteCampaignModal(true)} aria-label="삭제" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-base text-red-600"><Trash2 size={13} />삭제</button>
            ) : (
              <Tooltip side="bottom" multiline content="지원자가 있는 캠페인은 삭제할 수 없습니다. 취소 후 종료 처리하세요.">
                <span aria-disabled="true" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-base text-gray-400 cursor-not-allowed"><Trash2 size={13} />삭제</span>
              </Tooltip>
            )}
          </div>
        </div>

        {/* 일정 바 — 모집/콘텐츠등록/완료 3단계 (정책서 기준) */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-base min-w-0">
            <span className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 font-medium shrink-0">모집</span>
            <span className="text-gray-600 break-words">{meta.recruitPeriod.split(' ~ ').map(fmtDate).join(' ~ ')}</span>
          </div>
          <div className="flex items-center gap-2 text-base min-w-0">
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium shrink-0">업로드</span>
            <span className="text-gray-600 break-words">{meta.uploadPeriod.split(' ~ ').map(fmtDate).join(' ~ ')}</span>
          </div>
          <div className="flex items-center gap-2 text-base min-w-0">
            <span className="px-2.5 py-1 rounded-full bg-brand-green-bg text-brand-green-text font-medium shrink-0">완료</span>
            <span className="text-gray-600 break-words">{fmtDate(meta.announceDate)}</span>
          </div>
        </div>

        {/* KPI — 2×2 고정 (4칸 한 줄에 모두 넣으면 말줄임 발생) */}
        <div className="grid grid-cols-2 gap-3">
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
        <div className="bg-slate-100 border border-slate-200 text-slate-600 text-base px-4 py-3 rounded-xl">
          이 캠페인은 종료되었습니다.
        </div>
      )}

      {/* 탭 */}
      <div className={`relative flex items-center border-b border-gray-200 sticky bg-gray-50 z-10 -mx-4 @sm:mx-0 px-4 @sm:px-0 ${device !== 'desktop' ? 'top-12' : 'top-0'}`}>
        {canTabScrollLeft && (
          <button type="button" onClick={() => tabScrollRef.current?.scrollBy({ left: -120, behavior: 'smooth' })}
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
        )}
        <div ref={tabScrollRef} className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
        {tabs.map(tab => {
          const isTabGated = isGated && (tab === '등록 콘텐츠' || tab === '성과 리포트')
          const isDisabled = (isClosed && tab === '지원자 관리') || isTabGated
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              ref={el => {
                if (el && isActive) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                }
              }}
              onClick={() => {
                if (!isDisabled) {
                  setActiveTab(tab)
                  setCheckedApplicants(new Set())
                  // 탭 전환 시 필터·검색어 초기화
                  setApplicantsSearch('')
                  setAnswerFilters({})
                  setPendingOnlyFilter(false)
                  setContentFilter('전체')
                  setContentPlatform('전체')
                }
              }}
              disabled={isDisabled}
              aria-label={isTabGated ? `${tab} (구독 만료)` : undefined}
              className={`relative whitespace-nowrap shrink-0 px-2.5 @sm:px-4 py-2.5 ${isPhone ? 'text-base' : 'text-base'} border-b-2 transition-all duration-150 ${
                isDisabled
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : isActive
                    ? 'border-brand-green font-semibold text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {isTabGated && (
                <span className="absolute inset-0 rounded backdrop-blur-[1px] bg-white/40" aria-hidden="true" />
              )}
            </button>
          )
        })}
        </div>
        {canTabScrollRight && (
          <button type="button" onClick={() => tabScrollRef.current?.scrollBy({ left: 120, behavior: 'smooth' })}
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ─── A) 캠페인 정보 탭 ─── */}
      {activeTab === '캠페인 정보' && (
        <div className="space-y-4">
          {/* 캠페인 설명 — 썸네일을 우측 상단에 부착, 클릭 시 라이트박스 (원본 ToastEditorViewer 보강) */}
          <Section title="캠페인 설명" icon={<FileText size={14} />}>
            <div className="flex flex-col @sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setCampaignImageOpen(true)}
                aria-label="대표 이미지 크게 보기"
                className="group relative w-full @sm:w-32 @md:w-40 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <div className="aspect-[4/3] flex items-center justify-center">
                  <Image size={22} className="text-gray-300" aria-hidden="true" strokeWidth={1.5} />
                </div>
                <span className="absolute inset-x-0 bottom-0 px-2 py-1 text-sm font-medium text-white bg-gradient-to-t from-black/55 to-transparent flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 transition-opacity">
                  크게 보기
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <MarkdownView text={campaign.description} />
              </div>
            </div>
          </Section>

          {/* 제공 내역 */}
          <Section title="제공 내역" icon={<Crown size={14} />}>
            <p className="text-base font-semibold text-gray-900 mb-1">{meta.productName}</p>
            <MarkdownView text={meta.productDetail} className="mb-3" />
            <ul className="text-base text-gray-500 space-y-1 list-disc pl-4">
              <li>제품을 받자마자 보관방법을 확인하여 설명서대로 보관해주세요.</li>
              <li>제품의 자세한 정보는 반드시 상세페이지에서 꼼꼼히 숙지 부탁드립니다.</li>
            </ul>
          </Section>

          {/* 캠페인 미션 — 3카드 */}
          <Section title="캠페인 미션" icon={<TrendingUp size={14} />}>
            <div className="grid grid-cols-1 @md:grid-cols-3 gap-2.5">
              <MissionCard icon={<Search size={16} />} label="키워드" value="필수 포함" />
              <MissionCard icon={<Camera size={16} />} label="게시 유형" value={meta.postType} />
              <MissionCard icon={<Heart size={16} />} label="유의사항" value={meta.precaution} />
            </div>
          </Section>

          {/* 필수 가이드 — 원본 ToastEditorViewer 마크다운 뷰어 보강 (경량) */}
          <Section title="필수 가이드" icon={<FileText size={14} />}>
            <MarkdownView text={meta.guideText} />
          </Section>

          {/* 필수 키워드 */}
          <Section title="필수 키워드" icon={<Search size={14} />}>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {meta.requiredKeywords.map(k => (
                <span key={k} className="px-2.5 py-1 rounded-full bg-brand-green-bg text-brand-green-text text-base font-medium">{k}</span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(meta.requiredKeywords.join(' '))
                showToast('키워드가 복사되었습니다', 'success')
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-gray-300 text-base text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Copy size={13} />
              키워드 한 번에 복사하기
            </button>
          </Section>
        </div>
      )}

      {/* ─── B) 지원자 관리 탭 ─── */}
      {activeTab === '지원자 관리' && !isClosed && (() => {
        // 검색·정렬·동적 답변 필터 (원본 ApplicantList 기능 보강)
        const q = applicantsSearch.trim().toLowerCase()
        let filtered = applicants
        if (pendingOnlyFilter) {
          filtered = filtered.filter(a => pendingApplicants.has(a.id))
        }
        if (q) {
          filtered = filtered.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.activityFields.some(f => f.toLowerCase().includes(q))
          )
        }
        // 동적 답변 필터 적용
        const activeFilters = Object.entries(answerFilters).filter(([, v]) => !!v)
        if (activeFilters.length > 0) {
          filtered = filtered.filter(a =>
            activeFilters.every(([question, value]) => {
              const ans = a.allAnswers?.find(x => x.question === question)
              return ans?.answer === value
            })
          )
        }
        // 정렬
        const sorted = [...filtered].sort((a, b) => {
          let av = 0, bv = 0
          switch (applicantsSortKey) {
            case 'followerCount': av = a.followerCount; bv = b.followerCount; break
            case 'postsCount': av = a.postsCount; bv = b.postsCount; break
            case 'avgLikes': av = a.avgLikes; bv = b.avgLikes; break
            case 'avgComments': av = a.avgComments; bv = b.avgComments; break
            case 'engagement': av = a.engagement; bv = b.engagement; break
            case 'fitScore': av = a.fitScore; bv = b.fitScore; break
            case 'recentActivity': av = -a.recentActivityDays; bv = -b.recentActivityDays; break  // 일수 작을수록 최근
          }
          return applicantsSortDesc ? bv - av : av - bv
        })
        const totalCount = sorted.length
        const paginated = sorted.slice((applicantsPage - 1) * PAGE_SIZE, applicantsPage * PAGE_SIZE)
        // 동적 객관식 옵션 (Q2/Q3/Q4)
        const dynamicQuestions = [SECONDARY_QUESTIONS[0], SECONDARY_QUESTIONS[1], SECONDARY_QUESTIONS[2]]
        const toggleSort = (k: ApplicantSortKey) => {
          if (applicantsSortKey === k) setApplicantsSortDesc(d => !d)
          else { setApplicantsSortKey(k); setApplicantsSortDesc(true) }
        }
        // 정렬 가능 컬럼 인디케이터 (정책서 § 6-3) — 활성: ▼/▲ 짙게, 비활성: ▼ 흐리게 (정렬 가능 표시)
        const sortIcon = (k: ApplicantSortKey) =>
          applicantsSortKey === k
            ? <span className="ml-0.5 text-gray-700">{applicantsSortDesc ? '▼' : '▲'}</span>
            : <span className="ml-0.5 text-gray-300">▼</span>
        return (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Users size={15} className="text-gray-400" aria-hidden="true" />
              지원자 <span className="text-gray-900 font-bold">{totalCount}</span>명
              {totalCount !== applicants.length && <span className="text-base text-gray-500 font-normal">(전체 {applicants.length}명)</span>}
            </h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setPendingOnlyFilter(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-base border transition-colors duration-150 ${
                  pendingOnlyFilter
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={12} aria-hidden="true" />
                선정 예정만
                {pendingOnlyFilter && <span className="ml-0.5 font-semibold">{pendingApplicants.size}</span>}
              </button>
              <button
                onClick={handleBulkPend}
                disabled={applicants.length === 0}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-base hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UserCheck size={13} aria-hidden="true" />
                일괄 선정 예정
              </button>
              {pendingApplicants.size > 0 && (
                <button
                  onClick={() => setConfirmSelectionModal({ ids: Array.from(pendingApplicants) })}
                  className="flex items-center gap-2 bg-brand-green text-white px-3 py-1.5 rounded-xl text-base hover:bg-brand-green-hover transition-colors duration-150"
                >
                  <Check size={13} aria-hidden="true" />
                  선정 예정 {pendingApplicants.size}명 일괄 확정
                </button>
              )}
              <button
                onClick={handleExportApplicants}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-base hover:bg-gray-50 transition-colors duration-150"
              >
                <Download size={13} aria-hidden="true" />
                리스트 Export
              </button>
            </div>
          </div>

          {/* 검색 + 옵션 필터 — 한 패널로 통합. 검색은 항상 노출, 옵션은 펼침/접힘 */}
          {(() => {
            const activeEntries = Object.entries(answerFilters).filter(([, v]) => v)
            const activeCount = activeEntries.length
            const hasOptions = dynamicQuestions.length > 0
            return (
              <div className="bg-gray-50 rounded-xl border border-gray-100">
                {/* 헤더: 검색 + (있을 때) 옵션 토글 */}
                <div className="flex items-stretch gap-2 p-2 flex-wrap @sm:flex-nowrap">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                    <input
                      type="search"
                      placeholder="이름·활동분야로 검색"
                      value={applicantsSearch}
                      onChange={e => { setApplicantsSearch(e.target.value); setApplicantsPage(1) }}
                      className="w-full pl-9 pr-3 py-2 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 placeholder:text-gray-400"
                    />
                  </div>
                  {hasOptions && (
                    <button
                      type="button"
                      onClick={() => setOptionFilterOpen(o => !o)}
                      aria-expanded={optionFilterOpen}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-base font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    >
                      <span>옵션 필터</span>
                      {activeCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-brand-green text-white text-sm font-semibold">{activeCount}</span>
                      )}
                      <ChevronDown size={12} className={`transition-transform ${optionFilterOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* 활성 필터 칩 — 접힘 상태에서도 노출 */}
                {hasOptions && activeCount > 0 && (
                  <div className="px-3 pb-2.5 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2">
                    {activeEntries.map(([q, v]) => (
                      <span key={q} className="inline-flex items-center gap-1 max-w-full pl-2 pr-1 py-1 rounded-full bg-white border border-gray-200 text-base text-gray-700">
                        <span className="break-words">
                          <span className="text-gray-500">{q.replace(/\?$/, '')}:</span> <span className="font-medium">{v}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => { setAnswerFilters(prev => ({ ...prev, [q]: '' })); setApplicantsPage(1) }}
                          aria-label={`${q} 필터 제거`}
                          className="w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => { setAnswerFilters({}); setApplicantsPage(1) }}
                      className="text-base text-brand-green hover:underline ml-1 self-center"
                    >전체 해제</button>
                  </div>
                )}

                {/* 펼침 영역 — 질문 라벨(상단) + 드롭다운(하단) 그리드 */}
                {hasOptions && optionFilterOpen && (
                  <div className="p-3 border-t border-gray-100 grid grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-3 gap-3">
                    {dynamicQuestions.map(q => (
                      <div key={q.question} className="space-y-1 min-w-0">
                        <label className="block text-base text-gray-600 leading-snug break-words" title={q.question}>{q.question}</label>
                        <CustomSelect
                          value={answerFilters[q.question] ?? ''}
                          onChange={v => { setAnswerFilters(prev => ({ ...prev, [q.question]: v })); setApplicantsPage(1) }}
                          options={[{ label: '전체', value: '' }, ...q.answers.map(a => ({ label: a, value: a }))]}
                          className="text-base w-full"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {applicantBtnTop !== null && canApplicantScrollLeft && (
            <button type="button" onClick={() => applicantTableScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
              aria-label="왼쪽으로 스크롤" style={{ top: applicantBtnTop }}
              className="fixed left-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <ChevronLeft size={15} aria-hidden="true" />
            </button>
          )}
          {applicantBtnTop !== null && canApplicantScrollRight && (
            <button type="button" onClick={() => applicantTableScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
              aria-label="오른쪽으로 스크롤" style={{ top: applicantBtnTop }}
              className="fixed right-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative" ref={applicantTableWrapperRef}>
              {canApplicantScrollLeft && <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />}
              {canApplicantScrollRight && <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />}
            <div className="overflow-x-auto scrollbar-none" ref={applicantTableScrollRef}>
            <table className="w-full" ref={applicantTableRef}>
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      aria-label="전체 선택"
                      checked={paginated.length > 0 && paginated.every(a => checkedApplicants.has(a.id))}
                      onChange={() => {
                        const allChecked = paginated.length > 0 && paginated.every(a => checkedApplicants.has(a.id))
                        if (allChecked) setCheckedApplicants(new Set())
                        else setCheckedApplicants(new Set(paginated.map(a => a.id)))
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">이름</th>
                  <th scope="col" onClick={() => toggleSort('engagement')} className="text-right text-base font-medium text-gray-500 py-3 px-4 cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      참여율
                      <Tooltip content="(좋아요 + 댓글) ÷ 팔로워 × 100" multiline>
                        <Info size={11} className="text-gray-400 cursor-help" />
                      </Tooltip>
                      {sortIcon('engagement')}
                    </span>
                  </th>
                  <th scope="col" onClick={() => toggleSort('fitScore')} className="text-right text-base font-medium text-gray-500 py-3 px-4 cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles size={11} className="text-brand-green" aria-hidden="true" />
                      Fit Score
                      <Tooltip content="AI가 캠페인과 인플루언서의 카테고리·콘텐츠 톤·참여 시그널을 분석해 산출한 매칭 점수입니다. (검증 단계)" multiline>
                        <Info size={11} className="text-gray-400 cursor-help" />
                      </Tooltip>
                      {sortIcon('fitScore')}
                    </span>
                  </th>
                  <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">콘텐츠</th>
                  <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">활동분야</th>
                  <th scope="col" onClick={() => toggleSort('followerCount')} className="text-right text-base font-medium text-gray-500 py-3 px-4 cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap">팔로워 {sortIcon('followerCount')}</th>
                  <th scope="col" onClick={() => toggleSort('postsCount')} className="text-right text-base font-medium text-gray-500 py-3 px-4 cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap">게시물수 {sortIcon('postsCount')}</th>
                  <th scope="col" onClick={() => toggleSort('avgLikes')} className="text-right text-base font-medium text-gray-500 py-3 px-4 cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap">평균좋아요 {sortIcon('avgLikes')}</th>
                  <th scope="col" onClick={() => toggleSort('avgComments')} className="text-right text-base font-medium text-gray-500 py-3 px-4 cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap">평균댓글 {sortIcon('avgComments')}</th>
                  <th scope="col" onClick={() => toggleSort('recentActivity')} className="text-center text-base font-medium text-gray-500 py-3 px-4 cursor-pointer hover:bg-gray-100 select-none whitespace-nowrap">최근활동 {sortIcon('recentActivity')}</th>
                  <th scope="col" className="text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">신청일</th>
                  <th scope="col" className="text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">답변</th>
                  <th scope="col" aria-label="액션" className="py-3 px-2 sticky right-0 bg-gray-50/90 backdrop-blur-sm shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] min-w-[60px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(a => (
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
                        <div className={`w-10 h-10 rounded-full ${a.avatar} flex items-center justify-center text-gray-700 font-semibold text-base shrink-0`}>
                          {a.name[0]}
                        </div>
                        <div className="leading-tight">
                          <span className="block text-base font-bold text-gray-900 whitespace-nowrap">@{a.instagramId}</span>
                          <span className="block text-base text-gray-500 whitespace-nowrap mt-0.5">본명 · {a.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-base font-medium text-gray-800 text-right whitespace-nowrap">{a.engagement}%</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-base font-semibold bg-brand-green/10 text-brand-green">
                        {a.fitScore}
                      </span>
                    </td>
                    {/* 콘텐츠 미리보기 (피드 1 + 릴스 1) — 정책서 § 6-3-1 */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {a.isPrivate ? (
                        <span className="inline-flex items-center gap-1 text-base text-gray-500">
                          <Image size={12} aria-hidden="true" /> 비공개
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {a.previewFeed ? (
                            <button
                              type="button"
                              onClick={() => setPreviewModal({ applicantId: a.id, type: 'feed' })}
                              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${a.previewFeed} flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-brand-green/50 transition-all`}
                              aria-label={`${a.name} 최근 피드 미리보기`}
                            >
                              <Image size={14} className="text-white/60" aria-hidden="true" />
                            </button>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center" />
                          )}
                          {a.previewReels ? (
                            <button
                              type="button"
                              onClick={() => setPreviewModal({ applicantId: a.id, type: 'reels' })}
                              className={`w-8 h-12 rounded-lg bg-gradient-to-br ${a.previewReels} flex items-center justify-center relative cursor-pointer hover:ring-2 hover:ring-brand-green/50 transition-all`}
                              aria-label={`${a.name} 최근 릴스 미리보기`}
                            >
                              <Image size={12} className="text-white/60" aria-hidden="true" />
                              <span className="absolute top-0.5 right-0.5 text-[8px] bg-black/40 text-white px-0.5 rounded">릴스</span>
                            </button>
                          ) : (
                            <div className="w-8 h-12 rounded-lg bg-gray-50 flex items-center justify-center" />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {a.activityFields.map(f => (
                          <span key={f} className="text-base px-2 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">{f}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-base text-gray-700 text-right whitespace-nowrap">{a.followers}</td>
                    <td className="py-3 px-4 text-base text-gray-700 text-right whitespace-nowrap">{fmtNumber(a.postsCount)}</td>
                    <td className="py-3 px-4 text-base text-gray-700 text-right whitespace-nowrap">{fmtNumber(a.avgLikes)}</td>
                    <td className="py-3 px-4 text-base text-gray-700 text-right whitespace-nowrap">{fmtNumber(a.avgComments)}</td>
                    <td className="py-3 px-4 text-base text-gray-500 text-center whitespace-nowrap">{a.recentActivityDays === 0 ? '오늘' : `${a.recentActivityDays}일 전`}</td>
                    <td className="py-3 px-4 text-base text-gray-500 whitespace-nowrap">{fmtDate(a.appliedAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setAnswersModalId(a.id)}
                        className="text-base text-blue-600 hover:underline whitespace-nowrap"
                      >답변 보기</button>
                    </td>
                    <td className="py-2 px-2 sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                      {pendingApplicants.has(a.id) ? (
                        <div className="flex flex-col items-stretch gap-1 min-w-[64px]">
                          <span className="inline-flex items-center justify-center text-sm bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-1 rounded-md whitespace-nowrap">
                            선정 예정
                          </span>
                          <Tooltip content="선정 확정">
                            <button
                              onClick={() => setConfirmSelectionModal({ ids: [a.id], name: a.name })}
                              aria-label="선정 확정"
                              className="w-full inline-flex items-center justify-center bg-brand-green text-white p-1.5 rounded-md hover:bg-brand-green-hover transition-colors duration-150"
                            >
                              <Check size={14} aria-hidden="true" />
                            </button>
                          </Tooltip>
                          <Tooltip content="선정 취소">
                            <button
                              onClick={() => handleUnpendApplicant(a.id)}
                              aria-label="선정 취소"
                              className="w-full inline-flex items-center justify-center text-gray-500 border border-gray-200 p-1.5 rounded-md hover:bg-gray-50 transition-colors duration-150"
                            >
                              <X size={14} aria-hidden="true" />
                            </button>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="flex flex-col items-stretch gap-1 min-w-[64px]">
                          <Tooltip content="선정 예정">
                            <button
                              onClick={() => handlePendApplicant(a.id)}
                              aria-label="선정 예정"
                              className="w-full inline-flex items-center justify-center bg-white border border-brand-green text-brand-green p-1.5 rounded-md hover:bg-brand-green/5 transition-colors duration-150"
                            >
                              <Check size={14} aria-hidden="true" />
                            </button>
                          </Tooltip>
                          <Tooltip content="반려">
                            <button
                              onClick={() => setRejectModal(a.id)}
                              aria-label="반려"
                              className="w-full inline-flex items-center justify-center text-red-500 border border-red-200 p-1.5 rounded-md hover:bg-red-50 transition-colors duration-150"
                            >
                              <X size={14} aria-hidden="true" />
                            </button>
                          </Tooltip>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-base text-gray-500">
                      {applicants.length === 0 ? '지원자가 없습니다.' : '조건에 맞는 지원자가 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>{/* /overflow-x-auto */}
            </div>{/* /relative wrapper */}
            <Pagination total={totalCount} page={applicantsPage} pageSize={PAGE_SIZE} onChange={setApplicantsPage} />
          </div>
        </div>
        )
      })()}

      {/* ─── C) 선정된 지원자 탭 ─── */}
      {activeTab === '선정 인플루언서' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck size={15} className="text-gray-400" aria-hidden="true" />
              선정된 인플루언서 {selectedInfluencers.length}명
            </h2>
            <button
              onClick={handleExportSelected}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-base hover:bg-gray-50 transition-colors duration-150"
            >
              <Download size={13} aria-hidden="true" />
              리스트 Export
            </button>
          </div>

          {/* 등록 콘텐츠 현황 카드 — 신규, 원본 page.tsx 보강 */}
          {selectedInfluencers.length > 0 && (() => {
            const total = selectedInfluencers.length
            const uploaded = (selectedInfluencers as typeof selectedApplicantsData).filter(s => (s.uploadedPostCount ?? 0) > 0).length
            const rate = total > 0 ? Math.round((uploaded / total) * 100) : 0
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 @md:p-5">
                <div className="flex items-end justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">등록 콘텐츠 현황</h3>
                    <p className="text-base text-gray-500 mt-0.5">완료율 <span className="font-semibold text-gray-900">{rate}%</span> · {uploaded}/{total}명</p>
                  </div>
                  <button
                    onClick={() => { setUploadOverviewDetailId(null); setUploadOverviewOpen(true) }}
                    className="text-base font-medium px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  >자세히 보기 →</button>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${rate}%` }} />
                </div>
              </div>
            )
          })()}

          {/* 업로드 필터 — 신규, 원본 ApplicantList uploadFilter 보강 */}
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { value: 'all', label: '전체' },
              { value: 'uploaded', label: '등록 완료' },
              { value: 'not-uploaded', label: '미등록' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => { setSelectedUploadFilter(opt.value); setSelectedPage(1) }}
                className={`px-3 py-1.5 rounded-xl text-base font-medium transition-colors ${
                  selectedUploadFilter === opt.value
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >{opt.label}</button>
            ))}
          </div>

          {(() => {
            const data = selectedInfluencers as typeof selectedApplicantsData
            const filteredSelected = selectedUploadFilter === 'all'
              ? data
              : data.filter(s => selectedUploadFilter === 'uploaded' ? (s.uploadedPostCount ?? 0) > 0 : (s.uploadedPostCount ?? 0) === 0)
            const totalSel = filteredSelected.length
            const pagedSelected = filteredSelected.slice((selectedPage - 1) * PAGE_SIZE, selectedPage * PAGE_SIZE)
            return (
              <>
              {selectedBtnTop !== null && canSelectedScrollLeft && (
                <button type="button" onClick={() => selectedTableScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
                  aria-label="왼쪽으로 스크롤" style={{ top: selectedBtnTop }}
                  className="fixed left-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                  <ChevronLeft size={15} aria-hidden="true" />
                </button>
              )}
              {selectedBtnTop !== null && canSelectedScrollRight && (
                <button type="button" onClick={() => selectedTableScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
                  aria-label="오른쪽으로 스크롤" style={{ top: selectedBtnTop }}
                  className="fixed right-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              )}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="relative" ref={selectedTableWrapperRef}>
                  {canSelectedScrollLeft && <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />}
                  {canSelectedScrollRight && <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />}
                <div className="overflow-x-auto scrollbar-none" ref={selectedTableScrollRef}>
                <table className="w-full" ref={selectedTableRef}>
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">이름</th>
                      <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">활동분야</th>
                      <th scope="col" className="text-right text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">팔로워</th>
                      <th scope="col" className="text-right text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          참여율
                          <Tooltip content="(좋아요 + 댓글) ÷ 팔로워 × 100" multiline>
                            <Info size={11} className="text-gray-400 cursor-help" />
                          </Tooltip>
                        </span>
                      </th>
                      <th scope="col" className="text-right text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Sparkles size={11} className="text-brand-green" aria-hidden="true" />
                          Fit Score
                          <Tooltip content="AI가 캠페인과 인플루언서의 카테고리·콘텐츠 톤·참여 시그널을 분석해 산출한 매칭 점수입니다. (검증 단계)" multiline>
                            <Info size={11} className="text-gray-400 cursor-help" />
                          </Tooltip>
                        </span>
                      </th>
                      <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">연락처</th>
                      <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">주소</th>
                      <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">업로드 상태</th>
                      <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">최초 등록일</th>
                      <th scope="col" className="text-right text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">등록 게시글</th>
                      <th scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">답변</th>
                      <th scope="col" className="text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">선정일</th>
                      <th scope="col" className="text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pagedSelected.map(i => (
                      <tr key={i.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${i.avatar} flex items-center justify-center text-gray-700 font-semibold text-base shrink-0`}>
                              {i.name[0]}
                            </div>
                            <div className="leading-tight">
                              <span className="block text-base font-bold text-gray-900 whitespace-nowrap">@{i.instagramId}</span>
                              <span className="block text-base text-gray-500 whitespace-nowrap mt-0.5">본명 · {i.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(i.activityFields ?? []).map(f => (
                              <span key={f} className="text-base px-2 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">{f}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-base text-gray-700 text-right whitespace-nowrap">{i.followers}</td>
                        <td className="py-3 px-4 text-base text-gray-600 text-right whitespace-nowrap">{i.engagement}%</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-base font-semibold bg-brand-green-bg text-gray-900">
                            {i.fitScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-base text-gray-600 whitespace-nowrap">{i.phoneNumber ?? '-'}</td>
                        <td className="py-3 px-4 text-base text-gray-600 whitespace-nowrap">{i.address ?? '-'} {i.addressDetail ?? ''}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {(i.uploadedPostCount ?? 0) > 0 ? (
                            <span className="inline-flex rounded-full bg-brand-green-bg px-2.5 py-1 text-base font-bold text-brand-green-text">등록 완료</span>
                          ) : (
                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-base font-bold text-gray-600">미등록</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-base text-gray-600 whitespace-nowrap">{i.firstUploadedAt ?? '-'}</td>
                        <td className="py-3 px-4 text-base text-gray-700 text-right whitespace-nowrap">{(i.uploadedPostCount ?? 0) > 0 ? `${i.uploadedPostCount}개` : '-'}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setAnswersModalId(i.id)}
                            className="text-base text-blue-600 hover:underline whitespace-nowrap"
                          >답변 보기</button>
                        </td>
                        <td className="py-3 px-4 text-base text-gray-500 whitespace-nowrap">{fmtDate(i.selectedAt)}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setDeselectModal(i.id)}
                            disabled={isClosed}
                            className={`flex items-center gap-1 text-base border px-3 py-1.5 rounded-xl transition-colors duration-150 whitespace-nowrap ${
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
                    {pagedSelected.length === 0 && (
                      <tr>
                        <td colSpan={13} className="py-12 text-center text-base text-gray-500">
                          {selectedInfluencers.length === 0 ? '선정된 인플루언서가 없습니다.' : '조건에 맞는 인플루언서가 없습니다.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>{/* /overflow-x-auto */}
                </div>{/* /relative wrapper */}
                <Pagination total={totalSel} page={selectedPage} pageSize={PAGE_SIZE} onChange={setSelectedPage} />
              </div>
              </>
            )
          })()}
        </div>
      )}

      {/* ─── D) 등록 콘텐츠 탭 ─── */}
      {activeTab === '등록 콘텐츠' && !isGated && qa === 'tab-content-empty' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Image size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-base font-medium text-gray-500">등록된 콘텐츠가 없습니다</p>
          <p className="text-base text-gray-500 mt-1">인플루언서가 콘텐츠를 제출하면 여기에 표시됩니다.</p>
        </div>
      )}
      {activeTab === '등록 콘텐츠' && !isGated && qa !== 'tab-content-empty' && (() => {
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
                  <p className="text-base text-amber-700 font-medium">검수 대기 콘텐츠 {counts.검수중}건이 있습니다</p>
                </div>
                <span className="text-base text-amber-500">검수하기 →</span>
              </button>
            )}

            {/* 헤더 — 건수 + 다운로드 */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-semibold text-gray-900">
                등록 콘텐츠
                <span className="ml-1.5 text-base font-normal text-gray-500">{filtered.length}건</span>
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/library?campaign=${encodeURIComponent(campaign.name)}`)}
                  className="inline-flex items-center gap-1.5 text-base text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <FolderOpen size={13} aria-hidden="true" />
                  라이브러리에서 보기
                </button>
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
                  className="text-base text-gray-600 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors whitespace-nowrap"
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
                  className="inline-flex items-center gap-1.5 bg-brand-green text-white px-3 py-1.5 rounded-xl text-base hover:bg-brand-green-hover transition-colors duration-150 whitespace-nowrap"
                >
                  <Download size={13} aria-hidden="true" />
                  다운로드{selectedContents.size > 0 && ` (${selectedContents.size})`}
                </button>
              </div>
            </div>

            {/* 필터 + 정렬 — 모바일은 1열(stacked), 태블릿+ flex 한 줄 */}
            <div className="grid grid-cols-1 gap-2 @sm:flex @sm:items-center @sm:gap-2">
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
                <p className="text-base text-gray-500">
                  {[
                    contentPlatform !== '전체' && contentPlatform,
                    contentFilter !== '전체' && contentFilter,
                  ].filter(Boolean).join(' · ')} 콘텐츠가 없습니다
                </p>
                {(contentFilter !== '전체' || contentPlatform !== '전체') && (
                  <button
                    onClick={() => { setContentFilter('전체'); setContentPlatform('전체'); setContentPage(1) }}
                    className="mt-3 text-base text-brand-green hover:underline"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4">
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
                        <span className={`text-base px-2 py-1 rounded-full font-medium ${
                          c.platform === '인스타그램' ? 'bg-pink-500/90 text-white' :
                          c.platform === '유튜브' ? 'bg-red-500/90 text-white' :
                          c.platform === '틱톡' ? 'bg-black/80 text-white' :
                          'bg-green-600/90 text-white'
                        }`}>{c.platform}</span>
                        {c.type && (
                          <span className={`text-base px-2.5 py-1 rounded-full font-medium ${CONTENT_TYPE_STYLE[c.type as keyof typeof CONTENT_TYPE_STYLE] ?? 'bg-gray-100 text-gray-600'}`}>
                            {c.type}
                          </span>
                        )}
                        </div>
                        {/* 콘텐츠 점수 (정책서 § 8-2) */}
                        <div className="absolute bottom-3 right-3">
                          <Tooltip content="콘텐츠의 도달·참여·반응을 종합한 자체 산출 점수입니다. (검증 단계 — 자세한 산식은 후속 정의)" multiline>
                            <div className={`text-base font-bold px-2.5 py-1 rounded-full backdrop-blur-sm cursor-help ${
                              c.viralScore === 0 ? 'bg-white/80 text-gray-400' :
                              c.viralScore >= 80 ? 'bg-green-500/90 text-white' :
                              c.viralScore >= 50 ? 'bg-amber-400/90 text-white' : 'bg-white/80 text-gray-500'
                            }`}>
                              {c.viralScore === 0 ? '—' : `${c.viralScore}점`}
                            </div>
                          </Tooltip>
                        </div>
                      </div>

                      {/* 정보 영역 */}
                      <div className="p-4 space-y-3">
                        {/* 인플루언서 + 상태 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-base shrink-0">
                              {c.influencer[0]}
                            </div>
                            <div className="min-w-0 leading-tight">
                              <p className="text-base font-bold text-gray-900 break-words">@{c.instagramId}</p>
                              <p className="text-base text-gray-500 break-words mt-0.5">본명 · {c.influencer}</p>
                            </div>
                          </div>
                          <span className={`text-base font-semibold px-2.5 py-1 rounded-full shrink-0 ${CONTENT_STATUS_STYLE[status]}`}>
                            {status}
                          </span>
                        </div>

                        {/* 제출일 + 찜하기 */}
                        <div className="flex items-center justify-between">
                          <p className="text-base text-gray-500">제출일 {c.submittedAt}</p>
                          <button
                            onClick={e => { e.stopPropagation(); toggleContentInfluencerBookmark(c.influencer) }}
                            aria-label={contentInfluencerBookmarks.has(c.influencer) ? `${c.influencer} 찜 해제` : `${c.influencer} 찜하기`}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Heart
                              size={14}
                              className={contentInfluencerBookmarks.has(c.influencer) ? 'fill-red-400 text-red-400' : 'text-gray-300'}
                              aria-hidden="true"
                            />
                          </button>
                        </div>

                        {/* 지표 — 항상 2×3 (3열은 좁은 카드에서 값 겹침) */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-center border-t border-gray-50 pt-3">
                          {[
                            { label: '도달', value: fmtNumber(c.reach) },
                            { label: '좋아요', value: fmtNumber(c.likes) },
                            { label: '댓글', value: fmtNumber(c.comments) },
                            { label: '저장', value: fmtNumber(c.saves) },
                            { label: '공유', value: fmtNumber(c.shares) },
                            { label: '참여율', value: `${engRate}%`, highlight: true },
                          ].map(m => (
                            <div key={m.label}>
                              <p className="text-base text-gray-500 mb-0.5">{m.label}</p>
                              <p className={`text-base font-bold ${m.highlight ? 'text-brand-green' : 'text-gray-800'}`}>{m.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* 검수 액션 — 검수중만 표시 */}
                        {status === '검수중' && !isClosed && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => {
                                setContentStatuses(prev => ({ ...prev, [c.id]: '승인' }))
                                sendNotificationMock('content-approve', 1)
                                showToast(`${c.influencer} 콘텐츠를 승인했습니다. 인플루언서에게 알림이 발송되었습니다.`, 'success')
                              }}
                              className="flex-1 flex items-center justify-center gap-1 bg-brand-green text-white py-3 rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors"
                            >
                              <Check size={12} aria-hidden="true" /> 승인
                            </button>
                            <button
                              onClick={() => setContentRejectModal(c.id)}
                              className="flex-1 flex items-center justify-center gap-1 border border-red-200 text-red-500 py-3 rounded-xl text-base font-medium hover:bg-red-50 transition-colors"
                            >
                              <X size={12} aria-hidden="true" /> 반려
                            </button>
                          </div>
                        )}
                        {/* 반려 사유 재제출 안내 */}
                        {status === '반려' && (
                          <div className="flex items-center gap-1.5 bg-red-50 rounded-xl px-3 py-2">
                            <X size={12} className="text-red-400 shrink-0" aria-hidden="true" />
                            <p className="text-base text-red-500">반려 처리됨 · 인플루언서에게 피드백 전달</p>
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
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 text-base flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-colors"
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
                      ? <span key={`e${i}`} className="w-8 text-center text-base text-gray-500">…</span>
                      : <button
                          key={p}
                          onClick={() => setContentPage(p as number)}
                          className={`w-8 h-8 rounded-lg text-base font-medium transition-colors ${
                            safePage === p ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >{p}</button>
                  )}
                <button
                  onClick={() => setContentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 text-base flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )
      })()}

      {/* ─── E) 성과 리포트 탭 — 빈 상태 ─── */}
      {activeTab === '성과 리포트' && !isGated && qa === 'tab-report-empty' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <BarChart3 size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-base font-medium text-gray-500">성과 데이터가 없습니다</p>
          <p className="text-base text-gray-500 mt-1">캠페인이 진행되면 성과 리포트가 자동으로 생성됩니다.</p>
        </div>
      )}

      {/* ─── E) 성과 리포트 탭 ─── */}
      {activeTab === '성과 리포트' && !isGated && qa !== 'tab-report-empty' && (
        <div className="space-y-4">
          {/* KPI 6개 — 2×3 고정 (말줄임 방지). 평균 참여율은 6번째에 통합 */}
          <div className="grid grid-cols-2 gap-3 @sm:gap-4">
            {reportKPI.map(k => {
              const Icon = k.icon
              return (
                <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 @sm:p-5 min-w-0">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Icon size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <span className="text-base text-gray-500 break-words">{k.label}</span>
                    {k.tooltip && (
                      <Tooltip content={k.tooltip} multiline>
                        <Info size={11} className="text-gray-400 cursor-help shrink-0" />
                      </Tooltip>
                    )}
                  </div>
                  <div className="text-2xl @sm:text-3xl font-bold text-gray-900 tracking-tight break-words">{k.value}</div>
                </div>
              )
            })}
          </div>

          {/* TOP 인플루언서 (인플루언서 단위 Top 5) — 원본 ReportView 보강 */}
          {topInfluencers.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-gray-400" aria-hidden="true" />
                <h3 className="text-base font-semibold text-gray-900">TOP 인플루언서</h3>
                <span className="text-base text-gray-500">· 좋아요 + 댓글 + 공유 + 저장 합산 (정책서 § 9-4)</span>
              </div>
              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 @sm:gap-4">
                {topInfluencers.map((inf, idx) => (
                  <div key={inf.instagramId || inf.name} className="flex flex-col rounded-xl bg-gray-50 px-4 py-4 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-base font-bold shrink-0 ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                      }`}>{idx + 1}</div>
                      <div className="min-w-0 leading-tight">
                        <p className="text-base font-bold text-gray-900 break-words">@{inf.instagramId}</p>
                        <p className="text-base text-gray-500 break-words mt-0.5">본명 · {inf.name} · 콘텐츠 {inf.contents}개</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-3 gap-y-1 text-base flex-wrap pl-11">
                      <span className="text-gray-500">좋아요 <strong className="text-gray-900">{fmtNumber(inf.likes)}</strong></span>
                      <span className="text-gray-500">댓글 <strong className="text-gray-900">{fmtNumber(inf.comments)}</strong></span>
                      <span className="text-gray-500">공유 <strong className="text-gray-900">{fmtNumber(inf.shares)}</strong></span>
                      <span className="text-gray-500">저장 <strong className="text-gray-900">{fmtNumber(inf.saves)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 시계열 차트 3종 — 항상 1열 (각 차트 내부 가로 스크롤로 확인) */}
          {trendData.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              <TrendChart title="좋아요 추이" data={trendData} dataKey="likes" stroke="#ef4444" />
              <TrendChart title="비디오 재생수 추이" data={trendData} dataKey="views" stroke="#3b82f6" />
              <TrendChart title="공유·댓글 추이" data={trendData} multi={[
                { dataKey: 'shares', label: '공유', stroke: '#10b981' },
                { dataKey: 'comments', label: '댓글', stroke: '#f59e0b' },
              ]} />
            </div>
          )}

          {/* 중요 릴스 콘텐츠 TOP 3 (정책서 § 9-3) — 릴스 한정, 콘텐츠 점수(바이럴 점수) 기준 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown size={16} className="text-amber-500" aria-hidden="true" />
              <h3 className="text-base font-semibold text-gray-900">중요 릴스 콘텐츠 TOP 3</h3>
              <span className="text-base text-gray-500">· 릴스 한정 · 콘텐츠 점수 기준</span>
              <Tooltip content="콘텐츠 점수는 도달·참여·반응을 종합한 자체 산출 점수입니다. 자세한 산식은 검증 단계입니다." multiline>
                <Info size={11} className="text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 @md:grid @md:grid-cols-3 @md:overflow-visible @md:pb-0">
              {[...approvedContents]
                .filter(c => c.type === '릴스' || c.type === '영상' || c.type === '쇼츠')
                .sort((a, b) => b.viralScore - a.viralScore)
                .slice(0, 3)
                .map((c, idx) => {
                  const medals = ['🥇', '🥈', '🥉']
                  const scoreColor = c.viralScore >= 80 ? 'text-brand-green' : c.viralScore >= 50 ? 'text-amber-500' : 'text-gray-500'
                  const borderColor = idx === 0 ? 'border-amber-200' : 'border-gray-100'
                  const engRate = c.reach > 0 ? ((c.likes + c.comments + c.saves) / c.reach * 100).toFixed(1) : '0.0'
                  return (
                    <div key={c.id} className={`rounded-xl border ${borderColor} p-4 flex flex-col gap-3 min-w-[260px] @md:min-w-0 shrink-0 @md:shrink`}>
                      {/* 상단: 순위 + 점수 */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg" aria-hidden="true">{medals[idx]}</span>
                        <span className={`text-base font-bold ${scoreColor}`}>{c.viralScore}점</span>
                      </div>
                      {/* 콘텐츠 제목 */}
                      <div>
                        <p className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">{c.caption}</p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className="text-base text-gray-500 whitespace-nowrap">@{c.instagramId}</span>
                          <PlatformBadge platform={c.platform} />
                          {c.type && (
                            <span className={`text-base px-2 py-1 rounded-full font-medium whitespace-nowrap shrink-0 ${CONTENT_TYPE_STYLE[c.type as keyof typeof CONTENT_TYPE_STYLE] ?? 'bg-gray-100 text-gray-600'}`}>
                              {c.type}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* 지표 — 카드 폭이 좁아 값 겹침 방지 위해 stacked (라벨·값 한 행씩) */}
                      <div className="flex flex-col gap-1 pt-2 border-t border-gray-50">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-base text-gray-500 shrink-0">도달</p>
                          <p className="text-base font-bold text-gray-800">{fmtNumber(c.reach)}</p>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-base text-gray-500 shrink-0">좋아요</p>
                          <p className="text-base font-bold text-gray-800">{fmtNumber(c.likes)}</p>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-base text-gray-500 shrink-0">참여율</p>
                          <p className="text-base font-bold text-brand-green">{engRate}%</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* 콘텐츠별 좋아요 비교 그래프 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">콘텐츠별 좋아요 비교</h3>
                  {approvedContents.length > CHART_MAX_POINTS && (
                    <span className="text-base text-gray-500">좋아요 Top {CHART_MAX_POINTS} (전체 {approvedContents.length}건 중)</span>
                  )}
                </div>
                <div className="relative overflow-x-auto overflow-y-hidden">
                  <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible block" style={{ minWidth: chartW }}>
                    {/* Y축 그리드 */}
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
                    {/* 막대 */}
                    {bars.map((b, i) => {
                      const barTop = padT + plotH - b.barH
                      const isHovered = hoveredChartIdx === i
                      return (
                        <g key={i}
                          onMouseEnter={() => setHoveredChartIdx(i)}
                          onMouseLeave={() => setHoveredChartIdx(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* 막대 본체 */}
                          <rect
                            x={b.x}
                            y={barTop}
                            width={barW}
                            height={b.barH}
                            rx={4}
                            fill={isHovered ? 'var(--color-brand-green)' : 'var(--color-brand-green)'}
                            fillOpacity={isHovered ? 1 : 0.7}
                          />
                          {/* X축 라벨 */}
                          <text
                            x={b.x + barW / 2}
                            y={padT + plotH + 16}
                            textAnchor="end"
                            transform={`rotate(-35 ${b.x + barW / 2} ${padT + plotH + 16})`}
                            fontSize={11}
                            fill="#6b7280"
                          >
                            {b.name.length > 5 ? `${b.name.slice(0, 5)}…` : b.name}
                          </text>
                          {/* 호버 툴팁 */}
                          {isHovered && (
                            <g>
                              <rect x={b.x + barW / 2 - 72} y={barTop - 52} width={144} height={44} rx={6} fill="#1f2937" fillOpacity={0.92} />
                              <text x={b.x + barW / 2} y={barTop - 34} textAnchor="middle" fontSize={10} fill="#d1d5db">
                                {b.caption.length > 20 ? `${b.caption.slice(0, 20)}…` : b.caption}
                              </text>
                              <text x={b.x + barW / 2} y={barTop - 16} textAnchor="middle" fontSize={12} fill="white" fontWeight="600">
                                ♥ {b.likes.toLocaleString()}
                              </text>
                            </g>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </div>
          </div>

          {/* 콘텐츠 순위 테이블 */}
          {(() => {
            const pagedRanked = rankedContents.slice((rankedPage - 1) * PAGE_SIZE, rankedPage * PAGE_SIZE)
            const rankOffset = (rankedPage - 1) * PAGE_SIZE
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">콘텐츠 순위</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        {['순위', '인플루언서', '도달', '좋아요', '참여율'].map(h => (
                          <th key={h} scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-4 whitespace-nowrap">{h}</th>
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
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-base font-bold ${
                                rank === 1 ? 'bg-yellow-100 text-yellow-700' : rank === 2 ? 'bg-gray-100 text-gray-600' : rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'
                              }`}>
                                {rank}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap leading-tight">
                              <p className="text-base font-bold text-gray-900">@{c.instagramId}</p>
                              <p className="text-base text-gray-500 mt-0.5">본명 · {c.influencer}</p>
                            </td>
                            <td className="py-3 px-4 text-base text-gray-700 whitespace-nowrap">{fmtNumber(c.reach)}</td>
                            <td className="py-3 px-4 text-base text-gray-700 whitespace-nowrap">{c.likes.toLocaleString()}</td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="text-base font-semibold text-brand-green">{engRate}%</span>
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
            size="md"
            footer={
              <>
                {dcStatus === '검수중' && !isClosed && (
                  <>
                    <button
                      onClick={() => { setContentStatuses(prev => ({ ...prev, [dc.id]: '승인' })); sendNotificationMock('content-approve', 1); showToast(`${dc.influencer} 콘텐츠를 승인했습니다. 인플루언서에게 알림이 발송되었습니다.`, 'success'); setContentDetailModal(null) }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brand-green text-white py-2.5 rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors"
                    ><Check size={13} /> 승인</button>
                    <button
                      onClick={() => { setContentDetailModal(null); setContentRejectModal(dc.id) }}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-500 py-2.5 rounded-xl text-base font-medium hover:bg-red-50 transition-colors"
                    ><X size={13} /> 반려</button>
                  </>
                )}
                <button
                  onClick={() => { setContentDetailModal(null); toggleContentCheck(dc.id); setDownloadModal(true) }}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
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
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-base shrink-0">
                    {dc.influencer[0]}
                  </div>
                  <div className="leading-tight">
                    <p className="text-base font-bold text-gray-900">@{dc.instagramId}</p>
                    <p className="text-base text-gray-500 mt-0.5">본명 · {dc.influencer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className={`text-base px-2.5 py-1 rounded-full font-medium ${
                    dc.platform === '인스타그램' ? 'bg-pink-100 text-pink-700' :
                    dc.platform === '유튜브' ? 'bg-red-100 text-red-700' :
                    dc.platform === '틱톡' ? 'bg-gray-200 text-gray-800' :
                    'bg-green-100 text-green-700'
                  }`}>{dc.type ? `${dc.platform} · ${dc.type}` : dc.platform}</span>
                  <span className={`text-base font-semibold px-2.5 py-1 rounded-full ${CONTENT_STATUS_STYLE[dcStatus]}`}>{dcStatus}</span>
                </div>
              </div>
              {/* 제출일 + 바이럴 */}
              <div className="flex items-center justify-between text-base text-gray-500">
                <span>제출일 {dc.submittedAt}</span>
                {dc.viralScore > 0 && (
                  <span className={`font-bold px-2.5 py-1 rounded-full ${
                    dc.viralScore >= 80 ? 'bg-green-100 text-green-700' :
                    dc.viralScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}>바이럴 {dc.viralScore}점</span>
                )}
              </div>
              {/* 지표 — 모바일 3×2, 태블릿+ 한 줄 6열 */}
              <div className="grid grid-cols-3 @sm:grid-cols-6 gap-y-2 gap-x-1 text-center bg-gray-50 rounded-xl py-2.5 px-2">
                {[
                  { label: '도달', value: fmtNumber(dc.reach) },
                  { label: '좋아요', value: fmtNumber(dc.likes) },
                  { label: '댓글', value: fmtNumber(dc.comments) },
                  { label: '저장', value: fmtNumber(dc.saves) },
                  { label: '공유', value: fmtNumber(dc.shares) },
                  { label: '참여율', value: `${dcEngRate}%`, highlight: true },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-sm text-gray-500 mb-0.5">{m.label}</p>
                    <p className={`text-base font-bold ${m.highlight ? 'text-brand-green' : 'text-gray-800'}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )
      })()}

      {/* 콘텐츠 다운로드 모달 — 구독자: 건당 결제(Library 패턴) / 미구독자: 플랜 선택 → 결제 → 다운로드 */}
      <Modal
        open={downloadModal}
        onClose={closeDownloadModal}
        title={canDownloadContent ? '콘텐츠를 다운로드하시겠습니까?' : (downloadStep === 'plan-select' ? '구독 후 다운로드 가능' : '결제 진행')}
        size={canDownloadContent ? 'sm' : 'md'}
        footer={canDownloadContent ? (
          <>
            <button onClick={closeDownloadModal} disabled={isPaying} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors disabled:opacity-50">취소</button>
            <button
              onClick={handleDownload}
              disabled={isPaying || selectedContents.size === 0}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors disabled:opacity-50"
            >
              {isPaying ? '결제 중…' : '결제 후 다운로드'}
            </button>
          </>
        ) : downloadStep === 'plan-select' ? (
          <>
            <button onClick={closeDownloadModal} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors">취소</button>
            {pickedPlan === 'enterprise' ? (
              <button
                onClick={() => { closeDownloadModal(); window.location.href = 'mailto:enterprise@wellink.ai?subject=Enterprise 플랜 문의' }}
                className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors"
              >
                문의하기
              </button>
            ) : (
              <button
                onClick={() => setDownloadStep('payment')}
                className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors"
              >
                결제하기
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setDownloadStep('plan-select')} disabled={isPaying} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors disabled:opacity-60">이전</button>
            <button onClick={handlePayAndDownload} disabled={isPaying} className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {isPaying ? '결제 중...' : '결제 완료'}
            </button>
          </>
        )}
      >
        {canDownloadContent ? (
          // 구독자 — Library 건당 결제 패턴과 동일
          <div className="space-y-3">
            <p className="text-base text-gray-600">
              다운로드 1건당 <strong className="text-gray-900">₩{PRICE_PER_DOWNLOAD.toLocaleString()}</strong>이 부과됩니다.
            </p>
            <div className="space-y-2 text-base bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between"><span className="text-gray-500">다운로드 대상</span><span className="font-medium">선택한 콘텐츠</span></div>
              <div className="flex justify-between"><span className="text-gray-500">건수</span><span className="font-medium">{selectedContents.size}건</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
                <span className="text-gray-500">결제 금액</span>
                <span className="font-semibold text-gray-900">₩{(PRICE_PER_DOWNLOAD * selectedContents.size).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-base text-gray-500">등록된 기본 결제 수단으로 결제됩니다. 결제 내역은 마이페이지 결제 내역에서 확인할 수 있습니다.</p>
            <p className="text-base text-gray-500">다운로드한 콘텐츠는 계약된 SNS 채널 및 광고 활용 범위 내에서만 사용 가능합니다.</p>
          </div>
        ) : downloadStep === 'plan-select' ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <Crown size={16} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                <p className="text-base font-semibold text-amber-900">콘텐츠 다운로드는 유료 플랜 전용 기능입니다</p>
                <p className="text-base text-amber-700">선택 콘텐츠 <span className="font-semibold">{selectedContents.size}건</span> · 현재 <span className="font-semibold">{planLabel}</span></p>
              </div>
            </div>
            <div className="space-y-2">
              {([
                { id: 'focus' as const,      name: 'Focus',      price: '₩99,000/월',  desc: '소규모 캠페인 1~3건 운영, 기본 분석' },
                { id: 'scale' as const,      name: 'Scale',      price: '₩299,000/월', desc: '다중 캠페인, 인플루언서 관리, 고급 필터', recommend: true },
                { id: 'enterprise' as const, name: 'Enterprise', price: '문의',         desc: '무제한 캠페인, 고급 분석, 전담 매니저' },
              ]).map(p => {
                const active = pickedPlan === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPickedPlan(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      active ? 'border-brand-green bg-brand-green/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 ${active ? 'border-brand-green' : 'border-gray-300'}`}>
                          {active && <span className="w-2 h-2 rounded-full bg-brand-green" />}
                        </span>
                        <span className="text-base font-semibold text-gray-900">{p.name}</span>
                        {p.recommend && <span className="text-sm px-2 py-1 rounded-full bg-brand-green/10 text-brand-green-text font-medium">추천</span>}
                      </div>
                      <span className="text-base font-semibold text-gray-900 shrink-0">{p.price}</span>
                    </div>
                    <p className="text-base text-gray-500 mt-1 ml-6">{p.desc}</p>
                  </button>
                )
              })}
            </div>
            <p className="text-base text-gray-500">Enterprise 플랜은 별도 상담을 통해 견적이 산출됩니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-base">
                <span className="text-gray-500">선택한 플랜</span>
                <span className="text-gray-900 font-semibold">{pickedPlan === 'focus' ? 'Focus' : 'Scale'} 플랜</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-500">결제 금액</span>
                <span className="text-gray-900 font-semibold">{pickedPlan === 'focus' ? '₩99,000' : '₩299,000'} / 월</span>
              </div>
              <div className="flex justify-between text-base border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-500">다운로드 콘텐츠</span>
                <span className="text-gray-900 font-medium">{selectedContents.size}건 (즉시 다운로드)</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-base text-gray-500">결제 수단을 입력해 주세요</p>
              <div className="space-y-2">
                <input type="text" placeholder="카드 번호 (1234-5678-9012-3456)" disabled className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-base bg-gray-50 text-gray-400 cursor-not-allowed" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="MM/YY" disabled className="px-3 py-2.5 border border-gray-200 rounded-xl text-base bg-gray-50 text-gray-400 cursor-not-allowed" />
                  <input type="text" placeholder="CVC" disabled className="px-3 py-2.5 border border-gray-200 rounded-xl text-base bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
              </div>
              <p className="text-base text-gray-500">실제 결제는 PG사 보안 페이지로 안전하게 연결됩니다 (mock).</p>
            </div>
          </div>
        )}
      </Modal>

      {/* 캠페인 대표 이미지 라이트박스 — 클릭 시 딤드 + 크게 보기 */}
      {campaignImageOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="캠페인 대표 이미지"
          onClick={() => setCampaignImageOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-3xl w-full max-h-[85vh] rounded-2xl overflow-hidden bg-brand-green-bg cursor-default"
          >
            <button
              type="button"
              onClick={() => setCampaignImageOpen(false)}
              aria-label="닫기"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-700"
            >
              <X size={18} />
            </button>
            <div className="aspect-[4/3] flex items-center justify-center">
              <Image size={80} className="text-gray-200" aria-hidden="true" />
            </div>
          </div>
        </div>
      )}

      {/* 신청 답변 보기 모달 — 신규, 원본 ApplicantList 보강 */}
      {(() => {
        const target = answersModalId !== null
          ? (applicants.find(a => a.id === answersModalId) ?? (selectedInfluencers as typeof selectedApplicantsData).find(s => s.id === answersModalId))
          : null
        return (
          <Modal
            open={answersModalId !== null}
            onClose={() => setAnswersModalId(null)}
            title="전체 답변 보기"
            size="md"
            footer={
              <button
                onClick={() => setAnswersModalId(null)}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-base font-medium hover:bg-gray-800 transition-colors"
              >닫기</button>
            }
          >
            <div className="space-y-3">
              {target && (
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-10 h-10 rounded-full ${target.avatar} flex items-center justify-center text-gray-700 font-semibold text-base shrink-0`}>
                    {target.name[0]}
                  </div>
                  <span className="text-base font-semibold text-gray-900">{target.name}</span>
                </div>
              )}
              {target?.allAnswers && target.allAnswers.length > 0 ? (
                <div className="space-y-3">
                  {target.allAnswers.map(a => (
                    <div key={a.orderNumber} className="space-y-1">
                      <p className="text-base font-medium text-gray-500">{a.question}</p>
                      <p className="text-base text-gray-800 bg-gray-50 rounded-xl p-3 leading-relaxed">{a.answer || '-'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-gray-500 text-center py-6">답변이 없습니다.</p>
              )}
            </div>
          </Modal>
        )
      })()}

      {/* 등록 콘텐츠 현황 모달 — 신규, 원본 page.tsx 업로드 현황 모달 보강 */}
      {(() => {
        const data = selectedInfluencers as typeof selectedApplicantsData
        const detail = uploadOverviewDetailId !== null
          ? data.find(s => s.id === uploadOverviewDetailId) ?? null
          : null
        const total = data.length
        const uploaded = data.filter(s => (s.uploadedPostCount ?? 0) > 0).length
        const rate = total > 0 ? Math.round((uploaded / total) * 100) : 0
        return (
          <Modal
            open={uploadOverviewOpen}
            onClose={() => { setUploadOverviewOpen(false); setUploadOverviewDetailId(null) }}
            title={detail ? `${detail.name}님의 업로드 현황` : '등록 콘텐츠 현황'}
            size="lg"
            footer={
              detail ? (
                <button
                  onClick={() => setUploadOverviewDetailId(null)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors"
                >← 목록으로</button>
              ) : (
                <button
                  onClick={() => { setUploadOverviewOpen(false); setUploadOverviewDetailId(null) }}
                  className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-base font-medium hover:bg-gray-800 transition-colors"
                >닫기</button>
              )
            }
          >
            {!detail ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-brand-green-border bg-brand-green-bg px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold uppercase tracking-wider text-brand-green-text">완료율</p>
                    <p className="text-3xl font-bold text-gray-900 mt-0.5">{rate}%</p>
                  </div>
                  <p className="text-base text-brand-green-text">{uploaded}/{total}명 등록</p>
                </div>
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {data.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setUploadOverviewDetailId(s.id)}
                      className="w-full flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full ${s.avatar} flex items-center justify-center text-gray-700 font-semibold text-base shrink-0`}>
                        {s.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-gray-900">{s.name}</span>
                          {(s.uploadedPostCount ?? 0) > 0 ? (
                            <span className="text-base font-bold rounded-full bg-brand-green-bg text-brand-green-text px-2.5 py-1">등록 완료</span>
                          ) : (
                            <span className="text-base font-bold rounded-full bg-gray-100 text-gray-600 px-2.5 py-1">미등록</span>
                          )}
                        </div>
                        <p className="text-base text-gray-500 mt-0.5">팔로워 {s.followers} · 참여율 {s.engagement}%</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-semibold text-gray-900">{s.uploadedPostCount ?? 0}개</p>
                        <p className="text-sm text-gray-500">게시글</p>
                      </div>
                    </button>
                  ))}
                  {data.length === 0 && (
                    <p className="text-base text-gray-500 text-center py-12">선정된 인플루언서가 없습니다.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full ${detail.avatar} flex items-center justify-center text-gray-700 font-semibold shrink-0`}>
                      {detail.name[0]}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{detail.name}</p>
                      <p className="text-base text-gray-500">팔로워 {detail.followers} · Fit Score {detail.fitScore}점</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 @sm:grid-cols-3 gap-2">
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">게시글 수</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{detail.uploadedPostCount ?? 0}개</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">등록 시점</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {detail.firstUploadedAt ? fmtDate(detail.firstUploadedAt) : '미등록'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">게시글 이동</p>
                      {detail.latestPostUrl ? (
                        <a
                          href={detail.latestPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-semibold text-brand-green-text underline mt-1 inline-block"
                        >게시글로 이동 ↗</a>
                      ) : (
                        <p className="text-base text-gray-500 mt-1">연결된 게시글 없음</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        )
      })()}

      {/* 등록 콘텐츠 반려 모달 */}
      <Modal
        open={contentRejectModal !== null}
        onClose={() => { setContentRejectModal(null); setContentRejectFeedback('') }}
        size="sm"
        title="콘텐츠 반려"
        footer={
          <>
            <button onClick={() => { setContentRejectModal(null); setContentRejectFeedback('') }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors">취소</button>
            <button
              onClick={() => {
                if (contentRejectModal === null) return
                if (!contentRejectFeedback.trim()) { showToast('반려 사유를 입력해주세요.', 'error'); return }
                setContentStatuses(prev => ({ ...prev, [contentRejectModal]: '반려' }))
                const name = registeredContents.find(c => c.id === contentRejectModal)?.influencer ?? ''
                sendNotificationMock('content-reject', 1)
                showToast(`${name} 콘텐츠를 반려했습니다. 인플루언서에게 알림이 발송되었습니다.`, 'error')
                setContentRejectModal(null)
                setContentRejectFeedback('')
              }}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-base hover:bg-red-600 transition-colors"
            >반려 전송</button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-base text-gray-600">반려 사유를 입력해주세요. 인플루언서에게 전달됩니다.</p>
          <textarea
            value={contentRejectFeedback}
            onChange={e => setContentRejectFeedback(e.target.value)}
            placeholder="예) 브랜드 로고가 누락되었습니다. 수정 후 재제출해 주세요."
            rows={4}
            maxLength={500}
            className="w-full text-base border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-all placeholder:text-gray-400"
          />
          <div className="text-right text-base text-gray-500">{contentRejectFeedback.length}/500</div>
        </div>
      </Modal>

      {/* 선정 확정 컨펌 모달 (정책서 § 6-4) — 확정 시 인플루언서에게 알림 + 이후 변경 불가 */}
      <AlertModal
        open={confirmSelectionModal !== null}
        onClose={() => setConfirmSelectionModal(null)}
        title="선정을 확정하시겠습니까?"
        confirmLabel="선정 확정"
        cancelLabel="취소"
        variant="danger"
        size="sm"
        onConfirm={() => confirmSelectionModal && handleConfirmSelection(confirmSelectionModal.ids)}
      >
        <p className="text-base text-gray-500">
          {confirmSelectionModal?.name ? (
            <><strong className="text-gray-700">{confirmSelectionModal.name}</strong>님의 선정을 확정합니다.</>
          ) : confirmSelectionModal ? (
            <>선정 예정 <strong className="text-gray-700">{confirmSelectionModal.ids.length}</strong>명을 확정합니다.</>
          ) : null}{' '}
          확정 시 인플루언서에게 선정 알림이 발송되며, <strong className="text-gray-700">이후 선정을 변경할 수 없습니다.</strong>
        </p>
      </AlertModal>

      {/* 선정 취소 컨펌 모달 */}
      <AlertModal
        open={deselectModal !== null}
        onClose={() => setDeselectModal(null)}
        title="선정을 취소할까요?"
        confirmLabel="선정 취소"
        cancelLabel="아니요"
        variant="danger"
        size="sm"
        onConfirm={() => deselectModal !== null && confirmDeselectInfluencer(deselectModal)}
      >
        <p className="text-base text-gray-500">
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
        size="sm"
        onConfirm={confirmEditCampaign}
      >
        <p className="text-base text-gray-500 whitespace-pre-line">
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
        size="sm"
        onConfirm={handleDeleteCampaign}
      >
        <p className="text-base text-gray-500">
          <strong className="text-gray-700">{campaign.name}</strong> 캠페인을 삭제합니다. 모집·콘텐츠·정산 데이터가 함께 사라지며 이 작업은 되돌릴 수 없습니다.
        </p>
      </AlertModal>

      {/* 콘텐츠 인라인 미리보기 모달 (정책서 § 6-3-1) */}
      <Modal
        open={previewModal !== null}
        onClose={() => setPreviewModal(null)}
        title={previewModal?.type === 'feed' ? '최근 피드 미리보기' : '최근 릴스 미리보기'}
        size="md"
      >
        {(() => {
          if (!previewModal) return null
          const previewable = applicants.filter(a => !a.isPrivate && (previewModal.type === 'feed' ? a.previewFeed : a.previewReels))
          const curIdx = previewable.findIndex(a => a.id === previewModal.applicantId)
          const target = previewable[curIdx]
          if (!target) return null
          const hasPrev = curIdx > 0
          const hasNext = curIdx < previewable.length - 1
          const isFeed = previewModal.type === 'feed'
          const baseGrad = isFeed ? target.previewFeed : target.previewReels
          return (
            <div className="space-y-4">
              {/* 헤더 — 인플루언서 정보 + 이전/다음 */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${target.avatar} flex items-center justify-center text-gray-700 font-semibold shrink-0`}>
                  {target.name[0]}
                </div>
                <div className="flex-1 min-w-0 leading-tight">
                  <p className="text-base font-bold text-gray-900">@{target.instagramId}</p>
                  <p className="text-base text-gray-500 mt-0.5">본명 · {target.name} · 팔로워 {target.followers}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setPreviewModal({ applicantId: previewable[curIdx - 1].id, type: previewModal.type })}
                    disabled={!hasPrev}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="이전"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-base text-gray-500 min-w-[40px] text-center">{curIdx + 1} / {previewable.length}</span>
                  <button
                    onClick={() => setPreviewModal({ applicantId: previewable[curIdx + 1].id, type: previewModal.type })}
                    disabled={!hasNext}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="다음"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              {/* 콘텐츠 그리드 — 피드: 3×2 / 릴스: 3×2 (세로 비율) */}
              {baseGrad ? (
                <div className={`grid ${isFeed ? 'grid-cols-3' : 'grid-cols-3'} gap-1.5`}>
                  {Array.from({ length: 6 }, (_, i) => {
                    const g = isFeed
                      ? FEED_GRADIENTS[(target.id + i) % FEED_GRADIENTS.length]
                      : REELS_GRADIENTS[(target.id + i) % REELS_GRADIENTS.length]
                    const likes = Math.round(target.avgLikes * (0.7 + (i * 0.13) % 0.6))
                    return (
                      <div key={i} className={`${isFeed ? 'aspect-square' : 'aspect-[9/16]'} bg-gradient-to-br ${g} rounded-lg flex flex-col items-center justify-center relative overflow-hidden`}>
                        <Image size={22} className="text-white/50" aria-hidden="true" />
                        {!isFeed && i === 0 && (
                          <span className="absolute top-1.5 right-1.5 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-full leading-none">릴스</span>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 text-[11px] text-white/80 font-medium">♥ {fmtNumber(likes)}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center text-base text-gray-500">콘텐츠 없음</div>
              )}
              {/* 통계 */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-base text-gray-500">평균 좋아요</p>
                  <p className="text-base font-semibold text-gray-900">{fmtNumber(target.avgLikes)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-base text-gray-500">평균 댓글</p>
                  <p className="text-base font-semibold text-gray-900">{fmtNumber(target.avgComments)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-base text-gray-500">참여율</p>
                  <p className="text-base font-semibold text-gray-900">{target.engagement}%</p>
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* 캠페인 취소 확인 모달 */}
      <AlertModal
        open={cancelCampaignModal}
        onClose={() => setCancelCampaignModal(false)}
        title="캠페인을 취소할까요?"
        confirmLabel="캠페인 취소"
        cancelLabel="닫기"
        variant="danger"
        size="sm"
        onConfirm={() => {
          setCancelCampaignModal(false)
          setIsCancelled(true)
          showToast(`'${campaign.name}' 캠페인이 취소되었습니다. 지원자에게 알림이 발송됩니다.`, 'success')
        }}
      >
        <p className="text-base text-gray-500 whitespace-pre-line">
          {`현재 ${applicants.length}명의 지원자가 있습니다.\n캠페인을 취소하면 모든 지원자에게 자동 알림이 발송되며, 위약금이 발생할 수 있습니다.\n\n계약 조건에 따라 환불·정산 정책이 적용됩니다.`}
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
            <button onClick={() => { setRejectModal(null); setFeedback('') }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors">취소</button>
            <button onClick={handleReject} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-base hover:bg-red-600 transition-colors">반려 전송</button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-base text-gray-600">반려 이유를 입력해주세요. 인플루언서에게 전달됩니다.</p>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="예) 브랜드 로고가 누락되었습니다. 수정 후 재제출해 주세요."
            rows={4}
            maxLength={500}
            className="w-full text-base border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-all"
          />
          <div className="text-right text-base text-gray-500">{feedback.length}/500</div>
        </div>
      </Modal>
    </div>
  )
}

function KpiCell({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5 min-w-0">
      <p className="text-base text-gray-500 mb-0.5">{label}</p>
      <p className={`font-bold text-gray-900 break-words ${small ? 'text-base leading-snug' : 'text-lg @md:text-xl leading-tight'}`}>{value}</p>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 @md:p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
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
      <p className="text-base text-gray-500 mb-0.5">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  )
}

/** 마크다운 경량 뷰어 — 원본 ToastEditorViewer 일부 호환 (제목·굵게·리스트·줄바꿈) */
function MarkdownView({ text, className = '' }: { text: string; className?: string }) {
  if (!text || !text.trim()) {
    return <p className={`text-base text-gray-500 ${className}`}>내용이 없습니다.</p>
  }
  // 라인 단위 파싱
  const lines = text.split(/\r?\n/)
  const blocks: React.ReactNode[] = []
  let listBuf: string[] = []
  const flushList = (key: string) => {
    if (listBuf.length === 0) return
    blocks.push(
      <ul key={`ul-${key}`} className="text-base text-gray-700 list-disc pl-5 space-y-1 my-1">
        {listBuf.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
        ))}
      </ul>
    )
    listBuf = []
  }
  // 인라인 굵게/기울임 — `**bold**`, `*italic*`만
  const inlineFormat = (s: string): string => {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*\s][^*]*[^*\s]|\S)\*(?!\*)/g, '<em>$1</em>')
  }
  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd()
    if (line.trim() === '') {
      flushList(String(idx))
      return
    }
    // 헤딩
    const h2 = /^##\s+(.+)$/.exec(line)
    const h3 = /^###\s+(.+)$/.exec(line)
    const h1 = /^#\s+(.+)$/.exec(line)
    // 리스트
    const li = /^[-*]\s+(.+)$/.exec(line)
    if (h1) {
      flushList(String(idx))
      blocks.push(<h3 key={idx} className="text-lg font-bold text-gray-900 mt-3 mb-2" dangerouslySetInnerHTML={{ __html: inlineFormat(h1[1]) }} />)
    } else if (h2) {
      flushList(String(idx))
      blocks.push(<h4 key={idx} className="text-base font-bold text-gray-900 mt-3 mb-1.5" dangerouslySetInnerHTML={{ __html: inlineFormat(h2[1]) }} />)
    } else if (h3) {
      flushList(String(idx))
      blocks.push(<h5 key={idx} className="text-base font-semibold text-gray-800 mt-2 mb-1" dangerouslySetInnerHTML={{ __html: inlineFormat(h3[1]) }} />)
    } else if (li) {
      listBuf.push(li[1])
    } else {
      flushList(String(idx))
      blocks.push(<p key={idx} className="text-base text-gray-700 leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />)
    }
  })
  flushList('end')
  return <div className={className}>{blocks}</div>
}

/** 시계열 추이 라인 차트 — 원본 ReportView PerformanceChart 동등 (SVG로 직접 구현) */
type TrendPoint = { label: string; sortKey: number; likes: number; comments: number; shares: number; views: number }
function TrendChart({
  title,
  data,
  dataKey,
  stroke,
  multi,
}: {
  title: string
  data: TrendPoint[]
  dataKey?: keyof Omit<TrendPoint, 'label' | 'sortKey'>
  stroke?: string
  multi?: { dataKey: keyof Omit<TrendPoint, 'label' | 'sortKey'>; label: string; stroke: string }[]
}) {
  const W = 600, H = 200, padL = 40, padR = 12, padT = 16, padB = 28
  const plotW = W - padL - padR, plotH = H - padT - padB
  const series = multi ?? (dataKey && stroke ? [{ dataKey, label: title, stroke }] : [])
  const allValues = series.flatMap(s => data.map(d => d[s.dataKey]))
  const max = Math.max(1, ...allValues)
  const xStep = data.length > 1 ? plotW / (data.length - 1) : 0
  const pointFor = (v: number, i: number) => ({
    x: padL + i * xStep,
    y: padT + plotH - (v / max) * plotH,
  })
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const updateFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const xRatio = (e.clientX - rect.left) / rect.width
    const xInVB = xRatio * W
    const clamped = Math.max(padL, Math.min(padL + plotW, xInVB))
    const idx = Math.round((clamped - padL) / Math.max(xStep, 0.0001))
    if (idx >= 0 && idx < data.length) setHoverIdx(idx)
  }
  const handleDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromPointer(e)
  }
  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    // 모바일(터치): 캡처된 동안만 갱신 / 데스크톱(마우스): 항상 갱신
    if (e.pointerType === 'mouse' || e.currentTarget.hasPointerCapture(e.pointerId)) {
      updateFromPointer(e)
    }
  }
  const handleUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  const handleLeave = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'mouse') setHoverIdx(null)
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 @sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-gray-700">{title}</h4>
        {multi && (
          <div className="flex items-center gap-3">
            {multi.map(s => (
              <span key={s.dataKey} className="flex items-center gap-1 text-base text-gray-500">
                <span className="w-2 h-2 rounded-full" style={{ background: s.stroke }} />
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-x-auto overflow-y-hidden -mx-1">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible cursor-crosshair touch-none select-none mx-1 block"
        style={{ minWidth: W }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onPointerLeave={handleLeave}
      >
        {[0, 0.25, 0.5, 0.75, 1].map(r => {
          const y = padT + plotH - r * plotH
          const v = Math.round(r * max)
          return (
            <g key={r}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize={9} fill="#9ca3af">{v.toLocaleString()}</text>
            </g>
          )
        })}
        {series.map(s => {
          const points = data.map((d, i) => pointFor(d[s.dataKey], i))
          const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
          const fillPath = points.length > 0
            ? `${path} L ${points[points.length - 1].x} ${padT + plotH} L ${points[0].x} ${padT + plotH} Z`
            : ''
          return (
            <g key={s.dataKey}>
              {fillPath && <path d={fillPath} fill={s.stroke} fillOpacity={0.08} />}
              <path d={path} fill="none" stroke={s.stroke} strokeWidth={2} />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={s.stroke} />
              ))}
            </g>
          )
        })}
        {/* X축: 첫·마지막 라벨만 (호버로 상세 확인) */}
        {data.length > 0 && (
          <>
            <text x={padL} y={padT + plotH + 16} textAnchor="start" fontSize={10} fill="#6b7280">{data[0].label}</text>
            <text x={padL + plotW} y={padT + plotH + 16} textAnchor="end" fontSize={10} fill="#6b7280">{data[data.length - 1].label}</text>
          </>
        )}
        {/* 호버/탭 인디케이터 + 툴팁 (모바일은 더 크게) */}
        {hoverIdx !== null && (() => {
          const hx = padL + hoverIdx * xStep
          // 모바일 터치 가독성을 위해 툴팁 크기·폰트 확대
          const tipW = Math.max(170, 110 + series.length * 36)
          const tipH = 32 + series.length * 20
          const tx = Math.max(padL, Math.min(W - padR - tipW, hx - tipW / 2))
          const ty = 4
          return (
            <g pointerEvents="none">
              <line x1={hx} y1={padT} x2={hx} y2={padT + plotH} stroke="#9ca3af" strokeWidth={1} strokeDasharray="3 3" />
              {series.map(s => {
                const p = pointFor(data[hoverIdx][s.dataKey], hoverIdx)
                return <circle key={s.dataKey} cx={p.x} cy={p.y} r={5} fill="white" stroke={s.stroke} strokeWidth={2.5} />
              })}
              <rect x={tx} y={ty} width={tipW} height={tipH} rx={8} fill="#111827" opacity={0.94} />
              <text x={tx + 12} y={ty + 18} fontSize={13} fontWeight={700} fill="white">{data[hoverIdx].label}</text>
              {series.map((s, i) => (
                <g key={s.dataKey}>
                  <circle cx={tx + 16} cy={ty + 36 + i * 20} r={3.5} fill={s.stroke} />
                  <text x={tx + 26} y={ty + 40 + i * 20} fontSize={12} fill="#e5e7eb">
                    {s.label}: <tspan fontWeight={700} fill="white">{data[hoverIdx][s.dataKey].toLocaleString()}</tspan>
                  </text>
                </g>
              ))}
            </g>
          )
        })()}
      </svg>
      </div>
    </div>
  )
}

