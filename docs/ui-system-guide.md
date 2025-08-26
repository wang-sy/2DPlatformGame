# UI System Guide

## Overview

The UI system in this framework provides a responsive, scalable interface management solution through the **UIManager** class. It handles different screen sizes, aspect ratios, and provides a declarative way to create UI layouts that automatically adapt to various display configurations.

## Table of Contents

1. [UIManager Core Concepts](#uimanager-core-concepts)
2. [Creating UI Layouts](#creating-ui-layouts)
3. [UI Element Types](#ui-element-types)
4. [Responsive Design](#responsive-design)
5. [Animations](#animations)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## UIManager Core Concepts

The UIManager is designed to handle UI creation and management with automatic responsive scaling. It uses a base resolution system and scales all UI elements proportionally to maintain consistent appearance across different screen sizes.

### Key Features

- 📐 **Responsive Positioning**: Use percentages or pixels for element placement
- 🎨 **Multiple Element Types**: Text, images, buttons, and containers
- 🎬 **Built-in Animations**: Smooth transitions and effects
- 📱 **Automatic Scaling**: Maintains aspect ratio and proportions
- 🔄 **Dynamic Updates**: Update elements after creation
- 🎯 **Interactive Elements**: Buttons with hover and click effects

### Basic Usage

```typescript
import { UIManager, UILayoutConfig } from '../managers/UIManager';

// In your scene's create method
const uiConfig: UILayoutConfig = {
    baseWidth: 1024,
    baseHeight: 768,
    scalingMode: 'fit',
    responsive: true,
    elements: {
        // UI elements defined here
    }
};

this.uiManager = new UIManager(this, uiConfig);
this.uiManager.createUI();
```

---

## Creating UI Layouts

### Configuration Structure

A UI layout configuration consists of:

```typescript
interface UILayoutConfig {
    elements: { [key: string]: UIElement };
    responsive?: boolean;           // Enable responsive scaling (default: true)
    baseWidth?: number;             // Reference width (default: 1920)
    baseHeight?: number;            // Reference height (default: 1080)
    scalingMode?: 'fit' | 'fill' | 'stretch' | 'none';
    minAspectRatio?: number;        // Minimum supported aspect ratio
    maxAspectRatio?: number;        // Maximum supported aspect ratio
}
```

### Positioning System

Positions can be specified in multiple ways:

- **Percentage**: `"50%"` - Relative to screen dimensions
- **Pixels**: `100` or `"100px"` - Absolute positioning (scaled)
- **Mixed**: Combine both for flexible layouts

```typescript
position: { 
    x: '50%',     // Center horizontally
    y: '25%'      // 25% from top
}
```

---

## UI Element Types

### 1. Text Elements

Display text with customizable styling:

```typescript
titleText: {
    type: 'text',
    text: 'Game Title',
    position: { x: '50%', y: '20%' },
    origin: { x: 0.5, y: 0.5 },
    style: {
        fontFamily: 'Arial Black',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
        shadow: {
            offsetX: 4,
            offsetY: 4,
            color: '#000000',
            blur: 8,
            fill: true
        }
    },
    depth: 10
}
```

### 2. Image Elements

Display images or sprites:

```typescript
logo: {
    type: 'image',
    texture: 'logo-texture',
    position: { x: '50%', y: '30%' },
    origin: { x: 0.5, y: 0.5 },
    scale: 1.5,
    tint: 0xffffff,  // Optional color tint
    alpha: 1,
    depth: 5
}
```

### 3. Button Elements

Interactive buttons with automatic hover/click effects:

```typescript
playButton: {
    type: 'button',
    text: 'PLAY GAME',
    position: { x: '50%', y: '60%' },
    scale: 1,
    textStyle: {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
    },
    texture: 'button-bg',  // Optional background image
    onClick: () => this.startGame(),
    onHover: () => console.log('Hovering'),
    onOut: () => console.log('Mouse out'),
    hoverScale: 1.1,      // Scale on hover
    clickScale: 0.95,     // Scale on click
    depth: 10
}
```

### 4. Container Elements

Group multiple elements together:

```typescript
menuContainer: {
    type: 'container',
    position: { x: '50%', y: '50%' },
    children: [
        // Child elements here
    ],
    scale: 1,
    alpha: 1,
    depth: 0
}
```

---

## Responsive Design

### Scaling Modes

The UIManager supports different scaling strategies:

| Mode | Description | Use Case |
|------|-------------|----------|
| `fit` | Maintains aspect ratio, fits within screen | Default, most games |
| `fill` | Maintains aspect ratio, fills entire screen | Full-screen experiences |
| `stretch` | Stretches to fill, may distort | Special effects |
| `none` | No automatic scaling | Pixel-perfect games |

### Handling Different Aspect Ratios

```typescript
const uiConfig: UILayoutConfig = {
    baseWidth: 1024,
    baseHeight: 768,
    scalingMode: 'fit',
    minAspectRatio: 4/3,    // Support 4:3 and wider
    maxAspectRatio: 21/9,   // Support up to ultra-wide
    // ...
};
```

### Dynamic Screen Resize

The UIManager automatically handles window resize events:

```typescript
// Automatic updates on resize
this.scale.on('resize', this.onResize, this);
```

---

## Animations

### Built-in Animation Support

Animate any UI element with the `animateElement` method:

```typescript
// Fade in animation
this.uiManager.animateElement('titleText', {
    alpha: { from: 0, to: 1 },
    duration: 1000,
    ease: 'Power2.easeOut'
});

// Scale bounce effect
this.uiManager.animateElement('playButton', {
    scale: { from: 0, to: this.uiManager.getScale() },
    duration: 500,
    ease: 'Back.easeOut'
});

// Position slide
this.uiManager.animateElement('menuPanel', {
    x: { from: '-100%', to: '50%' },
    duration: 800,
    ease: 'Cubic.easeOut'
});
```

### Animation Properties

- **alpha**: Opacity fade
- **scale**: Size changes
- **x/y**: Position movements
- **rotation**: Rotation effects
- **duration**: Time in milliseconds
- **delay**: Start delay
- **ease**: Easing function
- **yoyo**: Reverse animation
- **repeat**: Number of repetitions (-1 for infinite)

---

## Best Practices

### 1. Use Percentage Positioning

Prefer percentage-based positioning for better responsiveness:

```typescript
// Good - Responsive
position: { x: '50%', y: '30%' }

// Avoid - Fixed position
position: { x: 512, y: 300 }
```

### 2. Define Base Resolution

Always define a base resolution that matches your design mockups:

```typescript
baseWidth: 1920,
baseHeight: 1080
```

### 3. Group Related Elements

Use containers for related UI elements:

```typescript
hudContainer: {
    type: 'container',
    position: { x: '10%', y: '10%' },
    children: [
        scoreText,
        healthBar,
        ammoCount
    ]
}
```

### 4. Clean Up

Always destroy the UIManager when leaving a scene:

```typescript
// In your scene's shutdown
this.uiManager.destroy();
```

### 5. Z-Order Management

Use depth values to control layering:

```typescript
background: { depth: 0 },
middleground: { depth: 5 },
foreground: { depth: 10 },
overlay: { depth: 15 }
```

---

## Examples

### Main Menu Example

```typescript
create() {
    const uiConfig: UILayoutConfig = {
        baseWidth: 1024,
        baseHeight: 768,
        scalingMode: 'fit',
        elements: {
            background: {
                type: 'image',
                texture: 'menu-bg',
                position: { x: '50%', y: '50%' },
                origin: { x: 0.5, y: 0.5 },
                depth: 0
            },
            title: {
                type: 'text',
                text: 'AWESOME GAME',
                position: { x: '50%', y: '25%' },
                origin: { x: 0.5, y: 0.5 },
                style: {
                    fontSize: '64px',
                    color: '#FFD700'
                },
                depth: 2
            },
            playButton: {
                type: 'button',
                text: 'START',
                position: { x: '50%', y: '50%' },
                onClick: () => this.startGame(),
                hoverScale: 1.1,
                depth: 3
            },
            quitButton: {
                type: 'button',
                text: 'QUIT',
                position: { x: '50%', y: '65%' },
                onClick: () => this.quitGame(),
                hoverScale: 1.1,
                depth: 3
            }
        }
    };

    this.uiManager = new UIManager(this, uiConfig);
    this.uiManager.createUI();
}
```

### HUD Example

```typescript
const hudConfig: UILayoutConfig = {
    baseWidth: 1920,
    baseHeight: 1080,
    scalingMode: 'fit',
    elements: {
        scoreLabel: {
            type: 'text',
            text: 'Score:',
            position: { x: '5%', y: '5%' },
            style: { fontSize: '24px', color: '#ffffff' },
            depth: 100
        },
        scoreValue: {
            type: 'text',
            text: '0',
            position: { x: '15%', y: '5%' },
            style: { fontSize: '24px', color: '#FFD700' },
            depth: 100
        },
        healthBar: {
            type: 'container',
            position: { x: '5%', y: '10%' },
            children: [
                // Health bar components
            ],
            depth: 100
        }
    }
};
```

### Victory Screen Example

```typescript
const victoryConfig: UILayoutConfig = {
    baseWidth: 1024,
    baseHeight: 768,
    scalingMode: 'fit',
    elements: {
        victoryText: {
            type: 'text',
            text: '🏆 VICTORY! 🏆',
            position: { x: '50%', y: '30%' },
            origin: { x: 0.5, y: 0.5 },
            style: {
                fontSize: '72px',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 8
            },
            depth: 10
        },
        scoreDisplay: {
            type: 'text',
            text: `Final Score: ${this.score}`,
            position: { x: '50%', y: '45%' },
            origin: { x: 0.5, y: 0.5 },
            style: {
                fontSize: '36px',
                color: '#ffffff'
            },
            depth: 9
        },
        continueButton: {
            type: 'button',
            text: 'CONTINUE',
            position: { x: '35%', y: '65%' },
            onClick: () => this.nextLevel(),
            depth: 10
        },
        menuButton: {
            type: 'button',
            text: 'MAIN MENU',
            position: { x: '65%', y: '65%' },
            onClick: () => this.returnToMenu(),
            depth: 10
        }
    }
};

// Animate elements on creation
this.uiManager.animateElement('victoryText', {
    scale: { from: 0, to: 1 },
    rotation: { from: -0.2, to: 0 },
    duration: 800,
    ease: 'Back.easeOut'
});
```

---

## API Reference

### UIManager Methods

```typescript
// Create all UI elements
createUI(): void

// Get a specific element
getElement(key: string): GameObjects.GameObject | undefined

// Update element properties
updateElement(key: string, updates: Partial<UIElement>): void

// Animate an element
animateElement(key: string, tweenConfig: TweenBuilderConfig): void

// Get current scale factor
getScale(): number

// Get screen dimensions
getScreenSize(): { width: number; height: number }

// Get current aspect ratio
getAspectRatio(): number

// Clean up and destroy
destroy(): void
```

### Common Patterns

#### Updating Text

```typescript
this.uiManager.updateElement('scoreText', {
    text: `Score: ${newScore}`
});
```

#### Showing/Hiding Elements

```typescript
this.uiManager.updateElement('pauseMenu', {
    visible: false
});
```

#### Dynamic Positioning

```typescript
this.uiManager.updateElement('popup', {
    position: { x: '50%', y: '50%' }
});
```

---

## Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Elements not centered | Check `origin` is set to `{ x: 0.5, y: 0.5 }` |
| Buttons not clickable | Ensure `interactive` is true or button type is used |
| Text too small/large | Adjust `fontSize` based on `baseWidth/Height` |
| Elements off-screen | Use percentage positioning instead of fixed pixels |
| Animation glitches | Check for conflicting tweens on same property |

### Debug Mode

Enable debug visualization for buttons:

```typescript
// In UIManager.ts, set debugMode to true
const debugMode = true; // Shows interactive areas
```

---

## Integration with Scenes

The UIManager integrates seamlessly with Phaser scenes:

1. **MainMenu**: Title screen with navigation buttons
2. **GameOver**: Death screen with retry options
3. **Victory**: Win screen with score display
4. **Game HUD**: In-game status displays

Each scene should create its own UIManager instance and destroy it when transitioning to prevent memory leaks.

---

## Performance Tips

1. **Minimize Updates**: Batch UI updates when possible
2. **Use Containers**: Group related elements to reduce draw calls
3. **Optimize Fonts**: Load only required font weights/styles
4. **Texture Atlases**: Use sprite sheets for UI elements
5. **Depth Management**: Use consistent depth values to avoid sorting overhead

---

## Future Enhancements

Planned features for the UI system:

- [ ] Drag and drop support
- [ものSlider and progress bar components
- [ ] Modal dialog system
- [ ] Transition effects between scenes
- [ ] Theme system for consistent styling
- [ ] Accessibility features (screen reader support)
- [ ] Localization support for multi-language UI