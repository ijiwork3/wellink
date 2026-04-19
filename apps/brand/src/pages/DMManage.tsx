import { useState, useEffect, useRef } from 'react'
import { Send, Search, MessageSquare, ArrowLeft } from 'lucide-react'
import { ErrorState, TIMER_MS } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { mockConversations as conversations } from '../services/mock/dm'

export default function DMManage() {
  const qa = useQAMode()
  const [selected, setSelected] = useState<typeof conversations[0] | null>(
    qa === 'empty-convo' ? null : conversations[0]
  )
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<(typeof conversations[0]['messages'][0] & { isSimulated?: boolean })[]>(qa === 'empty-convo' ? [] : conversations[0].messages)
  const [search, setSearch] = useState('')
  const [unreadMap, setUnreadMap] = useState<Record<number, number>>(
    () => Object.fromEntries(conversations.map(c => [c.id, c.unread]))
  )
  const autoReplyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSelect = (conv: typeof conversations[0]) => {
    // 대화 전환 시 이전 자동 응답 타이머 정리
    if (autoReplyTimerRef.current) clearTimeout(autoReplyTimerRef.current)
    autoReplyTimerRef.current = null
    setSelected(conv)
    setMessages(conv.messages)
    setInput('')
    setUnreadMap(prev => ({ ...prev, [conv.id]: 0 }))
  }


  // 메시지 변경 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => {
      if (autoReplyTimerRef.current !== null) {
        clearTimeout(autoReplyTimerRef.current)
      }
    }
  }, [])

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg = { id: Date.now(), from: 'me' as const, text: input.trim(), time: '지금' }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    // 자동 응답 (시뮬레이션)
    if (autoReplyTimerRef.current !== null) {
      clearTimeout(autoReplyTimerRef.current)
    }
    autoReplyTimerRef.current = setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'them' as const,
        text: '네, 확인했습니다! 감사합니다 😊',
        time: '지금',
        isSimulated: true,
      }])
      autoReplyTimerRef.current = null
    }, TIMER_MS.MOCK_AUTO_REPLY)
  }

  const filtered = conversations.filter(c => c.name.includes(search))

  /* ── QA: 로딩 스켈레톤 ── */
  if (qa === 'loading') {
    return (
      <div className="max-w-5xl">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">DM 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">인플루언서와의 메시지를 관리합니다.</p>
        </div>
        <div className="flex gap-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse min-h-[400px] h-[calc(100vh-120px)]">
          {/* 대화목록 스켈레톤 */}
          <div className="w-64 border-r border-gray-100 flex flex-col">
            <div className="p-3 border-b border-gray-50">
              <div className="h-7 bg-gray-200 rounded-lg" />
            </div>
            <div className="flex-1 p-3 space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-start gap-3 py-1">
                  <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* 메시지 영역 스켈레톤 */}
          <div className="flex-1 flex flex-col p-4 gap-3 justify-end">
            <div className="flex justify-start">
              <div className="h-10 w-48 bg-gray-200 rounded-2xl" />
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-56 bg-gray-200 rounded-2xl" />
            </div>
            <div className="flex justify-start">
              <div className="h-10 w-40 bg-gray-200 rounded-2xl" />
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-52 bg-gray-200 rounded-2xl" />
            </div>
            <div className="h-10 bg-gray-100 rounded-xl mt-4" />
          </div>
        </div>
      </div>
    )
  }

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return <ErrorState message="DM 데이터를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  /* ── QA: 빈 상태 ── */
  if (qa === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center w-full max-w-sm">
          <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400 mb-1">진행 중인 DM이 없습니다</p>
          <p className="text-xs text-gray-400 mb-4">인플루언서와의 DM이 시작되면 여기에 표시됩니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">DM 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">인플루언서와의 메시지를 관리합니다.</p>
      </div>

      <div className="flex gap-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] h-[calc(100vh-120px)]">
        {/* 대화 목록 */}
        <div className={`${selected ? 'hidden @sm:flex' : 'flex'} w-full @sm:w-64 border-r border-gray-100 flex-col`}>
          <div className="p-3 border-b border-gray-50">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="검색..."
                aria-label="대화 검색"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-8 gap-2 text-center px-4">
                <p className="text-xs font-medium text-gray-500">검색 결과가 없습니다</p>
                <p className="text-xs text-gray-400">'{search}' 검색 결과가 없어요</p>
              </div>
            )}
            {filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => handleSelect(conv)}
                className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors border-b border-gray-50 ${selected?.id === conv.id ? 'bg-brand-green/10 border-l-2 border-l-brand-green' : 'hover:bg-gray-50'}`}
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
                {(unreadMap[conv.id] ?? 0) > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium shrink-0 mt-0.5">
                    {unreadMap[conv.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 채팅 인터페이스 */}
        <div className={`${selected ? 'flex' : 'hidden @sm:flex'} flex-1 flex-col`}>
          {selected ? (
            <>
              {/* 헤더 */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                <button
                  onClick={() => setSelected(null)}
                  className="@sm:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="목록으로 돌아가기"
                >
                  <ArrowLeft size={18} />
                </button>
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
                    <div className={`max-w-[65%] rounded-2xl px-4 py-2.5 break-words ${msg.from === 'me' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} ${'isSimulated' in msg && msg.isSimulated ? 'opacity-60' : ''}`}>
                      <p className={`text-sm leading-relaxed ${'isSimulated' in msg && msg.isSimulated ? 'italic' : ''}`}>{msg.text}</p>
                      {'isSimulated' in msg && msg.isSimulated && (
                        <p className="text-[10px] mt-0.5 text-gray-400">(시뮬레이션)</p>
                      )}
                      <p className={`text-[10px] mt-1 ${msg.from === 'me' ? 'text-gray-400' : 'text-gray-400'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력창 */}
              <div className="p-3 border-t border-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    aria-label="메시지 입력"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    maxLength={2000}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green focus:bg-white transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-brand-green text-white px-4 py-2.5 rounded-xl hover:bg-brand-green-hover transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                    <span className="text-sm">전송</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* QA: empty-convo — 대화 미선택 빈 상태 */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
              <MessageSquare size={40} className="text-gray-200" />
              <p className="text-sm font-semibold text-gray-400">대화를 선택해 주세요</p>
              <p className="text-xs text-gray-400">왼쪽 목록에서 대화를 선택하면 메시지가 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
