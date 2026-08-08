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
    // Sword & Spear
    { id: 'sharpness', name: 'Sharpness', maxLevel: 5, bookMul: 1, itemMul: 2, group: 'melee_damage', cats: ['sword','axe','spear'] },
    { id: 'smite', name: 'Smite', maxLevel: 5, bookMul: 1, itemMul: 2, group: 'melee_damage', cats: ['sword','axe','spear'] },
    { id: 'bane_of_arthropods', name: 'Bane of Arthropods', maxLevel: 5, bookMul: 1, itemMul: 2, group: 'melee_damage', cats: ['sword','axe','spear'] },
    { id: 'knockback', name: 'Knockback', maxLevel: 2, bookMul: 1, itemMul: 2, group: null, cats: ['sword','spear'] },
    { id: 'fire_aspect', name: 'Fire Aspect', maxLevel: 2, bookMul: 2, itemMul: 4, group: null, cats: ['sword','mace','spear'] },
    { id: 'looting', name: 'Looting', maxLevel: 3, bookMul: 2, itemMul: 4, group: null, cats: ['sword','spear'] },
    { id: 'sweeping_edge', name: 'Sweeping Edge', maxLevel: 3, bookMul: 2, itemMul: 4, group: null, cats: ['sword'] },
    // Spear Exclusive
    { id: 'lunge', name: 'Lunge', maxLevel: 3, bookMul: 2, itemMul: 4, group: null, cats: ['spear'] },
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
    { id: 'unbreaking', name: 'Unbreaking', maxLevel: 3, bookMul: 1, itemMul: 2, group: null, cats: ['helmet','chestplate','leggings','boots','sword','mace','pickaxe','shovel','axe','hoe','bow','crossbow','trident','spear','shield','elytra','fishing_rod','flint_and_steel','shears','brush'] },
    { id: 'mending', name: 'Mending', maxLevel: 1, bookMul: 2, itemMul: 4, group: null, cats: ['helmet','chestplate','leggings','boots','sword','mace','pickaxe','shovel','axe','hoe','bow','crossbow','trident','spear','shield','elytra','fishing_rod','flint_and_steel','shears','brush'] },
    // Curses
    { id: 'binding_curse', name: 'Curse of Binding', maxLevel: 1, bookMul: 4, itemMul: 8, group: null, cats: ['helmet','chestplate','leggings','boots','elytra'] },
    { id: 'vanishing_curse', name: 'Curse of Vanishing', maxLevel: 1, bookMul: 4, itemMul: 8, group: null, cats: ['helmet','chestplate','leggings','boots','sword','mace','pickaxe','shovel','axe','hoe','bow','crossbow','trident','spear','shield','elytra','fishing_rod','flint_and_steel','shears','brush'] }
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
    { id: 'spear', name: 'Spear', icon: '🗡️' },
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
function findOptimal(items, mode, ignoreIncompatibility = false, extraTimeMs = 0) {
    if (items.length < 2) return [];

    let bestTotalCost = Infinity;
    let bestFinalUses = Infinity;
    let bestSolutions = [];
    const memo = new Map();

    // Safety limits to prevent browser freeze (10s base limit)
    const TIME_LIMIT_MS = 10000 + extraTimeMs;
    const ITERATION_CAP = 2500000 + (extraTimeMs ? 5000000 : 0);
    const startTime = performance.now();
    let iterations = 0;
    let hitLimit = false;

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
        // Check safety limits every 1000 iterations
        if (++iterations % 1000 === 0) {
            if (iterations >= ITERATION_CAP || (performance.now() - startTime) >= TIME_LIMIT_MS) {
                hitLimit = true;
                return;
            }
        }
        if (hitLimit) return;

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
                if (hitLimit) return;
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
                    category: target.category,
                    invIndex: Math.min(target.invIndex ?? 999, sacrifice.invIndex ?? 999)
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
                    resultEnchs: { ...res.resultEnchs },
                    sacrificeInvIndex: sacrifice.invIndex ?? 999
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

    // Tie-break equal-cost solutions by matching inventory placement order
    if (bestSolutions.length > 1) {
        bestSolutions.sort((a, b) => {
            const orderA = a.steps.map(s => s.sacrificeInvIndex);
            const orderB = b.steps.map(s => s.sacrificeInvIndex);
            for (let k = 0; k < Math.max(orderA.length, orderB.length); k++) {
                const valA = orderA[k] ?? 999;
                const valB = orderB[k] ?? 999;
                if (valA !== valB) return valA - valB;
            }
            return 0;
        });
    }

    // Attach metadata about search limits
    if (bestSolutions.length > 0) {
        bestSolutions._hitLimit = hitLimit;
        bestSolutions._iterations = iterations;
    }

    return bestSolutions;
}


// ══════════════════════════════════════════════════════════════
// UI STATE
// ══════════════════════════════════════════════════════════════

let inventory = [];
let nextId = 1;
let currentMode = null;
let allSolutions = [];
let currentSolutionIndex = 0;
let loadedProtocolsCount = 100;
let currentIgnoredBooks = [];
let currentExtraTimeMs = 0;

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

    // Find current target gear item if any
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

        if (!selectedEnch) {
            const catName = capitalize(gearItem.category);
            if (!allowConflicts) {
                showConflictWarning(`All non-conflicting enchantments for ${catName} have already been added as books. Turn on "Allow Conflicting Enchantments" on the left panel to add conflicting books.`);
            } else {
                showConflictWarning(`All available enchantments for ${catName} have already been added as books.`);
            }
            return;
        }
    } else {
        // No gear item in inventory yet: pick any unused enchantment
        const candidates = ENCHANTMENTS_DB.filter(e => !usedEnchIds.has(e.id));
        if (allowConflicts) {
            selectedEnch = candidates[0] || null;
        } else {
            selectedEnch = candidates.find(cand => {
                return !existingEnchIds.some(existId => areIncompatible(cand.id, existId));
            }) || null;
        }

        if (!selectedEnch) {
            if (!allowConflicts) {
                showConflictWarning('No non-conflicting enchantments available for a new book. Turn on "Allow Conflicting Enchantments" on the left panel to add more books.');
            } else {
                showConflictWarning('All available enchantments in Minecraft 1.21 have already been added as books.');
            }
            return;
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

function showConflictWarning(msg) {
    const errorEl = document.getElementById('protocol-error');
    const emptyEl = document.getElementById('protocol-empty');
    const resultEl = document.getElementById('protocol-results');
    if (errorEl) {
        if (emptyEl) emptyEl.classList.add('hidden');
        if (resultEl) resultEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
        errorEl.innerHTML = `<div class="error-msg" style="background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.35);color:var(--red);margin-bottom:0.75rem;">⚠️ ${msg}</div>`;
    }
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
    if (available.length === 0) {
        const allowConflicts = document.getElementById('toggle-conflicts')?.checked || false;
        if (!allowConflicts) {
            showConflictWarning(`No non-conflicting enchantments available for this ${item.isBook ? 'book' : 'item'}. Turn on "Allow Conflicting Enchantments" on the left panel to add more enchantments.`);
        }
        return;
    }
    const ench = available[0];
    item.enchantments[ench.id] = ench.maxLevel; // Max level automatically
    renderInventory();
}

function removeEnchantment(uid, enchId) {
    const item = inventory.find(i => i.uid === uid);
    if (!item) return;
    delete item.enchantments[enchId];
    renderInventory();
}

function getItemCardConflicts(item) {
    const enchIds = Object.keys(item.enchantments);
    const conflicts = [];

    // 1. Intra-item conflicts (on this item itself)
    for (let i = 0; i < enchIds.length; i++) {
        for (let j = i + 1; j < enchIds.length; j++) {
            if (areIncompatible(enchIds[i], enchIds[j])) {
                conflicts.push({ type: 'self', enchA: enchIds[i], enchB: enchIds[j] });
            }
        }
    }

    // 2. Inter-item conflicts (with OTHER items in inventory)
    for (const otherItem of inventory) {
        if (otherItem.uid === item.uid) continue;
        for (const enchId of enchIds) {
            for (const otherEnchId of Object.keys(otherItem.enchantments)) {
                if (areIncompatible(enchId, otherEnchId)) {
                    conflicts.push({
                        type: 'other',
                        enchA: enchId,
                        enchB: otherEnchId,
                        otherItem
                    });
                }
            }
        }
    }

    return conflicts;
}

function getAvailableEnchantments(item, currentEnchIdToReplace = null) {
    const allowConflicts = document.getElementById('toggle-conflicts')?.checked || false;
    let list;
    if (item.isBook) {
        // Books can have any enchantment
        list = ENCHANTMENTS_DB.filter(e => !(e.id in item.enchantments) || e.id === currentEnchIdToReplace);
    } else {
        // Items: primary category enchantments not already on this item
        list = ENCHANTMENTS_DB.filter(e => (e.cats.includes(item.category) && !(e.id in item.enchantments)) || e.id === currentEnchIdToReplace);

        // If allowConflicts is ON and all category enchantments are added, fall back to any remaining unused enchantment
        if (allowConflicts && list.length === 0) {
            list = ENCHANTMENTS_DB.filter(e => !(e.id in item.enchantments) || e.id === currentEnchIdToReplace);
        }
    }

    if (!allowConflicts) {
        // Collect ALL enchantment IDs present in the ENTIRE inventory across ALL items
        const allInventoryEnchIds = [];
        for (const invItem of inventory) {
            for (const enchId of Object.keys(invItem.enchantments)) {
                if (invItem.uid === item.uid && enchId === currentEnchIdToReplace) continue;
                allInventoryEnchIds.push(enchId);
            }
        }

        // Filter candidate list so it doesn't conflict with ANY enchantment in the entire inventory
        list = list.filter(cand => {
            return !allInventoryEnchIds.some(existId => areIncompatible(cand.id, existId));
        });
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
}

function updateItemCategory(uid, newCat) {
    // Synchronize ALL gear items in inventory to the new category
    for (const item of inventory) {
        if (!item.isBook) {
            item.category = newCat;
            // Remove enchantments that don't apply to new category
            for (const enchId of Object.keys(item.enchantments)) {
                const info = ENCHANT_MAP.get(enchId);
                if (info && !info.cats.includes(newCat)) {
                    delete item.enchantments[enchId];
                }
            }
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

    const allowConflicts = document.getElementById('toggle-conflicts')?.checked || false;
    if (!allowConflicts) {
        // Check conflicts against ALL other enchantments in the ENTIRE inventory
        const allInventoryEnchIds = [];
        for (const invItem of inventory) {
            for (const enchId of Object.keys(invItem.enchantments)) {
                if (invItem.uid === item.uid && enchId === oldId) continue;
                allInventoryEnchIds.push(enchId);
            }
        }
        const conflictWith = allInventoryEnchIds.find(existId => areIncompatible(newId, existId));
        if (conflictWith) {
            const conflictName = ENCHANT_MAP.get(conflictWith)?.name || conflictWith;
            const newName = ENCHANT_MAP.get(newId)?.name || newId;
            showConflictWarning(`"${newName}" conflicts with "${conflictName}" in your inventory. Turn on "Allow Conflicting Enchantments" on the left panel.`);
            renderInventory();
            return;
        }
    }

    delete item.enchantments[oldId];
    const info = ENCHANT_MAP.get(newId);
    item.enchantments[newId] = info ? info.maxLevel : 1; // Max level automatically
    renderInventory();
}

function updateEnchantLevel(uid, enchId, level) {
    const item = inventory.find(i => i.uid === uid);
    if (!item) return;
    item.enchantments[enchId] = parseInt(level) || 1;
}

// ══════════════════════════════════════════════════════════════
// UI: SEARCHABLE DROPDOWN COMPONENT
// ══════════════════════════════════════════════════════════════

let openDropdownId = null;

function toggleSearchDropdown(uid, enchId, event) {
    if (event) event.stopPropagation();
    const dropdownId = `dropdown-${uid}-${enchId}`;
    const dropdown = document.getElementById(dropdownId);
    const trigger = document.getElementById(`trigger-${uid}-${enchId}`);

    if (!dropdown) return;

    // Close any previously open dropdown
    if (openDropdownId && openDropdownId !== dropdownId) {
        const prev = document.getElementById(openDropdownId);
        if (prev) prev.classList.add('hidden');
        const prevTrigger = document.getElementById(openDropdownId.replace('dropdown-', 'trigger-'));
        if (prevTrigger) prevTrigger.classList.remove('active');
    }

    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
        dropdown.classList.remove('hidden');
        if (trigger) trigger.classList.add('active');
        openDropdownId = dropdownId;

        // Smart collision check: flip upward if near bottom edge of viewport
        if (trigger) {
            const triggerRect = trigger.getBoundingClientRect();
            const spaceBelow = window.innerHeight - triggerRect.bottom;
            if (spaceBelow < 220 && triggerRect.top > 220) {
                dropdown.style.top = 'auto';
                dropdown.style.bottom = 'calc(100% + 4px)';
            } else {
                dropdown.style.top = 'calc(100% + 4px)';
                dropdown.style.bottom = 'auto';
            }
        }

        const input = dropdown.querySelector('.searchable-select-input');
        if (input) {
            input.value = '';
            filterSearchOptions(input, uid, enchId);
            setTimeout(() => input.focus(), 20);
        }
    } else {
        dropdown.classList.add('hidden');
        if (trigger) trigger.classList.remove('active');
        openDropdownId = null;
    }
}

function filterSearchOptions(inputEl, uid, enchId) {
    const q = inputEl.value.trim().toLowerCase();
    const container = document.getElementById(`options-${uid}-${enchId}`);
    if (!container) return;

    const options = container.querySelectorAll('.searchable-option');
    let hasVisible = false;

    options.forEach(opt => {
        const text = opt.textContent.toLowerCase();
        if (!q || text.includes(q)) {
            opt.style.display = 'block';
            hasVisible = true;
        } else {
            opt.style.display = 'none';
        }
    });

    let noMatch = container.querySelector('.no-match-option');
    if (!hasVisible) {
        if (!noMatch) {
            noMatch = document.createElement('div');
            noMatch.className = 'no-match-option';
            noMatch.style.padding = '0.4rem 0.6rem';
            noMatch.style.fontSize = '0.75rem';
            noMatch.style.color = 'var(--text-3)';
            noMatch.style.fontStyle = 'italic';
            noMatch.textContent = 'No matching enchantments';
            container.appendChild(noMatch);
        }
        noMatch.style.display = 'block';
    } else if (noMatch) {
        noMatch.style.display = 'none';
    }
}

function handleSearchKeyDown(event, uid, enchId) {
    const container = document.getElementById(`options-${uid}-${enchId}`);
    if (!container) return;

    const visibleOptions = Array.from(container.querySelectorAll('.searchable-option')).filter(opt => opt.style.display !== 'none');
    if (visibleOptions.length === 0) return;

    let highlighted = container.querySelector('.searchable-option.highlighted');
    let idx = visibleOptions.indexOf(highlighted);

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (highlighted) highlighted.classList.remove('highlighted');
        idx = (idx + 1) % visibleOptions.length;
        visibleOptions[idx].classList.add('highlighted');
        visibleOptions[idx].scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (highlighted) highlighted.classList.remove('highlighted');
        idx = (idx - 1 + visibleOptions.length) % visibleOptions.length;
        visibleOptions[idx].classList.add('highlighted');
        visibleOptions[idx].scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (highlighted) {
            const val = highlighted.dataset.value;
            selectSearchOption(uid, enchId, val);
        } else if (visibleOptions.length > 0) {
            const val = visibleOptions[0].dataset.value;
            selectSearchOption(uid, enchId, val);
        }
    } else if (event.key === 'Escape') {
        toggleSearchDropdown(uid, enchId);
    }
}

function selectSearchOption(uid, oldEnchId, newEnchId) {
    const dropdownId = `dropdown-${uid}-${oldEnchId}`;
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) dropdown.classList.add('hidden');
    openDropdownId = null;
    updateEnchantId(uid, oldEnchId, newEnchId);
}

// Global click outside listener to close dropdowns
document.addEventListener('click', (e) => {
    if (openDropdownId && !e.target.closest('.searchable-select')) {
        const prev = document.getElementById(openDropdownId);
        if (prev) prev.classList.add('hidden');
        const prevTrigger = document.getElementById(openDropdownId.replace('dropdown-', 'trigger-'));
        if (prevTrigger) prevTrigger.classList.remove('active');
        openDropdownId = null;
    }
});

// ══════════════════════════════════════════════════════════════
// UI: RENDER INVENTORY
// ══════════════════════════════════════════════════════════════

function renderInventory() {
    const list = document.getElementById('inventory-list');
    const count = document.getElementById('item-count');
    const allowConflicts = document.getElementById('toggle-conflicts')?.checked || false;

    count.textContent = `${inventory.length} item${inventory.length !== 1 ? 's' : ''}`;

    list.innerHTML = inventory.map(item => {
        const isBook = item.isBook;
        const catInfo = isBook ? null : ITEM_CAT_MAP.get(item.category);
        const iconHTML = getItemIconHTML(item);
        const title = isBook ? 'Enchanted Book' : (catInfo ? catInfo.name : 'Item');

        // Check for conflicting enchantments on this item or with other items
        const conflicts = getItemCardConflicts(item);
        const hasConflicts = conflicts.length > 0 && !allowConflicts;

        let conflictBadgeHTML = '';
        if (hasConflicts) {
            const conflictMsgs = Array.from(new Set(conflicts.map(c => {
                const nameA = ENCHANT_MAP.get(c.enchA)?.name || c.enchA;
                const nameB = ENCHANT_MAP.get(c.enchB)?.name || c.enchB;
                if (c.type === 'self') {
                    return `${nameA} vs ${nameB}`;
                } else {
                    const otherName = c.otherItem.isBook ? 'Book' : capitalize(c.otherItem.category);
                    return `${nameA} conflicts with ${nameB} on ${otherName}`;
                }
            }))).join('; ');
            conflictBadgeHTML = `<div class="item-conflict-badge">⚠️ Conflicting enchantments (${conflictMsgs}). Turn on "Allow Conflicting Enchantments" on the left panel to calculate.</div>`;
        }

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

        // Prior Work Penalty row with help tooltip
        const usesRow = `
            <div class="item-card-row">
                <label style="display:inline-flex;align-items:center;gap:0.35rem;">
                    Prior Work Penalty
                    <span class="pwp-help-tooltip-wrapper">
                        <span class="pwp-help-icon" tabindex="0">❓</span>
                        <span class="pwp-help-tooltip">
                            <strong>What is Prior Work Penalty (PWP)?</strong><br>
                            Each anvil operation doubles the extra XP penalty of future combines (2<sup>N</sup> - 1).<br>
                            <span style="color:#10b981;font-weight:600;">💡 Lower PWP = More future enchantments possible</span> before hitting the 40-level <em>"Too Expensive!"</em> cap.<br><br>
                            <strong>Finding your item's PWP in-game:</strong><br>
                            Put item in an anvil and rename it (without adding books):<br>
                            • Cost <strong>1 level</strong> ➔ <strong>0 uses</strong> (PWP: 0)<br>
                            • Cost <strong>2 – 3 levels</strong> ➔ <strong>1 use</strong> (PWP: 1)<br>
                            • Cost <strong>4 – 7 levels</strong> ➔ <strong>2 uses</strong> (PWP: 3)<br>
                            • Cost <strong>8 – 15 levels</strong> ➔ <strong>3 uses</strong> (PWP: 7)<br>
                            • Cost <strong>16 – 31 levels</strong> ➔ <strong>4 uses</strong> (PWP: 15)<br>
                            • Cost <strong>32+ levels</strong> ➔ <strong>5+ uses</strong> (PWP: 31+)
                        </span>
                    </span>
                </label>
                <input type="number" class="uses-input" value="${item.anvilUses}" min="0" max="31"
                    onchange="updateItemUses(${item.uid}, this.value)"
                    onblur="updateItemUses(${item.uid}, this.value)">
            </div>`;

        // Enchantment rows
        const enchIds = Object.keys(item.enchantments);
        const available = getAvailableEnchantments(item);

        const enchRows = enchIds.map(enchId => {
            const info = ENCHANT_MAP.get(enchId);
            if (!info) return '';
            const level = item.enchantments[enchId];

            // Highlight conflicting rows when conflicts setting is OFF
            const isConflicting = hasConflicts && conflicts.some(c => c.enchA === enchId || c.enchB === enchId);

            // Build options: current ench + all available (sorted alphabetically)
            const otherAvailable = available.filter(e => e.id !== enchId);
            const allOptions = [info, ...otherAvailable].sort((a, b) => a.name.localeCompare(b.name));

            let levelOptions = '';
            for (let l = 1; l <= info.maxLevel; l++) {
                levelOptions += `<option value="${l}" ${l === level ? 'selected' : ''}>${toRoman(l)}</option>`;
            }

            return `
                <div class="ench-row ${isConflicting ? 'conflict-row' : ''}">
                    <div class="searchable-select" id="select-wrap-${item.uid}-${enchId}">
                        <div class="searchable-select-trigger" id="trigger-${item.uid}-${enchId}" onclick="toggleSearchDropdown(${item.uid}, '${enchId}', event)">
                            <span>${info.name}</span>
                            <span class="arrow">▼</span>
                        </div>
                        <div class="searchable-select-dropdown hidden" id="dropdown-${item.uid}-${enchId}" onclick="event.stopPropagation()">
                            <input type="text" class="searchable-select-input" placeholder="Type to search..."
                                oninput="filterSearchOptions(this, ${item.uid}, '${enchId}')"
                                onkeydown="handleSearchKeyDown(event, ${item.uid}, '${enchId}')">
                            <div class="searchable-select-options" id="options-${item.uid}-${enchId}">
                                ${allOptions.map(e => `
                                    <div class="searchable-option ${e.id === enchId ? 'selected' : ''}" data-value="${e.id}" onclick="selectSearchOption(${item.uid}, '${enchId}', '${e.id}')">
                                        ${e.name}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <select class="level-select" onchange="updateEnchantLevel(${item.uid}, '${enchId}', this.value)">
                        ${levelOptions}
                    </select>
                    <button class="btn-remove-ench" onclick="removeEnchantment(${item.uid}, '${enchId}')" aria-label="Remove enchantment">×</button>
                </div>`;
        }).join('');

        const canAdd = available.length > 0;
        let addBtnHTML = '';
        if (canAdd) {
            addBtnHTML = `<button class="btn-add-ench" onclick="addEnchantment(${item.uid})">+ Add Enchantment</button>`;
        } else {
            if (!allowConflicts) {
                addBtnHTML = `<div class="add-ench-status">No more non-conflicting enchantments available (turn on "Allow Conflicting Enchantments")</div>`;
            } else {
                addBtnHTML = `<div class="add-ench-status">All available enchantments added</div>`;
            }
        }

        return `
            <div class="item-card">
                <div class="item-card-header">
                    <div class="item-card-title">${iconHTML} <span>${title}</span></div>
                    <button class="btn-remove-item" onclick="removeItem(${item.uid})" aria-label="Remove item">×</button>
                </div>
                ${conflictBadgeHTML}
                ${catSelect}
                ${usesRow}
                ${enchRows}
                ${addBtnHTML}
            </div>`;
    }).join('');

    // Update inventory item count display
    const countEl = document.getElementById('item-count');
    if (countEl) {
        countEl.textContent = `${inventory.length} item${inventory.length !== 1 ? 's' : ''}`;
    }
}

// ══════════════════════════════════════════════════════════════
// UI: RUN OPTIMIZER & RENDER PROTOCOL
// ══════════════════════════════════════════════════════════════

function calculate(isContinuation = false) {
    const emptyEl = document.getElementById('protocol-empty');
    const resultEl = document.getElementById('protocol-results');
    const errorEl = document.getElementById('protocol-error');
    const statusEl = document.getElementById('protocol-status');

    // ONLY calculate when user opts for Min XP or Min PWP
    if (currentMode === null) {
        emptyEl.classList.remove('hidden');
        resultEl.classList.add('hidden');
        errorEl.classList.add('hidden');
        statusEl.textContent = '';
        return;
    }

    if (!isContinuation) {
        currentExtraTimeMs = 0;
    }

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

    const allowConflicts = document.getElementById('toggle-conflicts')?.checked || false;

    // Check if any item in inventory contains conflicting enchantments when allowConflicts is false
    if (!allowConflicts) {
        const conflictingItems = [];
        for (const item of inventory) {
            const conflicts = getItemCardConflicts(item);
            if (conflicts.length > 0) {
                conflictingItems.push({ item, conflicts });
            }
        }
        if (conflictingItems.length > 0) {
            emptyEl.classList.add('hidden');
            resultEl.classList.add('hidden');
            errorEl.classList.remove('hidden');
            const details = Array.from(new Set(conflictingItems.flatMap(c => c.conflicts.map(cnf => {
                const nameA = ENCHANT_MAP.get(cnf.enchA)?.name || cnf.enchA;
                const nameB = ENCHANT_MAP.get(cnf.enchB)?.name || cnf.enchB;
                const itemAName = c.item.isBook ? 'Book' : capitalize(c.item.category);
                if (cnf.type === 'self') {
                    return `${itemAName} (${nameA} + ${nameB})`;
                } else {
                    const itemBName = cnf.otherItem.isBook ? 'Book' : capitalize(cnf.otherItem.category);
                    return `${itemAName} (${nameA}) vs ${itemBName} (${nameB})`;
                }
            })))).join('; ');

            errorEl.innerHTML = `<div class="error-msg" style="background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.35);color:var(--red);">⚠️ Cannot calculate: ${details} contains conflicting enchantments. Either remove conflicting enchantments or turn on "Allow Conflicting Enchantments" on the left panel.</div>`;
            return;
        }
    }

    // Validate gear items in inventory: allow multiple gear items as long as they are of the SAME category
    const gearItems = inventory.filter(i => !i.isBook);
    if (gearItems.length > 1) {
        const firstCat = gearItems[0].category;
        const diffItem = gearItems.find(i => i.category !== firstCat);
        if (diffItem) {
            emptyEl.classList.add('hidden');
            resultEl.classList.add('hidden');
            errorEl.classList.remove('hidden');
            errorEl.innerHTML = `<div class="error-msg" style="background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.35);color:var(--red);">⚠️ Cannot combine gear items of different types (${capitalize(firstCat)} and ${capitalize(diffItem.category)}). All gear items in inventory must be of the <strong>same item type</strong> to be combined together.</div>`;
            return;
        }
    }

    // Identify target categories from non-book items in inventory
    const targetCats = new Set(gearItems.map(i => i.category));

    // Filter items and detect completely useless books
    const ignoredBooks = [];
    const validInventory = [];

    for (const item of inventory) {
        if (!item.isBook) {
            validInventory.push(item);
        } else {
            const enchKeys = Object.keys(item.enchantments);
            if (enchKeys.length === 0) continue; // skip empty books

            // Check if AT LEAST ONE enchantment on this book is compatible with ANY target item category
            const isCompatible = targetCats.size === 0 || enchKeys.some(id => {
                const info = ENCHANT_MAP.get(id);
                return info && Array.from(targetCats).some(cat => info.cats.includes(cat));
            });

            if (isCompatible) {
                validInventory.push(item);
            } else {
                ignoredBooks.push(item);
            }
        }
    }
    currentIgnoredBooks = ignoredBooks;

    if (validInventory.length < 2) {
        emptyEl.classList.add('hidden');
        resultEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
        if (ignoredBooks.length > 0) {
            const names = ignoredBooks.map(b => bookName(b)).join(', ');
            errorEl.innerHTML = `<div class="error-msg">The added book (${names}) has no enchantments compatible with your target item. Add a compatible book to calculate.</div>`;
        } else {
            errorEl.innerHTML = `<div class="error-msg">Add at least 2 compatible items/books to calculate a combination.</div>`;
        }
        return;
    }

    // Build items for optimizer — number duplicates (Sword #1, Sword #2)
    const catCounts = {};
    const catIndices = {};
    for (const item of validInventory) {
        const key = item.isBook ? 'book' : item.category;
        catCounts[key] = (catCounts[key] || 0) + 1;
    }
    const optItems = validInventory.map(item => {
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
            category: item.category,
            invIndex: inventory.indexOf(item)
        };
    });

    statusEl.textContent = 'Computing...';

    // Run async to allow UI update
    setTimeout(() => {
        const t0 = performance.now();
        const allowConflicts = document.getElementById('toggle-conflicts')?.checked || false;
        const solutions = findOptimal(optItems, currentMode, allowConflicts, currentExtraTimeMs);
        const dt = performance.now() - t0;

        if (solutions._hitLimit) {
            statusEl.textContent = `${dt.toFixed(0)}ms (partial — 10s search limit reached)`;
        } else {
            statusEl.textContent = `${dt.toFixed(0)}ms`;
        }

        if (!solutions || solutions.length === 0) {
            allSolutions = [];
            currentSolutionIndex = 0;
            loadedProtocolsCount = 100;
            emptyEl.classList.add('hidden');
            resultEl.classList.add('hidden');
            errorEl.classList.remove('hidden');
            errorEl.innerHTML = `<div class="error-msg">No valid combination found. Every path exceeds the "Too Expensive!" limit (≥40 levels per step). Try using fewer enchantments or items with lower anvil uses.</div>`;
            return;
        }

        allSolutions = solutions;
        currentSolutionIndex = 0;
        loadedProtocolsCount = 100;
        emptyEl.classList.add('hidden');
        errorEl.classList.add('hidden');
        resultEl.classList.remove('hidden');
        renderProtocol();
    }, 10);
}

function continueSearch() {
    currentExtraTimeMs += 10000;
    calculate(true);
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
    if (currentIgnoredBooks && currentIgnoredBooks.length > 0) {
        const bookNames = currentIgnoredBooks.map(b => bookName(b)).join(', ');
        warnings += `<div class="warning-msg" style="margin-bottom:0.5rem;background:rgba(251,191,36,0.12);border-color:rgba(251,191,36,0.3);color:var(--amber);">⚠️ Skipped ${currentIgnoredBooks.length} book${currentIgnoredBooks.length > 1 ? 's' : ''} with no compatible enchantments for target: <strong>${bookNames}</strong></div>`;
    }
    if (allSolutions && allSolutions._hitLimit) {
        warnings += `<div class="warning-msg" style="margin-bottom:0.5rem;background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.35);color:var(--red);">⚠️ Search limit reached (10s timeout). Partial optimal path shown. <button id="btn-continue-search" onclick="continueSearch()" class="btn-continue-link">Continue Search?</button></div>`;
    }
    if (solution.maxStepCost >= 30) {
        warnings += `<div class="warning-msg">⚠️ Most expensive step costs ${solution.maxStepCost} levels — close to the 39-level limit!</div>`;
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
    const maxLoaded = Math.min(allSolutions.length, loadedProtocolsCount);

    if (allSolutions.length > 1) {
        const hasMore = allSolutions.length > loadedProtocolsCount;
        shuffleHtml = `
            <div class="protocol-nav-bar">
                <button class="btn-nav" title="Previous Protocol" onclick="changeProtocolIndex(-1)">◀</button>
                <div class="protocol-nav-label">
                    Protocol
                    <input type="number" class="protocol-num-input" id="protocol-num-input"
                        min="1" max="${maxLoaded}" value="${currentSolutionIndex + 1}"
                        onchange="jumpToProtocol(this.value)"
                        onkeydown="if(event.key==='Enter') jumpToProtocol(this.value)">
                    of ${maxLoaded}${hasMore ? ` (${allSolutions.length} total)` : ''}
                </div>
                <button class="btn-nav" title="Next Protocol" onclick="changeProtocolIndex(1)">▶</button>
                ${hasMore ? `<button class="btn-load-more" title="Load next 100 protocols" onclick="loadMoreProtocols()">+100 More</button>` : ''}
                <button class="btn-random" title="Random Protocol" onclick="randomProtocol()">🔀 Random</button>
            </div>`;
    }

    stepsEl.innerHTML = stepsHtml + shuffleHtml;
}

function loadMoreProtocols() {
    if (!allSolutions) return;
    loadedProtocolsCount = Math.min(allSolutions.length, loadedProtocolsCount + 100);
    renderProtocol();
}

function changeProtocolIndex(delta) {
    if (!allSolutions || allSolutions.length <= 1) return;
    const maxLoaded = Math.min(allSolutions.length, loadedProtocolsCount);

    let nextIndex = currentSolutionIndex + delta;
    if (nextIndex >= maxLoaded && loadedProtocolsCount < allSolutions.length) {
        loadedProtocolsCount = Math.min(allSolutions.length, loadedProtocolsCount + 100);
    }
    const newMaxLoaded = Math.min(allSolutions.length, loadedProtocolsCount);
    currentSolutionIndex = (nextIndex + newMaxLoaded) % newMaxLoaded;
    renderProtocol();
}

function jumpToProtocol(val) {
    if (!allSolutions || allSolutions.length <= 1) return;
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 1;
    if (num > loadedProtocolsCount && num <= allSolutions.length) {
        loadedProtocolsCount = Math.min(allSolutions.length, Math.ceil(num / 100) * 100);
    }
    const maxLoaded = Math.min(allSolutions.length, loadedProtocolsCount);
    num = Math.max(1, Math.min(maxLoaded, num));
    currentSolutionIndex = num - 1;
    renderProtocol();
}

function randomProtocol() {
    if (!allSolutions || allSolutions.length <= 1) return;
    const maxLoaded = Math.min(allSolutions.length, loadedProtocolsCount);
    currentSolutionIndex = Math.floor(Math.random() * maxLoaded);
    renderProtocol();
}

// ══════════════════════════════════════════════════════════════
// EVENT WIRING
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Render authentic Minecraft header & mode icons
    const headerIcon = document.getElementById('header-book-icon') || document.getElementById('header-anvil-icon');
    if (headerIcon) headerIcon.innerHTML = getEnchantedBookIconHTML(42);

    const xpIcon = document.getElementById('xp-mode-icon');
    if (xpIcon) xpIcon.innerHTML = getXPOrbIconHTML(18);

    const pwpIcon = document.getElementById('pwp-mode-icon');
    if (pwpIcon) pwpIcon.innerHTML = getAnvilIconHTML(18);

    // Start cycling through XP orb frames
    startXPOrbAnimation();

    document.getElementById('btn-add-item').addEventListener('click', () => addItem());
    document.getElementById('btn-add-book').addEventListener('click', () => addBook());

    // Mode toggle
    document.getElementById('mode-xp').addEventListener('click', () => setMode('xp'));
    document.getElementById('mode-pwp').addEventListener('click', () => setMode('pwp'));

    // Conflict toggle: re-render inventory so available dropdowns and conflict badges update live!
    document.getElementById('toggle-conflicts').addEventListener('change', () => {
        renderInventory();
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
