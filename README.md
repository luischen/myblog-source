# Next Station Blog

这是 `luischen.github.io` 的 Hexo 博客源码目录。博客使用 Hexo 6 和 Fluid 主题，发布产物通过 `hexo deploy` 推送到 GitHub Pages 仓库。

## 工作笔记知识库同步

`D:\knowledgebase\Manulism Work` 是原始知识库，日常仍在该目录中维护。博客中只保存一份同步后的 Hexo 文章副本，位置是：

```text
source/_posts/manulism-work
```

同步脚本是：

```text
scripts/sync-manulism-work.js
```

同步后，每篇笔记会自动补充 Hexo front matter，并归入分类：

```yaml
categories:
  - 工作笔记
```

生成后的分类页路径为：

```text
categories/工作笔记/
```

## 日常维护流程

在原始知识库修改完成后，进入博客源码目录：

```powershell
cd D:\myblog
```

同步知识库笔记：

```powershell
npm run sync:manulism
```

本地构建检查：

```powershell
npm run build
```

如需本地预览：

```powershell
npm run server
```

确认无误后提交博客源码变更：

```powershell
git status
git add .
git commit -m "Sync work notes"
```

发布到 GitHub Pages：

```powershell
npm run deploy
```

## Git 管理说明

`D:\myblog` 是博客源码仓库，应该纳入版本管理的内容包括：

- Hexo 配置。
- 主题配置。
- 博客文章。
- `scripts/sync-manulism-work.js` 同步脚本。
- `source/_posts/manulism-work` 下的知识库同步副本。

以下内容不进入源码仓库：

- `node_modules/`
- `public/`
- `.deploy_git/`
- `db.json`

其中 `.deploy_git/` 是 Hexo 部署缓存和发布产物仓库，不是博客源码仓库。

## 同步脚本行为

`npm run sync:manulism` 会执行以下操作：

1. 读取 `D:\knowledgebase\Manulism Work`。
2. 扫描这些目录下的 Markdown 笔记：
   - `00_Home`
   - `10_Architecture`
   - `20_Domain_Knowledge`
   - `30_Projects`
   - `40_Templates_Standards`
3. 清空并重新生成 `source/_posts/manulism-work`。
4. 为每篇笔记生成 Hexo front matter。
5. 将 Obsidian 双链转换为普通 Markdown 链接。
6. 保留笔记正文中的 HTML 图表。

如果后续知识库目录变化，需要同步修改 `scripts/sync-manulism-work.js` 中的 `includeDirs`。
