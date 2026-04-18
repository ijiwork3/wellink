import { SNSPanel } from '@wellink/ui'
import { useDeviceMode } from '../qa-mockup-kit'

export default function ProfileHeader() {
  const device = useDeviceMode()
  const isMobile = device === 'phone'

  return (
    <div className={`bg-white border-b border-gray-100 ${isMobile ? 'px-4 py-4' : 'px-6 py-5'}`}>
      <div className={`max-w-screen-xl mx-auto flex ${isMobile ? 'flex-col gap-4' : 'flex-row items-start justify-between gap-6'}`}>
        {/* 프로필 정보 */}
        <div className={`flex items-start ${isMobile ? 'gap-3' : 'gap-4'} flex-1`}>
          {/* 아바타 */}
          <div
            className={`${isMobile ? 'w-12 h-12 text-lg' : 'w-16 h-16 text-2xl'} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}
            style={{ backgroundColor: '#8CC63F' }}
          >
            김
          </div>

          {/* 이름 & 소개 */}
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 ${isMobile ? 'mb-0.5' : 'mb-1'}`}>
              <span className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>김찬기님</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#8CC63F]/10 text-[#8CC63F]">
                인플루언서
              </span>
            </div>
            <p className={`${isMobile ? 'text-xs mb-2 line-clamp-1' : 'text-sm mb-3'} text-gray-500`}>
              헬스·필라테스 전문 인플루언서 | 건강한 라이프스타일을 공유합니다
            </p>

            {/* 통계 */}
            <div className={`flex items-center ${isMobile ? 'gap-4' : 'gap-6'}`}>
              <div className="text-center">
                <p className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-900`}>2,450</p>
                <p className="text-xs text-gray-500">포인트</p>
              </div>
              <div className={`w-px ${isMobile ? 'h-6' : 'h-8'} bg-gray-100`} />
              <div className="text-center">
                <p className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-900`}>8</p>
                <p className="text-xs text-gray-500">등록 콘텐츠</p>
              </div>
              <div className={`w-px ${isMobile ? 'h-6' : 'h-8'} bg-gray-100`} />
              <div className="text-center">
                <p className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-900`}>3</p>
                <p className="text-xs text-gray-500">진행 캠페인</p>
              </div>
            </div>
          </div>
        </div>

        {/* SNS 패널: 태블릿·PC에서만 표시 */}
        {!isMobile && (
          <div className="w-64 flex-shrink-0">
            <SNSPanel instaConnected={true} />
          </div>
        )}
      </div>
    </div>
  )
}
