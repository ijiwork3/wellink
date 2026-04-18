import { useState, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Link2, XCircle, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import { Modal } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '../utils/useQAMode'

interface Platform {
  id: string
  name: string
  iconBg: string
  icon: string
  connected: boolean
  url?: string
  followers?: number
  engagementRate?: number
}

export default function Media() {
  const qa = useQAMode()

  // QA: platforms 초기값 결정
  const initPlatforms = (): Platform[] => {
    if (qa === 'all-disconnected') return [
      { id: 'naver', name: '네이버 블로그', iconBg: '#03C75A', icon: 'N', connected: false },
      { id: 'instagram', name: '인스타그램', iconBg: '#E1306C', icon: '📷', connected: false },
      { id: 'youtube', name: '유튜브', iconBg: '#FF0000', icon: '▶', connected: false },
    ]
    if (qa === 'all-connected') return [
      { id: 'naver', name: '네이버 블로그', iconBg: '#03C75A', icon: 'N', connected: true, url: 'myblog', followers: 3200, engagementRate: 2.8 },
      { id: 'instagram', name: '인스타그램', iconBg: '#E1306C', icon: '📷', connected: true, url: 'chanstyler', followers: 8700, engagementRate: 4.1 },
      { id: 'youtube', name: '유튜브', iconBg: '#FF0000', icon: '▶', connected: true, url: 'chanChannel', followers: 1200, engagementRate: 3.5 },
    ]
    return [
      { id: 'naver', name: '네이버 블로그', iconBg: '#03C75A', icon: 'N', connected: false },
      { id: 'instagram', name: '인스타그램', iconBg: '#E1306C', icon: '📷', connected: true, url: 'chanstyler', followers: 8700, engagementRate: 4.1 },
      { id: 'youtube', name: '유튜브', iconBg: '#FF0000', icon: '▶', connected: false },
    ]
  }

  const [platforms, setPlatforms] = useState<Platform[]>(initPlatforms)

  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [connectModal, setConnectModal] = useState<{ platformId: string; name: string } | null>(null)
  const [disconnectModal, setDisconnectModal] = useState<{ platformId: string; name: string } | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    // legacy ?modal= param support
    const m = searchParams.get('modal')
    if (m === 'connect')    setConnectModal({ platformId: 'naver', name: '네이버 블로그' })
    if (m === 'disconnect') setDisconnectModal({ platformId: 'instagram', name: '인스타그램' })
    // QA: ?qa= param
    if (qa === 'modal-connect')    setConnectModal({ platformId: 'naver', name: '네이버 블로그' })
    if (qa === 'modal-disconnect') setDisconnectModal({ platformId: 'instagram', name: '인스타그램' })
  }, [searchParams, location.key, qa])

  // QA: loading 상태
  if (qa === 'loading') {
    return (
      <Layout>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded-xl w-24" />
          </div>
          <div className="h-3 bg-gray-100 rounded-xl w-2/3 mb-5" />
          {/* SNS 플랫폼 카드 스켈레톤 3개 */}
          <div className="space-y-3 max-w-lg">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 bg-gray-100 rounded-xl w-28" />
                    <div className="h-3 bg-gray-100 rounded-xl w-20" />
                  </div>
                </div>
                <div className="h-8 bg-gray-100 rounded-xl w-16" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  // QA: 에러 상태
  if (qa === 'error') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <XCircle size={44} className="text-red-300" />
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">SNS 연결 정보를 불러오지 못했어요</p>
            <p className="text-xs text-gray-500 mt-1">잠시 후 다시 시도해 주세요</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={14} />다시 시도
          </button>
        </div>
      </Layout>
    )
  }

  const handleConnect = () => {
    if (!urlInput.trim()) {
      showToast('URL을 입력해 주세요', 'error')
      return
    }
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === connectModal?.platformId
          ? { ...p, connected: true, url: urlInput.trim() }
          : p
      )
    )
    setConnectModal(null)
    setUrlInput('')
    showToast(`${connectModal?.name}이(가) 연결되었습니다!`, 'success')
  }

  const handleDisconnect = () => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === disconnectModal?.platformId
          ? { ...p, connected: false, url: undefined }
          : p
      )
    )
    setDisconnectModal(null)
    showToast(`${disconnectModal?.name} 연결이 해제됐어요`, 'info')
  }

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Link2 size={16} style={{ color: '#8CC63F' }} />
          <h2 className="text-base font-semibold text-gray-900">미디어 연결</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          활동 채널 미디어를 연결하고 캠페인을 시작해보세요
        </p>

        <div className="space-y-3 max-w-lg">
          {platforms.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: p.iconBg }}
                >
                  {p.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  {p.connected && p.url ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8CC63F] inline-block" />
                      <p className="text-xs text-[#5a8228] truncate max-w-[140px]">@{p.url}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">연결되지 않음</p>
                  )}
                  {p.connected && p.followers && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500">팔로워 <strong className="text-gray-700">{p.followers.toLocaleString()}</strong></span>
                      {p.engagementRate != null && (
                        <span className="text-[10px] text-gray-500">참여율 <strong className={p.engagementRate >= 4 ? 'text-[#5a8228]' : p.engagementRate >= 2.5 ? 'text-gray-700' : 'text-red-500'}>{p.engagementRate}%</strong></span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {p.connected ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#5a8228] bg-[#8CC63F]/10 px-2.5 py-1 rounded-full">연결됨</span>
                  <button
                    onClick={() => setDisconnectModal({ platformId: p.id, name: p.name })}
                    className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-150"
                  >
                    관리
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setUrlInput('')
                    setConnectModal({ platformId: p.id, name: p.name })
                  }}
                  className="text-xs px-3.5 py-1.5 rounded-xl text-white transition-all duration-150 hover:opacity-90"
                  style={{ backgroundColor: '#8CC63F' }}
                >
                  연결하기
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-xl bg-[#8CC63F]/5" style={{ borderLeft: '3px solid #8CC63F' }}>
          <p className="text-xs text-gray-600">
            SNS 채널을 연결하면 캠페인 신청 시 팔로워·구독자 수가 자동으로 확인됩니다.
          </p>
        </div>
      </div>

      {/* 연결 모달 */}
      <Modal
        open={!!connectModal}
        onClose={() => { setConnectModal(null); setUrlInput('') }}
        title={connectModal ? `${connectModal.name} 연결` : ''}
        size="sm"
      >
        {connectModal && (
          <>
            <p className="text-sm text-gray-500 mb-3">
              {connectModal.name === '네이버 블로그' ? '블로그 URL을 입력해 주세요' :
               connectModal.name === '인스타그램' ? '인스타그램 아이디를 입력해 주세요' :
               '유튜브 채널 URL을 입력해 주세요'}
            </p>
            <label htmlFor="platform-url-input" className="sr-only">
              {connectModal.name === '네이버 블로그' ? '블로그 URL' :
               connectModal.name === '인스타그램' ? '인스타그램 아이디' :
               '유튜브 채널 URL'}
            </label>
            <input
              id="platform-url-input"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={
                connectModal.name === '네이버 블로그' ? 'https://blog.naver.com/아이디' :
                connectModal.name === '인스타그램' ? '@인스타그램 아이디' :
                'https://www.youtube.com/@채널명'
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150 mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setConnectModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-150"
              >
                취소
              </button>
              <button
                onClick={handleConnect}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
                style={{ backgroundColor: '#8CC63F' }}
              >
                연결
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* 연결 해제 확인 모달 */}
      <Modal
        open={!!disconnectModal}
        onClose={() => setDisconnectModal(null)}
        title="연결 해제"
        size="sm"
      >
        {disconnectModal && (
          <>
            <p className="text-sm text-gray-600 mb-5">
              <span className="font-semibold">{disconnectModal.name}</span> 연결을 해제하시겠습니까?
              <br />
              <span className="text-xs text-gray-400 mt-1 inline-block">연결 해제 후 해당 채널로 캠페인 신청이 불가해질 수 있어요.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDisconnectModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-150"
              >
                취소
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-150"
              >
                연결 해제
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* 토스트 */}
    </Layout>
  )
}
