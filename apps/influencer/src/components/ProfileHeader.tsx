import { useState } from 'react'
import { Link2, X } from 'lucide-react'
import { SNSPanel } from '@wellink/ui'

export default function ProfileHeader() {
  const [snsOpen, setSnsOpen] = useState(false)

  return (
    <div className="@container bg-white border-b border-gray-100 px-4 py-4 @sm:px-6 @sm:py-5">
      <div className="max-w-screen-xl mx-auto flex flex-col @sm:flex-row @sm:items-start @sm:justify-between gap-4 @sm:gap-6">
        {/* 프로필 정보 */}
        <div className="flex items-start gap-3 @sm:gap-4 flex-1">
          {/* 아바타 */}
          <div className="w-12 h-12 text-lg @sm:w-16 @sm:h-16 @sm:text-2xl rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm bg-brand-green">
            김
          </div>

          {/* 이름 & 소개 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5 @sm:mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base @sm:text-lg font-bold text-gray-900 truncate">김찬기님</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green flex-shrink-0">
                  인플루언서
                </span>
              </div>
              {/* 모바일 SNS 버튼 */}
              <button
                onClick={() => setSnsOpen(true)}
                className="@sm:hidden flex items-center gap-1 text-xs text-brand-green font-medium border border-brand-green/30 rounded-lg px-2.5 py-1 hover:bg-brand-green/5 transition-colors"
                aria-label="SNS 연결 상태 보기"
              >
                <Link2 size={12} />
                SNS
              </button>
            </div>
            <p className="text-xs @sm:text-sm mb-2 @sm:mb-3 text-gray-500 line-clamp-1 @sm:line-clamp-none">
              헬스·필라테스 전문 인플루언서 | 건강한 라이프스타일을 공유합니다
            </p>

            {/* 통계 */}
            <div className="flex items-center gap-4 @sm:gap-6">
              <div className="text-center">
                <p className="text-base @sm:text-xl font-bold text-gray-900">2,450</p>
                <p className="text-xs text-gray-500">포인트</p>
              </div>
              <div className="w-px h-6 @sm:h-8 bg-gray-100" />
              <div className="text-center">
                <p className="text-base @sm:text-xl font-bold text-gray-900">8</p>
                <p className="text-xs text-gray-500">등록 콘텐츠</p>
              </div>
              <div className="w-px h-6 @sm:h-8 bg-gray-100" />
              <div className="text-center">
                <p className="text-base @sm:text-xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500">진행 캠페인</p>
              </div>
            </div>
          </div>
        </div>

        {/* SNS 패널: 데스크탑에서만 인라인 표시 */}
        <div className="hidden @sm:block w-64 flex-shrink-0">
          <SNSPanel
            platforms={[
              { id: 'naver', connected: false },
              { id: 'instagram', connected: true, handle: 'chanstyler' },
              { id: 'youtube', connected: false },
            ]}
          />
        </div>
      </div>

      {/* 모바일 SNS 모달 */}
      {snsOpen && (
        <div
          className="@sm:hidden fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setSnsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-md bg-white rounded-t-2xl p-5 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-900">연결된 SNS</span>
              <button
                onClick={() => setSnsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>
            <SNSPanel
              platforms={[
                { id: 'naver', connected: false },
                { id: 'instagram', connected: true, handle: 'chanstyler' },
                { id: 'youtube', connected: false },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
