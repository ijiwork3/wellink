import { useState, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Link2, Users, TrendingUp, CheckCircle2, Heart, MessageCircle, Image, Clock, BarChart3, RefreshCw, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'
import { ResponsiveSheet, AlertModal, getEngagementColor, PLATFORM_COLORS as PLATFORM_COLOR, fmtFollowers, ErrorState, Skeleton, Pagination } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { mockInstaStats, mockProfile } from '../services/mock/profile'
import { ko주격조사, fmtRelativeDate } from '../utils/format'
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
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [connectModal, setConnectModal] = useState<Platform | null>(null)
  const [disconnectModal, setDisconnectModal] = useState<Platform | null>(null)
  const [urlInput, setUrlInput] = useState('')
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
    if (m === 'connect')    setConnectModal(platforms.find(p => p.id === 'naver') ?? null)
    if (m === 'disconnect') setDisconnectModal(platforms.find(p => p.id === 'instagram') ?? null)
    if (qa === 'modal-connect')    setConnectModal(platforms.find(p => p.id === 'naver') ?? null)
    if (qa === 'modal-disconnect') setDisconnectModal(platforms.find(p => p.id === 'instagram') ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, location.key, qa])

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <Skeleton shape="text" height={16} width="7rem" className="mb-5" />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Skeleton shape="circle" height={40} width={40} />
                <div className="space-y-1.5">
                  <Skeleton shape="text" height={16} width="6rem" />
                  <Skeleton shape="text" height={12} width="8rem" />
                </div>
              </div>
              <Skeleton shape="card" height={32} width="4rem" />
            </div>
          ))}
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState message="SNS 연결 정보를 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  const handleConnect = () => {
    if (!urlInput.trim()) { showToast('URL을 입력해 주세요', 'error'); return }
    const input = urlInput.trim()
    // 플랫폼별 검증 — 인스타는 핸들/URL 모두 허용, 네이버/유튜브는 URL 형식 요구
    if (connectModal?.id === 'instagram') {
      const handle = input.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')
      if (!/^[a-zA-Z0-9_.]{1,30}$/.test(handle)) {
        showToast('올바른 인스타그램 아이디를 입력해 주세요', 'error'); return
      }
    } else {
      if (!/^https?:\/\/.+\..+/.test(input)) {
        showToast('올바른 URL 형식이 아니에요 (예: https://...)', 'error'); return
      }
    }
    // 인스타그램만 @ 핸들 정규화. 네이버 블로그·유튜브는 URL 그대로 저장 (L264 @${url} 노출 방지)
    const normalized = connectModal?.id === 'instagram'
      ? input.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')
      : input
    setPlatforms(prev => prev.map(p => p.id === connectModal?.id ? { ...p, connected: true, url: normalized } : p))
    showToast(`${connectModal?.name}${ko주격조사(connectModal?.name ?? '')} 연결됐어요!`, 'success')
    setConnectModal(null)
    setUrlInput('')
  }

  const handleDisconnect = () => {
    setPlatforms(prev => prev.map(p => p.id === disconnectModal?.id ? { ...p, connected: false, url: undefined, followers: undefined, engagementRate: undefined } : p))
    showToast(`${disconnectModal?.name} 연결을 해제했어요`, 'info')
    setDisconnectModal(null)
  }

  const instaPlatform = platforms[0]

  return (
    <Layout mobileFull>
      <div className="space-y-4">
        <h1 className="sr-only">인스타 관리</h1>
        {/* 인스타그램 통계 패널 — 연결된 경우만 */}
        {instaPlatform?.connected && (
          <div className="bg-white rounded-2xl border border-brand-green-border shadow-sm p-5">
            {/* 패널 헤더 */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1.5 min-w-0">
                {mockPosts === 0 && (
                  <AlertTriangle size={13} className="text-red-500 shrink-0" />
                )}
                {/* 원본 mypage L1436-1446: 핸들 + 외부링크 아이콘 함께 <a> 안에 */}
                <a
                  href={`https://www.instagram.com/${instaPlatform.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-sm font-semibold hover:underline truncate ${mockPosts === 0 ? 'text-red-600' : 'text-gray-900'}`}
                  aria-label="인스타 프로필로 이동"
                >
                  @{instaPlatform.url}
                  <ExternalLink size={11} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                </a>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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

            {/* 데이터 수집/오류 상태 배너 — 원본 mypage L1357-1364, L1519-1524 */}
            {isFailed ? (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                올바르지 않은 사용자 이름이에요. 다시 확인해보세요.
              </div>
            ) : isUpdating ? (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-lime-200 bg-lime-50 px-3 py-2 text-xs text-lime-800">
                <Loader2 size={13} className="animate-spin shrink-0" aria-hidden="true" />
                <span>데이터를 수집 중이에요. 잠시만 기다려주세요.</span>
              </div>
            ) : mockPosts === 0 ? (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                게시물 수가 0개예요. 연결한 계정 정보가 정확한지 확인해주세요.
              </div>
            ) : null}

            {/* 6개 통계 그리드 — 원본 mypage L1523: xl:grid-cols-6 (데스크탑 1행) */}
            <div className="grid grid-cols-3 xl:grid-cols-6 gap-2 mb-4">
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
            </div>

            {/* 콘텐츠 썸네일 그리드 */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 size={14} className="text-brand-green" />
                <p className="text-sm font-semibold text-gray-700">최근 콘텐츠</p>
              </div>
              {/* 5열 × 4행 = 20개/페이지 */}
              <div className="grid grid-cols-2 @[400px]:grid-cols-3 @[560px]:grid-cols-4 @[720px]:grid-cols-5 gap-1.5">
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
              <Pagination
                total={MOCK_CONTENT.length}
                page={contentPage}
                pageSize={CONTENT_PAGE_SIZE}
                onChange={setContentPage}
                showSummary={false}
                className="mt-3"
              />
            </div>
            {/* 카드 하단: 계정 변경 — 원본 mypage L1436: 연결된 상태에서 아이디 변경 */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => { setUrlInput(instaPlatform?.url ?? ''); setConnectModal(instaPlatform ?? null) }}
                className="text-xs text-gray-500 hover:text-brand-green-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
              >
                계정 변경
              </button>
            </div>
          </div>
        )}

        {/* 인스타 관리 헤더 — 미연결 상태에서만 표시 */}
        {!instaPlatform?.connected && (
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-brand-green" />
            <h2 className="text-base font-semibold text-gray-900">인스타 관리</h2>
          </div>
        )}

        {/* 미연결 상태에서만: 플랫폼 카드 + 안내 문구 */}
        {!instaPlatform?.connected && (
          <>
            {platforms.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: p.iconBg }}>
                      {p.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-500 break-keep mt-0.5">{p.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setUrlInput(''); setConnectModal(p) }}
                    className="shrink-0 text-sm px-3.5 py-2.5 rounded-xl text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    연결하기
                  </button>
                </div>
              </div>
            ))}
            <div className="p-4 rounded-xl bg-brand-green-bg border-l-[3px] border-brand-green">
              <p className="text-sm text-gray-600 break-keep">인스타그램을 연결하면 캠페인 신청 시 팔로워 수가 자동으로 확인돼요</p>
            </div>
          </>
        )}
      </div>

      {/* 채널 연결 */}
      <ResponsiveSheet open={!!connectModal} onClose={() => { setConnectModal(null); setUrlInput('') }} title={`${connectModal?.name ?? ''} 연결`} size="sm">
        {connectModal && (
          <>
            <p className="text-sm text-gray-500 mb-3">{connectModal.description}</p>
            {/* 인스타그램 연결 시 계정 주의 경고 — 원본 mypage/page.tsx L238-246 */}
            {connectModal.id === 'instagram' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-3 space-y-1">
                <p>· 본인 계정이 아닌 다른 계정을 입력하면 제재가 이루어질 수 있습니다.</p>
                <p>· 기존 계정과 다른 계정을 입력하면 연결된 기존 데이터가 사라지거나 다시 수집될 수 있습니다.</p>
              </div>
            )}
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder={connectModal.placeholder}
              aria-label={`${connectModal.name} ${connectModal.id === 'instagram' ? '아이디' : 'URL'}`}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-all mb-4"
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
            />
            <div className="flex gap-3">
              <button onClick={() => setConnectModal(null)} className="flex-1 py-3 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
              <button onClick={handleConnect} className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">연결</button>
            </div>
          </>
        )}
      </ResponsiveSheet>

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
