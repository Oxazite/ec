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
 * Returns authentic Mythitorium PNG image URL for an enchanted book
 */
function getBookTextureURL(enchantments = {}) {
    const entries = Object.entries(enchantments);
    if (entries.length === 0) {
        return ITEM_PNG_URLS.book;
    }

    // Use primary (first) enchantment and its level
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
