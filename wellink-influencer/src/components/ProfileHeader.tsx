import SNSPanel from './SNSPanel'

export default function ProfileHeader() {
  return (
    <div className="bg-white border-b border-gray-100 px-6 py-5">
      <div className="max-w-screen-xl mx-auto flex items-start justify-between gap-6">
        {/* 프로필 정보 */}
        <div className="flex items-start gap-4 flex-1">
          {/* 아바타 */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-sm"
            style={{ backgroundColor: '#8CC63F' }}
          >
            김
          </div>

          {/* 이름 & 소개 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-900">김찬기님</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8CC63F]/10 text-[#8CC63F]">
                인플루언서
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              헬스·필라테스 전문 인플루언서 | 건강한 라이프스타일을 공유합니다
            </p>

            {/* 통계 */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">포인트</p>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">등록 콘텐츠</p>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">진행 캠페인</p>
              </div>
            </div>
          </div>
        </div>

        {/* SNS 패널 */}
        <div className="w-64 flex-shrink-0">
          <SNSPanel instaConnected={true} />
        </div>
      </div>
    </div>
  )
}
