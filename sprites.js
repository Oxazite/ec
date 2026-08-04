/**
 * MINECRAFT ITEM SPRITES & MYTHITORIUM EVEN BETTER ENCHANTS BOOK ICONS
 * SVG Pixel Art Sprites for Minecraft 1.21+ Anvil Optimizer
 */

// Helper to wrap SVG into HTML string
function makeSVG(pathContent, viewBox = "0 0 16 16") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="20" height="20" class="mc-sprite">${pathContent}</svg>`;
}

// Pixel art SVG paths for all 19 gear categories
const ITEM_SPRITES_SVG = {
    sword: `<path fill="#2dd4bf" d="M13 1h2v2h-2zM12 3h2v2h-2zM11 4h2v2h-2zM10 5h2v2h-2zM9 6h2v2h-2zM8 7h2v2h-2zM7 8h2v2h-2zM6 9h2v2h-2z"/><path fill="#0d9488" d="M12 2h2v2h-2zM11 3h2v2h-2zM10 4h2v2h-2zM9 5h2v2h-2zM8 6h2v2h-2zM7 7h2v2h-2zM6 8h2v2h-2zM5 9h2v2h-2z"/><path fill="#854d0e" d="M3 12h2v2H3zM2 13h2v2H2z"/><path fill="#f59e0b" d="M5 10h2v2H5zM4 11h2v2H4zM3 10h2v2H3zM5 12h2v2H5z"/>`,
    axe: `<path fill="#2dd4bf" d="M7 1h6v3H7zM11 4h3v3h-3zM6 2h2v4H6z"/><path fill="#0d9488" d="M8 2h4v2H8zM10 4h2v2h-2z"/><path fill="#854d0e" d="M5 5h2v2H5zM4 7h2v2H4zM3 9h2v2H3zM2 11h2v2H2zM1 13h2v2H1z"/>`,
    pickaxe: `<path fill="#2dd4bf" d="M5 1h8v2H5zM12 3h3v3h-3zM3 3h3v3H3z"/><path fill="#0d9488" d="M6 2h6v1H6zM12 4h2v1h-2z"/><path fill="#854d0e" d="M7 6h2v2H7zM6 8h2v2H6zM5 10h2v2H5zM4 12h2v2H4zM3 14h2v2H3z"/>`,
    shovel: `<path fill="#2dd4bf" d="M11 1h4v4h-4z"/><path fill="#0d9488" d="M12 2h2v2h-2z"/><path fill="#854d0e" d="M9 5h2v2H9zM8 7h2v2H8zM7 9h2v2H7zM6 11h2v2H6zM5 13h2v2H5z"/>`,
    hoe: `<path fill="#2dd4bf" d="M6 1h7v3H6zM11 4h2v2h-2z"/><path fill="#0d9488" d="M7 2h5v1H7z"/><path fill="#854d0e" d="M6 5h2v2H6zM5 7h2v2H5zM4 9h2v2H4zM3 11h2v2H3zM2 13h2v2H2z"/>`,
    bow: `<path fill="#854d0e" d="M11 1h3v2h-3zM13 3h2v3h-2zM13 10h2v3h-2zM11 13h3v2h-3z"/><path fill="#e2e8f0" d="M12 3v10h-1V3z"/><path fill="#b45309" d="M8 3h3v2H8zM8 11h3v2H8z"/>`,
    crossbow: `<path fill="#854d0e" d="M2 2h12v2H2zM7 4h2v10H7z"/><path fill="#cbd5e1" d="M1 1h3v3H1zM12 1h3v3h-3z"/><path fill="#f59e0b" d="M6 3h4v3H6z"/>`,
    trident: `<path fill="#38bdf8" d="M3 1h2v5H3zM7 1h2v6H7zM11 1h2v5h-2zM3 5h10v2H3z"/><path fill="#0284c7" d="M7 7h2v8H7z"/>`,
    mace: `<path fill="#64748b" d="M5 1h6v6H5z"/><path fill="#475569" d="M4 2h8v4H4zM6 0h4v8H6z"/><path fill="#854d0e" d="M7 7h2v8H7z"/>`,
    helmet: `<path fill="#2dd4bf" d="M3 4h10v6H3z"/><path fill="#0d9488" d="M4 5h8v3H4z"/><path fill="#0f766e" d="M2 7h3v4H2zM11 7h3v4h-3z"/>`,
    chestplate: `<path fill="#2dd4bf" d="M2 2h4v3H2zM10 2h4v3h-4zM2 5h12v7H2z"/><path fill="#0d9488" d="M5 2h6v4H5zM3 6h10v5H3z"/>`,
    leggings: `<path fill="#2dd4bf" d="M3 2h10v11H3z"/><path fill="#0f172a" d="M7 6h2v7H7z"/><path fill="#0d9488" d="M4 3h8v3H4z"/>`,
    boots: `<path fill="#2dd4bf" d="M2 7h4v6H2zM10 7h4v6h-4z"/><path fill="#0d9488" d="M1 10h5v3H1zM9 10h5v3H9z"/>`,
    shield: `<path fill="#854d0e" d="M3 1h10v10L8 14 3 11z"/><path fill="#94a3b8" d="M4 2h8v8L8 13 4 10z"/><path fill="#cbd5e1" d="M7 3h2v8H7zM5 6h6v2H5z"/>`,
    elytra: `<path fill="#64748b" d="M2 2c3 0 5 3 5 8L2 13zM14 2c-3 0-5 3-5 8l5 3z"/><path fill="#94a3b8" d="M3 3c2 0 3 2 3 6L3 11zM13 3c-2 0-3 2-3 6l3 2z"/>`,
    fishing_rod: `<path fill="#854d0e" d="M1 13l11-11h2v2L3 15z"/><path fill="#e2e8f0" d="M14 4v9h-1V4z"/><path fill="#ef4444" d="M12 13h3v2h-3z"/>`,
    shears: `<path fill="#94a3b8" d="M3 2h4v6H3zM9 2h4v6H9z"/><path fill="#854d0e" d="M2 8h3v6H2zM11 8h3v6h-3z"/>`,
    flint_and_steel: `<path fill="#475569" d="M3 5h6v7H3z"/><path fill="#cbd5e1" d="M8 2h5v6H8z"/><path fill="#f97316" d="M11 4h3v3h-3z"/>`,
    brush: `<path fill="#d97706" d="M6 1h4v4H6z"/><path fill="#854d0e" d="M7 5h2v6H7z"/><path fill="#f59e0b" d="M5 11h6v4H5z"/>`
};

// Mythitorium Even Better Enchants Emblem Badges
const ENCHANTMENT_EMBLEMS = {
    // Protection family (Blue / Red / Orange / Target Shields)
    protection: `<path fill="#3b82f6" d="M6 5h4v5l-2 2-2-2z"/><path fill="#93c5fd" d="M7 6h2v3H7z"/>`,
    fire_protection: `<path fill="#f97316" d="M6 5h4v5l-2 2-2-2z"/><path fill="#fbbf24" d="M7 6h2v2H7z"/>`,
    blast_protection: `<path fill="#eab308" d="M6 5h4v5l-2 2-2-2z"/><path fill="#ef4444" d="M7 7h2v2H7z"/>`,
    projectile_protection: `<path fill="#06b6d4" d="M6 5h4v5l-2 2-2-2z"/><circle cx="8" cy="8" r="1" fill="#fff"/>`,

    // Melee Damage (Red / Blue Cross Swords)
    sharpness: `<path fill="#ef4444" d="M5 5l6 6M11 5L5 11" stroke="#ef4444" stroke-width="1.5"/><circle cx="8" cy="8" r="1" fill="#fca5a5"/>`,
    smite: `<path fill="#38bdf8" d="M7 4h2v5H7zM5 6h6v2H5z"/><path fill="#fff" d="M8 5v3"/>`,
    bane_of_arthropods: `<path fill="#a855f7" d="M6 6h4v4H6z"/><path fill="#c084fc" d="M5 5h2v2H5zM9 5h2v2H9zM5 9h2v2H5zM9 9h2v2H9z"/>`,

    // Utility / Universal
    mending: `<circle cx="8" cy="8" r="3" fill="#f59e0b" stroke="#fef08a" stroke-width="1"/><path fill="#fff" d="M8 6l1 2h-2zM8 10l-1-2h2z"/>`,
    unbreaking: `<path fill="#94a3b8" d="M6 6h4v4H6z"/><path fill="#38bdf8" d="M7 7h2v2H7z"/>`,
    thorns: `<path fill="#22c55e" d="M6 6l4 4M10 6L6 10" stroke="#22c55e" stroke-width="1.5"/><circle cx="8" cy="8" r="1" fill="#4ade80"/>`,

    // Mining / Tools
    efficiency: `<path fill="#06b6d4" d="M5 5h6v2H5zM7 7h2v4H7z"/><path fill="#67e8f9" d="M6 6h4v1H6z"/>`,
    silk_touch: `<path fill="#10b981" d="M5 6c0-1 3-2 3-2s3 1 3 2-3 4-3 4-3-3-3-4z"/><circle cx="8" cy="7" r="1" fill="#a7f3d0"/>`,
    fortune: `<path fill="#fbbf24" d="M8 4l3 4-3 4-3-4z"/><path fill="#fef08a" d="M8 6l1 2-1 2-1-2z"/>`,

    // Boots
    feather_falling: `<path fill="#e0f2fe" d="M8 4c-1 2-3 3-3 5a3 3 0 006 0c0-2-2-3-3-5z"/><path fill="#38bdf8" d="M8 6v3"/>`,
    depth_strider: `<path fill="#0284c7" d="M5 8c1-1 2-1 3 0s2 1 3 0v2c-1 1-2 1-3 0s-2-1-3 0z"/>`,
    frost_walker: `<path fill="#bae6fd" d="M6 6h4v4H6z"/><path fill="#38bdf8" d="M7 7h2v2H7z"/>`,
    soul_speed: `<path fill="#c084fc" d="M6 5h4v6H6z"/><path fill="#e9d5ff" d="M7 6h2v4H7z"/>`,
    swift_sneak: `<path fill="#64748b" d="M5 7h6v3H5z"/><circle cx="7" cy="8" r="1" fill="#38bdf8"/><circle cx="9" cy="8" r="1" fill="#38bdf8"/>`,

    // Bow / Crossbow
    power: `<path fill="#f43f5e" d="M8 4l3 4h-2v4H7V8H5z"/>`,
    punch: `<path fill="#fb7185" d="M5 8h6v2H5zM9 6l3 3-3 3z"/>`,
    flame: `<path fill="#f97316" d="M8 4c1 2 3 3 3 5a3 3 0 01-6 0c0-2 2-3 3-5z"/><path fill="#fef08a" d="M8 7a1 1 0 011 1c0 1-1 2-1 2s-1-1-1-2a1 1 0 011-1z"/>`,
    infinity: `<path fill="#c084fc" d="M5 8a2 2 0 113-2 2 2 0 013 2 2 2 0 01-3 2 2 2 0 01-3-2z" fill-opacity="0.3" stroke="#c084fc" stroke-width="1.5"/>`,

    // Mace 1.21
    density: `<path fill="#64748b" d="M6 4h4v8H6z"/><path fill="#94a3b8" d="M7 5h2v6H7z"/>`,
    breach: `<path fill="#ef4444" d="M8 4l4 4-4 4V9H4V7h4z"/>`,
    wind_burst: `<path fill="#38bdf8" d="M5 8c2-2 4-2 6 0M6 10c1-1 3-1 4 0"/>`,

    // Curses
    binding_curse: `<path fill="#dc2626" d="M6 5h4v3H6zM5 8h6v4H5z"/><circle cx="8" cy="10" r="1" fill="#fca5a5"/>`,
    vanishing_curse: `<path fill="#7f1d1d" d="M6 6h4v4H6z"/><path fill="#fca5a5" d="M7 7h2v2H7z"/>`
};

/**
 * Returns HTML string for gear item sprite SVG
 */
function getItemSpriteHTML(category) {
    const path = ITEM_SPRITES_SVG[category] || ITEM_SPRITES_SVG.sword;
    return makeSVG(path);
}

/**
 * Returns Mythitorium 'Even Better Enchants' styled Book SVG
 */
function getBookSpriteHTML(enchantments = {}) {
    const enchIds = Object.keys(enchantments);
    const primaryEnch = enchIds.length > 0 ? enchIds[0] : null;

    // Mythitorium style Enchanted Book base (Purple leather cover + golden corner + magic aura)
    const baseBook = `
        <rect x="2" y="2" width="12" height="12" rx="1" fill="#7e22ce"/>
        <path fill="#a855f7" d="M3 3h10v10H3z"/>
        <path fill="#581c87" d="M2 2h2v12H2zM2 13h12v1H2z"/>
        <path fill="#f59e0b" d="M12 3h1v1h-1zM12 12h1v1h-1z"/>
        <path fill="#e9d5ff" opacity="0.3" d="M4 4h7v2H4z"/>
    `;

    const emblem = primaryEnch && ENCHANTMENT_EMBLEMS[primaryEnch]
        ? ENCHANTMENT_EMBLEMS[primaryEnch]
        : `<circle cx="8" cy="8" r="2" fill="#f59e0b"/>`;

    return makeSVG(baseBook + emblem);
}

/**
 * Returns item or book icon HTML depending on item state
 */
function getItemIconHTML(item) {
    if (item.isBook) {
        return getBookSpriteHTML(item.enchantments || item.targetEnchs || {});
    }
    return getItemSpriteHTML(item.category || 'sword');
}
