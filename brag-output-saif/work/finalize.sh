#!/bin/zsh
# Poster (t=88.5 settled outro) baked as frame 0, soundtrack muxed, deliverables written to brag-output-saif/.
set -e
cd "$(dirname "$0")"
OUT=..
ffmpeg -v error -y -ss 88.5 -i video-0-90.mp4 -frames:v 1 -q:v 2 "$OUT/causaseal-saif-poster.jpg"
# Replace frame 0 with the poster; duration and sync unchanged.
ffmpeg -v error -y -i video-0-90.mp4 -loop 1 -t 0.0334 -i "$OUT/causaseal-saif-poster.jpg" -i soundtrack.wav \
  -filter_complex "[1:v]scale=1920:1080,setsar=1,fps=30,trim=end_frame=1,setpts=PTS-STARTPTS[p];[0:v]trim=start_frame=1,setpts=PTS-STARTPTS[r];[p][r]concat=n=2:v=1:a=0[v]" \
  -map "[v]" -map 2:a -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart -shortest \
  "$OUT/causaseal-saif-2026.mp4"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT/causaseal-saif-2026.mp4"
