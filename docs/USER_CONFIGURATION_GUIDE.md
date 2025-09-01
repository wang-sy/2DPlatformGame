# User Configuration Guide

## 🎮 Create Games Without Coding!

This guide helps designers, artists, and hobbyists create complete platform games using visual tools and simple configuration. **No programming required!**

## ✨ What You Can Create

- **Custom Levels**: Design unique worlds with Tiled editor
- **Player Abilities**: Configure jumping, shooting, wall-climbing
- **Enemy Behaviors**: Set up 8 different AI patterns
- **Interactive Objects**: Create triggers, platforms, collectibles
- **Mobile Games**: Automatic touch controls for phones/tablets
- **Visual Effects**: Particles, animations, screen effects

## 🚀 Quick Start (10 Minutes)

### Step 1: Install Tools

1. **[Tiled Map Editor](https://www.mapeditor.org/)** (Free)
   - Visual level designer
   - No coding needed

2. **Text Editor** (Choose one)
   - [VS Code](https://code.visualstudio.com/) (Recommended)
   - Notepad++ (Windows)
   - TextEdit (Mac)

3. **Image Editor** (Optional)
   - [Aseprite](https://www.aseprite.org/) (Pixel art)
   - [GIMP](https://www.gimp.org/) (Free)
   - [Paint.NET](https://www.getpaint.net/) (Windows)

### Step 2: Project Structure

```
your-game/
├── 📁 public/assets/
│   ├── 🎮 player/          → Character graphics
│   ├── 👾 enemy/           → Enemy sprites
│   ├── 🗺️ tilemap/         → Your levels
│   ├── 💎 collectible/     → Items to collect
│   ├── 🎵 audio/           → Music & sounds
│   └── 🎨 ui/              → Interface graphics
└── 📁 src/config/
    └── gameConfig.ts       → Game settings
```

## 🎯 Game Configuration

### Basic Settings

Edit `src/config/gameConfig.ts` (just change the numbers!):

```javascript
export const gameConfig = {
  // === DIFFICULTY ===
  playerHealth: 3,        // Lives (1-10)
  playerSpeed: 160,       // Movement (50-300)
  jumpHeight: 330,        // Jump power (200-500)
  
  // === ENEMIES ===
  enemySpeed: 50,         // Enemy speed (20-150)
  enemyDamage: 1,         // Damage dealt (1-3)
  
  // === PHYSICS ===
  gravity: 600,           // Fall speed (100-1000)
  
  // === FEATURES ===
  doubleJump: true,       // Allow double jump
  wallJump: true,         // Allow wall jumping
  chargedJump: true,      // Hold to jump higher
  superJump: true         // Special high jump
};
```

### Difficulty Presets

**Easy Mode:**
```javascript
playerHealth: 5,
enemySpeed: 30,
gravity: 400
```

**Normal Mode:**
```javascript
playerHealth: 3,
enemySpeed: 50,
gravity: 600
```

**Hard Mode:**
```javascript
playerHealth: 1,
enemySpeed: 100,
gravity: 800
```

## 🗺️ Level Design with Tiled

### Creating Your First Level

1. **Open Tiled**
2. **File → Open** → `public/assets/tilemap/scenes/tilemap.json`
3. **Edit your level**
4. **Save (Ctrl+S)**
5. **Refresh browser** to see changes!

### Essential Layers

- **Terrain Layer**: Draw platforms and walls
- **Objects Layer**: Place enemies, items, triggers
- **Background Layer**: Decorative elements

### Drawing Platforms

1. Select **Terrain Layer**
2. Pick tiles from **Tileset** panel
3. Use tools:
   - 🖌️ **Stamp** (B): Place single tiles
   - ✏️ **Line** (L): Draw straight lines
   - 🪣 **Fill** (F): Fill areas
   - 🔲 **Rectangle** (R): Draw rectangles

### Adding Game Elements

1. Select **Objects Layer**
2. Press **Insert Rectangle** (R)
3. Draw object boundary
4. Set properties in panel

## 👤 Player Setup

### Player Properties (in Tiled)

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| type | string | Must be "player" | "player" |
| name | string | Sprite name | "character_purple" |
| uuid | string | Unique ID | "player-001" |
| max_health | int | Starting lives | 3 |
| speed | float | Movement speed | 160 |
| jump_velocity | float | Jump power | -330 |

### Player Abilities

Enable/disable features per level:

```json
{
  "can_jump": true,
  "can_double_jump": true,
  "can_wall_jump": true,
  "can_shoot": true,
  "can_charged_jump": true,
  "can_super_jump": true
}
```

## 👾 Enemy Configuration

### Enemy Types (AI Behaviors)

1. **static**: Doesn't move
2. **patrol**: Walks back and forth
3. **jump**: Jumps in place
4. **moveJump**: Walks and jumps
5. **patrolJump**: Patrols with jumping
6. **follow**: Chases player
7. **followJump**: Chases and jumps
8. **custom**: Special behavior

### Enemy Properties (in Tiled)

| Property | Type | Description | Range |
|----------|------|-------------|--------|
| type | string | Must be "enemy" | "enemy" |
| name | string | Enemy sprite | "enemy_red" |
| ai_type | string | Behavior type | See list above |
| speed | float | Movement speed | 20-150 |
| health | int | Hit points | 1-5 |
| damage | int | Damage to player | 1-3 |
| patrol_distance | float | Patrol range | 50-500 |
| detection_range | float | Player detection | 100-300 |
| jump_interval | int | Jump frequency (ms) | 1000-5000 |

### Example: Patrolling Enemy

```json
{
  "type": "enemy",
  "name": "enemy_green",
  "ai_type": "patrol",
  "speed": 50,
  "health": 2,
  "damage": 1,
  "patrol_distance": 200
}
```

## 💎 Collectibles

### Collectible Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| type | string | Must be "collectible" | "collectible" |
| name | string | Item sprite | "gem_blue" |
| uuid | string | Unique ID | "gem-001" |
| points | int | Score value | 10 |
| required | bool | Needed to win | false |
| particle_color | string | Effect color | "#FFD700" |

### Special Collectibles

**Required Item** (must collect to win):
```json
{
  "type": "collectible",
  "name": "key_gold",
  "required": true,
  "points": 50
}
```

**Bonus Item** (optional):
```json
{
  "type": "collectible",
  "name": "star",
  "required": false,
  "points": 100,
  "particle_color": "#FFFF00"
}
```

## 🎯 Trigger System

Create interactive mechanics without coding!

### Trigger Types

1. **move**: Move objects
2. **scale**: Resize objects
3. **rotate**: Spin objects
4. **destroy**: Remove objects
5. **spawn**: Create objects
6. **teleport**: Instant move

### Trigger Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| type | string | Must be "trigger" | "trigger" |
| trigger_type | string | Action type | "move" |
| target_uuids | string | Target IDs (comma-separated) | "platform-1,platform-2" |
| move_x | float | Horizontal movement | 100 |
| move_y | float | Vertical movement | -50 |
| duration | int | Animation time (ms) | 2000 |
| delay | int | Start delay (ms) | 500 |
| repeat | int | Repeat count (-1 = infinite) | 3 |
| return_to_origin | bool | Return after action | true |

### Example: Moving Platform

```json
{
  "type": "trigger",
  "trigger_type": "move",
  "target_uuids": "platform-001",
  "move_x": 200,
  "move_y": 0,
  "duration": 3000,
  "return_to_origin": true,
  "repeat": -1
}
```

## 🎨 Visual Assets

### Sprite Requirements

- **Format**: PNG with transparency
- **Player Size**: 32x32 or 64x64 pixels
- **Enemy Size**: 32x32 pixels
- **Tile Size**: 32x32 pixels

### Animation Frames

Create sprite sheets with frames:

```
player_idle: frames 0-3
player_run: frames 4-11
player_jump: frames 12-13
player_fall: frames 14-15
```

### Replacing Graphics

1. Navigate to `public/assets/[type]/`
2. Replace PNG files (keep same names)
3. Update atlas JSON if needed
4. Refresh browser

## 🎵 Audio Configuration

### Audio Files

Place in `public/assets/audio/`:

- **BGM**: MP3 format, looping tracks
- **SFX**: MP3/OGG, short sounds

### BGM Configuration

Edit `public/assets/audio/bgm/bgm-config.json`:

```json
{
  "MainMenu": "menu-music",
  "GameScene": "level1-music",
  "BossLevel": "boss-music"
}
```

### SFX Configuration

Edit `public/assets/audio/sfx/sfx-config.json`:

```json
{
  "player_jump": ["jump1", "jump2"],
  "player_land": "land",
  "enemy_death": "explosion",
  "collect_coin": "coin"
}
```

## 📱 Mobile Support

Your game automatically works on mobile devices!

### Mobile Features

- **Auto-detect**: Knows when on phone/tablet
- **Virtual Joystick**: Touch movement control
- **Action Buttons**: Jump and shoot buttons
- **Fullscreen**: Automatic fullscreen support
- **Responsive**: Adapts to any screen size

### Mobile Testing

1. Start dev server: `npm run dev`
2. Find your IP: shown in terminal
3. Open on phone: `http://[your-ip]:5173`

## 🎯 Goal & Victory

### Goal Object Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| type | string | Must be "goal" | "goal" |
| name | string | Goal sprite | "door_exit" |
| require_all_items | bool | Need all collectibles | true |
| next_level | string | Next scene name | "Level2" |

## ⚠️ Hazards

### Hazard Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| type | string | Must be "hazard" | "hazard" |
| name | string | Hazard sprite | "spikes" |
| damage | int | Damage dealt | 1 |
| kill_instantly | bool | One-hit kill | false |

## 🚀 Advanced Techniques

### Multi-Level Games

1. Create multiple tilemap files
2. Name them: `level1.json`, `level2.json`, etc.
3. Set `next_level` property on goal objects

### Custom Physics Areas

Create invisible objects with properties:

```json
{
  "type": "physics_zone",
  "gravity_x": 0,
  "gravity_y": -300,  // Reverse gravity!
  "friction": 0.5
}
```

### Checkpoints

```json
{
  "type": "checkpoint",
  "uuid": "checkpoint-1",
  "activated_texture": "flag_green",
  "inactive_texture": "flag_red"
}
```

## 🐛 Testing Your Game

### Quick Test Cycle

1. **Edit** in Tiled
2. **Save** (Ctrl+S)
3. **Switch** to browser
4. **Refresh** (F5)
5. **Test** your changes

### Debug Mode

Add to URL: `?debug=true`

Shows:
- Collision boxes
- Object IDs
- Performance stats

## 💡 Pro Tips

### Performance

- Keep enemy count under 20 per level
- Use object pooling for projectiles
- Limit particle effects

### Level Design

- Start levels easy, increase difficulty
- Teach mechanics gradually
- Place checkpoints before hard sections
- Reward exploration with bonus items

### Mobile Optimization

- Test on real devices
- Keep UI elements large
- Avoid precise platforming on mobile
- Use auto-run sections

## 📚 Examples

### Example 1: Elevator Platform

```json
{
  "type": "trigger",
  "trigger_type": "move",
  "target_uuids": "elevator-1",
  "move_y": -200,
  "duration": 3000,
  "delay": 1000,
  "return_to_origin": true,
  "repeat": -1
}
```

### Example 2: Boss Enemy

```json
{
  "type": "enemy",
  "name": "boss_skull",
  "ai_type": "follow",
  "speed": 80,
  "health": 10,
  "damage": 2,
  "detection_range": 400
}
```

### Example 3: Secret Area

```json
{
  "type": "trigger",
  "trigger_type": "destroy",
  "target_uuids": "secret_wall",
  "delay": 0
}
```

## 🆘 Troubleshooting

### Game Won't Load
- Check browser console (F12)
- Verify JSON syntax
- Ensure all file paths correct

### Tiled Changes Don't Appear
- Save the file in Tiled
- Hard refresh browser (Ctrl+F5)
- Check file path in game

### Performance Issues
- Reduce enemy count
- Simplify particle effects
- Use smaller textures

## 🎉 You're Ready!

Start creating your game:

1. Open Tiled
2. Design your level
3. Test in browser
4. Share with friends!

**Remember**: No coding needed - everything is configuration!