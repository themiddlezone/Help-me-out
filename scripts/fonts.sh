#!/usr/bin/env bash
# Rebuilds the self-hosted font files in src/assets/fonts. They live under src
# rather than public so Vite fingerprints them and applies the Pages base path.
#
# Google Sans Flex is instanced down to the axes the site actually animates
# (weight, width and roundness), with optical size pinned at its default and
# slant dropped, then subset to Latin. That takes the 3.9 MB upstream file to
# roughly 150 KB.
#
# Material Symbols comes straight from the Google Fonts API with icon_names,
# so only the glyphs listed below are shipped. FILL stays variable so selected
# nav items can animate to the filled style.
#
# Needs: curl, python3 with fonttools and brotli (pip install fonttools brotli)

set -euo pipefail

cd "$(dirname "$0")/.."
out=src/assets/fonts
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

gsf_url='https://raw.githubusercontent.com/google/fonts/main/ofl/googlesansflex'

echo "Google Sans Flex"
curl -fsSL -o "$tmp/gsf.ttf" "$gsf_url/GoogleSansFlex%5BROND%2Copsz%2Cslnt%2Cwdth%2Cwght%5D.ttf"
curl -fsSL -o "$out/OFL.txt" "$gsf_url/OFL.txt"

fonttools varLib.instancer "$tmp/gsf.ttf" \
  slnt=0 opsz=18 wght=200:1000 wdth=25:151 \
  -o "$tmp/gsf-instanced.ttf" -q

pyftsubset "$tmp/gsf-instanced.ttf" \
  --unicodes='U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+20AC,U+2122,U+2190-2193,U+2212' \
  --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk,tnum,case' \
  --flavor=woff2 \
  --output-file="$out/google-sans-flex.woff2"

echo "Material Symbols Rounded"
# Keep this list sorted, the API rejects unsorted icon_names.
icons=(
  add android animation arrow_back arrow_forward arrow_outward bolt bug_report
  build check chevron_right close construction content_copy deployed_code
  description download expand_more favorite folder folder_zip help history home
  hourglass_top info lock_open mail memory menu_book motion_photos_auto
  motion_photos_off open_in_new schedule science search smartphone tag terminal
  update verified warning
)
names=$(IFS=,; echo "${icons[*]}")
ua='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
css=$(curl -fsSL -A "$ua" "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0&icon_names=$names&display=block")
woff2=$(grep -o 'https://[^)]*' <<<"$css" | head -n1)
curl -fsSL -o "$out/material-symbols-rounded.woff2" "$woff2"
curl -fsSL -o "$out/LICENSE-material-symbols.txt" \
  'https://raw.githubusercontent.com/google/material-design-icons/master/LICENSE'

ls -l "$out"
