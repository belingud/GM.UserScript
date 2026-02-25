# Auto Random Scroll

## Description

`auto-scroll.js` is a Tampermonkey script that simulates more natural random scrolling on target sites.

Current match pattern:

- `https://linux.do/*`

## Features

- Floating button menu: hover to show quick actions for Start, Stop, and Config.
- Randomized scrolling: configurable min/max scroll step (px) and interval (ms).
- Smooth scrolling toggle: `smooth` (`1` = enabled, `0` = disabled).
- Auto-stop behavior:
- Stops after reaching the bottom and waiting without new content updates.
- Optional timer-based stop (minutes).
- Config panel with persistent settings.
- Draggable floating button with saved position.
- Theme options: `auto`, `light`, `mocha`.

## Default Settings

| Option | Default | Notes |
| --- | --- | --- |
| `stepMin` | `8` | Minimum scroll step per tick (px) |
| `stepMax` | `17` | Maximum scroll step per tick (px) |
| `intMin` | `30` | Minimum interval between ticks (ms) |
| `intMax` | `100` | Maximum interval between ticks (ms) |
| `smooth` | `1` | `1` enables smooth scrolling |
| `stopAfterMin` | `0` | Stop after N minutes; `0` means no timed stop |
| `autoStop` | `1` | `1` enables bottom auto-stop |
| `bottomWaitSec` | `10` | Seconds to wait at bottom without mutations |
| `theme` | `auto` | `auto` / `light` / `mocha` |

## Usage

1. Install Tampermonkey.
2. Add and enable `auto-scroll.js`.
3. Open a matched page (for example, `linux.do`).
4. Hover the floating button at the bottom-right and click:
- `Start` to begin auto scrolling.
- `Stop` to stop it.
- `Config` to open settings and save changes.

## Persistence and Console APIs

- Settings are stored with `GM_setValue` and persist after refresh.
- Console methods are available:
- `window.autoScrollStart()` to start.
- `window.autoScrollStop()` to stop.
