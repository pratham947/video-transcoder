#!/bin/bash

# Check if FILE_NAME variable is provided
if [ -z "$FILE_NAME" ]; then
    echo "Please provide the name of the video file."
    exit 1
fi

# Check if KEY variable is provided
if [ -z "$KEY" ]; then
    echo "Please provide the KEY for the output folder."
    exit 1
fi

output_dir="/uploads/$KEY"
mkdir -p "$output_dir"

# Perform ffmpeg operations to convert video to different resolutions
ffmpeg -i "/uploads/$FILE_NAME" -vf "scale=426:240" -c:a copy "$output_dir/output_240p.mp4"

ffmpeg -i "/uploads/$FILE_NAME" -vf "scale=640:360" -c:a copy "/$output_dir/output_360p.mp4"

ffmpeg -i "/uploads/$FILE_NAME" -vf "scale=854:480" -c:a copy "/$output_dir/output_480p.mp4"

ffmpeg -i "/uploads/$FILE_NAME" -vf scale=-1:720 -c:v libx264 -crf 0 -preset veryslow -c:a copy "/$output_dir/MyMovie_720p.mkv"