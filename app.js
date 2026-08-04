/**
 * ANVIL OPTIMIZER — Minecraft 1.21+ Optimal Enchantment Combiner
 * Single-feature app: inventory in → optimal combination protocol out
 */

// ══════════════════════════════════════════════════════════════
// DATA: ENCHANTMENTS & CONFLICTS (Minecraft 1.21)
// ══════════════════════════════════════════════════════════════

const INCOMPATIBILITY_GROUPS = {
    armor_protection: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection'],
    melee_damage: ['sharpness', 'smite', 'bane_of_arthropods'],
    mace_offensive: ['density', 'breach', 'smite', 'bane_of_arthropods', 'sharpness'],
    mining_drop: ['silk_touch', 'fortune'],
    crossbow_shot: ['multishot', 'piercing'],
    boots_water: ['depth_strider', 'frost_walker']
};

const PAIRWISE_CONFLICTS = [
    ['riptide', 'loyalty'],
    ['riptide', 'channeling'],
    ['infinity', 'mending']
];

const ENCHANTMENTS_DB = [
    // Armor
    { id: 'protection', name: 'Protection', maxLevel: 4, bookMul: 1, itemMul: 2, group: 'armor_protection', cats: ['helmet','chestplate','leggings','boots'] },
    { id: 'fire_protection', name: 'Fire Protection', maxLevel: 4, bookMul: 1, itemMul: 2, group: 'armor_protection', cats: ['helmet','chestplate','leggings','boots'] },
    { id: 'blast_protection', name: 'Blast Protection', maxLevel: 4, bookMul: 2, itemMul: 4, group: 'armor_protection', cats: ['helmet','chestplate','leggings','boots'] },
    { id: 'projectile_protection', name: 'Projectile Protection', maxLevel: 4, bookMul: 1, itemMul: 2, group: 'armor_protection', cats: ['helmet','chestplate','leggings','boots'] },
    { id: 'feather_falling', name: 'Feather Falling', maxLevel: 4, bookMul: 1, itemMul: 2, group: null, cats: ['boots'] },
    { id: 'respiration', name: 'Respiration', maxLevel: 3, bookMul: 2, itemMul: 4, group: null, cats: ['helmet'] },
    { id: 'aqua_affinity', name: 'Aqua Affinity', maxLevel: 1, bookMul: 2, itemMul: 4, group: null, cats: ['helmet'] },
    { id: 'thorns', name: 'Thorns', maxLevel: 3, bookMul: 4, itemMul: 8, group: null, cats: ['helmet','chestplate','leggings','boots'] },
    { id: 'depth_strider', name: 'Depth Strider', maxLevel: 3, bookMul: 2, itemMul: 4, group: 'boots_water', cats: ['boots'] },
    { id: 'frost_walker', name: 'Frost Walker', maxLevel: 2, bookMul: 2, itemMul: 4, group: 'boots_water', cats: ['boots'] },
    { id: 'soul_speed', name: 'Soul Speed', maxLevel: 3, bookMul: 4, itemMul: 8, group: null, cats: ['boots'] },
    { id: 'swift_sneak', name: 'Swift Sneak', maxLevel: 3, bookMul: 4, itemMul: 8, group: null, cats: ['leggings'] },
    // Sword
    { id: 'sharpness', name: 'Sharpness', maxLevel: 5, bookMul: 1, itemMul: 2, group: 'melee_damage', cats: ['sword','axe'] },
    { id: 'smite', name: 'Smite', maxLevel: 5, bookMul: 1, itemMul: 2, group: 'melee_damage', cats: ['sword','axe'] },
    { id: 'bane_of_arthropods', name: 'Bane of Arthropods', maxLevel: 5, bookMul: 1, itemMul: 2, group: 'melee_damage', cats: ['sword','axe'] },
    { id: 'knockback', name: 'Knockback', maxLevel: 2, bookMul: 1, itemMul: 2, group: null, cats: ['sword'] },
    { id: 'fire_aspect', name: 'Fire Aspect', maxLevel: 2, bookMul: 2, itemMul: 4, group: null, cats: ['sword','mace'] },
    { id: 'looting', name: 'Looting', maxLevel: 3, bookMul: 2, itemMul: 4, group: null, cats: ['sword'] },
    { id: 'sweeping_edge', name: 'Sweeping Edge', maxLevel: 3, bookMul: 2, itemMul: 4, group: null, cats: ['sword'] },
    // Mace
    { id: 'density', name: 'Density', maxLevel: 5, bookMul: 1, itemMul: 2, group: 'mace_offensive', cats: ['mace'] },
    { id: 'breach', name: 'Breach', maxLevel: 4, bookMul: 2, itemMul: 4, group: 'mace_offensive', cats: ['mace'] },
    { id: 'wind_burst', name: 'Wind Burst', maxLevel: 3, bookMul: 2, itemMul: 4, group: null, cats: ['mace'] },
    // Tools
    { id: 'efficiency', name: 'Efficiency', maxLevel: 5, bookMul: 1, itemMul: 2, group: null, cats: ['pickaxe','shovel','axe','hoe','shears'] },
    { id: 'silk_touch', name: 'Silk Touch', maxLevel: 1, bookMul: 4, itemMul: 8, group: 'mining_drop', cats: ['pickaxe','shovel','axe','hoe'] },
    { id: 'fortune', name: 'Fortune', maxLevel: 3, bookMul: 2, itemMul: 4, group: 'mining_drop', cats: ['pickaxe','shovel','axe','hoe'] },
    // Bow & Crossbow
    { id: 'power', name: 'Power', maxLevel: 5, bookMul: 1, itemMul: 2, group: null, cats: ['bow'] },
    { id: 'punch', name: 'Punch', maxLevel: 2, bookMul: 2, itemMul: 4, group: null, cats: ['bow'] },
    { id: 'flame', name: 'Flame', maxLevel: 1, bookMul: 2, itemMul: 4, group: null, cats: ['bow'] },
    { id: 'infinity', name: 'Infinity', maxLevel: 1, bookMul: 4, itemMul: 8, group: null, cats: ['bow'] },
    { id: 'quick_charge', name: 'Quick Charge', maxLevel: 3, bookMul: 1, itemMul: 2, group: null, cats: ['crossbow'] },
    { id: 'multishot', name: 'Multishot', maxLevel: 1, bookMul: 2, itemMul: 4, group: 'crossbow_shot', cats: ['crossbow'] },
    { id: 'piercing', name: 'Piercing', maxLevel: 4, bookMul: 1, itemMul: 2, group: 'crossbow_shot', cats: ['crossbow'] },
    // Trident
    { id: 'loyalty', name: 'Loyalty', maxLevel: 3, bookMul: 1, itemMul: 2, group: null, cats: ['trident'] },
    { id: 'impaling', name: 'Impaling', maxLevel: 5, bookMul: 2, itemMul: 4, group: null, cats: ['trident'] },
    { id: 'riptide', name: 'Riptide', maxLevel: 3, bookMul: 2, itemMul: 4, group: null, cats: ['trident'] },
    { id: 'channeling', name: 'Channeling', maxLevel: 1, bookMul: 4, itemMul: 8, group: null, cats: ['trident'] },
    // Fishing Rod
    { id: 'luck_of_the_sea', name: 'Luck of the Sea', maxLevel: 3, bookMul: 2, itemMul: 4, group: null, cats: ['fishing_rod'] },
    { id: 'lure', name: 'Lure', maxLevel: 3, bookMul: 2, itemMul: 4, group: null, cats: ['fishing_rod'] },
    // Universal
    { id: 'unbreaking', name: 'Unbreaking', maxLevel: 3, bookMul: 1, itemMul: 2, group: null, cats: ['helmet','chestplate','leggings','boots','sword','mace','pickaxe','shovel','axe','hoe','bow','crossbow','trident','shield','elytra','fishing_rod','flint_and_steel','shears','brush'] },
    { id: 'mending', name: 'Mending', maxLevel: 1, bookMul: 2, itemMul: 4, group: null, cats: ['helmet','chestplate','leggings','boots','sword','mace','pickaxe','shovel','axe','hoe','bow','crossbow','trident','shield','elytra','fishing_rod','flint_and_steel','shears','brush'] },
    // Curses
    { id: 'binding_curse', name: 'Curse of Binding', maxLevel: 1, bookMul: 4, itemMul: 8, group: null, cats: ['helmet','chestplate','leggings','boots','elytra'] },
    { id: 'vanishing_curse', name: 'Curse of Vanishing', maxLevel: 1, bookMul: 4, itemMul: 8, group: null, cats: ['helmet','chestplate','leggings','boots','sword','mace','pickaxe','shovel','axe','hoe','bow','crossbow','trident','shield','elytra','fishing_rod','flint_and_steel','shears','brush'] }
];

const ENCHANT_MAP = new Map(ENCHANTMENTS_DB.map(e => [e.id, e]));

const ITEM_CATEGORIES = [
    { id: 'sword', name: 'Sword', icon: '⚔️' },
    { id: 'axe', name: 'Axe', icon: '🪓' },
    { id: 'pickaxe', name: 'Pickaxe', icon: '⛏️' },
    { id: 'shovel', name: 'Shovel', icon: '🔨' },
    { id: 'hoe', name: 'Hoe', icon: '🌾' },
    { id: 'bow', name: 'Bow', icon: '🏹' },
    { id: 'crossbow', name: 'Crossbow', icon: '🎯' },
    { id: 'trident', name: 'Trident', icon: '🔱' },
    { id: 'mace', name: 'Mace', icon: '🔩' },
    { id: 'helmet', name: 'Helmet', icon: '⛑️' },
    { id: 'chestplate', name: 'Chestplate', icon: '🛡️' },
    { id: 'leggings', name: 'Leggings', icon: '👖' },
    { id: 'boots', name: 'Boots', icon: '👢' },
    { id: 'shield', name: 'Shield', icon: '🛡️' },
    { id: 'elytra', name: 'Elytra', icon: '🪽' },
    { id: 'fishing_rod', name: 'Fishing Rod', icon: '🎣' },
    { id: 'shears', name: 'Shears', icon: '✂️' },
    { id: 'flint_and_steel', name: 'Flint & Steel', icon: '🔥' },
    { id: 'brush', name: 'Brush', icon: '🖌️' }
];

const ITEM_CAT_MAP = new Map(ITEM_CATEGORIES.map(c => [c.id, c]));

// ══════════════════════════════════════════════════════════════
// UTILITY
// ══════════════════════════════════════════════════════════════

function toRoman(n) { return { 1:'I', 2:'II', 3:'III', 4:'IV', 5:'V' }[n] || String(n); }

function fmtEnch(id, level) {
    const e = ENCHANT_MAP.get(id);
    if (!e) return id;
    return e.maxLevel === 1 ? e.name : `${e.name} ${toRoman(level)}`;
}

function capitalize(s) {
    if (!s) return '';
    return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ══════════════════════════════════════════════════════════════
// ENGINE: ANVIL MATH (Minecraft 1.21)
// ══════════════════════════════════════════════════════════════

function getPWP(n) { return n <= 0 ? 0 : Math.pow(2, n) - 1; }

function areIncompatible(idA, idB) {
    if (idA === idB) return false;
    // Pairwise
    for (const [a, b] of PAIRWISE_CONFLICTS) {
        if ((idA === a && idB === b) || (idA === b && idB === a)) return true;
    }
    // Mace offensive group (special: cross-category conflict)
    const mace = INCOMPATIBILITY_GROUPS.mace_offensive;
    if (mace.includes(idA) && mace.includes(idB)) return true;
    // Standard groups
    const eA = ENCHANT_MAP.get(idA), eB = ENCHANT_MAP.get(idB);
    if (eA && eB && eA.group && eA.group === eB.group) return true;
    return false;
}

/**
 * Calculate a single anvil step cost.
 * Returns: { totalCost, enchCost, incompatCost, resultUses, resultEnchs, tooExpensive }
 */
function calcStep(target, sacrifice, ignoreIncompatibility = false) {
    const tPWP = getPWP(target.anvilUses);
    const sPWP = getPWP(sacrifice.anvilUses);

    let enchCost = 0;
    let incompatCost = 0;
    const resultEnchs = { ...target.enchantments };

    for (const [enchId, sacLevel] of Object.entries(sacrifice.enchantments)) {
        const info = ENCHANT_MAP.get(enchId);
        if (!info) continue;

        // If target is an item (not book), skip enchantments not applicable to its category
        if (!target.isBook && target.category && !info.cats.includes(target.category)) continue;

        // Check compatibility with all current target enchantments unless ignoreIncompatibility is true
        let incompat = false;
        if (!ignoreIncompatibility) {
            for (const tId of Object.keys(resultEnchs)) {
                if (areIncompatible(enchId, tId)) { incompat = true; break; }
            }
        }

        if (incompat) {
            incompatCost += 1;
            continue;
        }

        // Level merge logic
        const tLevel = resultEnchs[enchId] || 0;
        let finalLevel;
        if (tLevel === 0) finalLevel = sacLevel;
        else if (sacLevel > tLevel) finalLevel = sacLevel;
        else if (sacLevel === tLevel) finalLevel = Math.min(info.maxLevel, tLevel + 1);
        else finalLevel = tLevel;

        // Cost: Java edition charges based on final level
        const mul = sacrifice.isBook ? info.bookMul : info.itemMul;
        enchCost += finalLevel * mul;
        resultEnchs[enchId] = finalLevel;
    }

    const totalCost = tPWP + sPWP + enchCost + incompatCost;
    const resultUses = Math.max(target.anvilUses, sacrifice.anvilUses) + 1;

    return {
        totalCost,
        tPWP, sPWP,
        enchCost,
        incompatCost,
        resultUses,
        resultEnchs,
        tooExpensive: totalCost >= 40
    };
}

// ══════════════════════════════════════════════════════════════
// OPTIMIZER: DP MEMOIZED STATE-SPACE SEARCH
// ══════════════════════════════════════════════════════════════

function getItemSig(item) {
    const enchs = Object.entries(item.enchantments).sort().map(([k,v]) => `${k}:${v}`).join(',');
    return `${item.isBook ? 'B' : 'G'}:${item.anvilUses}:[${enchs}]`;
}

function getStateKey(items) {
    return items.map(getItemSig).sort().join(';');
}

/**
 * Find optimal combination order.
 * mode: 'xp' (minimize total XP cost) | 'pwp' (minimize final anvil uses, tiebreak by XP)
 */
function findOptimal(items, mode, ignoreIncompatibility = false) {
    if (items.length < 2) return [];

    let bestTotalCost = Infinity;
    let bestFinalUses = Infinity;
    let bestSolutions = [];
    const memo = new Map();

    function evaluateCandidate(cand) {
        if (mode === 'pwp') {
            if (cand.finalUses < bestFinalUses) {
                bestFinalUses = cand.finalUses;
                bestTotalCost = cand.totalCost;
                bestSolutions = [cand];
            } else if (cand.finalUses === bestFinalUses) {
                if (cand.totalCost < bestTotalCost) {
                    bestTotalCost = cand.totalCost;
                    bestSolutions = [cand];
                } else if (cand.totalCost === bestTotalCost) {
                    const sig = cand.steps.map(s => `${s.targetId}+${s.sacrificeId}`).join(';');
                    if (!bestSolutions.some(s => s.steps.map(x => `${x.targetId}+${x.sacrificeId}`).join(';') === sig)) {
                        bestSolutions.push(cand);
                    }
                }
            }
        } else {
            // mode === 'xp'
            if (cand.totalCost < bestTotalCost) {
                bestTotalCost = cand.totalCost;
                bestFinalUses = cand.finalUses;
                bestSolutions = [cand];
            } else if (cand.totalCost === bestTotalCost) {
                if (cand.finalUses < bestFinalUses) {
                    bestFinalUses = cand.finalUses;
                    bestSolutions = [cand];
                } else if (cand.finalUses === bestFinalUses) {
                    const sig = cand.steps.map(s => `${s.targetId}+${s.sacrificeId}`).join(';');
                    if (!bestSolutions.some(s => s.steps.map(x => `${x.targetId}+${x.sacrificeId}`).join(';') === sig)) {
                        bestSolutions.push(cand);
                    }
                }
            }
        }
    }

    function search(current, accCost, maxStep, steps) {
        if (mode === 'xp' && accCost > bestTotalCost) return;

        const key = getStateKey(current);
        if (memo.has(key) && memo.get(key) < accCost) return;
        memo.set(key, accCost);

        if (current.length === 1) {
            const final = current[0];
            if (!final.isBook) {
                evaluateCandidate({
                    finalItem: final,
                    totalCost: accCost,
                    maxStepCost: maxStep,
                    finalUses: final.anvilUses,
                    steps: [...steps]
                });
            }
            return;
        }

        const n = current.length;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === j) continue;
                const target = current[i];
                const sacrifice = current[j];

                if (target.isBook && !sacrifice.isBook) continue;
                if (!target.isBook && !sacrifice.isBook && target.category !== sacrifice.category) continue;

                const res = calcStep(target, sacrifice, ignoreIncompatibility);
                if (res.tooExpensive) continue;

                const enchsChanged = Object.keys(res.resultEnchs).length !== Object.keys(target.enchantments).length ||
                    Object.entries(res.resultEnchs).some(([k, v]) => (target.enchantments[k] || 0) !== v);
                if (!enchsChanged) continue;

                const newItem = {
                    id: `${target.id}+${sacrifice.id}`,
                    name: target.isBook ? 'Combined Book' : target.name,
                    anvilUses: res.resultUses,
                    isBook: target.isBook,
                    enchantments: res.resultEnchs,
                    category: target.category
                };

                const step = {
                    targetName: target.name,
                    targetId: target.id,
                    sacrificeName: sacrifice.name,
                    sacrificeId: sacrifice.id,
                    targetIsBook: target.isBook,
                    sacrificeIsBook: sacrifice.isBook,
                    targetCategory: target.category,
                    sacrificeCategory: sacrifice.category,
                    targetUses: target.anvilUses,
                    sacrificeUses: sacrifice.anvilUses,
                    targetEnchs: { ...target.enchantments },
                    sacrificeEnchs: { ...sacrifice.enchantments },
                    cost: res.totalCost,
                    tPWP: res.tPWP,
                    sPWP: res.sPWP,
                    enchCost: res.enchCost,
                    incompatCost: res.incompatCost,
                    resultUses: res.resultUses,
                    resultEnchs: { ...res.resultEnchs }
                };

                const next = [];
                for (let k = 0; k < n; k++) {
                    if (k !== i && k !== j) next.push(current[k]);
                }
                next.push(newItem);

                search(next, accCost + res.totalCost, Math.max(maxStep, res.totalCost), [...steps, step]);
            }
        }
    }

    search(items, 0, 0, []);
    return bestSolutions;
}


// ══════════════════════════════════════════════════════════════
// UI STATE
// ══════════════════════════════════════════════════════════════

let inventory = [];
let nextId = 1;
let currentMode = 'xp';
let allSolutions = [];
let currentSolutionIndex = 0;

function scrollToBottom() {
    setTimeout(() => {
        const body = document.getElementById('inventory-body');
        if (body) {
            body.scrollTop = body.scrollHeight;
        }
    }, 10);
}

// ══════════════════════════════════════════════════════════════
// UI: INVENTORY MANAGEMENT
// ══════════════════════════════════════════════════════════════

function addItem(category = 'sword') {
    // If a gear item already exists in inventory, match its category
    const existingGear = inventory.find(i => !i.isBook);
    const cat = existingGear ? existingGear.category : category;

    inventory.push({
        uid: nextId++,
        isBook: false,
        category: cat,
        anvilUses: 0,
        enchantments: {}
    });
    renderInventory();
    scrollToBottom();
}

function addBook() {
    const allowConflicts = document.getElementById('toggle-conflicts')?.checked || false;

    // Find all enchantment IDs currently in inventory
    const usedEnchIds = new Set();
    const existingEnchIds = [];
    for (const item of inventory) {
        for (const enchId of Object.keys(item.enchantments)) {
            usedEnchIds.add(enchId);
            existingEnchIds.push(enchId);
        }
    }

    // Find current gear item if any
    const gearItem = inventory.find(i => !i.isBook);
    let selectedEnch = null;

    if (gearItem) {
        // Find enchantments for this gear's category that haven't been added yet
        const candidates = ENCHANTMENTS_DB.filter(e => e.cats.includes(gearItem.category) && !usedEnchIds.has(e.id));
        if (allowConflicts) {
            selectedEnch = candidates[0] || null;
        } else {
            // Must NOT conflict with any existing enchantment in inventory
            selectedEnch = candidates.find(cand => {
                return !existingEnchIds.some(existId => areIncompatible(cand.id, existId));
            }) || null;
        }
    }

    // Fallback if no gear item or all gear category enchantments used: pick any unused enchantment
    if (!selectedEnch) {
        const candidates = ENCHANTMENTS_DB.filter(e => !usedEnchIds.has(e.id));
        if (allowConflicts) {
            selectedEnch = candidates[0] || null;
        } else {
            selectedEnch = candidates.find(cand => {
                return !existingEnchIds.some(existId => areIncompatible(cand.id, existId));
            }) || null;
        }
    }

    const initialEnchs = {};
    if (selectedEnch) {
        initialEnchs[selectedEnch.id] = selectedEnch.maxLevel;
    }

    inventory.push({
        uid: nextId++,
        isBook: true,
        category: null,
        anvilUses: 0,
        enchantments: initialEnchs
    });
    renderInventory();
    scrollToBottom();
}

function removeItem(uid) {
    inventory = inventory.filter(i => i.uid !== uid);
    renderInventory();
}

function addEnchantment(uid) {
    const item = inventory.find(i => i.uid === uid);
    if (!item) return;
    // Find an enchantment not already on this item
    const available = getAvailableEnchantments(item);
    if (available.length === 0) return;
    const ench = available[0];
    item.enchantments[ench.id] = 1;
    renderInventory();
}

function removeEnchantment(uid, enchId) {
    const item = inventory.find(i => i.uid === uid);
    if (!item) return;
    delete item.enchantments[enchId];
    renderInventory();
}

function getAvailableEnchantments(item) {
    let list;
    if (item.isBook) {
        // Books can have any enchantment
        list = ENCHANTMENTS_DB.filter(e => !(e.id in item.enchantments));
    } else {
        // Items: filter by category
        list = ENCHANTMENTS_DB.filter(e => e.cats.includes(item.category) && !(e.id in item.enchantments));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
}

function updateItemCategory(uid, newCat) {
    const item = inventory.find(i => i.uid === uid);
    if (!item) return;
    item.category = newCat;
    // Remove enchantments that don't apply to new category
    for (const enchId of Object.keys(item.enchantments)) {
        const info = ENCHANT_MAP.get(enchId);
        if (info && !info.cats.includes(newCat)) {
            delete item.enchantments[enchId];
        }
    }
    renderInventory();
}

function updateItemUses(uid, val) {
    const item = inventory.find(i => i.uid === uid);
    if (!item) return;
    item.anvilUses = Math.max(0, Math.min(31, parseInt(val) || 0));
}

function updateEnchantId(uid, oldId, newId) {
    const item = inventory.find(i => i.uid === uid);
    if (!item) return;
    const level = item.enchantments[oldId] || 1;
    delete item.enchantments[oldId];
    const info = ENCHANT_MAP.get(newId);
    item.enchantments[newId] = Math.min(level, info ? info.maxLevel : 1);
    renderInventory();
}

function updateEnchantLevel(uid, enchId, level) {
    const item = inventory.find(i => i.uid === uid);
    if (!item) return;
    item.enchantments[enchId] = parseInt(level) || 1;
}

// ══════════════════════════════════════════════════════════════
// UI: RENDER INVENTORY
// ══════════════════════════════════════════════════════════════

function renderInventory() {
    const list = document.getElementById('inventory-list');
    const count = document.getElementById('item-count');
    count.textContent = `${inventory.length} item${inventory.length !== 1 ? 's' : ''}`;

    list.innerHTML = inventory.map(item => {
        const isBook = item.isBook;
        const catInfo = isBook ? null : ITEM_CAT_MAP.get(item.category);
        const iconHTML = getItemIconHTML(item);
        const title = isBook ? 'Enchanted Book' : (catInfo ? catInfo.name : 'Item');

        // Category selector for items (not books)
        let catSelect = '';
        if (!isBook) {
            catSelect = `
                <div class="item-card-row">
                    <label>Type</label>
                    <select onchange="updateItemCategory(${item.uid}, this.value)">
                        ${ITEM_CATEGORIES.map(c =>
                            `<option value="${c.id}" ${c.id === item.category ? 'selected' : ''}>${c.name}</option>`
                        ).join('')}
                    </select>
                </div>`;
        }

        // Anvil uses
        const usesRow = `
            <div class="item-card-row">
                <label>Anvil Uses</label>
                <input type="number" class="uses-input" value="${item.anvilUses}" min="0" max="31"
                    onchange="updateItemUses(${item.uid}, this.value)"
                    onblur="updateItemUses(${item.uid}, this.value)">
                <span style="font-size:0.7rem;color:var(--text-3);margin-left:0.2rem">PWP: ${getPWP(item.anvilUses)}</span>
            </div>`;

        // Enchantment rows
        const enchIds = Object.keys(item.enchantments);
        const available = getAvailableEnchantments(item);

        const enchRows = enchIds.map(enchId => {
            const info = ENCHANT_MAP.get(enchId);
            if (!info) return '';
            const level = item.enchantments[enchId];

            // Build options: current ench + all available (sorted alphabetically)
            const otherAvailable = available.filter(e => e.id !== enchId);
            const allOptions = [info, ...otherAvailable].sort((a, b) => a.name.localeCompare(b.name));

            let levelOptions = '';
            for (let l = 1; l <= info.maxLevel; l++) {
                levelOptions += `<option value="${l}" ${l === level ? 'selected' : ''}>${toRoman(l)}</option>`;
            }

            return `
                <div class="ench-row">
                    <select onchange="updateEnchantId(${item.uid}, '${enchId}', this.value)">
                        ${allOptions.map(e =>
                            `<option value="${e.id}" ${e.id === enchId ? 'selected' : ''}>${e.name}</option>`
                        ).join('')}
                    </select>
                    <select class="level-select" onchange="updateEnchantLevel(${item.uid}, '${enchId}', this.value)">
                        ${levelOptions}
                    </select>
                    <button class="btn-remove-ench" onclick="removeEnchantment(${item.uid}, '${enchId}')" aria-label="Remove enchantment">×</button>
                </div>`;
        }).join('');

        const canAdd = available.length > 0;

        return `
            <div class="item-card">
                <div class="item-card-header">
                    <div class="item-card-title">${iconHTML} <span>${title}</span></div>
                    <button class="btn-remove-item" onclick="removeItem(${item.uid})" aria-label="Remove item">×</button>
                </div>
                ${catSelect}
                ${usesRow}
                ${enchRows}
                ${canAdd ? `<button class="btn-add-ench" onclick="addEnchantment(${item.uid})">+ Add Enchantment</button>` : ''}
            </div>`;
    }).join('');
}

// ══════════════════════════════════════════════════════════════
// UI: RUN OPTIMIZER & RENDER PROTOCOL
// ══════════════════════════════════════════════════════════════

function calculate() {
    const emptyEl = document.getElementById('protocol-empty');
    const resultEl = document.getElementById('protocol-results');
    const errorEl = document.getElementById('protocol-error');
    const statusEl = document.getElementById('protocol-status');

    // Validate
    if (inventory.length < 2) {
        emptyEl.classList.add('hidden');
        resultEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
        errorEl.innerHTML = `<div class="error-msg">Add at least 2 items/books to calculate a combination.</div>`;
        return;
    }

    // Check that at least one non-book item exists
    const hasItem = inventory.some(i => !i.isBook);
    if (!hasItem) {
        emptyEl.classList.add('hidden');
        resultEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
        errorEl.innerHTML = `<div class="error-msg">Add at least one item (not a book) as the target to combine into.</div>`;
        return;
    }

    // Check that at least one enchantment exists
    const hasEnch = inventory.some(i => Object.keys(i.enchantments).length > 0);
    if (!hasEnch) {
        emptyEl.classList.add('hidden');
        resultEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
        errorEl.innerHTML = `<div class="error-msg">Add at least one enchantment to your items/books.</div>`;
        return;
    }

    // Build items for optimizer — number duplicates (Sword #1, Sword #2)
    const catCounts = {};
    const catIndices = {};
    for (const item of inventory) {
        const key = item.isBook ? 'book' : item.category;
        catCounts[key] = (catCounts[key] || 0) + 1;
    }
    const optItems = inventory.map(item => {
        const key = item.isBook ? 'book' : item.category;
        catIndices[key] = (catIndices[key] || 0) + 1;
        const needsNum = catCounts[key] > 1;
        let name;
        if (item.isBook) {
            name = needsNum ? `${bookName(item)} (#${catIndices[key]})` : bookName(item);
        } else {
            name = needsNum ? `${capitalize(item.category)} #${catIndices[key]}` : capitalize(item.category);
        }
        return {
            id: `${item.isBook ? 'Book' : capitalize(item.category)}_${item.uid}`,
            name,
            anvilUses: item.anvilUses,
            isBook: item.isBook,
            enchantments: { ...item.enchantments },
            category: item.category
        };
    });

    statusEl.textContent = 'Computing...';

    // Run async to allow UI update
    setTimeout(() => {
        const t0 = performance.now();
        const allowConflicts = document.getElementById('toggle-conflicts')?.checked || false;
        const solutions = findOptimal(optItems, currentMode, allowConflicts);
        const dt = performance.now() - t0;

        statusEl.textContent = `${dt.toFixed(0)}ms`;

        if (!solutions || solutions.length === 0) {
            allSolutions = [];
            currentSolutionIndex = 0;
            emptyEl.classList.add('hidden');
            resultEl.classList.add('hidden');
            errorEl.classList.remove('hidden');
            errorEl.innerHTML = `<div class="error-msg">No valid combination found. Every path exceeds the "Too Expensive!" limit (≥40 levels per step). Try using fewer enchantments or items with lower anvil uses.</div>`;
            return;
        }

        allSolutions = solutions;
        currentSolutionIndex = 0;
        emptyEl.classList.add('hidden');
        errorEl.classList.add('hidden');
        resultEl.classList.remove('hidden');
        renderProtocol();
    }, 10);
}

function bookName(item) {
    const enchIds = Object.keys(item.enchantments);
    if (enchIds.length === 0) return 'Empty Book';
    if (enchIds.length === 1) return fmtEnch(enchIds[0], item.enchantments[enchIds[0]]);
    return enchIds.slice(0, 2).map(id => fmtEnch(id, item.enchantments[id])).join(', ') +
           (enchIds.length > 2 ? ` +${enchIds.length - 2}` : '');
}

function renderProtocol() {
    if (!allSolutions || allSolutions.length === 0) return;
    const solution = allSolutions[currentSolutionIndex];

    const summaryEl = document.getElementById('protocol-summary');
    const stepsEl = document.getElementById('protocol-steps');
    const warningsEl = document.getElementById('protocol-warnings');

    // Warnings
    let warnings = '';
    if (solution.maxStepCost >= 30) {
        warnings = `<div class="warning-msg">⚠️ Most expensive step costs ${solution.maxStepCost} levels — close to the 39-level limit!</div>`;
    }
    warningsEl.innerHTML = warnings;

    // Summary
    const modeLabel = currentMode === 'xp' ? 'XP-Optimized' : 'PWP-Optimized';
    summaryEl.innerHTML = `
        <div class="summary-stat">
            <div class="stat-label">Total Cost</div>
            <div class="stat-value">${solution.totalCost} lvl</div>
            <div class="stat-sub">${solution.steps.length} step${solution.steps.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="summary-stat">
            <div class="stat-label">Final PWP</div>
            <div class="stat-value pwp-value">${getPWP(solution.finalUses)}</div>
            <div class="stat-sub">${solution.finalUses} anvil uses</div>
        </div>
        <div class="summary-stat">
            <div class="stat-label">Mode</div>
            <div class="stat-value" style="font-size:0.9rem;color:${currentMode === 'xp' ? 'var(--emerald)' : 'var(--indigo)'}">${modeLabel}</div>
            <div class="stat-sub">Max step: ${solution.maxStepCost} lvl</div>
        </div>`;

    // Steps
    const stepsHtml = solution.steps.map((step, i) => {
        const costClass = step.cost >= 35 ? 'too-expensive' : step.cost >= 25 ? 'high-cost' : '';
        const tIcon = getItemIconHTML({ isBook: step.targetIsBook, category: step.targetCategory, enchantments: step.targetEnchs });
        const sIcon = getItemIconHTML({ isBook: step.sacrificeIsBook, category: step.sacrificeCategory, enchantments: step.sacrificeEnchs });
        const rIcon = getItemIconHTML({ isBook: step.targetIsBook, category: step.targetCategory, enchantments: step.resultEnchs });

        // Build descriptive names with current enchantments
        const tEnchStr = Object.entries(step.targetEnchs).map(([id, lv]) => fmtEnch(id, lv)).join(', ');
        const sEnchStr = Object.entries(step.sacrificeEnchs).map(([id, lv]) => fmtEnch(id, lv)).join(', ');
        const rEnchStr = Object.entries(step.resultEnchs).map(([id, lv]) => fmtEnch(id, lv)).join(', ');

        const tLabel = step.targetIsBook ? 'Book' : step.targetName.replace(/ #\d+$/, '');
        const sLabel = step.sacrificeIsBook ? 'Book' : step.sacrificeName.replace(/ #\d+$/, '');
        const rLabel = step.targetIsBook ? 'Book' : step.targetName.replace(/ #\d+$/, '');

        const tDisplay = tEnchStr ? `${tLabel} (${tEnchStr})` : tLabel;
        const sDisplay = sEnchStr ? `${sLabel} (${sEnchStr})` : sLabel;
        const rDisplay = rEnchStr ? `${rLabel} (${rEnchStr})` : rLabel;

        return `
            <div class="step-card ${step.cost >= 35 ? 'warning' : ''}">
                <div class="step-num">${i + 1}</div>
                <div class="step-detail">
                    <div class="step-title">
                        <span>${tIcon} ${tDisplay}</span>
                        <span class="step-op">+</span>
                        <span>${sIcon} ${sDisplay}</span>
                        <span class="step-op">=</span>
                        <span class="step-result">${rIcon} ${rDisplay}</span>
                    </div>
                    <div class="step-meta">
                        <span>PWP: ${step.tPWP}+${step.sPWP}</span>
                        <span>Ench: ${step.enchCost}${step.incompatCost ? ` +${step.incompatCost} incompat` : ''}</span>
                        <span>→ Uses: ${step.resultUses}</span>
                    </div>
                </div>
                <div class="step-cost ${costClass}">${step.cost} lvl</div>
            </div>`;
    }).join('');

    let shuffleHtml = '';
    if (allSolutions.length > 1) {
        shuffleHtml = `
            <div class="protocol-nav-bar">
                <button class="btn-nav" title="Previous Protocol" onclick="changeProtocolIndex(-1)">◀</button>
                <div class="protocol-nav-label">
                    Protocol
                    <input type="number" class="protocol-num-input" id="protocol-num-input"
                        min="1" max="${allSolutions.length}" value="${currentSolutionIndex + 1}"
                        onchange="jumpToProtocol(this.value)"
                        onkeydown="if(event.key==='Enter') jumpToProtocol(this.value)">
                    of ${allSolutions.length}
                </div>
                <button class="btn-nav" title="Next Protocol" onclick="changeProtocolIndex(1)">▶</button>
                <button class="btn-random" title="Random Protocol" onclick="randomProtocol()">🔀 Random</button>
            </div>`;
    }

    stepsEl.innerHTML = stepsHtml + shuffleHtml;
}

function changeProtocolIndex(delta) {
    if (!allSolutions || allSolutions.length <= 1) return;
    currentSolutionIndex = (currentSolutionIndex + delta + allSolutions.length) % allSolutions.length;
    renderProtocol();
}

function jumpToProtocol(val) {
    if (!allSolutions || allSolutions.length <= 1) return;
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 1;
    num = Math.max(1, Math.min(allSolutions.length, num));
    currentSolutionIndex = num - 1;
    renderProtocol();
}

function randomProtocol() {
    if (!allSolutions || allSolutions.length <= 1) return;
    currentSolutionIndex = Math.floor(Math.random() * allSolutions.length);
    renderProtocol();
}

// ══════════════════════════════════════════════════════════════
// EVENT WIRING
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Render authentic Minecraft header & mode icons
    const headerIcon = document.getElementById('header-anvil-icon');
    if (headerIcon) headerIcon.innerHTML = getAnvilIconHTML(28);

    const xpIcon = document.getElementById('xp-mode-icon');
    if (xpIcon) xpIcon.innerHTML = getXPOrbIconHTML(18);

    const pwpIcon = document.getElementById('pwp-mode-icon');
    if (pwpIcon) pwpIcon.innerHTML = getAnvilIconHTML(18);

    // Start cycling through XP orb frames
    startXPOrbAnimation();

    document.getElementById('btn-add-item').addEventListener('click', () => addItem());
    document.getElementById('btn-add-book').addEventListener('click', () => addBook());
    document.getElementById('btn-calculate').addEventListener('click', () => calculate());

    // Mode toggle
    document.getElementById('mode-xp').addEventListener('click', () => setMode('xp'));
    document.getElementById('mode-pwp').addEventListener('click', () => setMode('pwp'));

    // Conflict toggle
    document.getElementById('toggle-conflicts').addEventListener('change', () => {
        if (inventory.length >= 2) {
            calculate();
        }
    });

    // Start with one sword and one book for convenience
    addItem('sword');
    addBook();
});

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    // Always auto-recalculate if inventory has 2+ items
    if (inventory.length >= 2) {
        calculate();
    }
}
