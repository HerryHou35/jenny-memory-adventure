# Jenny 的生日回忆冒险

一个手机优先的像素回忆探索游戏：八个章节、跟随的花生、可重玩的放映室胶片墙，以及约 45 秒的回忆蒙太奇。

## 本地预览

直接打开 `dist/index.html`，或在仓库根目录启动任意静态文件服务器并将根目录指向 `dist/`。

## 替换素材

把素材放在 `dist/assets/`：

- `birthday-video.mp4`：最终生日视频，推荐 H.264 编码的 MP4。在 `dist/assets/ending.json` 把 `video` 设置为 `assets/birthday-video.mp4`。
- 没有生日视频时，终章使用已提供的真实合照与生日字幕；不会请求不存在的视频或显示损坏的播放器。

后续照片可以按章节命名后加入，例如 `hongdae-01.jpg`、`aquarium-01.jpg`、`campus-01.jpg`。

游戏进度保存在浏览器的 `localStorage` 中。

## 操作与重玩

点击地面或使用 WASD/方向键移动，靠近物品后点击动作按钮。空格或 Enter 也可执行动作和推进对白。英语卡片可从左上角随身物品栏拖到右侧日历。放映室胶片墙上的已完成章节可单独重玩；右上角“重玩”需确认后才清除整段进度。“◌”可减少动画效果，“♪”关闭声音。

## 文件组织与验证

- `dist/app.js`：八章原有玩法与基础场景绘制。
- `dist/polish.js`：导演层、拖拽、存档恢复、胶片墙、蒙太奇与音效。
- `dist/polish.css`：统一的电影框架、开场、交互和手机布局。
- `scripts/qa-v19.cjs`：浏览器集成检查，覆盖八章、拖拽、告别、结尾、刷新和重玩。仅加速测试中的移动距离与等待动画，阶段推进使用游戏动作。

运行 `node --check dist/app.js`、`node --check dist/polish.js`，浏览器检查为 `node scripts/qa-v19.cjs`。本机测试脚本使用已安装的 Playwright 和 Chrome，截图位于忽略的 `.sites-runtime/qa`。
