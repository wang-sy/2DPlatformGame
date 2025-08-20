# BGM 音乐系统使用指南

## 系统概述
本项目使用 BGMPlayer 管理游戏背景音乐，支持场景切换、音乐循环、音量控制等功能。

## 添加新 BGM 的步骤

### 1. 添加音频文件
将 MP3 格式的音频文件放入 `/public/assets/audio/bgm/` 目录。

### 2. 配置 BGM
编辑 `/public/assets/audio/bgm-config.json` 文件：

```json
{
  "scenes": {
    "场景名称": {
      "bgm": "音乐标识符",
      "loop": true,      // 是否循环播放
      "volume": 0.5       // 音量（0-1）
    }
  },
  "bgmList": {
    "音乐标识符": {
      "url": "/assets/audio/bgm/音频文件名.mp3",
      "preload": false   // 是否预加载
    }
  }
}
```

### 3. 在代码中使用

```typescript
import { BGMPlayer } from './managers/BGMPlayer';

// 初始化 BGMPlayer
const bgmPlayer = new BGMPlayer();

// 播放指定场景的 BGM
bgmPlayer.playScene('Game');

// 停止当前 BGM
bgmPlayer.stop();

// 调整音量
bgmPlayer.setVolume(0.8);

// 淡入淡出效果
bgmPlayer.fadeIn('Game', 2000);  // 2秒淡入
bgmPlayer.fadeOut(1000);         // 1秒淡出
```

## 当前配置的 BGM

- **MainMenu**: Baltic Levity.mp3 - 主菜单音乐，循环播放
- **Game**: Alls Fair In Love.mp3 - 游戏进行中音乐，循环播放  
- **Victory**: Attic Secrets.mp3 - 胜利音乐，播放一次
- **GameOver**: Baltic Levity.mp3 - 游戏结束音乐，播放一次

## 注意事项

1. 音频文件建议使用 MP3 格式以获得最佳兼容性
2. 文件名中的空格会被保留，确保 URL 路径正确
3. preload 设置为 true 的音乐会在游戏启动时预加载
4. 音量范围为 0（静音）到 1（最大音量）