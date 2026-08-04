/**
 * MINECRAFT 1.21 AUTHENTIC ITEM PNG TEXTURES & MYTHITORIUM EVEN BETTER ENCHANTS
 * Official Minecraft game textures + EvenBetterEnchants book icons + Animated Glint
 */

const MC_ASSETS_BASE = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/";

// Real in-game Minecraft item PNG texture URLs
const ITEM_PNG_URLS = {
    sword: MC_ASSETS_BASE + "diamond_sword.png",
    axe: MC_ASSETS_BASE + "diamond_axe.png",
    pickaxe: MC_ASSETS_BASE + "diamond_pickaxe.png",
    shovel: MC_ASSETS_BASE + "diamond_shovel.png",
    hoe: MC_ASSETS_BASE + "diamond_hoe.png",
    bow: MC_ASSETS_BASE + "bow.png",
    crossbow: MC_ASSETS_BASE + "crossbow_standby.png",
    trident: MC_ASSETS_BASE + "trident.png",
    mace: MC_ASSETS_BASE + "mace.png",
    helmet: MC_ASSETS_BASE + "diamond_helmet.png",
    chestplate: MC_ASSETS_BASE + "diamond_chestplate.png",
    leggings: MC_ASSETS_BASE + "diamond_leggings.png",
    boots: MC_ASSETS_BASE + "diamond_boots.png",
    shield: MC_ASSETS_BASE + "shield.png",
    elytra: MC_ASSETS_BASE + "elytra.png",
    fishing_rod: MC_ASSETS_BASE + "fishing_rod.png",
    shears: MC_ASSETS_BASE + "shears.png",
    flint_and_steel: MC_ASSETS_BASE + "flint_and_steel.png",
    brush: MC_ASSETS_BASE + "brush.png",
    book: MC_ASSETS_BASE + "book.png"
};

// SVG helper for Even Better Enchants Mythitorium Styled Books
function makeSVG(pathContent, viewBox = "0 0 16 16") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="22" height="22" class="mc-sprite">${pathContent}</svg>`;
}

// Mythitorium EvenBetterEnchants Emblem Badges
const ENCHANTMENT_EMBLEMS = {
    protection: `<path fill="#3b82f6" d="M6 4h4v6l-2 2-2-2z"/><path fill="#93c5fd" d="M7 5h2v4H7z"/>`,
    fire_protection: `<path fill="#f97316" d="M6 4h4v6l-2 2-2-2z"/><path fill="#fbbf24" d="M7 5h2v3H7z"/>`,
    blast_protection: `<path fill="#eab308" d="M6 4h4v6l-2 2-2-2z"/><path fill="#ef4444" d="M7 6h2v3H7z"/>`,
    projectile_protection: `<path fill="#06b6d4" d="M6 4h4v6l-2 2-2-2z"/><circle cx="8" cy="7" r="1.5" fill="#fff"/>`,
    sharpness: `<path fill="#ef4444" d="M5 4l6 6M11 4L5 10" stroke="#ef4444" stroke-width="1.5"/><circle cx="8" cy="7" r="1" fill="#fca5a5"/>`,
    smite: `<path fill="#38bdf8" d="M7 3h2v6H7zM5 5h6v2H5z"/><path fill="#fff" d="M8 4v4"/>`,
    bane_of_arthropods: `<path fill="#a855f7" d="M6 5h4v5H6z"/><path fill="#c084fc" d="M5 4h2v2H5zM9 4h2v2H9zM5 8h2v2H5zM9 8h2v2H9z"/>`,
    mending: `<circle cx="8" cy="7" r="3" fill="#f59e0b" stroke="#fef08a" stroke-width="1"/><path fill="#fff" d="M8 5l1 2h-2zM8 9l-1-2h2z"/>`,
    unbreaking: `<path fill="#94a3b8" d="M6 5h4v4H6z"/><path fill="#38bdf8" d="M7 6h2v2H7z"/>`,
    thorns: `<path fill="#22c55e" d="M5 5l6 6M11 5L5 11" stroke="#22c55e" stroke-width="1.5"/><circle cx="8" cy="8" r="1" fill="#4ade80"/>`,
    efficiency: `<path fill="#06b6d4" d="M5 4h6v2H5zM7 6h2v5H7z"/><path fill="#67e8f9" d="M6 5h4v1H6z"/>`,
    silk_touch: `<path fill="#10b981" d="M5 5c0-1 3-2 3-2s3 1 3 2-3 4-3 4-3-3-3-4z"/><circle cx="8" cy="6" r="1" fill="#a7f3d0"/>`,
    fortune: `<path fill="#fbbf24" d="M8 3l3 4-3 4-3-4z"/><path fill="#fef08a" d="M8 5l1 2-1 2-1-2z"/>`,
    feather_falling: `<path fill="#e0f2fe" d="M8 3c-1 2-3 3-3 5a3 3 0 006 0c0-2-2-3-3-5z"/><path fill="#38bdf8" d="M8 5v3"/>`,
    depth_strider: `<path fill="#0284c7" d="M5 7c1-1 2-1 3 0s2 1 3 0v2c-1 1-2 1-3 0s-2-1-3 0z"/>`,
    frost_walker: `<path fill="#bae6fd" d="M6 5h4v4H6z"/><path fill="#38bdf8" d="M7 6h2v2H7z"/>`,
    soul_speed: `<path fill="#c084fc" d="M6 4h4v6H6z"/><path fill="#e9d5ff" d="M7 5h2v4H7z"/>`,
    swift_sneak: `<path fill="#64748b" d="M5 6h6v3H5z"/><circle cx="7" cy="7.5" r="1" fill="#38bdf8"/><circle cx="9" cy="7.5" r="1" fill="#38bdf8"/>`,
    power: `<path fill="#f43f5e" d="M8 3l3 4h-2v4H7V7H5z"/>`,
    punch: `<path fill="#fb7185" d="M5 7h6v2H5zM9 5l3 3-3 3z"/>`,
    flame: `<path fill="#f97316" d="M8 3c1 2 3 3 3 5a3 3 0 01-6 0c0-2 2-3 3-5z"/><path fill="#fef08a" d="M8 6a1 1 0 011 1c0 1-1 2-1 2s-1-1-1-2a1 1 0 011-1z"/>`,
    infinity: `<path fill="#c084fc" d="M5 7a2 2 0 113-2 2 2 0 013 2 2 2 0 01-3 2 2 2 0 01-3-2z" fill-opacity="0.3" stroke="#c084fc" stroke-width="1.5"/>`,
    density: `<path fill="#64748b" d="M6 3h4v8H6z"/><path fill="#94a3b8" d="M7 4h2v6H7z"/>`,
    breach: `<path fill="#ef4444" d="M8 3l4 4-4 4V8H4V6h4z"/>`,
    wind_burst: `<path fill="#38bdf8" d="M5 7c2-2 4-2 6 0M6 9c1-1 3-1 4 0"/>`,
    binding_curse: `<path fill="#dc2626" d="M6 4h4v3H6zM5 7h6v4H5z"/><circle cx="8" cy="9" r="1" fill="#fca5a5"/>`,
    vanishing_curse: `<path fill="#7f1d1d" d="M6 5h4v4H6z"/><path fill="#fca5a5" d="M7 6h2v2H7z"/>`
};

function getItemSpriteHTML(category) {
    const url = ITEM_PNG_URLS[category] || ITEM_PNG_URLS.sword;
    return `<img src="${url}" class="mc-sprite mc-item-png" alt="${category}" />`;
}

function getBookSpriteHTML(enchantments = {}) {
    const enchIds = Object.keys(enchantments);

    // Unenchanted Book (Official Minecraft Book PNG)
    if (enchIds.length === 0) {
        return `<img src="${ITEM_PNG_URLS.book}" class="mc-sprite mc-item-png" alt="Book" />`;
    }

    const primaryEnch = enchIds[0];

    // Mythitorium EvenBetterEnchants Base (Purple leather + gold corners + emblem)
    const baseBook = `
        <rect x="2" y="2" width="12" height="12" rx="1" fill="#581c87"/>
        <path fill="#7e22ce" d="M3 3h10v10H3z"/>
        <path fill="#3b0764" d="M2 2h2v12H2zM2 13h12v1H2z"/>
        <path fill="#f59e0b" d="M12 3h1v1h-1zM12 12h1v1h-1z"/>
        <path fill="#e9d5ff" opacity="0.3" d="M4 4h7v2H4z"/>
    `;

    const emblem = ENCHANTMENT_EMBLEMS[primaryEnch] || `<circle cx="8" cy="7" r="2" fill="#f59e0b"/>`;
    return makeSVG(baseBook + emblem);
}

/**
 * Returns item or book icon wrapped in animated glint overlay if enchanted
 */
function getItemIconHTML(item) {
    const enchs = item.enchantments || item.targetEnchs || {};
    const isEnchanted = Object.keys(enchs).length > 0;

    let innerHtml;
    if (item.isBook) {
        innerHtml = getBookSpriteHTML(enchs);
    } else {
        innerHtml = getItemSpriteHTML(item.category || 'sword');
    }

    return `
        <span class="mc-icon-wrapper ${isEnchanted ? 'is-enchanted' : ''}">
            ${innerHtml}
            ${isEnchanted ? '<span class="mc-glint-overlay"></span>' : ''}
        </span>`;
}
