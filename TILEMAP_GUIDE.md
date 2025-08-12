# Tilemap 配置详解

本文档详细说明 tilemap.json 的结构和配置方法。

## 1. Tilesets（贴图集）

### 基本结构

```json
{
  "firstgid": 1,
  "name": "terrain_grass_block_center",
  "image": "assets/tilemap/tiles/terrain_grass_block_center.png",
  "imagewidth": 64,
  "imageheight": 64,
  "margin": 0,
  "spacing": 0,
  "tilecount": 1,
  "tileheight": 64,
  "tilewidth": 64,
  "tiles": [...]
}
```

### firstgid 赋值逻辑

firstgid（first global ID）是每个tileset的起始ID，必须按顺序递增：

- 第1个tileset: `firstgid: 1`
- 第2个tileset: `firstgid: 2`（如果第1个tileset只有1个tile）
- 第3个tileset: `firstgid: 3`（如果前面共有2个tiles）
- 依此类推...

**计算公式**: 
```
下一个firstgid = 当前firstgid + 当前tilecount
```

**示例**:
```json
[
  {"firstgid": 1, "tilecount": 1, "name": "grass_center"},    // ID: 1
  {"firstgid": 2, "tilecount": 1, "name": "grass_top"},       // ID: 2
  {"firstgid": 3, "tilecount": 1, "name": "character"},       // ID: 3
  {"firstgid": 4, "tilecount": 1, "name": "spikes"},          // ID: 4
  {"firstgid": 5, "tilecount": 1, "name": "flag"}             // ID: 5
]
```

### Properties 配置

不同类型的素材需要不同的properties：

#### 地形瓦片（Terrain Tiles）
用于构建可碰撞的地面和平台：
```json
"tiles": [
  {
    "id": 0,  // tileset内部的局部ID，总是从0开始
    "properties": [
      {
        "name": "collision",
        "type": "bool",
        "value": true  // 启用碰撞检测，玩家不能穿过
      }
    ]
  }
]
```

#### 精灵图集（Sprite Atlas）
需要动画支持的资源（如角色、动态物体等）：
```json
"tiles": [
  {
    "id": 0,
    "properties": [
      {
        "name": "atlas",
        "type": "bool",
        "value": true  // 以atlas形式加载，需要对应的.json文件定义动画帧
      }
    ]
  }
]
```
**注意**：设置atlas为true时，系统会自动寻找同名的.json文件作为图集配置。例如`character_purple.png`会配套寻找`character_purple.json`。

#### 危险物（Hazards）
会对玩家造成伤害的物体：
```json
"tiles": [
  {
    "id": 0,
    "properties": [
      {
        "name": "damage",
        "type": "int",
        "value": 1  // 伤害值，碰到扣除的血量
      }
    ]
  }
]
```


### Properties 含义总结

| Property名称 | 类型 | 作用 | 适用对象 |
|------------|------|------|---------|
| collision | bool | 是否可碰撞（true=实体） | 地形瓦片 |
| atlas | bool | 是否以图集形式加载（true=需要.json配置文件） | 任何需要动画的资源 |
| damage | int | 造成的伤害值 | 危险物 |

## 2. Tile Layer（瓦片图层）

### 基本结构

```json
{
  "type": "tilelayer",
  "name": "Level1",
  "width": 25,      // 地图宽度（格子数）
  "height": 19,     // 地图高度（格子数）
  "x": 0,
  "y": 0,
  "visible": true,
  "opacity": 1,
  "data": [...]     // 地图数据数组
}
```

### 字段说明

- **type**: 必须为 "tilelayer"
- **name**: 图层名称，可自定义
- **width/height**: 定义地图尺寸（格子数量）
- **data**: 一维数组，长度必须等于 width × height

### 地图定义方法

data数组按从左到右、从上到下的顺序排列：

```
位置计算: index = y * width + x

示例（5×3的地图）:
[
  1,1,1,1,1,  // 第1行 (y=0)
  0,0,0,0,0,  // 第2行 (y=1)  
  2,2,2,2,2   // 第3行 (y=2)
]
```

### ID对应关系

data数组中的数字对应tilesets的firstgid：

- `0` = 空（无瓦片）
- `1` = firstgid为1的tileset（如grass_center）
- `2` = firstgid为2的tileset（如grass_top）
- `3` = firstgid为3的tileset（如character）
- 以此类推...

**完整示例**:
```json
{
  "type": "tilelayer",
  "name": "Ground",
  "width": 10,
  "height": 5,
  "data": [
    0,0,0,0,0,0,0,0,0,0,  // 空行
    0,0,2,2,2,2,0,0,0,0,  // 草地顶部（firstgid=2）
    0,0,1,1,1,1,0,0,0,0,  // 草地中心（firstgid=1）
    2,2,2,2,2,2,2,2,2,2,  // 完整地面顶部
    1,1,1,1,1,1,1,1,1,1   // 完整地面主体
  ]
}
```

## 3. Objects Layer（对象图层）

### 基本结构

```json
{
  "type": "objectgroup",
  "name": "Objects",
  "visible": true,
  "opacity": 1,
  "x": 0,
  "y": 0,
  "objects": [...]  // 对象数组
}
```

### 对象结构

每个对象包含：
```json
{
  "gid": 3,                    // 对应tileset的firstgid
  "id": 38,                    // 对象的唯一ID（系统生成）
  "name": "character_purple",  // ⚠️ 必须与tileset的name完全一致！
  "type": "player",            // 对象类型（决定游戏行为）
  "visible": true,
  "rotation": 0,
  "x": 64,                     // X坐标（像素）
  "y": 960,                    // Y坐标（像素）
  "width": 64,                 // 宽度（像素）
  "height": 64                 // 高度（像素）
}
```

### ⚠️ 重要：name 字段匹配规则

**对象的 `name` 必须与对应 tileset 的 `name` 完全一致！**

这是因为系统通过 name 来查找并加载正确的贴图资源。

**正确示例**：
```json
// tileset 定义
{
  "firstgid": 4,
  "name": "spikes",  // tileset名称
  "image": "assets/hazards/spikes.png"
}

// object 使用
{
  "gid": 4,
  "name": "spikes",  // ✅ 与tileset的name一致
  "type": "hazard"
}
```

**错误示例**：
```json
// tileset 定义
{
  "firstgid": 4,
  "name": "spikes",
  "image": "assets/hazards/spikes.png"
}

// object 使用
{
  "gid": 4,
  "name": "spike",   // ❌ 错误！少了s
  "type": "hazard"
}

{
  "gid": 4,
  "name": "Spikes",  // ❌ 错误！大小写不一致
  "type": "hazard"
}
```

### 支持的对象类型（type）

系统根据type字段决定对象的行为：

#### 1. player（玩家）
```json
{
  "type": "player",
  "name": "character_purple",
  "x": 100,
  "y": 500,
  "width": 64,   // 决定角色显示大小
  "height": 64   // 决定角色显示大小
}
```
- 游戏主角，受玩家控制
- 每个关卡只能有一个
- 拥有生命值、跳跃等能力

#### 2. hazard（危险物）
```json
{
  "type": "hazard",
  "name": "spikes",
  "x": 200,
  "y": 500,
  "width": 64,   // 决定危险区域大小
  "height": 64   // 决定危险区域大小
}
```
- 静态危险物，碰触造成伤害
- 可放置多个
- 伤害值由tileset的properties定义

#### 3. goal（目标）
```json
{
  "type": "goal",
  "name": "flag_green_a",
  "x": 1400,
  "y": 100,
  "width": 64,   // 决定触发区域大小
  "height": 64   // 决定触发区域大小
}
```
- 关卡终点，触碰后通关
- 通常为旗帜或传送门
- 建议每关只有一个

### width和height的作用

width和height影响对象的多个方面：

1. **视觉显示**
   - 决定贴图的缩放比例
   - 原图64×64，设置width:128会放大2倍

2. **碰撞检测**
   - 影响碰撞体积的初始大小
   - 实际碰撞体积可能会在代码中调整

3. **交互范围**
   - 对于goal，决定触发通关的范围
   - 对于hazard，决定造成伤害的范围

**示例：不同尺寸的配置**
```json
"objects": [
  {
    "type": "hazard",
    "name": "spikes_small",
    "width": 32,   // 小型尖刺
    "height": 32
  },
  {
    "type": "goal",
    "name": "flag",
    "width": 64,   // 标准尺寸旗帜
    "height": 96   // 高度略大，更容易触碰
  }
]
```

## 完整配置示例

```json
{
  "width": 10,
  "height": 5,
  "tilewidth": 64,
  "tileheight": 64,
  "layers": [
    {
      "type": "tilelayer",
      "name": "Ground",
      "width": 10,
      "height": 5,
      "data": [
        0,0,0,0,0,0,0,0,0,0,
        0,0,0,2,2,2,0,0,0,0,
        0,0,0,1,1,1,0,0,0,0,
        2,2,2,2,2,2,2,2,2,2,
        1,1,1,1,1,1,1,1,1,1
      ]
    },
    {
      "type": "objectgroup",
      "name": "Objects",
      "objects": [
        {
          "gid": 3,
          "type": "player",
          "name": "character_purple",
          "x": 64,
          "y": 256,
          "width": 64,
          "height": 64
        },
        {
          "gid": 4,
          "type": "hazard",
          "name": "spikes",
          "x": 320,
          "y": 256,
          "width": 64,
          "height": 64
        },
        {
          "gid": 5,
          "type": "goal",
          "name": "flag_green_a",
          "x": 576,
          "y": 256,
          "width": 64,
          "height": 64
        }
      ]
    }
  ],
  "tilesets": [
    {
      "firstgid": 1,
      "name": "terrain_grass_block_center",
      "image": "assets/tilemap/tiles/terrain_grass_block_center.png",
      "tilecount": 1,
      "tiles": [
        {
          "id": 0,
          "properties": [
            {"name": "collision", "type": "bool", "value": true}
          ]
        }
      ]
    },
    {
      "firstgid": 2,
      "name": "terrain_grass_block_top",
      "image": "assets/tilemap/tiles/terrain_grass_block_top.png",
      "tilecount": 1,
      "tiles": [
        {
          "id": 0,
          "properties": [
            {"name": "collision", "type": "bool", "value": true}
          ]
        }
      ]
    },
    {
      "firstgid": 3,
      "name": "character_purple",
      "image": "assets/player/character_purple.png",
      "tilecount": 1,
      "tiles": [
        {
          "id": 0,
          "properties": [
            {"name": "atlas", "type": "bool", "value": true}
          ]
        }
      ]
    },
    {
      "firstgid": 4,
      "name": "spikes",
      "image": "assets/hazards/spikes.png",
      "tilecount": 1,
      "tiles": [
        {
          "id": 0,
          "properties": [
            {"name": "damage", "type": "int", "value": 1}
          ]
        }
      ]
    },
    {
      "firstgid": 5,
      "name": "flag_green_a",
      "image": "assets/goal/flag_green_a.png",
      "tilecount": 1
    }
  ]
}
```