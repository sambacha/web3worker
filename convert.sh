## WebP
find ./ -type f -name '*.png' -exec sh -c 'cwebp -lossless $1 -o "${1%.png}.webp"' _ {} \;\n

## AVIF (s=speed / 0-10 / slowest-fastest)
find ./ -type f -name '*.png' -exec sh -c 'avifenc -s 6 $1 -o "${1%.png}.avif"' _ {} \;