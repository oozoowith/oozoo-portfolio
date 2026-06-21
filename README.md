# 정은용 포트폴리오

브랜드 경험 기획자 정은용의 포트폴리오 웹사이트. 단일 `index.html` (CSS/JS 인라인).

## 구조
- **Home** — perryw.ca 스타일 랜딩. 좌측 세리프 모노그램 `E—C©` + 우측 소개·구분선·링크 한 줄
- **About** — 소개 + 경력/학력/스킬
- **Works** — 갤러리(커버 + 번호 + 제목 + 문제→성과 한 줄) + 주제 필터 + 클릭 시 상세 페이지(Gabriel 구조) + 하단 서비스 블록
- **Playground** — 개인 프로젝트 3개
- **Contact** — 이메일(클립보드 복사) + SNS 링크

## 이미지 추가 방법

이미지가 없으면 회색 placeholder가 자동 표시됩니다. 아래 경로/이름에 맞춰 파일을 넣기만 하면 자동으로 뜹니다 (코드 수정 불필요).

```
images/
├── works/
│   ├── moints/      ← cover.webp (필수) · 01.webp · 02.webp
│   ├── ccbook/
│   ├── ccin/
│   ├── sqnc/
│   ├── txtclub/
│   ├── frip/
│   ├── seed/
│   └── gongil/
├── playground/
│   ├── book-cover.webp
│   ├── art.webp
│   └── seed.webp
└── og.webp          ← 공유 썸네일 1200×630
```

### 프로젝트 ↔ 폴더명
| 프로젝트 | 폴더 |
|---|---|
| MOINTS | `moints` |
| 씨집책방 | `ccbook` |
| CCIN (씬) | `ccin` |
| SQNC (시퀀스) | `sqnc` |
| 텍스트클럽 | `txtclub` |
| Frip Original | `frip` |
| 씨앗실험실 | `seed` |
| 공공일호 사람들 | `gongil` |

### 이미지 규칙
- **cover.webp** — 갤러리 카드 + 상세 히어로용 대표 컷. 가로 **3:2**, 폭 1600px. (프로젝트당 1장, 최우선)
- **01.webp, 02.webp** — 상세 페이지 본문 이미지. 가로 **16:9**, 폭 1600px.
- 형식: WebP ([squoosh.app](https://squoosh.app)에서 변환), 장당 200~400KB.

## 로고 교체
`index.html`의 nav 안에 주석 처리된 `<img src="images/logo.svg">` 를 주석 해제하고 텍스트 "정은용"을 지우면 로고 이미지로 바뀝니다.

## 배포
Vercel에 GitHub 레포 연결 → Deploy. 이후 GitHub에 파일 올리면 자동 재배포.
