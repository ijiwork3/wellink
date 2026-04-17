import { useState } from 'react'
import { Send, Search } from 'lucide-react'

const initialConversations = [
  {
    id: 1,
    name: '이창민',
    avatar: 'bg-pink-200',
    lastMsg: '네, 콘텐츠 가이드 확인했습니다!',
    time: '5분 전',
    unread: 2,
    messages: [
      { id: 1, from: 'me', text: '안녕하세요, 봄 요가 프로모션 관련해서 연락드립니다.', time: '10:30' },
      { id: 2, from: 'them', text: '안녕하세요! 말씀해 주세요 😊', time: '10:32' },
      { id: 3, from: 'me', text: '캠페인 가이드라인 공유드립니다. 검토 부탁드려요.', time: '10:34' },
      { id: 4, from: 'them', text: '네, 콘텐츠 가이드 확인했습니다!', time: '10:40' },
    ],
  },
  {
    id: 2,
    name: '김가애',
    avatar: 'bg-yellow-200',
    lastMsg: '언제까지 원고 제출해야 하나요?',
    time: '1시간 전',
    unread: 1,
    messages: [
      { id: 1, from: 'them', text: '안녕하세요, 캠페인 참여 확정됐다고 연락받았어요!', time: '09:00' },
      { id: 2, from: 'me', text: '네, 반갑습니다! 잘 부탁드립니다 🙂', time: '09:05' },
      { id: 3, from: 'them', text: '언제까지 원고 제출해야 하나요?', time: '09:20' },
    ],
  },
  {
    id: 3,
    name: '박리나',
    avatar: 'bg-purple-200',
    lastMsg: '알겠습니다, 수정해서 다시 보낼게요.',
    time: '어제',
    unread: 0,
    messages: [
      { id: 1, from: 'me', text: '콘텐츠 검토 완료했습니다. 해시태그 추가 부탁드려요.', time: '어제 14:00' },
      { id: 2, from: 'them', text: '알겠습니다, 수정해서 다시 보낼게요.', time: '어제 14:30' },
    ],
  },
]

// messages map for quick lookup
const mockMessages: Record<number, typeof initialConversations[0]['messages']> = Object.fromEntries(
  initialConversations.map(c => [c.id, c.messages])
)

export default function DMManage() {
  const [conversations, setConversations] = useState(initialConversations)
  const [selected, setSelected] = useState(initialConversations[0])
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(initialConversations[0].messages)
  const [search, setSearch] = useState('')

  const handleSelect = (conv: typeof initialConversations[0]) => {
    setSelected(conv)
    setMessages(mockMessages[conv.id] || [])
    setInput('')
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c))
  }

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg = { id: Date.now(), from: 'me' as const, text: input.trim(), time: '지금' }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    // 자동 응답
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'them' as const,
        text: '네, 확인했습니다! 감사합니다 😊',
        time: '지금'
      }])
    }, 1000)
  }

  const filtered = conversations.filter(c => c.name.includes(search))


  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">DM 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">인플루언서와의 메시지를 관리합니다.</p>
      </div>

      <div className="flex gap-0 bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ height: '560px' }}>
        {/* 대화 목록 */}
        <div className="w-64 border-r border-gray-100 flex flex-col">
          <div className="p-3 border-b border-gray-50">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => handleSelect(conv)}
                className={`w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${selected.id === conv.id ? 'bg-gray-50' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full ${conv.avatar} flex items-center justify-center text-gray-700 font-semibold text-sm shrink-0`}>
                  {conv.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-gray-900">{conv.name}</span>
                    <span className="text-[11px] text-gray-400">{conv.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMsg}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium shrink-0 mt-0.5">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 채팅 인터페이스 */}
        <div className="flex-1 flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
            <div className={`w-8 h-8 rounded-full ${selected.avatar} flex items-center justify-center text-gray-700 font-semibold text-sm`}>
              {selected.name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{selected.name}</p>
              <p className="text-xs text-gray-400">인플루언서</p>
            </div>
          </div>

          {/* 메시지 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[65%] rounded-2xl px-4 py-2.5 ${msg.from === 'me' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.from === 'me' ? 'text-gray-400' : 'text-gray-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 입력창 */}
          <div className="p-3 border-t border-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:bg-white transition-colors"
              />
              <button
                onClick={handleSend}
                className="bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-1.5"
              >
                <Send size={14} />
                <span className="text-sm">전송</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
