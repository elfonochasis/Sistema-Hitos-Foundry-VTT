# Changelog

## [1.3.0] - 2026-03-29

### Foundry VTT v13.351 Compatibility Update

This release updates the Hitos system to be fully compatible with Foundry VTT v13.351.
The minimum supported version is now Foundry VTT v13.

### Changed

- **system.json**: Updated `compatibility.minimum` to `13` and `compatibility.verified` to `13.351`. Bumped system version to `1.3.0`.

### Fixed

#### Removed APIs (would cause errors in v13)

- **`mergeObject` -> `foundry.utils.mergeObject`**: Replaced deprecated global `mergeObject()` calls in `actor-sheet.js`, `item-sheet.js`. The global was removed in Foundry v13.
- **`Math.clamped` -> `Math.clamp`**: Replaced removed `Math.clamped()` in `hitos.js` (token bar drawing). The method was removed in Foundry v13.
- **`CONST.DEFAULT_TOKEN` / `DEFAULT_TOKEN` removed**: Replaced references to the removed constant in `actor.js`, `item.js`, and `actor-sheet.js` with direct icon path strings.
- **`this.data.height` -> `this.document.height`**: Fixed token data access in `hitos.js` token bar override. The `data` property on Token was removed in v13.
- **`PIXI.utils.rgb2hex` -> `new PIXI.Color().toNumber()`**: Updated PIXI API call in `hitos.js` for PIXI v7 compatibility (used by Foundry v12+).
- **`ChatMessage.create` API changes**: Replaced deprecated `type: CONST.CHAT_MESSAGE_TYPES.ROLL` with `style: CONST.CHAT_MESSAGE_STYLES.OOC` in `dice.js` (4 occurrences) and `chat.js` (1 occurrence).
- **`roll` -> `rolls` (array)**: Changed singular `roll` property to `rolls: [roll]` array in all `ChatMessage.create()` calls across `dice.js` and `chat.js`.
- **`Roll.evaluate({async: true})` / `.roll({async: true})`**: Removed deprecated `{async: true}` parameter from `chat.js`. `evaluate()` is always async in v13.
- **Global utility functions removed**: Replaced all deprecated global helpers with their `foundry.utils.*` equivalents:
  - `hasProperty()` -> `foundry.utils.hasProperty()` in `actor-sheet.js`
  - `setProperty()` -> `foundry.utils.setProperty()` in `actor-sheet.js`
  - `getProperty()` -> `foundry.utils.getProperty()` in `actor-sheet.js` and `dice.js`
  - `duplicate()` -> `foundry.utils.deepClone()` in `actor-sheet.js`
- **`TextEditor.enrichHTML` async option**: Removed deprecated `{ async: true }` parameter in `actor-sheet.js` (the method is always async in v13).

### Files Modified

| File | Changes |
|------|---------|
| `system.json` | Version bump, compatibility update |
| `module/hitos.js` | `Math.clamped`, `this.data.height`, `PIXI.utils.rgb2hex` |
| `module/actor/actor.js` | `CONST.DEFAULT_TOKEN` removal |
| `module/actor/actor-sheet.js` | `mergeObject`, `hasProperty`, `setProperty`, `getProperty`, `duplicate`, `DEFAULT_TOKEN`, `TextEditor.enrichHTML` async |
| `module/item/item.js` | `CONST.DEFAULT_TOKEN` removal |
| `module/item/item-sheet.js` | `mergeObject` |
| `module/dice.js` | `ChatMessage` type/roll API, `getProperty` |
| `module/chat.js` | `ChatMessage` type/roll API, `Roll.evaluate` async |
