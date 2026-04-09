# @wellink/ui

Wellink 전사 공통 UI 컴포넌트 패키지

## 컴포넌트 목록

| 컴포넌트 | 설명 | 사용 앱 |
|---------|------|--------|
| `StatusBadge` | 상태 배지 (5그룹 컬러 정책) | admin / brand / influencer |
| `PlatformBadge` | SNS 플랫폼 배지 | admin / brand / influencer |
| `KPICard` | 지표 요약 카드 | admin / brand |
| `InfluencerCard` | 인플루언서 카드 | admin / brand |
| `CustomSelect` | 커스텀 셀렉트박스 (단일/다중) | admin / brand / influencer |
| `TagInput` | 태그 입력 | admin / brand |
| `FileUpload` | 파일 업로드 (드래그앤드롭) | admin / brand |
| `Toggle` | 스위치 토글 | influencer |
| `CustomCheckbox` | 커스텀 체크박스 | influencer |
| `Modal` | 공통 모달 | admin / brand / influencer |
| `Dropdown` | 드롭다운 | admin / brand |
| `SNSPanel` | SNS 연결 상태 패널 | influencer |
| `ToastProvider` | 토스트 Provider | 전체 |
| `useToast` | 토스트 hook | 전체 |

## 상태 컬러 정책

| 그룹 | 색상 | 상태값 |
|-----|------|-------|
| active | emerald | 모집중, 진행중 |
| pending | amber | 대기중, 신청완료, 콘텐츠대기 |
| review | sky | 검수중 |
| done | slate | 완료, 종료, 마감, 게시완료, 포인트지급 |
| alert | rose | 반려, 마감임박 |

## 브랜드 컬러

- Primary: `#8CC63F`
- Hover: `#7AB535`
