/**
 * MINECRAFT 1.21 AUTHENTIC ITEM PNG TEXTURES & MYTHITORIUM EVEN BETTER ENCHANTS
 * Official Minecraft game textures + Mythitorium's Authentic Book PNGs + Glint Mask
 */

const MC_ASSETS_BASE = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/";

// Real in-game Minecraft item PNG texture URLs
const ITEM_PNG_URLS = {
    sword: MC_ASSETS_BASE + "netherite_sword.png",
    axe: MC_ASSETS_BASE + "netherite_axe.png",
    pickaxe: MC_ASSETS_BASE + "netherite_pickaxe.png",
    shovel: MC_ASSETS_BASE + "netherite_shovel.png",
    hoe: MC_ASSETS_BASE + "netherite_hoe.png",
    bow: MC_ASSETS_BASE + "bow.png",
    crossbow: MC_ASSETS_BASE + "crossbow_standby.png",
    trident: MC_ASSETS_BASE + "trident.png",
    spear: "assets/spear.png",
    mace: MC_ASSETS_BASE + "mace.png",
    helmet: MC_ASSETS_BASE + "netherite_helmet.png",
    chestplate: MC_ASSETS_BASE + "netherite_chestplate.png",
    leggings: MC_ASSETS_BASE + "netherite_leggings.png",
    boots: MC_ASSETS_BASE + "netherite_boots.png",
    shield: MC_ASSETS_BASE + "shield.png",
    elytra: MC_ASSETS_BASE + "elytra.png",
    fishing_rod: MC_ASSETS_BASE + "fishing_rod.png",
    shears: MC_ASSETS_BASE + "shears.png",
    flint_and_steel: MC_ASSETS_BASE + "flint_and_steel.png",
    brush: MC_ASSETS_BASE + "brush.png",
    book: MC_ASSETS_BASE + "book.png"
};

// 3D rendered Anvil from Minecraft Wiki (browser can load directly)
const ANVIL_WIKI_URL = "https://minecraft.wiki/images/Anvil_%28N%29_JE3.png?d438e";

// Authentic animated 3D Enchanted Book directly from official Minecraft Wiki
const ENCHANTED_BOOK_WIKI_URL = "https://minecraft.wiki/images/Enchanted_Book.gif?b21c4";

// All 11 rendered Experience Orb value-tier images from Minecraft Wiki
// These are the green glowing orbs seen in-game, not the raw texture atlas
const XP_ORB_URLS = [
    "https://minecraft.wiki/images/Experience_Orb_Value_-32768-2.png?563f1",
    "https://minecraft.wiki/images/Experience_Orb_Value_3-6.png?6de8c",
    "https://minecraft.wiki/images/Experience_Orb_Value_7-16.png?7ba42",
    "https://minecraft.wiki/images/Experience_Orb_Value_17-36.png?ecbc0",
    "https://minecraft.wiki/images/Experience_Orb_Value_37-72.png?cb2d5",
    "https://minecraft.wiki/images/Experience_Orb_Value_73-148.png?1eec1",
    "https://minecraft.wiki/images/Experience_Orb_Value_149-306.png?0e61c",
    "https://minecraft.wiki/images/Experience_Orb_Value_307-616.png?175d5",
    "https://minecraft.wiki/images/Experience_Orb_Value_617-1236.png?b2ceb",
    "https://minecraft.wiki/images/Experience_Orb_Value_1237-2476.png?6c709",
    "https://minecraft.wiki/images/Experience_Orb_Value_2477-32767.png?cce67"
];

/**
 * Returns authentic 3D Isometric Minecraft Anvil icon HTML.
 * Loads directly from the Minecraft Wiki (browsers are not blocked).
 */
function getAnvilIconHTML(size = 24) {
    return `<img src="${ANVIL_WIKI_URL}" width="${size}" height="${size}" class="mc-sprite mc-anvil-img" alt="Anvil" crossorigin="anonymous" referrerpolicy="no-referrer" />`;
}

/**
 * Returns authentic animated 3D Minecraft Enchanted Book icon HTML.
 * Loads directly from the Minecraft Wiki (browsers are not blocked).
 */
function getEnchantedBookIconHTML(size = 32) {
    return `<img src="${ENCHANTED_BOOK_WIKI_URL}" width="${size}" height="${size}" class="mc-sprite mc-enchanted-book-img" alt="Enchanted Book" crossorigin="anonymous" referrerpolicy="no-referrer" />`;
}

/**
 * Returns animated Minecraft XP Orb HTML.
 *
 * Creates a container with all 11 rendered XP orb images stacked on top
 * of each other. JavaScript cycles through them to create the authentic
 * size-shifting animation seen in-game.
 */
function getXPOrbIconHTML(size = 20) {
    const imgs = XP_ORB_URLS.map((url, i) =>
        `<img src="${url}" width="${size}" height="${size}" class="mc-xp-orb-frame${i === 0 ? ' active' : ''}" alt="" crossorigin="anonymous" referrerpolicy="no-referrer" />`
    ).join('');

    return `<span class="mc-xp-orb-anim" style="width:${size}px;height:${size}px;">${imgs}</span>`;
}

// Animate XP orbs by cycling frames
let _xpOrbInterval = null;
function startXPOrbAnimation() {
    if (_xpOrbInterval) return;
    let frame = 0;
    _xpOrbInterval = setInterval(() => {
        document.querySelectorAll('.mc-xp-orb-anim').forEach(container => {
            const frames = container.querySelectorAll('.mc-xp-orb-frame');
            if (frames.length === 0) return;
            frames.forEach(f => f.classList.remove('active'));
            frame = (frame + 1) % frames.length;
            frames[frame].classList.add('active');
        });
    }, 150); // ~6.67 fps, matching Minecraft's orb animation speed
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
 * Returns item or book icon wrapped in animated glint overlay
 */
function getItemIconHTML(item) {
    const enchs = item.enchantments || item.targetEnchs || {};
    const isEnchanted = Object.keys(enchs).length > 0;

    if (item.isBook || item.targetIsBook || item.sacrificeIsBook) {
        return `
            <span class="mc-icon-wrapper">
                <img src="${ENCHANTED_BOOK_WIKI_URL}" class="mc-sprite mc-item-png" alt="Enchanted Book" crossorigin="anonymous" referrerpolicy="no-referrer" />
            </span>`;
    }

    const imgUrl = ITEM_PNG_URLS[item.category] || ITEM_PNG_URLS.sword;
    const imgHtml = `<img src="${imgUrl}" class="mc-sprite mc-item-png" alt="${item.category || 'item'}" onerror="this.src='${ITEM_PNG_URLS.sword}'" />`;

    return `
        <span class="mc-icon-wrapper ${isEnchanted ? 'is-enchanted' : ''}" style="--item-mask: url('${imgUrl}')">
            ${imgHtml}
            ${isEnchanted ? '<span class="mc-glint-overlay"></span>' : ''}
        </span>`;
}
