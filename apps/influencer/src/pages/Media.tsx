import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Users, TrendingUp, CheckCircle2, Heart, MessageCircle, Image, Clock, BarChart3, RefreshCw, AlertTriangle, Loader2, ExternalLink, User, Camera, BadgeCheck, ArrowUpRight } from 'lucide-react'
import Layout from '../components/Layout'
import { AlertModal, Modal, getEngagementColor, PLATFORM_COLORS as PLATFORM_COLOR, fmtFollowers, ErrorState, Skeleton, Pagination, SEMANTIC_COLORS } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { mockInstaStats, mockProfile } from '../services/mock/profile'
import { fmtRelativeDate } from '../utils/format'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../utils/thumbnailPlaceholder'
import { useInstagramState } from '../services/userState'

interface Platform {
  id: string
  name: string
  iconBg: string
  icon: string
  connected: boolean
  url?: string
  followers?: number
  engagementRate?: number
  description: string
  placeholder: string
}

const PLATFORM_META: Omit<Platform, 'connected' | 'url' | 'followers' | 'engagementRate'>[] = [
  { id: 'instagram', name: '인스타그램', iconBg: PLATFORM_COLOR.instagram, icon: '📷', description: '아이디를 연결하면 팔로워 수가 자동으로 확인돼요', placeholder: '@인스타그램 아이디' },
]

const CONTENT_PAGE_SIZE = 20
const MOCK_CONTENT = Array.from({ length: 100 }, (_, i) => ({
  id: String(i + 1),
  src: getThumbnailFromPool(i + 200).replace('w=360&h=640', 'w=400&h=400'),
}))

export default function Media() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const ig = useInstagramState()

  const [contentPage, setContentPage] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showMetaModal, setShowMetaModal] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(qa === 'modal-connect')
  const [connectInput, setConnectInput] = useState('')
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const { showToast } = useToast()

  // QA: all-disconnected → ig.connected 강제 override (localStorage 상태 무관)
  const isConnected = qa === 'all-disconnected' ? false : ig.connected

  // 데이터 수집 상태 — 원본 mypage L1357-1364 isMentionsUpdating/isMentionsFailed
  const isUpdating  = qa === 'updating'
  const isFailed    = qa === 'update-failed'
  // posts=0 경고 — 원본 mypage L1373-1406
  const mockPosts   = qa === 'no-posts' ? 0 : mockInstaStats.posts
  // 일반 계정 비공개 케이스 — 스크래핑 불가, 게시물 없음
  const isPrivate   = qa === 'personal-private'

  // 새로고침 상태 — 원본 InstagramSettings onRefreshProfile() refreshing 상태
  const [refreshing, setRefreshing] = useState(false)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current) }, [])

  const handleRefresh = () => {
    if (refreshing) return
    setRefreshing(true)
    refreshTimerRef.current = setTimeout(() => {
      setRefreshing(false)
      showToast('통계를 업데이트했어요', 'success')
    }, 1500)
  }

  // QA 파라미터 외부 동기화
  useEffect(() => {
    const m = searchParams.get('modal')
    if (m === 'disconnect' || qa === 'modal-disconnect') setShowDisconnectModal(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, location.key, qa])

  if (qa === 'loading') {
    return (
      <Layout mobileFull>
        <div className="bg-white @[640px]:rounded-2xl @[640px]:border @[640px]:border-gray-100 @[640px]:shadow-sm">
          {/* 헤더: @handle + 계정변경 텍스트 + 새로고침 버튼 + 연결됨 배지 */}
          <div className="flex items-center justify-between gap-3 px-4 pt-4 @[640px]:px-5 @[640px]:pt-5 mb-4">
            <Skeleton shape="text" height={16} width="8rem" />
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton shape="text" height={14} width="3.5rem" />
              <Skeleton shape="circle" height={28} width={28} />
              <Skeleton shape="card" height={24} width="4.5rem" className="rounded-full" />
            </div>
          </div>
          {/* 통계 그리드: 6셀 (팔로워·게시물·참여율·평균좋아요·평균댓글·최근활동) */}
          <div className="grid grid-cols-3 @[560px]:grid-cols-6 gap-2 mb-4 px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 flex flex-col items-center gap-1.5">
                <Skeleton shape="text" height={12} width="3.5rem" />
                <Skeleton shape="text" height={16} width="2.5rem" />
              </div>
            ))}
          </div>
          {/* 최근 콘텐츠 헤더 */}
          <div className="flex items-center gap-1.5 mb-2 px-4">
            <Skeleton shape="circle" height={14} width={14} />
            <Skeleton shape="text" height={14} width="5rem" />
          </div>
          {/* 이미지 그리드 */}
          <div className="grid grid-cols-3 @[560px]:grid-cols-4 @[720px]:grid-cols-5 gap-1.5 px-4 pb-4 @[640px]:px-5 @[640px]:pb-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout mobileFull>
        <div className="bg-white @[640px]:rounded-2xl @[640px]:border @[640px]:border-gray-100 @[640px]:shadow-sm">
          <div className="flex items-center justify-center min-h-[350px]">
            <ErrorState message="SNS 연결 정보를 불러오지 못했어요" onRetry={() => window.location.reload()} />
          </div>
        </div>
      </Layout>
    )
  }

  // 인스타 최초 연동 — Meta OAuth redirect (광고주 앱과 동일 방식)
  // 실제 구현: startInfluencerMetaConnect() → client_id/redirect_uri 인플루언서용으로 교체
  /** mock: 일반 또는 프로페셔널 계정 연결 시뮬레이션 */
  const handleConnect = (professional: boolean) => {
    setIsConnecting(true)
    setTimeout(() => {
      ig.connect(professional)
      setIsConnecting(false)
      showToast(
        professional ? '프로페셔널 계정이 연결됐어요!' : '인스타그램 계정이 연결됐어요',
        'success',
      )
    }, 1400)
  }

  /** 일반 계정 연결 모달 확인 */
  const handleConnectPersonalConfirm = () => {
    setShowConnectModal(false)
    handleConnect(false)
  }

  /** 프로페셔널 전환 — Meta OAuth 모달 열기 */
  const handleUpgradeToProfessional = () => {
    setShowMetaModal(true)
  }

  const handleDisconnect = () => {
    ig.disconnect()
    showToast('인스타그램 연결을 해제했어요', 'info')
    setShowDisconnectModal(false)
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="sr-only">인스타 관리</h1>

        {/* 모바일 탭 — 모바일(< 640px)에서만 표시, sticky */}
        <div className="@[640px]:hidden sticky top-0 z-10 -mx-4 px-4 py-2 bg-gray-50/95 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-1 flex">
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none"
            >
              <User size={14} />내 정보
            </button>
            <button
              aria-current="page"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold bg-brand-green-bg text-brand-green-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <Camera size={14} />인스타 관리
            </button>
          </div>
        </div>

        {/* ── 프로페셔널 계정 연결됨 — 통계 풀뷰 ── */}
        {isConnected && ig.professional && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* 패널 헤더 */}
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-2 min-w-0">
                {mockPosts === 0 && <AlertTriangle size={13} className="text-red-500 shrink-0" />}
                <a
                  href={`https://www.instagram.com/${mockProfile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-sm font-semibold hover:underline truncate ${mockPosts === 0 ? 'text-red-600' : 'text-gray-900'}`}
                  aria-label="인스타 프로필로 이동"
                >
                  @{mockProfile.instagram}
                  <ExternalLink size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                </a>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-green-bg text-brand-green-text flex items-center gap-1 whitespace-nowrap shrink-0">
                  <BadgeCheck size={11} />프로페셔널
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  aria-label="인스타 통계 새로고침"
                  disabled={refreshing}
                  onClick={handleRefresh}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <RefreshCw size={14} aria-hidden="true" className={refreshing ? 'animate-spin' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisconnectModal(true)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 rounded"
                >
                  해제
                </button>
              </div>
            </div>

            {/* 상태 배너 */}
            {isFailed ? (
              <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                올바르지 않은 사용자 이름이에요. 다시 확인해보세요.
              </div>
            ) : isUpdating ? (
              <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-lime-200 bg-lime-50 px-3 py-2 text-xs text-lime-800">
                <Loader2 size={13} className="animate-spin shrink-0" aria-hidden="true" />
                <span>데이터를 수집 중이에요. 잠시만 기다려주세요.</span>
              </div>
            ) : mockPosts === 0 ? (
              <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                게시물 수가 0개예요. 연결한 계정 정보가 정확한지 확인해주세요.
              </div>
            ) : null}

            {/* 통계 그리드 */}
            <div className={`grid gap-2 mb-4 px-4 ${mockPosts === 0 ? 'grid-cols-2' : 'grid-cols-3 @xl:grid-cols-6'}`}>
              <div className="bg-gray-50 rounded-xl p-3 text-center min-w-0">
                <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
                  <Users size={14} className="text-gray-400" />
                  <p className="text-sm text-gray-500 break-keep">팔로워</p>
                </div>
                <p className="text-sm font-bold text-gray-900 tabular-nums truncate">{fmtFollowers(mockInstaStats.followers)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center min-w-0">
                <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
                  <Image size={14} className="text-gray-400" />
                  <p className="text-sm text-gray-500 break-keep">게시물</p>
                </div>
                <p className={`text-sm font-bold tabular-nums truncate ${mockPosts === 0 ? 'text-red-500' : 'text-gray-900'}`}>{mockPosts.toLocaleString('ko-KR')}</p>
              </div>
              {mockPosts > 0 && (
                <>
                  <div className="bg-gray-50 rounded-xl p-3 text-center min-w-0">
                    <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
                      <TrendingUp size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-500 break-keep">참여율</p>
                    </div>
                    <p className={`text-sm font-bold tabular-nums truncate ${getEngagementColor(mockInstaStats.engagementRate)}`}>{mockInstaStats.engagementRate}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center min-w-0">
                    <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
                      <Heart size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-500 break-keep">평균 좋아요</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 tabular-nums truncate">{mockInstaStats.avgLikes.toLocaleString('ko-KR')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center min-w-0">
                    <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
                      <MessageCircle size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-500 break-keep">평균 댓글</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 tabular-nums truncate">{mockInstaStats.avgComments.toLocaleString('ko-KR')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center min-w-0">
                    <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
                      <Clock size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-500 break-keep">최근 활동</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 tabular-nums truncate">{fmtRelativeDate(mockInstaStats.lastActive)}</p>
                  </div>
                </>
              )}
            </div>

            {/* 최근 콘텐츠 헤더 */}
            <div className="flex items-center gap-1.5 mb-2 px-4">
              <BarChart3 size={14} className="text-brand-green" />
              <p className="text-sm font-semibold text-gray-700">최근 콘텐츠</p>
            </div>

            {mockPosts > 0 ? (
              <>
                <div className="grid grid-cols-3 @[560px]:grid-cols-4 @[720px]:grid-cols-5 gap-1.5 px-4">
                  {MOCK_CONTENT.slice((contentPage - 1) * CONTENT_PAGE_SIZE, contentPage * CONTENT_PAGE_SIZE).map(post => (
                    <div key={post.id} className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-100">
                      <img src={post.src} alt="" loading="lazy" className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = getPlaceholderDataUri(post.id) }} />
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <Pagination total={MOCK_CONTENT.length} page={contentPage} pageSize={CONTENT_PAGE_SIZE}
                    onChange={setContentPage} showSummary={false} className="mt-3" />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-16 text-sm text-gray-400">게시물이 없어요</div>
            )}
          </div>
        )}

        {/* ── 일반 계정 연결됨 — 인사이트 배너 + 게시물 그리드 ── */}
        {isConnected && !ig.professional && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">

            {/* 헤더 */}
            <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <a
                  href={`https://www.instagram.com/${mockProfile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:underline truncate"
                >
                  @{mockProfile.instagram}
                  <ExternalLink size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                </a>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap shrink-0">
                  일반 계정
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDisconnectModal(true)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 rounded shrink-0"
              >
                해제
              </button>
            </div>

            {/* 인사이트 없음 — compact 배너 */}
            <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-amber-800 break-keep leading-relaxed">
                  <span className="font-semibold">통계 인사이트·활동비 캠페인</span>은 프로페셔널 계정 전용이에요.
                </p>
                <button
                  type="button"
                  onClick={handleUpgradeToProfessional}
                  className="shrink-0 flex items-center gap-1 text-xs font-semibold text-amber-800 border border-amber-300 bg-white hover:bg-amber-50 rounded-lg px-2.5 py-1.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
                >
                  전환하기 <ArrowUpRight size={11} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* 비공개 계정 케이스 */}
            {isPrivate ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">비공개 계정이에요</p>
                  <p className="text-xs text-gray-400 break-keep leading-relaxed">
                    비공개 계정은 게시물을 가져올 수 없어요.<br />
                    인스타그램에서 계정을 공개로 전환하면 캠페인 심사에 유리해요.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* 게시물 수 */}
                <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
                  <BarChart3 size={14} className="text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">
                    게시물
                    <span className="ml-1.5 text-gray-400 font-normal tabular-nums">{mockPosts.toLocaleString('ko-KR')}개</span>
                  </p>
                </div>

                {mockPosts > 0 ? (
                  <>
                    <div className="grid grid-cols-3 @[560px]:grid-cols-4 @[720px]:grid-cols-5 gap-1.5 px-4">
                      {MOCK_CONTENT.slice((contentPage - 1) * CONTENT_PAGE_SIZE, contentPage * CONTENT_PAGE_SIZE).map(post => (
                        <div key={post.id} className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-100">
                          <img src={post.src} alt="" loading="lazy" className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.src = getPlaceholderDataUri(post.id) }} />
                        </div>
                      ))}
                    </div>
                    <div className="px-4 pb-4">
                      <Pagination total={MOCK_CONTENT.length} page={contentPage} pageSize={CONTENT_PAGE_SIZE}
                        onChange={setContentPage} showSummary={false} className="mt-3" />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-16 text-sm text-gray-400">게시물이 없어요</div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── 미연결 — 일반 / 프로페셔널 선택 ── */}
        {!isConnected && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ background: 'var(--gradient-instagram)' }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={SEMANTIC_COLORS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill={SEMANTIC_COLORS.white} stroke="none" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">인스타그램 계정을 연결해 주세요</h3>
              <p className="text-sm text-gray-500 break-keep">계정 유형에 따라 이용 가능한 캠페인 범위가 달라요</p>
            </div>

            {/* 모바일: 세로(프로 위·일반 아래) / 데스크톱: 가로(프로 왼·일반 오) */}
            <div className="flex flex-col @[640px]:flex-row gap-3">

              {/* 프로페셔널 계정 — 항상 첫 번째 (모바일 위 / 데스크톱 왼쪽) */}
              <div className="flex-1 rounded-xl border-2 border-brand-green-border bg-brand-green-bg p-4 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-green-text">프로페셔널 계정</p>
                    <p className="text-xs text-gray-600 mt-0.5 break-keep">비즈니스·크리에이터 계정</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-green text-white whitespace-nowrap shrink-0">추천</span>
                </div>
                <ul className="space-y-1 mb-4 flex-1">
                  <li className="text-xs text-brand-green-text flex items-center gap-1.5"><CheckCircle2 size={11} className="shrink-0" />제품 협찬 캠페인 지원 가능</li>
                  <li className="text-xs text-brand-green-text flex items-center gap-1.5"><CheckCircle2 size={11} className="shrink-0" />팔로워·인사이트 통계 자동 연동</li>
                  <li className="text-xs text-brand-green-text flex items-center gap-1.5"><CheckCircle2 size={11} className="shrink-0" />활동비 지급 캠페인 지원 가능</li>
                </ul>
                <button
                  type="button"
                  onClick={() => setShowMetaModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <BadgeCheck size={14} aria-hidden="true" />프로페셔널 계정으로 연결
                </button>
              </div>

              {/* 일반 계정 — 두 번째 (모바일 아래 / 데스크톱 오른쪽) */}
              <div className="flex-1 rounded-xl border border-gray-200 p-4 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">일반 계정</p>
                    <p className="text-xs text-gray-400 mt-0.5 break-keep">개인 인스타그램 계정</p>
                  </div>
                </div>
                <ul className="space-y-1 mb-4 flex-1">
                  <li className="text-xs text-gray-500 flex items-center gap-1.5"><CheckCircle2 size={11} className="text-gray-400 shrink-0" />제품 협찬 캠페인 지원 가능</li>
                  <li className="text-xs text-gray-300 flex items-center gap-1.5 line-through decoration-gray-300"><CheckCircle2 size={11} className="shrink-0 text-gray-300" />팔로워·인사이트 통계</li>
                  <li className="text-xs text-gray-300 flex items-center gap-1.5 line-through decoration-gray-300"><CheckCircle2 size={11} className="shrink-0 text-gray-300" />활동비 지급 캠페인</li>
                </ul>
                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => { setConnectInput(''); setShowConnectModal(true) }}
                  className="w-full py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  {isConnecting ? '연결 중...' : '일반 계정으로 연결'}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Meta OAuth 모달 — 프로페셔널 전환 */}
      <Modal
        open={showMetaModal}
        onClose={() => setShowMetaModal(false)}
        title=""
        showClose={false}
        size="xs"
        noDividers
      >
        <div className="flex flex-col items-center gap-5 px-2 py-2">
          <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 16 16" width="48" height="48" fill="#0866FF" aria-label="Meta" role="img">
              <path fillRule="evenodd" d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a55 55 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3q.477-.001.924.122c.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714m1.516 2.224q-.378-.615-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954 1.723 0 3.102 2.537 3.102 5.653 0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87zM4.846 4.756c.725.1 1.385.634 2.34 2.001A212 212 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9 0-2.602 1.298-5.264 2.846-5.264q.137 0 .27.018"/>
            </svg>
            <p className="text-base font-bold text-gray-900">Meta로 계속하기</p>
            <p className="text-xs text-gray-500 text-center break-keep">
              웰링크가 회원님의 Instagram 비즈니스 계정에 접근하도록 허용합니다
            </p>
          </div>
          <div className="w-full rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 space-y-1.5 text-xs text-gray-600">
            <p className="flex items-center gap-2"><span className="text-green-500">✓</span>팔로워 수 및 도달 데이터 읽기</p>
            <p className="flex items-center gap-2"><span className="text-green-500">✓</span>게시물 인사이트(노출·참여율) 읽기</p>
            <p className="flex items-center gap-2"><span className="text-green-500">✓</span>계정 기본 정보 읽기</p>
          </div>
          <div className="w-full flex flex-col gap-2">
            <a
              href="https://www.instagram.com/accounts/convert_to_professional/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowMetaModal(false)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0866FF] hover:bg-[#0757E0] transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866FF]/50"
            >
              계속
            </a>
            <button
              type="button"
              onClick={() => setShowMetaModal(false)}
              className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </Modal>

      {/* 일반 계정 연결 모달 — 원본 mypage handleSNSClick 방식 */}
      <Modal
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        title="인스타그램 연결"
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowConnectModal(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConnectPersonalConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              연결
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 space-y-1">
            <p>· 본인 계정이 아닌 다른 계정을 입력하면 제재가 이루어질 수 있습니다.</p>
            <p>· 기존 계정과 다른 계정을 입력하면 연결된 기존 데이터가 사라지거나 다시 수집될 수 있습니다.</p>
          </div>
          <input
            type="text"
            placeholder="@인스타그램 아이디"
            value={connectInput}
            onChange={e => setConnectInput(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/50 placeholder:text-gray-400"
          />
        </div>
      </Modal>

      {/* 연결 해제 모달 */}
      <AlertModal
        open={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        title="연결 해제"
        description="인스타그램 연결을 해제할까요? 해제 후 캠페인 신청이 어려울 수 있어요"
        variant="danger"
        confirmLabel="연결 해제"
        cancelLabel="취소"
        onConfirm={handleDisconnect}
      />
    </Layout>
  )
}
