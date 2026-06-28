# 인수인계 — 정은용 포트폴리오 (oozoo.work)

> 최종 갱신: 2026-06-28 / 최신 커밋 `5a82216`+ (main) / 라이브 정상
> 디자인 시스템 상세는 메모리 `design-guide.md`, 작업규칙은 `work-rules.md` 참고.
> ⚠️ 이제 단일 파일이 아님 — `index.html`(SPA) + `generate.mjs`(정적 페이지 생성기) + `vercel.json`·`robots.txt`·`sitemap.xml` + 생성물 `works/*.html`·`play/*.html`. 아래 10절 참고.

---

## 1. 한눈에 보는 현황
- `index.html` = SPA(CSS·JS 인라인). 데이터(works·*Detail)도 인라인 `<script>`에 있음. 외부 의존성 = 폰트 CDN(Montserrat·Pretendard) + GA4(googletagmanager).
- **프로젝트별 진짜 URL**: 상세 열람 시 `/works/{id}`·`/play/{key}`로 pushState. 직접 진입·공유·크롤러는 `generate.mjs`가 만든 **정적 페이지**(`works/*.html`·`play/*.html`)가 서빙. (10절)
- 라이브: **oozoo.work → www.oozoo.work**(308) / Vercel 호스팅 / Gabia DNS. `vercel.json`에 `cleanUrls`+보안 헤더(CSP 등).
- 배포: 로컬 → GitHub(`oozoowith/oozoo-portfolio` main) push → **Vercel 자동 배포**.
- 섹션: NAV · HOME · ABOUT · WORKS · PLAYGROUND · CONTACT · FOOTER.

## 2. 배포 방법 (중요)
- 로컬 `/Users/eunyong/portfolio_web` ↔ GitHub. SSH 키 `~/.ssh/github_family`(repo `core.sshCommand`, 계정 `oozoowith`).
- **사용자용**: `deploy.command` 더블클릭(**먼저 `node generate.mjs`로 정적 페이지 재생성** → `git add -A` → 커밋·푸시 자동). `deploy.command`는 .gitignore. ⚠️ node 필요.
- **에이전트용**: `export GIT_SSH_COMMAND="ssh -i ~/.ssh/github_family"` 후 `git add … && git commit && git push origin main`.
- ⚠️ **force-push·merge 전략 금지**(분류기 차단). 갈라지면 작업트리 커밋 후 일반 push(fast-forward). 과거 `merge -s ours` 되돌림 사고 있었음.
- **대용량 원본 커밋 금지**: `.gitignore`가 `images/works/**`·`images/playground/**`의 JPG/jpg/JPEG/jpeg/PNG/png + `portfolio.pdf`·`.claude/`·`deploy.command`·`editor.html` 제외. (사이트는 webp만 사용. `images/og.jpg`는 예외로 커밋됨)

## 3. 코드 구조 핵심
- **WORKS 상세**: `const works = [...]`(8개). `openDetail(id)`가 `#detail` 오버레이에 렌더. 섹션: ①소개(intro/메타) ②목표·타겟·전략(`strategyCore`✶+`strategy`[{t,lv}])·성과(`results:[{n,t}]`카드+`resultNote`) ③사진.
- **PLAYGROUND 상세**(갤러리 4카드): 마음의 실루엣=`openPhotoDetail`/`photoDetail`, 씨앗실험실=`openSeedDetail`/`seedDetail`, **TMT TOWN**=`openTmtDetail`/`tmtDetail`, 널 위한 문화예술=`openArtDetail`/`artDetail`.
  - 갤러리 카드 썸네일은 각 하위폴더 cover: `images/playground/{silhouette,seed,town,art4u}/cover.webp`.
- **renderBlocks(blocks, base)** 블록 타입: `h`(소제목 `detail-subhead` 16px)·`p`·`callout`·`introbox`(씨앗실험실 스타일 박스, TMT·art 소개)·`quote`·`list`(+`linkAll`로 항목 전체를 한 URL 링크)·`pgroup`(아래 사진 그룹 임베드, base 필요)·`photo`(구 probe). 섹션 `h`가 빈 문자열이면 h3 생략.
- **사진 그룹 시스템** `renderPhotoGroup(base, g)` — works·playground 공통. base=폴더 전체경로. 그룹 `g` 키:
  - `prefix` → 구 자동로딩 `probeImgs`(`{base}/{prefix}{n}.webp` 순차). 남은 건 frip·wal 정도.
  - `crop`(종횡비 w/h)+`cols`+`imgs` → 그리드, 셀 `aspect-ratio`+`object-fit:cover`(세로폭 통일+crop). `pos`로 `object-position`(예 `'top'`).
  - `cropRows:[{ar,imgs,pos?}]` → 행별 독립 그리드(행마다 cols=이미지수, 가로폭 꽉·행내 동일).
  - `justified:[[[name,aspect]…]]` → flex 행, `flex-grow+aspect-ratio:aspect`(원본비·crop 없음, 로고/BI/상세컷 보존). **aspect-ratio 필수**(레이아웃 시프트·lazy 0높이 방지).
  - `split:'a1'`+`ratio`+`text:[]` → 이미지(좌)+텍스트박스(우) 2단.
  - `story:{tag,heading,body:[]}` → 반투명 스토리 박스(이미지와 공존).
  - `magazines:[{code,headline,brand,rep,url}]` → 링크 카드 리스트.
  - `subgroups:[{title,…}]` → 상위 `pg-sub`(20px) 아래 `pg-subsub`(15px) 위계.
  - crop 종횡비는 **실측 픽셀비 하드코딩**(비동기 측정 없음) → 이미지 교체 시 갱신.
- **커버 크롭 위치**: 갤러리·상세 공통 `.img-ph img { object-position: var(--cover-pos,50% 50%) }`. work/playground에 `coverPos`(예 wal `'50% 100%'` 강아지 노출, 마음의 실루엣 `'50% 30%'` mind 글자 노출) 지정 시 적용.
- **고화질 webp 변환**: 원본(jpg/jpeg/png)→Pillow 긴 변 1600·quality 90·method 6·EXIF 회전. webp만 커밋.
- **상세 좌우 스와이프**: 터치/데스크탑 마우스 드래그(왼→다음, 오→닫기). **브라우저 뒤로가기**: 상세 열 때 `history.pushState`, popstate에서 오버레이만 닫힘(사이트 이탈 방지).
- **섹션 간격**: `.detail-section` 45px(목표·타겟·전략·성과·사진 사이), 사진 그룹 `.detail-photos .photo-group` 45px, 서브그룹 `.pg-subgroup` 31px (모두 기존 대비 40%↑).

## 4. 반드시 지킬 규칙
- **JS 문자열 안전**: 데이터 문자열의 `<`,`>`는 `&lt;`,`&gt;`로(안 그러면 태그로 먹힘). 작은따옴표 안 `'`는 큰따옴표 문자열 사용. 수정 후 항상 프리뷰로 갤러리 8카드 + 콘솔 에러 0 확인.
- **어절 줄바꿈**: `word-break:keep-all; overflow-wrap:break-word` 유지.
- **성과 카드**: A안. `.rc-num`(첫줄 파란 숫자)은 weight 800 + **`font-family:'Pretendard'`**(숫자·한글 동일 굵기). 열 수: 최대 4/줄, 짝수면 절반. `▲`는 숫자와 띄어쓰기.
- **영문 굵기**: 영문이 Montserrat라 국문(Pretendard)보다 가늘어 보임 → **타이틀·논문제목 영문은 Pretendard로**(`.detail-title/.g-title/.next-title/.section-label/.hn-en/.paper-title`).
- 전체 디자인 시스템(색상·박스·홈 인터랙션·OG)은 메모리 `design-guide.md` 참고.

## 5. 텍스트 편집 (사용자 self-edit)
- **`editor.html`**(루트, .gitignore로 배포 제외): 크롬에서 더블클릭 → `index.html 열기` → 텍스트 374곳을 폼으로 편집 → 저장(File System Access로 디스크 직접) → `deploy.command` 배포. GitHub 웹 안 거쳐 **세션 충돌 차단**. 오프셋 기반 치환이라 편집 안 한 곳은 byte 동일(검증됨).
- 구조/키 변경 시 `editor.html`의 `SINGLE_KEYS`/`ARRAY_KEYS`도 갱신.

## 6. 검증 팁 (프리뷰 도구 버그)
- **검증은 스크린샷 없이 `preview_eval` DOM 점검**(사용자 요청). 프리뷰 스크린샷·window 스크롤이 넓은 뷰포트/일반 흐름에서 반영 안 되는 버그 있음. 상세 오버레이(fixed)·overlay scrollTop은 동작.
- 데스크탑 검증: `preview_resize` width 1280 명시(임베드 패널이 좁아 모바일 규칙 뜨면).

## 7. 콘텐츠 출처 / 연동
- 원천: `portfolio.pdf`(피그마 export, 24p, 370MB·gitignore) + Notion. PDF는 `python3+PyMuPDF`로 페이지 PNG 렌더 후 시각 판독(폰트 인코딩 깨짐).
- **Notion MCP**(oozoowith): `fetch`/`search` 가능. ⚠️ **북마크의 외부 URL은 노출 안 됨**(TMT 에피소드 유튜브 링크가 북마크라 못 가져옴). `query_data_sources` Enterprise 전용.
- **Figma MCP**: Starter 한도 작아 거의 못 씀. **LinkedIn**: 봇 차단(999).

## 8. 남은 일 / 열린 결정
- [x] **TMT 에피소드별 유튜브 링크** — 시즌1~3 재생목록 RSS로 22개 영상 매칭 완료(개별 youtu.be 링크).
- [x] **진짜 URL + 정적 페이지 + GA4 + AI 봇 선택 차단** — 완료(10절). GA4 측정 ID `G-75SJSREK34` 반영됨.
- [ ] **GA4 데이터 확인** — 배포 후 24~48h 후 analytics.google.com에서 유입·프로젝트별 조회·체류·이탈 집계 시작. 실시간 보고서로 즉시 동작 확인 가능.
- [ ] **씨집책방 설명** — portfolio.pdf 6·7·8p 우측 상단 불렛으로 삽입 완료(2026-06-28). ccbook A/B crop 기준은 추정값.
- [ ] **커버 화질** — 씨집책방·SQNC 커버 일부 업스케일(약간 흐림), 고화질 원본 교체 권장.
- [ ] **Gotham 폰트** — 유료, Montserrat 대체 중(스택 1순위 'Gotham' 유지). 라이선스 시 자가호스팅.
- [ ] **원본 파일 삭제** — works·playground 원본(jpg/png)은 .gitignore로 제외돼 디스크 백업만. 삭제 시 더 높은 화질 재변환 불가(사용자 직접 확인 후 결정).

## 9. 파일 맵
- `index.html` — SPA 본체. `generate.mjs` — 정적 페이지 생성기(커밋). `works/*.html`·`play/*.html` — 생성된 정적 페이지(커밋). `vercel.json`·`robots.txt`·`sitemap.xml` — 커밋.
- `editor.html` — 로컬 텍스트 에디터(gitignore). `deploy.command` — 배포 버튼(gitignore, generate.mjs 자동 실행).
- `README.md`(이미지 가이드) · `WORKLOG.md`(이력) · `HANDOFF.md`(이 파일).
- 이미지: `images/works/{moints,gongil,wal,ccbook,ccin,sqnc,txtclub,frip}/`, `images/playground/{silhouette,seed,town,art4u}/`, `images/og.{webp,jpg}`.
- 메모리: `~/.claude/projects/-Users-eunyong-portfolio-web/memory/` — MEMORY.md(인덱스), project_portfolio.md, user_profile.md, korean-word-break.md, **work-rules.md**(배포·JS안전·성과카드·에디터·인프라·CSP·생성기·라우터·robots·GA4), **design-guide.md**(디자인 시스템 전체).

## 10. SEO·진짜 URL·정적 페이지·분석·보안 (커밋 5a82216+)
- **생성기 `generate.mjs`**: `index.html`의 데이터 리터럴(works·categoryLabels·seedDetail·photoDetail·tmtDetail·artDetail)을 `vm`으로 추출 → `/works/{id}.html`·`/play/{key}.html` 12개 + `sitemap.xml` 생성. **데이터는 index.html에 그대로 둠**(editor.html 영향 없음). 데이터 구조 변경 시 generate.mjs의 render 함수(workBody/detailBody/renderBlocksStatic)도 갱신. 실행: `node generate.mjs`(deploy.command가 배포 직전 자동 실행).
- **라우터(진짜 경로)**: 상세 열람 = `/works/{id}`·`/play/{key}` pushState(해시 아님). `<base href="/">` 필수(없으면 서브경로에서 상대경로 이미지 깨짐). currentRoute/markDetailOpen/parseRoute(경로+구해시 호환)/applyRoute/popstate/initialRoute. 직접 진입·크롤러는 정적 페이지가 응답.
- **정적 페이지**: 풀 SEO head(title·description·canonical·OG·JSON-LD CreativeWork) + 본문 전체 텍스트 → 검색·AI가 실제 내용 읽음(SPA는 JS라 비실행 크롤러가 못 읽던 문제 해결). 자체 경량 CSS, GA4 스니펫 포함.
- **JSON-LD**: index.html `<head>`에 Person+WebSite, 정적 페이지에 CreativeWork. `canonical` 모두 지정.
- **robots.txt(선택적 AI 차단)**: 일반 검색 전체 허용 / 생성형 AI 봇 26종은 `/works/`·`/play/` 상세만 차단(홈=간단정보 허용). **⚠️ 새 경로 디렉터리 추가 시 robots도 갱신**.
- **vercel.json**: `cleanUrls:true`(`.html` 자동 정리, 308) + 보안 헤더(X-Frame-Options·nosniff·Referrer-Policy·Permissions-Policy·**CSP**). **⚠️ 외부 리소스(폰트·CDN·스크립트·분석) 추가 시 CSP 허용목록 갱신 필수**(현재: jsdelivr·google fonts·googletagmanager·google-analytics, 'unsafe-inline'). 헤더는 로컬 미적용 → 실서버 `curl -sI`로 검증.
- **GA4(`G-75SJSREK34`)**: index.html `<head>`(2곳)+generate.mjs(GA4 상수) 동일 유지. 상세 열람=가상 page_view(markDetailOpen→gaView: 프로젝트별 조회·유입·체류·이탈), 네비 클릭=menu_click 이벤트. ID 변경 시 두 파일 모두 교체.
- **콘텐츠 복사 방지**: body `user-select:none` + JS로 우클릭·복사·드래그·선택 차단(억제 수준; 소스보기·크롤러는 못 막음). 이메일 클립보드 복사는 programmatic이라 정상.
