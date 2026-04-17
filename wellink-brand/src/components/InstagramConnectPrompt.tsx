import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

interface Props {
  featureName: string   // 예: '프로필 인사이트', '광고 성과', '바이럴 지표'
}

type ModalStep = 'idle' | 'confirm' | 'loading' | 'success' | 'error'

export default function InstagramConnectPrompt({ featureName }: Props) {
  const [step, setStep] = useState<ModalStep>('idle')
  const [, setSearchParams] = useSearchParams()

  function openModal() {
    setStep('confirm')
  }

  function closeModal() {
    setStep('idle')
  }

  function handleConnect() {
    setStep('loading')
    // 모의 연결 시도: 70% 성공, 30% 실패
    setTimeout(() => {
      const success = Math.random() > 0.3
      if (success) {
        setStep('success')
      } else {
        setStep('error')
      }
    }, 2000)
  }

  function handleSuccessConfirm() {
    // URL 파라미터로 연결 상태 업데이트
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('gs', 'instagram')
      return next
    })
    setStep('idle')
  }

  return (
    <>
      {/* 메인 프롬프트 */}
      <div className="flex flex-col items-center justify-center min-h-[420px] bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        {/* Instagram 그라디언트 아이콘 */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mb-5 shadow-lg">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
          </svg>
        </div>

        <h3 className="text-base font-bold text-gray-900 mb-2">
          인스타그램 비즈니스 계정을 연결해 주세요
        </h3>
        <p className="text-sm text-gray-500 max-w-[280px] mb-6 leading-relaxed">
          {featureName}는 Instagram 비즈니스 계정과 연결되어야
          데이터를 수집하고 표시할 수 있습니다.
        </p>

        <button
          onClick={openModal}
          className="flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-xl transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.8" fill="white" stroke="none" />
          </svg>
          계정 연결하기
        </button>
      </div>

      {/* 모달 오버레이 */}
      {step !== 'idle' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget && step !== 'loading') closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

            {/* ── 연결 확인 단계 ── */}
            {step === 'confirm' && (
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Instagram 계정 연결</h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  Instagram 비즈니스 계정을 연결하면<br />
                  {featureName} 데이터를 실시간으로 확인할 수 있어요.
                </p>

                <div className="bg-gray-50 rounded-xl p-3.5 mb-5 text-left space-y-2">
                  {[
                    '팔로워 분석 및 인구통계',
                    '게시물·릴스 성과 지표',
                    '광고 캠페인 연계 데이터',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500 font-bold">✓</span>
                      {item}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mb-5">
                  연결 시 Instagram 로그인 페이지로 이동합니다.<br />
                  읽기 전용 권한만 요청됩니다.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-xl transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConnect}
                    className="flex-1 text-sm font-semibold text-white py-2.5 rounded-xl transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
                  >
                    연결 시작
                  </button>
                </div>
              </div>
            )}

            {/* ── 로딩 단계 ── */}
            {step === 'loading' && (
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mx-auto mb-4 shadow-md animate-pulse">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">연결 중...</h3>
                <p className="text-sm text-gray-500">Instagram 계정 정보를 확인하고 있어요.</p>
                <div className="mt-5 flex justify-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── 성공 단계 ── */}
            {step === 'success' && (
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">연결 완료!</h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  Instagram 비즈니스 계정이 성공적으로<br />
                  연결되었습니다. 이제 {featureName}를 이용해 보세요.
                </p>
                <button
                  onClick={handleSuccessConfirm}
                  className="w-full text-sm font-semibold text-white py-2.5 rounded-xl transition-opacity hover:opacity-90 bg-green-500"
                >
                  확인
                </button>
              </div>
            )}

            {/* ── 실패 단계 ── */}
            {step === 'error' && (
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">연결에 실패했어요</h3>
                <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                  Instagram 계정 연결 중 오류가 발생했습니다.
                </p>
                <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-5">
                  오류 코드: IGC_AUTH_TIMEOUT<br />
                  Instagram 서버 응답 시간이 초과되었습니다.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-xl transition-colors"
                  >
                    닫기
                  </button>
                  <button
                    onClick={handleConnect}
                    className="flex-1 text-sm font-semibold text-white py-2.5 rounded-xl transition-opacity hover:opacity-90 bg-red-500"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
