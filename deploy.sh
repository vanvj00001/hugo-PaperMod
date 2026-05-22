#!/bin/bash

echo "→ 🚀 构建 Hugo 站点..."
hugo

echo "→ 📦 推送到 GitHub Pages..."
cd public
git init
git remote add origin https://github.com/vanvj00001/wellness.git
git add .
git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
git branch -M gh-pages
git push -u origin gh-pages --force
cd ..

echo "✓ 完成！访问: https://vanvj00001.github.io/wellness/"
