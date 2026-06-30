#!/bin/bash
cd "$(dirname "$0")"

echo "▶ puppeteer-core 설치 확인 중..."
if [ ! -d "node_modules/puppeteer-core" ]; then
  npm install puppeteer-core
fi

echo "▶ PNG 생성 시작..."
node make_png.cjs
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ 완료! feed 폴더에서 PNG 파일을 확인하세요."
else
  echo "❌ 오류가 발생했어요. 위 메시지를 확인해주세요."
fi

read -p "엔터를 누르면 창이 닫힙니다..."
