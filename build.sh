#!/bin/sh
# 게임을 만든다. 실제 작업은 tools/build.mjs(Vite)가 한다. 처음 한 번은 npm install 이 필요하다.
#   index.html          브라우저에서 바로 열 수 있는 완성 파일 (GitHub Pages 용)
#   dist/artifact.html  Claude 아티팩트에 게시하는 본문 조각 (doctype, html, body 없음)
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
node tools/build.mjs
