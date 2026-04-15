# 🪪 AI Emoji 数字工卡生成器 (AI Emoji ID Card Generator)

这是一个具有纯粹“隔空体感”与未来赛博朋克 (Cyberpunk) 风格的 Web 应用程序。它通过调用设备前置摄像头，利用 AI 实时识别用户的手势，完成从“拍照 -> 生成 -> 预览 -> 确认 -> 下载”的全套流程。整个过程**不需要触碰屏幕或鼠标**，为您生成专属的 NFT 级数字身份卡片。

## ✨ 核心亮点 (Features)

- 📸 **手势拍照**：对着镜头比出 **剪刀手 (✌️)**，触发 HUD 系统倒数 5 秒的自动拍照。
- 🤚 **隔空悬浮选图**：照片分析完成后，进入沉浸式的画廊预览模式。左右**挥手**切换生成的不同风格的图片方案。
- 👍 **点赞确认**：锁定最满意的一张方案时，比出 **大拇指 (👍)** 手势 1.5 秒即可确认选择。
- 💎 **高级设计美学**：
  - 玻璃拟态 (Glassmorphism) 与深色模式。
  - 拟真的 HUD 相机焦距边框、呼吸扫描线、数据流信息提示。
  - 最终呈现代币风/极简资产展示风的工卡大图（附带独立追溯二维码）。
- 📥 **一键导出**：基于 `html-to-image` 将 DOM 高清渲染为图片并无损下载至本地。

## 🛠 技术栈 (Tech Stack)

- **框架**: [Next.js (App Router)](https://nextjs.org/) + React
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **动效**: [Framer Motion](https://www.framer.com/motion/)
- **计算机视觉**: [Google MediaPipe (Hands)](https://google.github.io/mediapipe/)
- **渲染导出**: `html-to-image` & `qrcode.react`

## 🚀 快速启动 (Getting Started)

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **启动本地开发服务器**:
   ```bash
   npm run dev
   ```

3. 打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可体验。

## 💡 交互动作集提示

- **✌️ 剪刀手** (食指中指竖起)：首页拍照。
- **🤚 左右挥动**：在结果预览页向左或向右切换渲染结果。
- **👍 大拇指点赞**：在右侧控制台监测区比出点赞，确认最终使用该方案。

---

*“用最极客的方式，重新定义你的数字分身。”*
