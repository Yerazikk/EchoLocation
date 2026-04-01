import ffmpeg from 'ffmpeg-static';
import { execSync } from 'child_process';
import path from 'path';

const input = 'public/cam1.mp4';
const output = 'public/cam1_compressed.mp4';

console.log(`Using ffmpeg at: ${ffmpeg}`);
try {
  execSync(`"${ffmpeg}" -i "${input}" -vcodec libx264 -crf 28 -preset fast -acodec aac -b:a 128k "${output}"`, { stdio: 'inherit' });
  console.log('Compression successful!');
} catch (err) {
  console.error('Compression failed:', err);
  process.exit(1);
}
