# Project Rules & Technical Guidelines — Anvil Optimizer (d:\Calc)

## 1. Asset & Media Rules
- **MediaWiki / Minecraft Wiki Downloads**: Never attempt server-side programmatic downloads (`curl`, `wget`, `node https`) from `minecraft.wiki` — MediaWiki returns 403 Forbidden with HTML wrapper pages. Instead, reference official wiki image URLs **directly in client-side HTML/JS `<img>` tags** using `referrerpolicy="no-referrer"`.
- **Rendered Assets vs. Raw Atlases**: Always verify that sprite assets represent the **rendered in-game appearance** (e.g., the green glowing `Experience_Orb_Value_*.png` images) rather than raw internal game texture atlases (e.g., the raw gray/red 64x64 `experience_orb.png` sheet).
- **Isometric 3D Renders**: Use official 3D isometric wiki renders for blocks/tools (e.g., `Anvil_(N)_JE3.png`).

## 2. Minecraft 1.21 Anvil Algorithm Rules
- **Java Edition Enchantment Cost**: Cost = $\text{finalLevel} \times \text{multiplier}$ (Do NOT use Bedrock's $\text{sacrificeLevel} \times \text{multiplier}$).
- **Prior Work Penalty (PWP)**: $\text{PWP} = 2^N - 1$. Result PWP uses = $\max(\text{target Uses}, \text{sacrifice Uses}) + 1$.
- **Survival Cap**: Operations costing $\ge 40$ levels are marked "Too Expensive!".

## 3. Algorithm & UI Performance
- **Search Limits**: DP / state-space searches MUST include hard safety caps (wall-clock time limit $\le 2\text{s}$ and iteration limit $\le 500{,}000$) to prevent browser main-thread freezes.
- **Debounced Auto-Calculate**: Run calculations reactively on inventory changes with a 300ms debounce.

## 4. UI & Class Audit Standards
- **Class Naming**: Ensure JS templates match `styles.css` class names exactly (e.g., `.btn-remove-item`).
- **Accessibility**: Include descriptive `aria-label` attributes on icon-only buttons.
