import { useState, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Link2, XCircle, RefreshCw, Users, TrendingUp, CheckCircle2 } from 'lucide-react'
import Layout from '../components/Layout'
import { Modal, getEngagementColor, PLATFORM_COLORS as PLATFORM_COLOR } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'

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
  { id: 'naver',     name: '네이버 블로그', iconBg: PLATFORM_COLOR.naver, icon: 'N', description: '블로그 URL을 연결하면 신청 시 자동 검증돼요', placeholder: 'https://blog.naver.com/아이디' },
  { id: 'youtube',   name: '유튜브', iconBg: PLATFORM_COLOR.youtube, icon: '▶', description: '채널 URL을 연결하면 구독자 수가 자동 확인돼요', placeholder: 'https://www.youtube.com/@채널명' },
]

export default function Media() {
  const qa = useQAMode()

  const initPlatforms = (): Platform[] => {
    const base = PLATFORM_META.map(m => ({ ...m, connected: false }))
    if (qa === 'all-disconnected') return base
    if (qa === 'all-connected') return [
      { ...PLATFORM_META[0], connected: true, url: 'chanstyler', followers: 8700, engagementRate: 4.1 },
      { ...PLATFORM_META[1], connected: true, url: 'myblog', followers: 3200, engagementRate: 2.8 },
      { ...PLATFORM_META[2], connected: true, url: 'chanChannel', followers: 1200, engagementRate: 3.5 },
    ]
    return [
      { ...PLATFORM_META[0], connected: true, url: 'chanstyler', followers: 8700, engagementRate: 4.1 },
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

  useEffect(() => {
    const m = searchParams.get('modal')
    if (m === 'connect')    setConnectModal(platforms.find(p => p.id === 'naver') ?? null)
    if (m === 'disconnect') setDisconnectModal(platforms.find(p => p.id === 'instagram') ?? null)
    if (qa === 'modal-connect')    setConnectModal(platforms.find(p => p.id === 'naver') ?? null)
    if (qa === 'modal-disconnect') setDisconnectModal(platforms.find(p => p.id === 'instagram') ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, location.key, qa])

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 rounded-xl w-28 mb-5" />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100" />
                <div className="space-y-1.5">
                  <div className="h-4 bg-gray-100 rounded-xl w-24" />
                  <div className="h-3 bg-gray-100 rounded-xl w-32" />
                </div>
              </div>
              <div className="h-8 bg-gray-100 rounded-xl w-16" />
            </div>
          ))}
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <XCircle size={44} className="text-red-300" />
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">SNS 연결 정보를 불러오지 못했어요</p>
            <p className="text-xs text-gray-500 mt-1">잠시 후 다시 시도해 주세요</p>
          </div>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors">
            <RefreshCw size={14} />다시 시도
          </button>
        </div>
      </Layout>
    )
  }

  const handleConnect = () => {
    if (!urlInput.trim()) { showToast('URL을 입력해 주세요', 'error'); return }
    setPlatforms(prev => prev.map(p => p.id === connectModal?.id ? { ...p, connected: true, url: urlInput.trim().replace(/^@/, '') } : p))
    showToast(`${connectModal?.name}이(가) 연결되었어요!`, 'success')
    setConnectModal(null)
    setUrlInput('')
  }

  const handleDisconnect = () => {
    setPlatforms(prev => prev.map(p => p.id === disconnectModal?.id ? { ...p, connected: false, url: undefined, followers: undefined, engagementRate: undefined } : p))
    showToast(`${disconnectModal?.name} 연결을 해제했어요`, 'info')
    setDisconnectModal(null)
  }

  const connectedCount = platforms.filter(p => p.connected).length

  return (
    <Layout>
      <div className="space-y-4 max-w-lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-brand-green" />
            <h2 className="text-base font-semibold text-gray-900">SNS 관리</h2>
          </div>
          <span className="text-xs text-gray-400">{connectedCount}/{platforms.length} 연결됨</span>
        </div>

        {/* 플랫폼 카드들 */}
        {platforms.map(p => (
          <div key={p.id} className={`bg-white rounded-2xl border p-4 transition-all ${p.connected ? 'border-brand-green/20' : 'border-gray-100'}`}>
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
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    {p.connected && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-green/10 text-brand-green-text">연결됨</span>
                    )}
                  </div>

                  {p.connected && p.url ? (
                    <p className="text-xs text-gray-500 truncate">@{p.url}</p>
                  ) : (
                    <p className="text-xs text-gray-400">{p.description}</p>
                  )}

                  {/* 연결된 계정 지표 */}
                  {p.connected && p.followers && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Users size={11} className="text-gray-400" />
                        <strong>{p.followers.toLocaleString()}</strong> 팔로워
                      </span>
                      {p.engagementRate != null && (
                        <span className="flex items-center gap-1 text-xs">
                          <TrendingUp size={11} className="text-gray-400" />
                          <strong className={getEngagementColor(p.engagementRate)}>{p.engagementRate}%</strong>
                          <span className="text-gray-400">참여율</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              {p.connected ? (
                <button
                  onClick={() => setDisconnectModal(p)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  관리
                </button>
              ) : (
                <button
                  onClick={() => { setUrlInput(''); setConnectModal(p) }}
                  className="shrink-0 text-xs px-3.5 py-1.5 rounded-xl text-white bg-brand-green hover:opacity-90 transition-opacity"
                >
                  연결하기
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="p-4 rounded-xl bg-brand-green/5 border-l-[3px] border-brand-green">
          <p className="text-xs text-gray-600">SNS 채널을 연결하면 캠페인 신청 시 팔로워·구독자 수가 자동으로 확인됩니다.</p>
        </div>
      </div>

      {/* 연결 모달 */}
      <Modal open={!!connectModal} onClose={() => { setConnectModal(null); setUrlInput('') }} title={`${connectModal?.name ?? ''} 연결`} size="sm">
        {connectModal && (
          <>
            <p className="text-sm text-gray-500 mb-3">{connectModal.description}</p>
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder={connectModal.placeholder}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all mb-4"
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
            />
            <div className="flex gap-3">
              <button onClick={() => setConnectModal(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">취소</button>
              <button onClick={handleConnect} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green hover:opacity-90 transition-opacity">연결</button>
            </div>
          </>
        )}
      </Modal>

      {/* 연결 해제 모달 */}
      <Modal open={!!disconnectModal} onClose={() => setDisconnectModal(null)} title="연결 해제" size="sm">
        {disconnectModal && (
          <>
            <p className="text-sm text-gray-600 mb-2"><strong>{disconnectModal.name}</strong> 연결을 해제할까요?</p>
            <p className="text-xs text-gray-400 mb-5">해제 후 해당 채널로 캠페인 신청이 어려울 수 있어요.</p>
            <div className="flex gap-3">
              <button onClick={() => setDisconnectModal(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">취소</button>
              <button onClick={handleDisconnect} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">연결 해제</button>
            </div>
          </>
        )}
      </Modal>
    </Layout>
  )
}
