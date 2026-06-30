/**
 * 인스타그램 피드 PNG 6장 생성
 * 실행: node make_png.cjs
 */

const puppeteer = require('puppeteer-core');
const http      = require('http');
const fs        = require('fs');
const path      = require('path');

// ── Chrome 경로 (Mac 기본값) ──────────────────────────────────
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const SLIDES = [
  'feed_01_cover',
  'feed_02_home',
  'feed_03_about_works',
  'feed_04_moints',
  'feed_05_silhouette',
  'feed_06_cta',
];

// ── 로컬 HTTP 서버 (CORS 우회) ──────────────────────────────────
function startServer(dir, port) {
  const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.png': 'image/png' };
  const server = http.createServer((req, res) => {
    const file = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('not found'); return; }
      const ext = path.extname(file);
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
  return new Promise(r => server.listen(port, () => r(server)));
}

(async () => {
  // Chrome 확인
  if (!fs.existsSync(CHROME_PATH)) {
    console.error('❌ Chrome을 찾을 수 없어요:', CHROME_PATH);
    process.exit(1);
  }

  // 로컬 서버 시작
  const port   = 18765;
  const server = await startServer(__dirname, port);
  console.log(`🌐 로컬 서버 시작 (포트 ${port})`);

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350 * SLIDES.length, deviceScaleFactor: 1 });

    console.log('📄 페이지 로딩 중...');
    await page.goto(`http://localhost:${port}/feed_slides.html`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // 웹폰트 + 이미지 로드 대기
    await new Promise(r => setTimeout(r, 3000));
    console.log('📸 스크린샷 캡처 중...');

    for (let i = 0; i < SLIDES.length; i++) {
      const outPath = path.join(__dirname, `${SLIDES[i]}.png`);
      await page.screenshot({
        path: outPath,
        clip: { x: 0, y: i * 1350, width: 1080, height: 1350 },
      });
      console.log(`  ✓ ${SLIDES[i]}.png`);
    }

    console.log('\n✅ 완료! PNG 6장이 feed/ 폴더에 저장됐습니다.');
  } catch (err) {
    console.error('\n❌ 오류 발생:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})();
