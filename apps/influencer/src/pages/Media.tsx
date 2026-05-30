import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Users, TrendingUp, CheckCircle2, Heart, MessageCircle, Image, Clock, BarChart3, RefreshCw, AlertTriangle, Loader2, ExternalLink, User, Camera } from 'lucide-react'
import Layout from '../components/Layout'
import { AlertModal, getEngagementColor, PLATFORM_COLORS as PLATFORM_COLOR, fmtFollowers, ErrorState, Skeleton, Pagination } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { mockInstaStats, mockProfile } from '../services/mock/profile'
import { fmtRelativeDate } from '../utils/format'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../utils/thumbnailPlaceholder'

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

  const initPlatforms = (): Platform[] => {
    const base = PLATFORM_META.map(m => ({ ...m, connected: false }))
    if (qa === 'all-disconnected') return base
    if (qa === 'all-connected') return [
      { ...PLATFORM_META[0], connected: true, url: mockProfile.instagram, followers: mockInstaStats.followers, engagementRate: mockInstaStats.engagementRate },
    ]
    // mockProfile.instagramConnected를 단일 출처로 — Home/Media 상태 sync (cold-review D4 후속)
    return [
      { ...PLATFORM_META[0], connected: mockProfile.instagramConnected, url: mockProfile.instagramConnected ? mockProfile.instagram : undefined, followers: mockProfile.instagramConnected ? mockInstaStats.followers : undefined, engagementRate: mockProfile.instagramConnected ? mockInstaStats.engagementRate : undefined },
    ]
  }

  const [platforms, setPlatforms] = useState<Platform[]>(initPlatforms)
  const [contentPage, setContentPage] = useState(1)

  // qa 모드 변경 시 platforms 재초기화 (useState는 마운트 시 1회만 실행되므로)
  useEffect(() => {
    setPlatforms(initPlatforms())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa])
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [disconnectModal, setDisconnectModal] = useState<Platform | null>(null)
  const { showToast } = useToast()
  // 데이터 수집 상태 — 원본 mypage L1357-1364 isMentionsUpdating/isMentionsFailed
  const isUpdating = qa === 'updating'
  const isFailed   = qa === 'update-failed'
  // posts=0 경고 — 원본 mypage L1373-1406
  const mockPosts  = qa === 'no-posts' ? 0 : mockInstaStats.posts

  // URL search params + QA 파라미터 외부 동기화 (정책 §외부동기화)
  useEffect(() => {
    const m = searchParams.get('modal')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (m === 'disconnect') setDisconnectModal(platforms.find(p => p.id === 'instagram') ?? null)
    if (qa === 'modal-disconnect') setDisconnectModal(platforms.find(p => p.id === 'instagram') ?? null)
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
  const handleConnectInstagram = () => {
    const params = new URLSearchParams({
      client_id: '742315354931014',
      redirect_uri: 'https://matcha.pnutbutter.kr/api-meta/auth/callback',
      scope: 'public_profile,instagram_basic,instagram_manage_insights',
      response_type: 'code',
      auth_type: 'rerequest',
    })
    window.location.href = `https://www.facebook.com/v24.0/dialog/oauth?${params}`
  }

  // 계정 변경 — 이미 연결된 계정을 다른 계정으로 교체하는 mock
  const [isChangingAccount, setIsChangingAccount] = useState(false)
  const handleChangeAccount = () => {
    setIsChangingAccount(true)
    setTimeout(() => {
      setIsChangingAccount(false)
      showToast('계정이 변경됐어요.', 'success')
    }, 1200)
  }

  const handleDisconnect = () => {
    setPlatforms(prev => prev.map(p => p.id === disconnectModal?.id ? { ...p, connected: false, url: undefined, followers: undefined, engagementRate: undefined } : p))
    showToast(`${disconnectModal?.name} 연결을 해제했어요`, 'info')
    setDisconnectModal(null)
  }

  const instaPlatform = platforms[0]

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

        {/* 인스타그램 통계 패널 — 연결된 경우만 */}
        {instaPlatform?.connected && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* 패널 헤더 */}
            <div className="flex items-center justify-between gap-3 p-4 mb-0">
              <div className="flex items-center gap-1.5 min-w-0">
                {mockPosts === 0 && (
                  <AlertTriangle size={13} className="text-red-500 shrink-0" />
                )}
                <a
                  href={`https://www.instagram.com/${instaPlatform.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-sm font-semibold hover:underline truncate ${mockPosts === 0 ? 'text-red-600' : 'text-gray-900'}`}
                  aria-label="인스타 프로필로 이동"
                >
                  @{instaPlatform.url}
                  <ExternalLink size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                </a>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleChangeAccount}
                  disabled={isChangingAccount}
                  className="text-xs text-gray-500 hover:text-brand-green-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded disabled:opacity-60"
                >
                  {isChangingAccount ? '변경 중...' : '계정 변경'}
                </button>
                <button
                  aria-label="인스타 통계 새로고침"
                  onClick={() => showToast('통계를 업데이트했어요', 'success')}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <RefreshCw size={14} aria-hidden="true" />
                </button>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-green-bg text-brand-green-text flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle2 size={12} />연결됨
                </span>
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

            {/* 통계 그리드 — 게시물 0개면 팔로워·게시물만 표시 */}
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

            {/* 이미지 그리드 — no-posts 시 0개 */}
            {mockPosts > 0 ? (
              <>
                <div className="grid grid-cols-3 @[560px]:grid-cols-4 @[720px]:grid-cols-5 gap-1.5 px-4">
                  {MOCK_CONTENT.slice((contentPage - 1) * CONTENT_PAGE_SIZE, contentPage * CONTENT_PAGE_SIZE).map(post => (
                    <div key={post.id} className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={post.src}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = getPlaceholderDataUri(post.id) }}
                      />
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <Pagination
                    total={MOCK_CONTENT.length}
                    page={contentPage}
                    pageSize={CONTENT_PAGE_SIZE}
                    onChange={setContentPage}
                    showSummary={false}
                    className="mt-3"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                게시물이 없어요
              </div>
            )}
          </div>
        )}

        {/* 미연결 상태 — InstagramConnectPrompt 스타일 (프로페셔널 계정) */}
        {!instaPlatform?.connected && (
          <div className="flex flex-col items-center justify-center min-h-[420px] bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg" style={{ background: 'var(--gradient-instagram)' }}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              인스타그램 프로페셔널 계정을 연결해 주세요
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              프로페셔널 계정 연결 후<br />팔로워·참여율 통계를 바로 확인할 수 있어요.
            </p>
            <button
              onClick={handleConnectInstagram}
              className="flex items-center gap-2 text-base font-semibold text-white px-6 py-2.5 rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50"
              style={{ background: 'var(--gradient-instagram)' }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="white" stroke="none" />
              </svg>
              계정 연결하기
            </button>
          </div>
        )}
      </div>

      {/* 연결 해제 모달 */}
      <AlertModal
        open={!!disconnectModal}
        onClose={() => setDisconnectModal(null)}
        title="연결 해제"
        description={disconnectModal ? `${disconnectModal.name} 연결을 해제할까요? 해제 후 해당 채널로 캠페인 신청이 어려울 수 있어요` : ''}
        variant="danger"
        confirmLabel="연결 해제"
        cancelLabel="취소"
        onConfirm={handleDisconnect}
      />
    </Layout>
  )
}
