# UI Design Prompt — Itinerary "Journey Stations" Interface

## Overview

Redesign the trip itinerary view as a **vertical journey road**, where each activity in a day's plan is represented as a **station stop** along a travel route. The interface should feel like a real-world transit map or a road trip milestone tracker — warm, tactile, and progress-driven.

---

## Core Visual Metaphor

The day's activities form a single vertical route from top (start of day) to bottom (end of day). A continuous vertical line runs through all stations. As activities are completed, the line segment **between stations fills with color** from top downward — like a progress bar being drawn along the road. Stations that are done glow with completion; the current active station pulses; future stations remain muted and waiting.

---

## Layout Structure

### The Route Line
- A single vertical line (3–4px wide, rounded caps) runs the full height of the activity list, positioned slightly left of center in a narrow left column (~44px wide).
- The line is divided into **segments** between each pair of adjacent stations.
- Completed segments are filled with the accent color (warm amber/orange).
- Upcoming segments remain in a muted neutral color (light gray).
- The transition point between filled and unfilled segments sits just below the currently active station.

### Station Nodes
Each activity is anchored to the route line by a **circular node** (28–34px diameter):
- **Completed station**: Solid filled circle in accent color, containing a relevant activity icon in white.
- **Active station**: Outlined circle with accent color border, slightly larger, with a subtle pulsing ring animation. Icon inside uses the accent color.
- **Upcoming station**: Dashed or light-border circle with a neutral icon inside, muted opacity.

Each node displays an **activity-type icon** (e.g., bus for transport, fork for food, camera for photography, home for accommodation, star for activity).

### Time Labels
- Small timestamps (e.g., "06:00") sit above each station node, left-aligned within the narrow left column.
- Completed times use the accent color; upcoming times use muted secondary text color.

### Activity Cards
To the right of each station node, a **compact card** shows the activity details:
- **Title** (bold, 13–14px)
- **Subtitle** — place name, notes snippet, or duration (muted, 11–12px)
- **Tags/badges** — activity type tags (Food, Transport, Activity, Stay, etc.) as small colored pills
- **Completed cards** are slightly dimmed (opacity ~0.65) to visually recede.
- **Active card** is the most prominent — white background, subtle border, full opacity, with a small "In progress" label in accent color.
- **Upcoming cards** have a secondary background fill, muted title color.

---

## Color & Tone

- **Primary accent**: Warm amber/orange tones (`#EF9F27` mid, `#BA7517` dark, `#FAEEDA` light fill) — evoking warmth, travel, sunshine.
- **Completed state**: Accent color fills (amber) for line segments, node backgrounds, and time labels.
- **Active state**: Accent border + pulsing ring on node; accent-colored title text on card.
- **Upcoming state**: Neutral grays for line segments, dashed node borders, muted text.
- Overall palette should feel warm and inviting, not clinical. Think road trip journal, not project management tool.

---

## Progress Indicator

At the bottom of the day's activity list, a **thin horizontal progress bar** shows overall day completion:
- Filled portion uses the accent color.
- A small label on the left shows "X / Y completed"; on the right shows the percentage.
- The bar's fill animates smoothly when an activity is marked done.

---

## Interaction & Behavior

- **Mark as done**: Tapping/clicking an activity card or its station node marks it complete — the node fills in, the segment above it animates filling downward to meet the previous completed segment, and the card fades slightly.
- **Active indicator**: The first incomplete activity is automatically highlighted as "active" / "in progress".
- **Gap indicators**: If there is a significant time gap between two consecutive activities (e.g., 90 minutes), a small label appears along the route line segment between those stations (e.g., "90 min gap" or a rest icon).
- **Smooth transitions**: All state changes (completion fill, node color, card opacity) animate with a short ease-out transition (~300ms).

---

## Responsive Behavior

- On desktop: left column (time + node) is ~44px; card area fills remaining width.
- On mobile: same layout, slightly more compact node size (~28px), card padding reduced.
- The route line always stays vertically centered within the left column regardless of screen width.

---

## What This Should Feel Like

Imagine looking at a **train route board** or a **hiking trail marker** — you can see at a glance how far along the journey you are, where you currently are, and what lies ahead. Completed stops feel satisfying and settled; the current stop has energy and focus; upcoming stops feel anticipatory and light. The overall effect is of a **living itinerary** that rewards progress and makes the day feel like a real adventure unfolding.
