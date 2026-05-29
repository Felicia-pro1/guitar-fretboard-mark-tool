# 吉他指板可视化器 - 项目说明

## 项目概述
这是一个类似 fretvisualizer.com 的吉他指板可视化工具，用于学习和练习音阶、和弦在指板上的位置。

## 已实现功能

### 1. 音阶可视化
- **音阶选择**：支持多种音阶/调式
  - Major（大调）
  - Natural Minor（自然小调）
  - Harmonic Minor（和声小调）
  - Melodic Minor（旋律小调）
  - Dorian（多利亚）
  - Phrygian（弗里吉亚）
  - Lydian（利底亚）
  - Mixolydian（混合利底亚）
  - Locrian（洛克里亚）
- **根音选择**：C、D、E、F、G、A、B
- **升降号显示**：Natural、Sharp、Flat

### 2. 调音选择
- Standard Guitar（标准调弦）
- Drop D
- Open G

### 3. 和弦功能
- **Diatonic Triads**：显示当前音阶的自然三和弦
- 点击和弦按钮显示和弦内音
- 和弦根音正确高亮显示
- **标签显示**：
  - Notes：显示音符名称
  - Degrees：音阶模式显示 1-7，和弦模式显示 1, 3, 5
  - Intervals：音阶模式显示 R, 2, 3, 4, 5, 6, 7，和弦模式显示 R, 3, 5

### 4. MARK 标记功能
- **颜色选择**：7种颜色圆点选择
  - Red（红色）
  - Blue（蓝色）
  - Green（绿色）
  - Yellow（黄色）
  - Purple（紫色）
  - Orange（橙色）
  - Teal（青色）
- **音符标记**：点击指板上的音符进行标记
- **标记效果**：标记的音符有彩色光晕和脉冲动画
- **清除标记**：垃圾桶图标清除所有标记

### 5. 显示选项
- **All Notes**：显示指板上所有音符
- **Root**：高亮根音
- **品数范围**：0-16 品可调

## 待开发功能

### 1. MARK 功能增强
- [ ] **自动生成框线/连线**：根据标记的音符自动生成外轮廓框线或按顺序连线
- [ ] **Shape 选择器**：CAGED 系统指型选择（C, A, G, E, D）

### 2. VERSION 版本管理功能
- [ ] **保存功能**：保存当前标记状态（颜色、框线、shape）
- [ ] **版本列表**：显示所有保存的版本
- [ ] **版本标题**：自定义版本名称
- [ ] **版本恢复**：点击版本恢复标记状态
- [ ] **删除版本**：删除不需要的版本
- [ ] **数据持久化**：使用 localStorage 保存版本数据

## 技术栈
- **前端**：HTML5, CSS3, JavaScript (原生)
- **服务器**：Node.js (简单HTTP服务器)
- **数据存储**：localStorage (待实现)

## 文件结构
```
guitar fret design/
├── index.html          # 主HTML文件
├── styles.css          # 样式文件
├── script.js           # JavaScript逻辑
├── server.js           # Node.js服务器
└── PROJECT_NOTES.md    # 项目说明文档（本文件）
```

## 核心代码结构

### currentState 状态对象
```javascript
let currentState = {
    rootNote: 'C',           // 根音
    scale: 'major',          // 音阶类型
    tuning: 'standard',      // 调音
    accidental: 'natural',   // 升降号显示
    harmony: 'scale',        // 和声模式（scale/chord）
    labels: 'notes',         // 标签类型（notes/degrees/intervals）
    allNotes: false,         // 显示所有音符
    rootNoteOnly: true,      // 只显示根音
    minFret: 0,              // 最小品数
    maxFret: 16,             // 最大品数
    selectedChord: null,     // 选中的和弦
    markMode: true,          // 标记模式
    selectedColor: '#e53935', // 选中的颜色
    markedNotes: {}          // 标记的音符
};
```

### 主要函数
- `renderFretboard()` - 渲染指板
- `getScaleNotes()` - 获取音阶音符
- `getChordNotes()` - 获取和弦音符
- `getDiatonicChords()` - 获取自然三和弦
- `toggleMark()` - 切换标记状态

## 启动方式
```bash
node server.js
```
访问 http://localhost:8000/

---
**创建时间**：2026-03-22
**最后更新**：2026-03-22# 吉他指板可视化器 - 项目说明

## 项目概述
这是一个类似 fretvisualizer.com 的吉他指板可视化工具，用于学习和练习音阶、和弦在指板上的位置。

## 已实现功能

### 1. 音阶可视化
- **音阶选择**：支持多种音阶/调式
  - Major（大调）
  - Natural Minor（自然小调）
  - Harmonic Minor（和声小调）
  - Melodic Minor（旋律小调）
  - Dorian（多利亚）
  - Phrygian（弗里吉亚）
  - Lydian（利底亚）
  - Mixolydian（混合利底亚）
  - Locrian（洛克里亚）
- **根音选择**：C、D、E、F、G、A、B
- **升降号显示**：Natural、Sharp、Flat

### 2. 调音选择
- Standard Guitar（标准调弦）
- Drop D
- Open G

### 3. 和弦功能
- **Diatonic Triads**：显示当前音阶的自然三和弦
- 点击和弦按钮显示和弦内音
- 和弦根音正确高亮显示
- **标签显示**：
  - Notes：显示音符名称
  - Degrees：音阶模式显示 1-7，和弦模式显示 1, 3, 5
  - Intervals：音阶模式显示 R, 2, 3, 4, 5, 6, 7，和弦模式显示 R, 3, 5

### 4. MARK 标记功能
- **颜色选择**：7种颜色圆点选择
  - Red（红色）
  - Blue（蓝色）
  - Green（绿色）
  - Yellow（黄色）
  - Purple（紫色）
  - Orange（橙色）
  - Teal（青色）
- **音符标记**：点击指板上的音符进行标记
- **标记效果**：标记的音符有彩色光晕和脉冲动画
- **清除标记**：垃圾桶图标清除所有标记

### 5. 显示选项
- **All Notes**：显示指板上所有音符
- **Root**：高亮根音
- **品数范围**：0-16 品可调

## 待开发功能

### 1. MARK 功能增强
- [ ] **自动生成框线/连线**：根据标记的音符自动生成外轮廓框线或按顺序连线
- [ ] **Shape 选择器**：CAGED 系统指型选择（C, A, G, E, D）

### 2. VERSION 版本管理功能
- [ ] **保存功能**：保存当前标记状态（颜色、框线、shape）
- [ ] **版本列表**：显示所有保存的版本
- [ ] **版本标题**：自定义版本名称
- [ ] **版本恢复**：点击版本恢复标记状态
- [ ] **删除版本**：删除不需要的版本
- [ ] **数据持久化**：使用 localStorage 保存版本数据

## 技术栈
- **前端**：HTML5, CSS3, JavaScript (原生)
- **服务器**：Node.js (简单HTTP服务器)
- **数据存储**：localStorage (待实现)

## 文件结构
```
guitar fret design/
├── index.html          # 主HTML文件
├── styles.css          # 样式文件
├── script.js           # JavaScript逻辑
├── server.js           # Node.js服务器
└── PROJECT_NOTES.md    # 项目说明文档（本文件）
```

## 核心代码结构

### currentState 状态对象
```javascript
let currentState = {
    rootNote: 'C',           // 根音
    scale: 'major',          // 音阶类型
    tuning: 'standard',      // 调音
    accidental: 'natural',   // 升降号显示
    harmony: 'scale',        // 和声模式（scale/chord）
    labels: 'notes',         // 标签类型（notes/degrees/intervals）
    allNotes: false,         // 显示所有音符
    rootNoteOnly: true,      // 只显示根音
    minFret: 0,              // 最小品数
    maxFret: 16,             // 最大品数
    selectedChord: null,     // 选中的和弦
    markMode: true,          // 标记模式
    selectedColor: '#e53935', // 选中的颜色
    markedNotes: {}          // 标记的音符
};
```

### 主要函数
- `renderFretboard()` - 渲染指板
- `getScaleNotes()` - 获取音阶音符
- `getChordNotes()` - 获取和弦音符
- `getDiatonicChords()` - 获取自然三和弦
- `toggleMark()` - 切换标记状态

## 启动方式
```bash
node server.js
```
访问 http://localhost:8000/

---
**创建时间**：2026-03-22
**最后更新**：2026-03-22