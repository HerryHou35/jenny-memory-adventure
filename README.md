# Jenny 的生日回忆冒险

一个手机优先的单页网页游戏。玩家沿着地图解锁七段共同回忆，完成轻量小游戏并收集七封信，最终开启生日视频。

## 本地预览

直接打开 `dist/index.html`，或在仓库根目录启动任意静态文件服务器并将根目录指向 `dist/`。

## 替换素材

把素材放在 `dist/assets/`：

- `birthday-video.mp4`：最终生日视频，推荐 H.264 编码的 MP4。
- `video-poster.jpg`：视频封面，推荐 16:9。

后续照片可以按章节命名后加入，例如 `hongdae-01.jpg`、`aquarium-01.jpg`、`campus-01.jpg`。

游戏进度保存在浏览器的 `localStorage` 中。
