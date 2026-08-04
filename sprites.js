/**
 * MINECRAFT 1.21 AUTHENTIC ITEM PNG TEXTURES & MYTHITORIUM EVEN BETTER ENCHANTS
 * Official Minecraft game textures + Mythitorium's Authentic Book PNGs + Glint Mask
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

/**
 * Returns authentic 3D Isometric Minecraft Anvil SVG
 */
function getAnvilIconSVG(size = 24) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" class="mc-sprite mc-anvil-sprite">
        <!-- Top Face -->
        <path fill="#64748b" d="M3 2h10v2H3z"/>
        <path fill="#94a3b8" d="M3 2h10v1H3z"/>
        <!-- Horn / Nose -->
        <path fill="#475569" d="M1 3h2v2H1zM13 3h2v1h-2z"/>
        <!-- Top Body -->
        <path fill="#334155" d="M2 4h12v3H2z"/>
        <path fill="#1e293b" d="M11 4h3v3h-3z"/>
        <!-- Waist Column -->
        <path fill="#334155" d="M5 7h6v4H5z"/>
        <path fill="#1e293b" d="M8 7h3v4H8z"/>
        <!-- Stepped Base -->
        <path fill="#475569" d="M3 11h10v1H3z"/>
        <path fill="#1e293b" d="M2 12h12v3H2z"/>
        <path fill="#334155" d="M2 12h12v1H2z"/>
    </svg>`;
}

/**
 * Returns animated glowing Minecraft XP Orb SVG
 */
function getXPOrbIconSVG(size = 20) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" class="mc-sprite mc-xp-orb">
        <circle cx="8" cy="8" r="6" fill="#84cc16" opacity="0.35" class="xp-glow"/>
        <rect x="5" y="5" width="6" height="6" rx="1" fill="#a3e635"/>
        <rect x="6" y="6" width="4" height="4" fill="#fef08a"/>
        <rect x="7" y="7" width="2" height="2" fill="#ffffff"/>
        <path fill="#65a30d" d="M5 5h1v6H5zM5 10h6v1H5z"/>
    </svg>`;
}

/**
 * Returns authentic Mythitorium PNG image URL for an enchanted book
 */
function getBookTextureURL(enchantments = {}) {
    const entries = Object.entries(enchantments);
    if (entries.length === 0) {
        return ITEM_PNG_URLS.book;
    }

    const [enchId, lvl] = entries[0];
    const levelNum = Math.max(1, parseInt(lvl) || 1);
    
    return `assets/books/${enchId}_${levelNum}.png`;
}

/**
 * Returns item or book icon wrapped in animated glint overlay (strictly masked to item shape)
 */
function getItemIconHTML(item) {
    const enchs = item.enchantments || item.targetEnchs || {};
    const isEnchanted = Object.keys(enchs).length > 0;

    const imgUrl = item.isBook ? getBookTextureURL(enchs) : (ITEM_PNG_URLS[item.category] || ITEM_PNG_URLS.sword);
    const imgHtml = `<img src="${imgUrl}" class="mc-sprite mc-item-png" alt="${item.category || 'item'}" onerror="this.src='${ITEM_PNG_URLS.book}'" />`;

    return `
        <span class="mc-icon-wrapper ${isEnchanted ? 'is-enchanted' : ''}" style="--item-mask: url('${imgUrl}')">
            ${imgHtml}
            ${isEnchanted ? '<span class="mc-glint-overlay"></span>' : ''}
        </span>`;
}
