import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import Layout from '../components/Layout'

export default function Home() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 헤더 */}
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">관심 캠페인</h2>
        </div>

        <div className="p-5">
          {/* 빈 상태 */}
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Heart size={28} className="text-red-300" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">관심 캠페인이 없어요</p>
            <p className="text-xs text-gray-400 mb-4">마음에 드는 캠페인에 좋아요를 눌러보세요</p>
            <button
              onClick={() => navigate('/campaigns/browse')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
              style={{ backgroundColor: '#8CC63F' }}
            >
              캠페인 둘러보기
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
