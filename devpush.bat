@echo off
chcp 65001 > nul
cd /d %~dp0

echo ===== develop に切り替え =====
git checkout develop

echo ===== 変更を追加 =====
git add .

echo.
set /p ver=バージョン（例: v1.1.1-beta.1）を入力:
set /p msg=コミット内容を入力:

echo ===== コミット =====
git commit -m "%ver% - %msg%"

echo ===== push（プレビュー） =====
git push origin develop

echo ===== 完了 =====
pause