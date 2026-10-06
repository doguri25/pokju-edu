#!/bin/sh
# src/ 의 조각 파일을 순서대로 이어 붙여 두 파일을 만든다.
#   index.html          브라우저에서 바로 열 수 있는 완성 파일 (GitHub Pages 용)
#   dist/artifact.html  Claude 아티팩트에 게시하는 본문 조각 (doctype, html, body 없음)
# 모든 js 조각은 하나의 즉시 실행 함수 안에 들어가므로 순서를 바꾸면 안 된다.
# @spell 자리에는 data/spell.json(맞춤법 문제 묶음)이 들어간다.
set -e
cd "$(dirname "$0")"
mkdir -p dist
PARTS="head3.html part_base.js js_hill.js js_world3.js js_region.js js_audio2.js part_weapons.js js_specs.js js_cars3.js part_cartail.js part_enemy.js part_fx.js js_ga.js js_proj2.js js_extra.js js_weather.js js_modes.js js_polish.js js_story.js js_quiz.js @spell js_gate.js js_chapters.js js_link.js js_gb.js"
: > dist/artifact.html
for p in $PARTS; do
  if [ "$p" = "@spell" ]; then
    # 맞춤법 문제 묶음: data/spell.json 을 그대로 넣는다 (JSON 은 그대로 JavaScript 값이다)
    { printf '  var SPELL_DATA = '; cat data/spell.json; printf ';\n'; } >> dist/artifact.html
  else
    cat "src/$p" >> dist/artifact.html
  fi
done
printf '</script>\n' >> dist/artifact.html
{
  printf '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">\n<style>html, body { margin: 0; height: 100%%; } body { font: 14px system-ui, sans-serif; }</style>\n</head>\n<body>\n'
  cat dist/artifact.html
  printf '</body>\n</html>\n'
} > index.html
# 문법 확인 (node 가 있을 때만)
if command -v node >/dev/null 2>&1; then
  awk '/^<script>$/ { on = 1; next } /^<\/script>$/ { on = 0 } on' dist/artifact.html > dist/check.js
  node --check dist/check.js && echo "문법 확인 통과"
  rm -f dist/check.js
fi
wc -c index.html dist/artifact.html
