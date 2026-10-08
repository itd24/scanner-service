#!/bin/bash

# Directory the scanned files are written to. Override with SCAN_DIR if needed.
scan_dir="${SCAN_DIR:-$HOME/Documents/Scans}"
mkdir -p "$scan_dir"

# Set the output file name and location
output_file="$scan_dir/scan_$(date +%Y%m%d_%H%M%S)_p%04d.tiff"
output_pdf="$scan_dir/scan_$(date +%Y-%m-%d_%H:%M:%S).pdf"

scanimage --format tiff --batch="$output_file" --resolution 150 --ScanMode Duplex
convert "$scan_dir"/*.tiff -quality 100 "$output_pdf"
rm "$scan_dir"/*.tiff

echo "Scanned document saved as $output_pdf"