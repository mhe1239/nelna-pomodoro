# Nelna Pomodoro Design Specification

This document details the visual design system, UX architecture, layout mechanics, and interaction guidelines for the **Nelna Pomodoro** timer application.

---

## 1. Design Vision & Concept

- **Brand / Product Name**: Nelna Pomodoro
- **Core Concept**: Reimagining the intuitive visual timer dial of the classic analog Nelna timer into a modern, minimalist digital interface.
- **Core Design Values**:
  1. **Deep Focus**: Eliminating visual noise to foster a distraction-free, deep work environment.
  2. **Clear Visibility**: Effortless glanceability for tracking session mode (Focus / Rest) and cycle progress from afar or within a compact mini-player.
  3. **Seamless Continuity**: Uninterrupted state and data sync during background tab hibernation, resource recovery, and window transitions.

---

## 2. Visual System

### 2.1 Color Palette

#### A. Dynamic Status Mode (Adaptive Backgrounds)
The central radial gradient tint adapts dynamically based on the current mode (Focus / Short Break / Long Break).

| Mode | Intensity Level | Hex Range (Center Tint) | Atmosphere |
| :--- | :--- | :--- | :--- |
| **Focus** | Level 1 (Default) | `#041a0f` | Stealth Deep Forest Green |
| | Level 2 | `#082d1a` | Deep Forest |
| | Level 3 | `#0c4025` | Calming Forest |
| | Level 4 | `#105330` | Vivid Focus Green |
| | Level 5 (Vivid) | `#14663b` | Bright Emerald |
| **Short Break** | Level 1 (Default) | `#051220` | Stealth Deep Ocean Blue |
| | Level 2 | `#0b233a` | Dark Night Blue |
| | Level 3 | `#113454` | Calming Ocean Blue |
| | Level 4 | `#17456e` | Vivid Ocean Blue |
| | Level 5 (Vivid) | `#1c4f86` | Bright Sky Blue |

- **Outer Gradient Edge**: `#020202` (Deep Black)
- **Gradient Formula**: `radial-gradient(circle at center, {CenterColor} 0%, #020202 100%)`

#### B. Rich Gradient Mode
- A tactile dark gradient transitioning smoothly from dark gray (`#1c1c1c`) to rich black (`#050505`).

#### C. Custom Mode
- Dynamically generated dark gradient using a user-selected custom Hex accent color.

---

### 2.2 Typography

- **Headings & Digits**: A high-contrast combination of clean sans-serif typography and monospace tabular numbers.
- **Tracking & Leading**: Expanded letter spacing (`letter-spacing: 0.15em ~ 0.2em`) with bold font weights (`font-bold`) for maximum badge legibility.

---

## 3. UI & Layout Architecture

### 3.1 Main View
1. **Analog Dial Overlay**:
   - A smooth 360° circular progress ring sweeping down in sync with remaining time.
2. **Central Timer Display**:
   - Large-scale `MM:SS` timer numerals with fluid viewport scaling.
3. **Status Badge**:
   - Prominent badge displaying current mode and set progress (e.g., `Focus (1/4)`, `Rest (2/4)`).
4. **Floating Control Glass**:
   - Play/Pause, Reset, and Mode controls styled on a frosted floating glass container.

---

### 3.2 Mini Player & Picture-in-Picture (PiP)

Three distinct mini-view styles tailored for small desktop floating windows:

1. **Pure Dial**: Ultra-minimalist aesthetic focusing purely on the circular progress arc.
2. **Minimal Info**: Clean time numerals accompanied by essential Play/Pause controls.
3. **Classic Card**: Structured card view including session indicators and full control actions.

---

## 4. UX & State Persistence System

1. **Persistent State Storage (`nelna_timer_state`)**:
   - `currentCycle`: Active session cycle index (1–4)
   - `mode`: Focus / Short Break / Long Break
   - `remainingTime`: Remaining time in seconds
   - `lastUpdated`: Epoch timestamp of last state record (`Date.now()`)
   - `timerStatus`: Running / Paused
2. **Resource Reclaim Calculation**:
   - Automatically computes time elapsed during browser tab sleep (`Date.now() - lastUpdated`) to ensure clock accuracy upon wakeup.
3. **Dynamic Favicon & Tab Title**:
   - **Favicon**: Real-time SVG ring icon updating color and opacity based on Focus (Green), Break (Blue), and Paused (Translucent) states.
   - **Browser Title**: Dynamic string formatting (`25:00 (1/4) - Nelna`).
