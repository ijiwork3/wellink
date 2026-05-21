import { useState, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Link2, Users, TrendingUp, CheckCircle2, Heart, MessageCircle, Image, Clock, BarChart3, RefreshCw, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'
import { BottomSheet, AlertModal, getEngagementColor, PLATFORM_COLORS as PLATFORM_COLOR, fmtFollowers, ErrorState, Skeleton } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { mockInstaStats, mockProfile } from '../services/mock/profile'
import { ko주격조사, fmtRelativeDate } from '../utils/format'

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

interface ContentPost {
  id: string
  emoji: string
  likes: number
  comments: number
  date: string
}

const PLATFORM_META: Omit<Platform, 'connected' | 'url' | 'followers' | 'engagementRate'>[] = [
  { id: 'instagram', name: '인스타그램', iconBg: PLATFORM_COLOR.instagram, icon: '📷', description: '아이디를 연결하면 팔로워 수가 자동으로 확인돼요', placeholder: '@인스타그램 아이디' },
  { id: 'naver',     name: '네이버 블로그', iconBg: PLATFORM_COLOR.naver, icon: 'N', description: '블로그 URL을 연결하면 신청 시 자동 검증돼요', placeholder: 'https://blog.naver.com/아이디' },
  { id: 'youtube',   name: '유튜브', iconBg: PLATFORM_COLOR.youtube, icon: '▶', description: '채널 URL을 연결하면 구독자 수가 자동 확인돼요', placeholder: 'https://www.youtube.com/@채널명' },
]

const MOCK_CONTENT: ContentPost[] = [
  { id: '1', emoji: '🏋️', likes: 420, comments: 23, date: '4/24' },
  { id: '2', emoji: '🧘', likes: 381, comments: 15, date: '4/22' },
  { id: '3', emoji: '🥗', likes: 298, comments: 11, date: '4/20' },
  { id: '4', emoji: '🏃', likes: 275, comments: 9,  date: '4/18' },
  { id: '5', emoji: '💪', likes: 341, comments: 20, date: '4/16' },
  { id: '6', emoji: '🚴', likes: 190, comments: 7,  date: '4/14' },
  { id: '7', emoji: '🤸', likes: 258, comments: 13, date: '4/12' },
  { id: '8', emoji: '🏊', likes: 219, comments: 8,  date: '4/10' },
  { id: '9', emoji: '⛹️', likes: 177, comments: 5,  date: '4/8' },
]

export default function Media() {
  const qa = useQAMode()

  const initPlatforms = (): Platform[] => {
    const base = PLATFORM_META.map(m => ({ ...m, connected: false }))
    if (qa === 'all-disconnected') return base
    if (qa === 'all-connected') return [
      { ...PLATFORM_META[0], connected: true, url: mockProfile.instagram, followers: mockInstaStats.followers, engagementRate: mockInstaStats.engagementRate },
      { ...PLATFORM_META[1], connected: true, url: 'myblog', followers: 3200, engagementRate: 2.8 },
      { ...PLATFORM_META[2], connected: true, url: 'chanChannel', followers: 1200, engagementRate: 3.5 },
    ]
    // mockProfile.instagramConnected를 단일 출처로 — Home/Media 상태 sync (cold-review D4 후속)
    return [
      { ...PLATFORM_META[0], connected: mockProfile.instagramConnected, url: mockProfile.instagramConnected ? mockProfile.instagram : undefined, followers: mockProfile.instagramConnected ? mockInstaStats.followers : undefined, engagementRate: mockProfile.instagramConnected ? mockInstaStats.engagementRate : undefined },
      { ...PLATFORM_META[1], connected: false },
      { ...PLATFORM_META[2], connected: false },
    ]
  }

  const [platforms, setPlatforms] = useState<Platform[]>(initPlatforms)
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
      <Layout showProfileHeader={false}>
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
      <Layout showProfileHeader={false}>
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

  const connectedCount = platforms.filter(p => p.connected).length
  const instaPlatform = platforms.find(p => p.id === 'instagram')

  return (
    <Layout showProfileHeader={false}>
      <div className="space-y-4 max-w-lg">
        <h1 className="sr-only">SNS 관리</h1>
        {/* 인스타그램 통계 패널 — 연결된 경우만 */}
        {instaPlatform?.connected && (
          <div className="bg-white rounded-2xl border border-brand-green-border shadow-sm p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-base flex-shrink-0" aria-hidden="true">📷</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* posts=0 경고 아이콘 — 원본 mypage L1373-1406 */}
                    {mockPosts === 0 && (
                      <AlertTriangle size={14} className="text-red-500 shrink-0" aria-label="게시물 수 0개 안내" />
                    )}
                    <p className={`text-sm font-semibold truncate ${mockPosts === 0 ? 'text-red-600' : 'text-gray-900'}`}>@{instaPlatform.url}</p>
                  </div>
                  <p className="text-xs text-gray-500">인스타그램</p>
                </div>
              </div>
              {/* 업데이트 시간 + 새로고침 + 인스타 프로필 링크 — 원본 mypage L1326-1330, L1435-1462 */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
                  {fmtRelativeDate(mockInstaStats.lastUpdated)}
                </span>
                {/* 인스타 프로필 외부 링크 — 원본 mypage L1436-1446 */}
                {instaPlatform?.url && (
                  <a
                    href={`https://www.instagram.com/${instaPlatform.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="인스타 프로필로 이동"
                    className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                )}
                <button
                  aria-label="인스타 통계 새로고침"
                  onClick={() => showToast('통계를 업데이트했어요', 'success')}
                  className="flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <RefreshCw size={13} aria-hidden="true" />
                </button>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-brand-green-bg text-brand-green-text flex items-center gap-1 whitespace-nowrap">
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
              {/* 원본 mypage L1583: md:grid-cols-6 (태블릿+ 1행) */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                {MOCK_CONTENT.map(post => (
                  <div key={post.id} className="aspect-square bg-brand-green-bg rounded-xl flex flex-col items-center justify-center gap-1 relative overflow-hidden group">
                    <span className="text-2xl" aria-hidden="true">{post.emoji}</span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-0.5">
                      <span className="text-white text-xs font-medium flex items-center gap-0.5 whitespace-nowrap">
                        <Heart size={12} fill="white" aria-hidden="true" />
                        {post.likes.toLocaleString('ko-KR')}
                      </span>
                      <span className="text-white text-xs flex items-center gap-0.5 whitespace-nowrap">
                        <MessageCircle size={12} aria-hidden="true" />
                        {post.comments.toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{post.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SNS 관리 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-brand-green" />
            <h2 className="text-base font-semibold text-gray-900">SNS 관리</h2>
          </div>
          <span className="text-sm text-gray-500">{connectedCount}/{platforms.length} 연결됨</span>
        </div>

        {/* 플랫폼 카드들 */}
        {platforms.map(p => (
          <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${p.connected ? 'border-brand-green-border' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* 아이콘 + 연결 인디케이터 */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: p.iconBg }}>
                    {p.icon}
                  </div>
                  {p.connected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-brand-green" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 break-keep">{p.name}</p>
                    {p.connected && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-brand-green-bg text-brand-green-text whitespace-nowrap">연결됨</span>
                    )}
                  </div>

                  {p.connected && p.url ? (
                    <p className="text-sm text-gray-500 truncate">{p.id === 'instagram' ? `@${p.url}` : p.url}</p>
                  ) : (
                    <p className="text-sm text-gray-500 break-keep">{p.description}</p>
                  )}

                  {/* 연결된 계정 지표 */}
                  {p.connected && p.followers && (
                    <div className="flex items-center gap-x-3 gap-y-1 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                        <Users size={14} className="text-gray-400" />
                        <strong className="tabular-nums">{fmtFollowers(p.followers)}</strong> 팔로워
                      </span>
                      {p.engagementRate != null && (
                        <span className="flex items-center gap-1 text-sm whitespace-nowrap">
                          <TrendingUp size={14} className="text-gray-400" />
                          <strong className={`${getEngagementColor(p.engagementRate)} tabular-nums`}>{p.engagementRate}%</strong>
                          <span className="text-gray-400">참여율</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 액션 버튼 — 최소 40px 터치 타깃 */}
              {p.connected ? (
                <button
                  onClick={() => setDisconnectModal(p)}
                  className="shrink-0 text-sm px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  관리
                </button>
              ) : (
                <button
                  onClick={() => { setUrlInput(''); setConnectModal(p) }}
                  className="shrink-0 text-sm px-3.5 py-2.5 rounded-xl text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  연결하기
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="p-4 rounded-xl bg-brand-green-bg border-l-[3px] border-brand-green">
          <p className="text-sm text-gray-600 break-keep">SNS 채널을 연결하면 캠페인 신청 시 팔로워·구독자 수가 자동으로 확인돼요</p>
        </div>
      </div>

      {/* 연결 바텀시트 */}
      <BottomSheet open={!!connectModal} onClose={() => { setConnectModal(null); setUrlInput('') }} title={`${connectModal?.name ?? ''} 연결`}>
        {connectModal && (
          <>
            <p className="text-sm text-gray-500 mb-3">{connectModal.description}</p>
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus:border-brand-green transition-all mb-4"
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
            />
            <div className="flex gap-3">
              <button onClick={() => setConnectModal(null)} className="flex-1 py-3 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
              <button onClick={handleConnect} className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">연결</button>
            </div>
          </>
        )}
      </BottomSheet>

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
