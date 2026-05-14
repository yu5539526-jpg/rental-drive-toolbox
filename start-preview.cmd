@echo off
cd /d "%~dp0"
echo Starting rental drive toolbox local preview...
echo.
echo Development preview for this computer only:
echo   http://127.0.0.1:5173/
echo.
echo Do not share this local address on Xiaohongshu.
echo For public access, deploy dist to Vercel, Netlify, or GitHub Pages.
echo.
echo Keep this window open while previewing.
echo.
node "%~dp0node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173 --strictPort
pause
