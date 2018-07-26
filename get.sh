#!/bin/sh

set -euo pipefail

curl http://localhost:3000/ \
    -d 'url=http://0.0.0.0:8000/SampleVideo_720x480_1mb.mp4' \
    -d 'url=http://0.0.0.0:8000/SampleVideo_720x480_1mb.mp4'
