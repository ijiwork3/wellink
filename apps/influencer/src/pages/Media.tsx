import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Users, TrendingUp, CheckCircle2, Heart, MessageCircle, Image, Clock, BarChart3, RefreshCw, AlertTriangle, Loader2, ExternalLink, User, Camera, BadgeCheck, ArrowUpRight } from 'lucide-react'
import Layout from '../components/Layout'
import { AlertModal, getEngagementColor, PLATFORM_COLORS as PLATFORM_COLOR, fmtFollowers, ErrorState, Skeleton, Pagination, SEMANTIC_COLORS } from '@wellink/ui'
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
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const { showToast } = useToast()

  // 데이터 수집 상태 — 원본 mypage L1357-1364 isMentionsUpdating/isMentionsFailed
  const isUpdating = qa === 'updating'
  const isFailed   = qa === 'update-failed'
  // posts=0 경고 — 원본 mypage L1373-1406
  const mockPosts  = qa === 'no-posts' ? 0 : mockInstaStats.posts

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

  // 계정 변경 — mock
  const [isChangingAccount, setIsChangingAccount] = useState(false)
  const handleChangeAccount = () => {
    setIsChangingAccount(true)
    setTimeout(() => {
      setIsChangingAccount(false)
      showToast('계정이 변경됐어요.', 'success')
    }, 1200)
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
        {ig.connected && ig.professional && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* 패널 헤더 */}
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-1.5 min-w-0">
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
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleChangeAccount}
                  disabled={isChangingAccount}
                  className="text-xs text-gray-500 hover:text-brand-green-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded disabled:opacity-60"
                >
                  {isChangingAccount ? '변경 중...' : '계정 변경'}
                </button>
                <button
                  type="button"
                  aria-label="인스타 통계 새로고침"
                  onClick={() => showToast('통계를 업데이트했어요', 'success')}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <RefreshCw size={14} aria-hidden="true" />
                </button>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-green-bg text-brand-green-text flex items-center gap-1 whitespace-nowrap">
                  <BadgeCheck size={12} />프로페셔널
                </span>
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

        {/* ── 일반 계정 연결됨 — 인사이트 없음 + 업그레이드 유도 ── */}
        {ig.connected && !ig.professional && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* 헤더 */}
            <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100">
              <a
                href={`https://www.instagram.com/${mockProfile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:underline truncate"
              >
                @{mockProfile.instagram}
                <ExternalLink size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              </a>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
                  일반 계정
                </span>
                <button
                  type="button"
                  onClick={() => setShowDisconnectModal(true)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 rounded"
                >
                  해제
                </button>
              </div>
            </div>

            {/* 인사이트 없음 안내 */}
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-semibold text-amber-800 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle size={14} aria-hidden="true" />
                  인사이트 데이터를 가져올 수 없어요
                </p>
                <p className="text-sm text-amber-700 leading-relaxed break-keep">
                  일반 계정은 Meta API 정책상 팔로워 수·노출·도달·참여율 데이터를 제공하지 않습니다.
                  무가시딩(제품 협찬) 캠페인에는 지원할 수 있지만, 활동비 지급 캠페인은 프로페셔널 계정이 필요해요.
                </p>
              </div>

              {/* 업그레이드 카드 */}
              <div className="rounded-xl border border-brand-green-border bg-brand-green-bg p-4">
                <p className="text-sm font-semibold text-brand-green-text mb-1">프로페셔널 계정으로 전환하면</p>
                <ul className="space-y-1 mb-3">
                  {['팔로워·참여율 통계 자동 연동', '활동비 지급 캠페인 지원 가능', '더 많은 캠페인 노출'].map(item => (
                    <li key={item} className="text-xs text-brand-green-text flex items-center gap-1.5">
                      <CheckCircle2 size={11} className="shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col @[400px]:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      ig.upgradeToProfessional()
                      showToast('프로페셔널 계정으로 전환됐어요!', 'success')
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    <BadgeCheck size={14} aria-hidden="true" />
                    프로페셔널 계정 연동
                  </button>
                  <a
                    href="https://help.instagram.com/502981923235522"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border border-brand-green-border text-brand-green-text hover:bg-brand-green/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    전환 방법 보기
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 미연결 — 일반 / 프로페셔널 선택 ── */}
        {!ig.connected && (
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

            <div className="space-y-3">
              {/* 일반 계정 */}
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">일반 계정</p>
                    <p className="text-xs text-gray-500 mt-0.5 break-keep">개인 인스타그램 계정</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap shrink-0">기본</span>
                </div>
                <ul className="space-y-1 mb-3">
                  <li className="text-xs text-gray-500 flex items-center gap-1.5"><CheckCircle2 size={11} className="text-gray-400 shrink-0" />무가시딩 캠페인 지원 가능</li>
                  <li className="text-xs text-gray-400 flex items-center gap-1.5 line-through"><CheckCircle2 size={11} className="shrink-0" />팔로워·인사이트 통계 (제공 안 됨)</li>
                  <li className="text-xs text-gray-400 flex items-center gap-1.5 line-through"><CheckCircle2 size={11} className="shrink-0" />활동비 지급 캠페인 (제공 안 됨)</li>
                </ul>
                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => handleConnect(false)}
                  className="w-full py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  {isConnecting ? '연결 중...' : '일반 계정으로 연결'}
                </button>
              </div>

              {/* 프로페셔널 계정 */}
              <div className="rounded-xl border-2 border-brand-green-border bg-brand-green-bg p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-green-text">프로페셔널 계정</p>
                    <p className="text-xs text-gray-600 mt-0.5 break-keep">비즈니스·크리에이터 계정</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-green text-white whitespace-nowrap shrink-0">추천</span>
                </div>
                <ul className="space-y-1 mb-3">
                  <li className="text-xs text-brand-green-text flex items-center gap-1.5"><CheckCircle2 size={11} className="shrink-0" />무가시딩 캠페인 지원 가능</li>
                  <li className="text-xs text-brand-green-text flex items-center gap-1.5"><CheckCircle2 size={11} className="shrink-0" />팔로워·인사이트 통계 자동 연동</li>
                  <li className="text-xs text-brand-green-text flex items-center gap-1.5"><CheckCircle2 size={11} className="shrink-0" />활동비 지급 캠페인 지원 가능</li>
                </ul>
                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => handleConnect(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  {isConnecting ? (
                    <><Loader2 size={13} className="animate-spin" aria-hidden="true" />연결 중...</>
                  ) : (
                    <><BadgeCheck size={14} aria-hidden="true" />프로페셔널 계정으로 연결</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
