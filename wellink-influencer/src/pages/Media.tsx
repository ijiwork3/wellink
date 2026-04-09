import { useState } from 'react'
import { Link2 } from 'lucide-react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import Toast, { useToast } from '../components/Toast'

interface Platform {
  id: string
  name: string
  iconBg: string
  icon: string
  connected: boolean
  url?: string
}

export default function Media() {
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'naver', name: '네이버 블로그', iconBg: '#03C75A', icon: 'N', connected: false },
    { id: 'instagram', name: '인스타그램', iconBg: '#E1306C', icon: '📷', connected: true, url: 'chanstyler' },
    { id: 'youtube', name: '유튜브', iconBg: '#FF0000', icon: '▶', connected: false },
  ])

  const [connectModal, setConnectModal] = useState<{ platformId: string; name: string } | null>(null)
  const [disconnectModal, setDisconnectModal] = useState<{ platformId: string; name: string } | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const { toasts, addToast, removeToast } = useToast()

  const handleConnect = () => {
    if (!urlInput.trim()) {
      addToast('URL을 입력해 주세요', 'error')
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
    addToast(`${connectModal?.name}이(가) 연결되었습니다!`, 'success')
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
    addToast(`${disconnectModal?.name} 연결이 해제되었습니다`, 'info')
  }

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Link2 size={16} style={{ color: '#8CC63F' }} />
          <h2 className="text-base font-semibold text-gray-900">미디어 연결</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          활동 채널 미디어를 연결하고 캠페인을 연결해보세요
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
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      <p className="text-xs text-green-600">@{p.url}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">연결되지 않음</p>
                  )}
                </div>
              </div>

              {p.connected ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">연결됨</span>
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

        <div className="mt-5 p-4 rounded-xl bg-green-50" style={{ borderLeft: '3px solid #8CC63F' }}>
          <p className="text-xs text-gray-600">
            SNS 채널을 연결하면 캠페인 신청 시 팔로워·구독자 수가 자동으로 확인됩니다.
          </p>
        </div>
      </div>

      {/* 연결 모달 */}
      <Modal
        isOpen={!!connectModal}
        onClose={() => setConnectModal(null)}
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
        isOpen={!!disconnectModal}
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
      <Toast toasts={toasts} onRemove={removeToast} />
    </Layout>
  )
}
