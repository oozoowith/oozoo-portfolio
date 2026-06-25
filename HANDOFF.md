# 인수인계 — 정은용 포트폴리오 (oozoo.work)

> 최종 갱신: 2026-06-24 / 최신 커밋 `2b9c353` (main) / 라이브 정상
> 상세한 섹션별 구성·이력은 `WORKLOG.md`, 이미지 추가법은 `README.md` 참고.

---

## 1. 한눈에 보는 현황
- **단일 파일** `index.html` (CSS·JS 전부 인라인, 외부 의존성=폰트 CDN뿐).
- 라이브: **oozoo.work → www.oozoo.work**(308 리다이렉트) / Vercel 호스팅 / Gabia DNS.
- 배포 경로: 로컬 → GitHub(`oozoowith/oozoo-portfolio` main) push → **Vercel 자동 배포**.
- 섹션: NAV · HOME · ABOUT · WORKS · PLAYGROUND · CONTACT · FOOTER.

## 2. 배포 방법 (중요)
- 로컬 폴더 `/Users/eunyong/portfolio_web`가 GitHub와 연결돼 있음. 인증은 SSH 키 `~/.ssh/github_family` (repo의 `core.sshCommand`에 설정됨, 계정 `oozoowith`).
- **사용자용**: 폴더의 `deploy.command` 더블클릭 → 커밋·푸시 자동 (이미지/텍스트 바꾼 뒤 사용). `deploy.command`는 .gitignore됨.
- **에이전트용**: `git add index.html && git commit && git push origin main` (SSH 키 env: `export GIT_SSH_COMMAND="ssh -i ~/.ssh/github_family"`).
- ⚠️ **force-push는 분류기에 의해 차단됨.** 절대 쓰지 말 것. 갈라지면 작업트리 커밋 후 일반 push(fast-forward). 과거 `git merge -s ours`로 내용이 되돌려진 사고 있었음 — 머지 전략 쓰지 말고 그냥 커밋+push.
- `portfolio.pdf`(370MB), `.claude/`, `images/works/moints/*.JPG`(원본) 등은 커밋 금지(대용량). `git add index.html`처럼 파일 지정 권장.

## 3. 코드 구조 핵심
- **WORKS 상세**: `const works = [...]` (8개). `openDetail(id)`가 `#detail` 오버레이에 렌더.
  - 섹션: ①소개(intro/메타: 소속·기간·카테고리·역할(기여도 줄바꿈)·수행업무) ②목표·타겟·전략(`strategyCore` ✶ + `strategy` 들여쓰기 lv1~3)·성과(`results:[{n,t}]` 카드) + `resultNote` ③사진(`photos:[{title,desc,prefix}]`).
- **PLAYGROUND 상세** (3개 카드 모두 클릭형):
  - 포토에세이=`openPhotoDetail`/`photoDetail`, 씨앗실험실=`openSeedDetail`/`seedDetail`, 널 위한 문화예술=`openArtDetail`/`artDetail`.
  - 공통 렌더러 `renderBlocks(blocks)` — 블록 타입: `h`(소제목)·`p`·`callout`·`quote`·`list`(items {t,lv})·`photo`({base,prefix}).
- **사진 그룹 두 가지 방식** (works 상세 `photos:[]`):
  - **(구) prefix 자동로딩** `probeImgs(box)`: `{base}/{prefix}{n}.webp`를 1번부터 순차 로드, 없는 번호에서 멈춤(폴더에 파일 넣으면 자동 표시, 빈 그룹 숨김). 그룹에 `prefix` 키가 있으면 이 방식. (ccbook·ccin·frip·sqnc·wal)
  - **(신) 명시 레이아웃** `renderPhotoGroup()`: 그룹에 `prefix` 없이 다음 키로 정의. (moints·gongil·txtclub)
    - `crop`(종횡비 w/h) + `cols` + `imgs:[...]` → CSS 그리드(repeat(cols,1fr)), 각 셀 `aspect-ratio:crop`+`object-fit:cover`로 **세로폭 통일+crop**. cols 고정이라 여러 줄이어도 셀 크기(높이) 동일. 모바일은 max 3열.
    - `justified:[[ [name,aspect],… ], …]` → flex 행, 각 img `flex-grow:aspect`(flex-basis 0) → **원본비 유지, 한 줄 가로폭 꽉 채우고 행 내 높이 자동 통일**(crop 없음, 로고/BI 보존용).
    - `subgroups:[{title, crop, cols, imgs}]` → 상위 `pg-sub`(20px) 아래 작은 `pg-subsub`(15px) 위계. (모인츠 디지털 커뮤니케이션 > SNS/APP/홈페이지)
    - crop 종횡비는 **변환 시 측정한 실제 픽셀비를 하드코딩**(비동기 측정 없음). 이미지 교체 시 비율 바뀌면 데이터의 crop 값도 갱신 필요.
- **고화질 webp 변환**: 원본(jpg/jpeg/png)을 `python3 + Pillow`로 긴 변 1600px·quality 90·EXIF 회전반영해 `{basename}.webp` 생성(원본은 .gitignore로 커밋 제외, 디스크 백업 유지). moints c그룹은 `c1-1·c1-2…` 네이밍.
  - works 사진: `images/works/{folder}/a1..webp`(현장)·`b1..webp`(디지털).
  - 갤러리 커버: `images/works/{folder}/cover.webp` (3:2).
  - 플레이그라운드 사진 슬롯(비어있음): `images/playground/silhouette/intro{n}.webp`(포토에세이 소개), `booktalk{n}.webp`(북토크).
- **상세 좌우 스와이프**: 터치 왼쪽→다음 프로젝트(`.next-project`), 오른쪽→닫기. **데스크탑 마우스 드래그도 구현됨**(임계 90px, 텍스트 선택·드래그 직후 click 무시 가드 포함).

## 4. 반드시 지킬 규칙 (위반 시 사이트 깨짐/지침)
- **JS 문자열 안전**: 데이터 문자열에 `<`,`>`는 반드시 `&lt;`,`&gt;`로 (안 그러면 HTML 태그로 먹혀 사라짐). 작은따옴표 문자열 안에 `'`가 있으면 큰따옴표 문자열로 쓸 것. ← 과거 GitHub 웹편집의 따옴표 오류로 Works 전체가 멈춘 사고 있었음. 수정 후엔 항상 프리뷰에서 갤러리 8카드 렌더+콘솔 에러 0 확인.
- **어절 단위 줄바꿈**: `body { word-break: keep-all; overflow-wrap: break-word; }` 항상 유지(메모리 `korean-word-break.md`).
- **성과 카드 열 수 규칙**: 최대 4개/줄, 짝수면 절반(6→3, 4→2, 3→3). 렌더에서 `--rc-cols` 인라인 변수로 제어. `▲`는 숫자와 띄어쓰기(렌더에서 `replace(/▲/g,' ▲')`).

## 5. 검증 팁 (프리뷰 도구 버그)
- 프리뷰 스크린샷은 **일반 흐름의 스크롤 영역을 빈 화면으로** 잡는 버그가 있음. 상세 오버레이(fixed)는 캡처됨.
- 검증은 `preview_eval`로 DOM 점검(`getComputedStyle`, `querySelector`)이 신뢰도 높음. 데스크탑 레이아웃은 `preview_resize` 1280으로.

## 6. 콘텐츠 출처 / 연동
- 텍스트·이미지 원천: `portfolio.pdf`(피그마 슬라이드 export, 24p) + Notion 포트폴리오 페이지.
- 도구: `python3` + **PyMuPDF**·**Pillow** (pip --user) 설치됨 — PDF 텍스트는 페이지를 PNG 렌더 후 시각 판독(폰트 인코딩 깨짐), 이미지는 표시영역 고DPI 렌더→3:2 크롭→webp.
- **Notion MCP**(oozoowith 연결): 페이지 `fetch`/`search` 가능. ⚠️ `query_data_sources`는 Enterprise 전용(차단), 북마크의 외부 URL은 노출 안 됨(제목만).
- **Figma MCP**: 연결되나 Starter 플랜 호출 한도 매우 작음(거의 못 씀).
- **LinkedIn**: 봇 차단(HTTP 999) — 자동 조회 불가, 사용자가 직접 제공.

## 7. 남은 일 / 열린 결정
- [x] **성과 카드 디자인** — A(소프트 톤) 확정. 첫줄 파란 숫자가 한글보다 얇아 보이던 문제는 Montserrat 800 weight 미로딩이 원인 → 폰트 link에 `0,800` 추가해 해결.
- [x] **데스크탑 스와이프** — 마우스 드래그 구현 완료.
- [x] **OG 이미지** — `images/og.{webp,jpg}`(1200×630) 제작. onur.design 구조(좌측 정렬 3줄: 정은용 / Experience Designer / 커뮤니티·캠페인·콘텐츠, off-white 배경). 메타는 절대 URL `og.jpg`(카카오 호환) + width/height + twitter card.
- [x] **'왈이의 마음단련장' 표기 통일** — intro의 '영상'→'명상' 교정, 사진 desc의 raw `<왈의…>`(HTML 태그로 먹혀 사라지던 버그)→`&lt;왈이의 마음단련장&gt;`로 escape+명칭 통일.
- [ ] **상세 사진 채우기** — 플레이그라운드 슬롯(silhouette/intro·booktalk) 및 일부 works 사진 비어있음. webp를 폴더에 드롭. *(사용자 작업 중)*
- [ ] **커버 화질** — 씨집책방·SQNC 커버는 PDF 원본이 작아 업스케일됨(약간 흐림), 원본 교체 권장.
- [ ] **Gotham 폰트** — 유료라 Montserrat로 대체 중(스택 1순위 'Gotham' 유지). 라이선스 파일 있으면 자가호스팅.

## 8. 파일 맵
- `/Users/eunyong/portfolio_web/index.html` — 전체 사이트
- `README.md`(이미지 추가 가이드) · `WORKLOG.md`(작업 이력·구조) · `HANDOFF.md`(이 파일) · `deploy.command`(배포 버튼, 로컬 전용)
- 메모리: `~/.claude/projects/-Users-eunyong-portfolio-web/memory/` (project_portfolio.md, user_profile.md, korean-word-break.md, MEMORY.md)
