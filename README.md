# Wellink Platform

인플루언서 마케팅 플랫폼 — 어드민 / 브랜드 / 인플루언서 앱

## 프로젝트 구조

```
wellink/
├── wellink-admin/       # 어드민 앱 (포트 3004)
├── wellink-brand/       # 브랜드 앱 (포트 3003)
├── wellink-influencer/  # 인플루언서 앱 (포트 3005)
└── wellink-ui/          # 전사 공통 UI 컴포넌트
```

## 기술 스택

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7
- Lucide React

## 브랜드 컬러

- Primary: `#8CC63F`
- Hover: `#7AB535`

## 로컬 실행

```bash
# 어드민
cd wellink-admin && npm install && npm run dev

# 브랜드
cd wellink-brand && npm install && npm run dev

# 인플루언서
cd wellink-influencer && npm install && npm run dev
```

## 공통 컴포넌트

`wellink-ui/` 폴더 참고 — StatusBadge, KPICard, Modal, Toast 등 14개 컴포넌트
