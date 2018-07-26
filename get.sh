#!/bin/sh

set -euo pipefail

# Use a locally cached file for speed.
mp4='http://localhost:3000/SampleVideo_720x480_1mb.mp4'

# Uncomment this if you prefer to fetch a video from a 3rd-party URL.
#mp4='https://www.sample-videos.com/video/mp4/240/big_buck_bunny_240p_1mb.mp4'

curl http://localhost:3000/ \
    -d 'token=42' \
    -d "url=$mp4" \
    -d "url=$mp4"
