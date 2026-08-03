/**
 * MINECRAFT PRIOR WORK PENALTY & GOD GEAR CALCULATOR ENGINE
 * Systematic 1.21 Anvil Mechanics, Formulas, & Binary Merge Tree Optimizer
 */

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

function toRoman(num) {
    const romanMap = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    return romanMap[num] || num;
}

function formatEnchantmentDisplay(id, level) {
    const ench = ENCHANT_MAP ? ENCHANT_MAP.get(id) : null;
    const name = ench ? ench.name : capitalize(id);
    if (ench && ench.maxLevel === 1) {
        return name; // Single level enchantments (Flame, Infinity, Mending, Silk Touch, Aqua Affinity, etc.) don't show roman numerals
    }
    return `${name} ${toRoman(level)}`;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ');
}

// ==========================================================================
// 1. ENCHANTMENTS & INCOMPATIBILITY REGISTRY (MINECRAFT 1.21)
// ==========================================================================

const INCOMPATIBILITY_GROUPS = {
    ARMOR_PROTECTION: {
        id: 'armor_protection',
        name: 'Armor Protection',
        members: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection']
    },
    MELEE_DAMAGE: {
        id: 'melee_damage',
        name: 'Melee Damage',
        members: ['sharpness', 'smite', 'bane_of_arthropods']
    },
    MACE_OFFENSIVE: {
        id: 'mace_offensive',
        name: 'Mace Primary Offense',
        members: ['density', 'breach', 'smite', 'bane_of_arthropods', 'sharpness']
    },
    MINING_DROP: {
        id: 'mining_drop',
        name: 'Tool Mining Fortune vs Silk Touch',
        members: ['silk_touch', 'fortune']
    },
    CROSSBOW_SHOT: {
        id: 'crossbow_shot',
        name: 'Crossbow Multishot vs Piercing',
        members: ['multishot', 'piercing']
    },
    BOOTS_WATER: {
        id: 'boots_water',
        name: 'Boots Movement',
        members: ['depth_strider', 'frost_walker']
    }
};

// Pairwise conflict pairs that can't be modelled by simple mutual-exclusion groups.
// In vanilla 1.21:
//   - Riptide conflicts with Loyalty AND Channeling, but Loyalty + Channeling are compatible
//   - Infinity conflicts with Mending
const PAIRWISE_CONFLICTS = [
    ['riptide', 'loyalty'],
    ['riptide', 'channeling'],
    ['infinity', 'mending']
];

const RECOMMENDED_GOD_GEAR_BUILDS = {
    boots: ['protection', 'feather_falling', 'depth_strider', 'soul_speed', 'unbreaking', 'mending', 'thorns'],
    helmet: ['protection', 'respiration', 'aqua_affinity', 'unbreaking', 'mending', 'thorns'],
    chestplate: ['protection', 'unbreaking', 'mending', 'thorns'],
    leggings: ['protection', 'swift_sneak', 'unbreaking', 'mending', 'thorns'],
    elytra: ['unbreaking', 'mending'],
    sword: ['sharpness', 'looting', 'sweeping_edge', 'fire_aspect', 'unbreaking', 'mending'],
    mace: ['density', 'wind_burst', 'fire_aspect', 'unbreaking', 'mending'],
    bow: ['power', 'flame', 'punch', 'infinity', 'unbreaking'],
    crossbow: ['quick_charge', 'multishot', 'unbreaking', 'mending'],
    trident: ['impaling', 'loyalty', 'channeling', 'unbreaking', 'mending'],
    axe: ['efficiency', 'sharpness', 'fortune', 'unbreaking', 'mending'],
    pickaxe: ['efficiency', 'fortune', 'unbreaking', 'mending'],
    shovel: ['efficiency', 'silk_touch', 'unbreaking', 'mending'],
    hoe: ['efficiency', 'fortune', 'unbreaking', 'mending'],
    fishing_rod: ['luck_of_the_sea', 'lure', 'unbreaking', 'mending'],
    shield: ['unbreaking', 'mending'],
    flint_and_steel: ['unbreaking', 'mending'],
    shears: ['efficiency', 'unbreaking', 'mending'],
    brush: ['unbreaking', 'mending']
};

const ENCHANTMENTS_DB = [
    // Armor Enchantments
    { id: 'protection', name: 'Protection', maxLevel: 4, bookMultiplier: 1, itemMultiplier: 2, group: 'armor_protection', categories: ['helmet', 'chestplate', 'leggings', 'boots'] },
    { id: 'fire_protection', name: 'Fire Protection', maxLevel: 4, bookMultiplier: 1, itemMultiplier: 2, group: 'armor_protection', categories: ['helmet', 'chestplate', 'leggings', 'boots'] },
    { id: 'blast_protection', name: 'Blast Protection', maxLevel: 4, bookMultiplier: 2, itemMultiplier: 4, group: 'armor_protection', categories: ['helmet', 'chestplate', 'leggings', 'boots'] },
    { id: 'projectile_protection', name: 'Projectile Protection', maxLevel: 4, bookMultiplier: 1, itemMultiplier: 2, group: 'armor_protection', categories: ['helmet', 'chestplate', 'leggings', 'boots'] },
    { id: 'feather_falling', name: 'Feather Falling', maxLevel: 4, bookMultiplier: 1, itemMultiplier: 2, group: null, categories: ['boots'] },
    { id: 'respiration', name: 'Respiration', maxLevel: 3, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['helmet'] },
    { id: 'aqua_affinity', name: 'Aqua Affinity', maxLevel: 1, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['helmet'] },
    { id: 'thorns', name: 'Thorns', maxLevel: 3, bookMultiplier: 4, itemMultiplier: 8, group: null, categories: ['helmet', 'chestplate', 'leggings', 'boots'] },
    { id: 'depth_strider', name: 'Depth Strider', maxLevel: 3, bookMultiplier: 2, itemMultiplier: 4, group: 'boots_water', categories: ['boots'] },
    { id: 'frost_walker', name: 'Frost Walker', maxLevel: 2, bookMultiplier: 2, itemMultiplier: 4, group: 'boots_water', categories: ['boots'] },
    { id: 'soul_speed', name: 'Soul Speed', maxLevel: 3, bookMultiplier: 4, itemMultiplier: 8, group: null, categories: ['boots'] },
    { id: 'swift_sneak', name: 'Swift Sneak', maxLevel: 3, bookMultiplier: 4, itemMultiplier: 8, group: null, categories: ['leggings'] },

    // Weapon / Sword Enchantments
    { id: 'sharpness', name: 'Sharpness', maxLevel: 5, bookMultiplier: 1, itemMultiplier: 2, group: 'melee_damage', categories: ['sword', 'axe'] },
    { id: 'smite', name: 'Smite', maxLevel: 5, bookMultiplier: 1, itemMultiplier: 2, group: 'melee_damage', categories: ['sword', 'axe'] },
    { id: 'bane_of_arthropods', name: 'Bane of Arthropods', maxLevel: 5, bookMultiplier: 1, itemMultiplier: 2, group: 'melee_damage', categories: ['sword', 'axe'] },
    { id: 'knockback', name: 'Knockback', maxLevel: 2, bookMultiplier: 1, itemMultiplier: 2, group: null, categories: ['sword'] },
    { id: 'fire_aspect', name: 'Fire Aspect', maxLevel: 2, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['sword', 'mace'] },
    { id: 'looting', name: 'Looting', maxLevel: 3, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['sword'] },
    { id: 'sweeping_edge', name: 'Sweeping Edge', maxLevel: 3, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['sword'] },

    // Mace 1.21 Enchantments
    { id: 'density', name: 'Density (Mace)', maxLevel: 5, bookMultiplier: 1, itemMultiplier: 2, group: 'mace_offensive', categories: ['mace'] },
    { id: 'breach', name: 'Breach (Mace)', maxLevel: 4, bookMultiplier: 2, itemMultiplier: 4, group: 'mace_offensive', categories: ['mace'] },
    { id: 'wind_burst', name: 'Wind Burst (Mace)', maxLevel: 3, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['mace'] },

    // Tool & Mining Enchantments
    { id: 'efficiency', name: 'Efficiency', maxLevel: 5, bookMultiplier: 1, itemMultiplier: 2, group: null, categories: ['pickaxe', 'shovel', 'axe', 'hoe', 'shears'] },
    { id: 'silk_touch', name: 'Silk Touch', maxLevel: 1, bookMultiplier: 4, itemMultiplier: 8, group: 'mining_drop', categories: ['pickaxe', 'shovel', 'axe', 'hoe'] },
    { id: 'fortune', name: 'Fortune', maxLevel: 3, bookMultiplier: 2, itemMultiplier: 4, group: 'mining_drop', categories: ['pickaxe', 'shovel', 'axe', 'hoe'] },

    // Bow & Crossbow
    { id: 'power', name: 'Power', maxLevel: 5, bookMultiplier: 1, itemMultiplier: 2, group: null, categories: ['bow'] },
    { id: 'punch', name: 'Punch', maxLevel: 2, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['bow'] },
    { id: 'flame', name: 'Flame', maxLevel: 1, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['bow'] },
    { id: 'infinity', name: 'Infinity', maxLevel: 1, bookMultiplier: 4, itemMultiplier: 8, group: null, categories: ['bow'] },
    
    { id: 'quick_charge', name: 'Quick Charge', maxLevel: 3, bookMultiplier: 1, itemMultiplier: 2, group: null, categories: ['crossbow'] },
    { id: 'multishot', name: 'Multishot', maxLevel: 1, bookMultiplier: 2, itemMultiplier: 4, group: 'crossbow_shot', categories: ['crossbow'] },
    { id: 'piercing', name: 'Piercing', maxLevel: 4, bookMultiplier: 1, itemMultiplier: 2, group: 'crossbow_shot', categories: ['crossbow'] },

    // Trident
    { id: 'loyalty', name: 'Loyalty', maxLevel: 3, bookMultiplier: 1, itemMultiplier: 2, group: null, categories: ['trident'] },
    { id: 'impaling', name: 'Impaling', maxLevel: 5, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['trident'] },
    { id: 'riptide', name: 'Riptide', maxLevel: 3, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['trident'] },
    { id: 'channeling', name: 'Channeling', maxLevel: 1, bookMultiplier: 4, itemMultiplier: 8, group: null, categories: ['trident'] },

    // Fishing Rod
    { id: 'luck_of_the_sea', name: 'Luck of the Sea', maxLevel: 3, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['fishing_rod'] },
    { id: 'lure', name: 'Lure', maxLevel: 3, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['fishing_rod'] },

    // Universal / General
    { id: 'unbreaking', name: 'Unbreaking', maxLevel: 3, bookMultiplier: 1, itemMultiplier: 2, group: null, categories: ['helmet', 'chestplate', 'leggings', 'boots', 'sword', 'mace', 'pickaxe', 'shovel', 'axe', 'hoe', 'bow', 'crossbow', 'trident', 'shield', 'elytra', 'fishing_rod', 'flint_and_steel', 'shears', 'brush'] },
    { id: 'mending', name: 'Mending', maxLevel: 1, bookMultiplier: 2, itemMultiplier: 4, group: null, categories: ['helmet', 'chestplate', 'leggings', 'boots', 'sword', 'mace', 'pickaxe', 'shovel', 'axe', 'hoe', 'bow', 'crossbow', 'trident', 'shield', 'elytra', 'fishing_rod', 'flint_and_steel', 'shears', 'brush'] },
    
    // Curses
    { id: 'binding_curse', name: 'Curse of Binding', maxLevel: 1, bookMultiplier: 4, itemMultiplier: 8, group: null, categories: ['helmet', 'chestplate', 'leggings', 'boots', 'elytra'] },
    { id: 'vanishing_curse', name: 'Curse of Vanishing', maxLevel: 1, bookMultiplier: 4, itemMultiplier: 8, group: null, categories: ['helmet', 'chestplate', 'leggings', 'boots', 'sword', 'mace', 'pickaxe', 'shovel', 'axe', 'hoe', 'bow', 'crossbow', 'trident', 'shield', 'elytra', 'fishing_rod', 'flint_and_steel', 'shears', 'brush'] }
];

// Helper map for fast lookup by ID
const ENCHANT_MAP = new Map(ENCHANTMENTS_DB.map(e => [e.id, e]));

// ==========================================================================
// 2. MATHEMATICAL CORE ENGINE (PRIOR WORK PENALTY & COSTS)
// ==========================================================================

/**
 * Calculates exact Prior Work Penalty (PWP) in experience levels from anvil uses N.
 * Formula: Penalty = 2^N - 1
 */
function getPWP(anvilUses) {
    if (anvilUses <= 0) return 0;
    return Math.pow(2, anvilUses) - 1;
}

/**
 * Checks if two enchantment IDs conflict based on incompatibility groups.
 */
function areEnchantmentsIncompatible(idA, idB) {
    if (idA === idB) return false;
    const enchA = ENCHANT_MAP.get(idA);
    const enchB = ENCHANT_MAP.get(idB);
    if (!enchA || !enchB) return false;
    
    // Check pairwise conflicts (handles asymmetric cases like Riptide/Loyalty/Channeling and Infinity/Mending)
    for (const [a, b] of PAIRWISE_CONFLICTS) {
        if ((idA === a && idB === b) || (idA === b && idB === a)) {
            return true;
        }
    }

    // Special rule for Mace: Density, Breach, Smite, Bane of Arthropods, Sharpness are all mutually exclusive
    const maceGroup = INCOMPATIBILITY_GROUPS.MACE_OFFENSIVE.members;
    if (maceGroup.includes(idA) && maceGroup.includes(idB)) {
        return true;
    }

    // Standard group-based check
    if (enchA.group && enchB.group && enchA.group === enchB.group) {
        return true;
    }
    return false;
}



/**
 * Calculates single anvil operation cost between target and sacrifice items.
 */
function calculateAnvilStep({
    targetItem,       // { name, anvilUses, enchantments: { id: level } }
    sacrificeItem,    // { name, anvilUses, isBook, enchantments: { id: level } }
    edition = 'java',
    isRename = false,
    materialRepairCount = 0,
    isItemRepair = false,
    ignoreIncompatibility = false
}) {
    const targetPWP = getPWP(targetItem.anvilUses);
    const sacrificePWP = getPWP(sacrificeItem.anvilUses);
    
    let enchantmentCost = 0;
    let incompatibleCount = 0;
    const resultingEnchantments = { ...targetItem.enchantments };

    // Process sacrifice enchantments
    const sacrificeEnchantIds = Object.keys(sacrificeItem.enchantments);

    for (const enchId of sacrificeEnchantIds) {
        const sacLevel = sacrificeItem.enchantments[enchId];
        const enchInfo = ENCHANT_MAP.get(enchId);
        if (!enchInfo) continue;

        // Check compatibility with existing target enchantments unless ignoreIncompatibility is true
        let isIncompatible = false;
        if (!ignoreIncompatibility) {
            const targetExistingIds = Object.keys(resultingEnchantments);
            for (const targetId of targetExistingIds) {
                if (areEnchantmentsIncompatible(enchId, targetId)) {
                    isIncompatible = true;
                    break;
                }
            }
        }

        if (isIncompatible) {
            incompatibleCount += 1; // 1 level penalty for each incompatible enchantment on sacrifice
            continue;
        }

        // Calculate level increase logic
        const targetCurrentLevel = resultingEnchantments[enchId] || 0;
        let finalLevel = targetCurrentLevel;

        if (targetCurrentLevel === 0) {
            finalLevel = sacLevel;
        } else if (sacLevel > targetCurrentLevel) {
            finalLevel = sacLevel;
        } else if (sacLevel === targetCurrentLevel) {
            finalLevel = Math.min(enchInfo.maxLevel, targetCurrentLevel + 1);
        } else {
            finalLevel = targetCurrentLevel;
        }

        // Determine multiplier based on sacrifice type
        const multiplier = sacrificeItem.isBook ? enchInfo.bookMultiplier : enchInfo.itemMultiplier;

        // Calculate level cost contribution
        let levelCostContribution = 0;
        if (edition === 'bedrock') {
            const levelDiff = Math.max(0, finalLevel - targetCurrentLevel);
            levelCostContribution = levelDiff * multiplier;
        } else {
            // Java edition charges based on final level of applied enchantment
            levelCostContribution = finalLevel * multiplier;
        }

        enchantmentCost += levelCostContribution;
        resultingEnchantments[enchId] = finalLevel;
    }

    // Repair costs
    let repairCost = 0;
    if (materialRepairCount > 0) {
        repairCost = Math.min(4, Math.max(1, materialRepairCount));
    } else if (isItemRepair) {
        repairCost = 2; // Combining 2 gear items of same type adds 2 base repair cost
    }

    // Rename cost
    const renameCost = isRename ? 1 : 0;

    // Total Anvil Level Cost
    const totalLevelCost = targetPWP + sacrificePWP + enchantmentCost + incompatibleCount + repairCost + renameCost;
    
    // Resulting Anvil Use Count and PWP
    const resultingUses = Math.max(targetItem.anvilUses, sacrificeItem.anvilUses) + 1;
    const resultingPWP = getPWP(resultingUses);
    const isTooExpensive = totalLevelCost >= 40;

    return {
        targetPWP,
        sacrificePWP,
        enchantmentCost,
        incompatibleCount,
        repairCost,
        renameCost,
        totalLevelCost,
        isTooExpensive,
        resultingUses,
        resultingPWP,
        resultingEnchantments
    };
}

// ==========================================================================
// 3. MINECRAFT EXPERIENCE (XP) CURVE MATHEMATICS
// ==========================================================================

/**
 * Total XP points required from Level 0 to Level `level`.
 */
function getLevelTotalXP(level) {
    if (level <= 0) return 0;
    if (level <= 16) {
        return Math.floor(level * level + 6 * level);
    } else if (level <= 31) {
        return Math.floor(2.5 * level * level - 40.5 * level + 360);
    } else {
        return Math.floor(4.5 * level * level - 162.5 * level + 2220);
    }
}

/**
 * Difference in XP points between startLevel and targetLevel.
 */
function getXPPointsBetween(startLevel, targetLevel) {
    return Math.max(0, getLevelTotalXP(targetLevel) - getLevelTotalXP(startLevel));
}

// ==========================================================================
// 4. FAST GOD GEAR COMBINATION OPTIMIZER (SUB-SECOND DP MEMOIZED SOLVER)
// ==========================================================================

function getItemSignature(item) {
    const enchs = Object.entries(item.enchantments).sort().map(([k, v]) => `${k}:${v}`).join(',');
    return `${item.isBook ? 'B' : 'G'}:${item.anvilUses}:[${enchs}]`;
}

function getMultisetKey(items) {
    return items.map(getItemSignature).sort().join(';');
}

/**
 * Ultra-fast DP memoized solver for finding optimal combination tree.
 */
function findOptimalCombinationTreeFromItems({ baseItem, initialBooks, edition = 'java', ignoreIncompatibility = false }) {
    const initialItems = [baseItem, ...initialBooks];

    let minTotalCost = Infinity;
    let bestSolution = null;
    const memoMap = new Map();

    function search(currentItems, accumulatedCost, maxStepCost, stepsHistory) {
        if (accumulatedCost >= minTotalCost) return;

        const setKey = getMultisetKey(currentItems);
        if (memoMap.has(setKey) && memoMap.get(setKey) <= accumulatedCost) {
            return;
        }
        memoMap.set(setKey, accumulatedCost);

        if (currentItems.length === 1) {
            const finalItem = currentItems[0];
            if (!finalItem.isBook) {
                if (accumulatedCost < minTotalCost) {
                    minTotalCost = accumulatedCost;
                    bestSolution = {
                        finalItem,
                        totalCost: accumulatedCost,
                        maxStepCost,
                        steps: [...stepsHistory]
                    };
                }
            }
            return;
        }

        const n = currentItems.length;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === j) continue;

                const target = currentItems[i];
                const sacrifice = currentItems[j];

                if (target.isBook && !sacrifice.isBook) continue;

                const res = calculateAnvilStep({ targetItem: target, sacrificeItem: sacrifice, edition, ignoreIncompatibility });
                if (res.isTooExpensive) continue;

                const newItem = {
                    id: `COMB_${target.id}_${sacrifice.id}`,
                    name: target.isBook ? 'Enchanted Book' : target.name,
                    anvilUses: res.resultingUses,
                    isBook: target.isBook,
                    enchantments: res.resultingEnchantments
                };

                const stepRecord = {
                    targetName: target.name,
                    sacrificeName: sacrifice.name,
                    targetUses: target.anvilUses,
                    sacrificeUses: sacrifice.anvilUses,
                    cost: res.totalLevelCost,
                    resultingUses: res.resultingUses,
                    resultingEnchantments: res.resultingEnchantments
                };

                const nextItems = [];
                for (let k = 0; k < n; k++) {
                    if (k !== i && k !== j) nextItems.push(currentItems[k]);
                }
                nextItems.push(newItem);

                search(
                    nextItems,
                    accumulatedCost + res.totalLevelCost,
                    Math.max(maxStepCost, res.totalLevelCost),
                    [...stepsHistory, stepRecord]
                );
            }
        }
    }

    search(initialItems, 0, 0, []);

    return bestSolution;
}
function findOptimalCombinationTree({ baseItemType, baseItemUses, desiredEnchantments, edition = 'java' }) {
    const targetGearLeaf = {
        id: 'GEAR',
        name: `Base ${capitalize(baseItemType)}`,
        anvilUses: parseInt(baseItemUses, 10) || 0,
        isBook: false,
        enchantments: {}
    };

    const bookLeaves = desiredEnchantments.map((ench, index) => ({
        id: `BOOK_${index + 1}`,
        name: `Book (${ENCHANT_MAP.get(ench.id)?.name || ench.id} ${toRoman(ench.level)})`,
        anvilUses: 0,
        isBook: true,
        enchantments: { [ench.id]: ench.level }
    }));

    return findOptimalCombinationTreeFromItems({
        baseItem: targetGearLeaf,
        initialBooks: bookLeaves,
        edition
    });
}

// ==========================================================================
// 5. USER INTERFACE CONTROLLER & EVENT LISTENERS
// ==========================================================================

let currentEdition = 'java';

document.addEventListener('DOMContentLoaded', () => {
    initEditionToggle();
    initNavTabs();
    initOptimizerTab();
    initSimulatorTab();
    initInspectorTab();
    initXPCalculatorTab();
});

// Edition Switcher (Java vs Bedrock)
function initEditionToggle() {
    const javaBtn = document.getElementById('edition-java');
    const bedrockBtn = document.getElementById('edition-bedrock');

    javaBtn.addEventListener('click', () => {
        currentEdition = 'java';
        javaBtn.classList.add('active');
        bedrockBtn.classList.remove('active');
        recalculateActiveViews();
    });

    bedrockBtn.addEventListener('click', () => {
        currentEdition = 'bedrock';
        bedrockBtn.classList.add('active');
        javaBtn.classList.remove('active');
        recalculateActiveViews();
    });
}

function recalculateActiveViews() {
    updateSimulator();
    const btnOpt = document.getElementById('btn-run-optimizer');
    if (btnOpt) btnOpt.click();
}

// Navigation Tabs Handler
function initNavTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetPaneId = tab.getAttribute('data-tab');
            const targetPane = document.getElementById(targetPaneId);
            if (targetPane) targetPane.classList.add('active');
        });
    });
}



// ==========================================================================
// TAB 1: GOD GEAR OPTIMIZER UI LOGIC
// ==========================================================================

let optimizerMode = 'standard'; // 'standard' or 'custom'
let customBooksInventory = [];

function initOptimizerTab() {
    const itemTypeSelect = document.getElementById('opt-item-type');
    const enchantListContainer = document.getElementById('opt-enchantment-list');
    const selectAllBtn = document.getElementById('opt-select-all');
    const runBtn = document.getElementById('btn-run-optimizer');
    const ignoreIncompCheckbox = document.getElementById('opt-ignore-incompatibility');

    const modeStandardBtn = document.getElementById('opt-mode-standard');
    const modeCustomBtn = document.getElementById('opt-mode-custom');
    const sectionStandard = document.getElementById('section-standard-mode');
    const sectionCustom = document.getElementById('section-custom-mode');
    const btnAddCustomBook = document.getElementById('btn-add-custom-book');
    const customBooksContainer = document.getElementById('custom-books-list');
    const btnPresetBoots = document.getElementById('btn-load-preset-boots');

    // Modal elements
    const modal = document.getElementById('modal-custom-book');
    const modalCloseBtn = document.getElementById('btn-close-modal');
    const modalCancelBtn = document.getElementById('btn-cancel-modal');
    const modalSaveBtn = document.getElementById('btn-save-modal-book');
    const modalAddEnchBtn = document.getElementById('btn-modal-add-ench');
    const modalEnchBuilder = document.getElementById('modal-enchantments-builder');

    // Mode Toggle
    modeStandardBtn.addEventListener('click', () => {
        optimizerMode = 'standard';
        modeStandardBtn.classList.add('active');
        modeCustomBtn.classList.remove('active');
        sectionStandard.classList.remove('hidden');
        sectionCustom.classList.add('hidden');
    });

    modeCustomBtn.addEventListener('click', () => {
        optimizerMode = 'custom';
        modeCustomBtn.classList.add('active');
        modeStandardBtn.classList.remove('active');
        sectionCustom.classList.remove('hidden');
        sectionStandard.classList.add('hidden');
        if (customBooksInventory.length === 0) {
            openCustomBookModal();
        }
    });

    // Preset Loader
    btnPresetBoots.addEventListener('click', () => {
        itemTypeSelect.value = 'boots';
        document.getElementById('opt-base-uses').value = '0';

        optimizerMode = 'custom';
        modeCustomBtn.click();

        // Load 7-Enchantment Boots Scenario Items
        customBooksInventory = [
            { id: 'b1', name: 'Book 1: Protection IV', anvilUses: 0, enchantments: { protection: 4 } },
            { id: 'b2', name: 'Book 2: Feather Falling IV', anvilUses: 0, enchantments: { feather_falling: 4 } },
            { id: 'b3', name: 'Book 3: Unbreaking III + Mending I', anvilUses: 1, enchantments: { unbreaking: 3, mending: 1 } },
            { id: 'b4', name: 'Book 4: Feather Falling III + Soul Speed III', anvilUses: 1, enchantments: { feather_falling: 3, soul_speed: 3 } },
            { id: 'b5', name: 'Book 5: Depth Strider III', anvilUses: 0, enchantments: { depth_strider: 3 } },
            { id: 'b6', name: 'Book 6: Thorns II', anvilUses: 0, enchantments: { thorns: 2 } },
            { id: 'b7', name: 'Book 7: Thorns II', anvilUses: 0, enchantments: { thorns: 2 } }
        ];

        renderCustomBooksUI();
        runBtn.click(); // Auto-solve preset!
    });

    // Conflict Checking in Standard Mode
    function updateConflictingEnchantmentsUI() {
        if (ignoreIncompCheckbox.checked) {
            enchantListContainer.querySelectorAll('.enchantment-option-card').forEach(card => {
                card.classList.remove('disabled-conflict');
                const cb = card.querySelector('.opt-ench-checkbox');
                if (cb) cb.disabled = false;
                const warn = card.querySelector('.conflict-warning-tag');
                if (warn) warn.remove();
            });
            return;
        }

        const checkedBoxes = Array.from(enchantListContainer.querySelectorAll('.opt-ench-checkbox:checked'));
        const selectedIds = checkedBoxes.map(cb => cb.getAttribute('data-id'));

        enchantListContainer.querySelectorAll('.enchantment-option-card').forEach(card => {
            const cb = card.querySelector('.opt-ench-checkbox');
            const id = cb.getAttribute('data-id');

            if (cb.checked) return;

            let conflictingSelectedId = null;
            for (const selId of selectedIds) {
                if (areEnchantmentsIncompatible(id, selId)) {
                    conflictingSelectedId = selId;
                    break;
                }
            }

            const existingWarn = card.querySelector('.conflict-warning-tag');

            if (conflictingSelectedId) {
                card.classList.add('disabled-conflict');
                cb.disabled = true;
                if (!existingWarn) {
                    const tag = document.createElement('span');
                    tag.className = 'conflict-warning-tag';
                    tag.textContent = `(Conflicts with ${ENCHANT_MAP.get(conflictingSelectedId)?.name || conflictingSelectedId})`;
                    card.querySelector('.enchant-info-col').appendChild(tag);
                }
            } else {
                card.classList.remove('disabled-conflict');
                cb.disabled = false;
                if (existingWarn) existingWarn.remove();
            }
        });
    }

    ignoreIncompCheckbox.addEventListener('change', updateConflictingEnchantmentsUI);

    // Populate enchantments list when item type changes in standard mode
    function populateEnchantments() {
        const selectedCategory = itemTypeSelect.value;
        enchantListContainer.innerHTML = '';

        const availableEnchants = ENCHANTMENTS_DB.filter(e => e.categories.includes(selectedCategory));

        availableEnchants.forEach(ench => {
            const card = document.createElement('div');
            card.className = 'enchantment-option-card';
            card.innerHTML = `
                <div class="enchant-info-col">
                    <label class="checkbox-container">
                        <input type="checkbox" class="opt-ench-checkbox" data-id="${ench.id}">
                        <span class="enchant-name-label">${ench.name}</span>
                    </label>
                </div>
                ${ench.maxLevel > 1 ? `
                    <select class="form-control enchant-level-select opt-ench-level" data-id="${ench.id}">
                        ${Array.from({length: ench.maxLevel}, (_, i) => `<option value="${i+1}" ${i+1 === ench.maxLevel ? 'selected' : ''}>${toRoman(i+1)}</option>`).join('')}
                    </select>
                ` : `<span class="badge badge-accent single-level-badge" data-id="${ench.id}">Level I</span>`}
            `;

            card.querySelector('.opt-ench-checkbox').addEventListener('change', updateConflictingEnchantmentsUI);
            enchantListContainer.appendChild(card);
        });

        updateConflictingEnchantmentsUI();
    }

    itemTypeSelect.addEventListener('change', populateEnchantments);
    populateEnchantments(); // Initial populate

    // Select Max Recommended Build (Non-conflicting Meta God Gear)
    selectAllBtn.addEventListener('click', () => {
        const selectedCategory = itemTypeSelect.value;
        const recommendedIds = RECOMMENDED_GOD_GEAR_BUILDS[selectedCategory] || [];

        enchantListContainer.querySelectorAll('.opt-ench-checkbox').forEach(cb => {
            const id = cb.getAttribute('data-id');
            const levelSelect = enchantListContainer.querySelector(`.opt-ench-level[data-id="${id}"]`);
            const ench = ENCHANT_MAP.get(id);

            if (recommendedIds.includes(id)) {
                cb.checked = true;
                if (levelSelect && ench) {
                    levelSelect.value = ench.maxLevel;
                }
            } else {
                cb.checked = false;
            }
        });

        updateConflictingEnchantmentsUI();
    });

    // Custom Book Modal Management
    btnAddCustomBook.addEventListener('click', () => openCustomBookModal());
    modalCloseBtn.addEventListener('click', closeCustomBookModal);
    modalCancelBtn.addEventListener('click', closeCustomBookModal);

    modalAddEnchBtn.addEventListener('click', () => addModalEnchantRow());

    function openCustomBookModal() {
        document.getElementById('modal-book-name').value = `Book ${customBooksInventory.length + 1}`;
        document.getElementById('modal-book-uses').value = '0';
        modalEnchBuilder.innerHTML = '';
        addModalEnchantRow('protection', 4);
        modal.classList.remove('hidden');
    }

    function closeCustomBookModal() {
        modal.classList.add('hidden');
    }

    function addModalEnchantRow(defaultId = 'protection', defaultLevel = null) {
        const row = document.createElement('div');
        row.className = 'sim-enchant-row';
        const initialEnch = ENCHANT_MAP.get(defaultId) || ENCHANTMENTS_DB[0];
        const selectedLvl = defaultLevel !== null ? defaultLevel : initialEnch.maxLevel;

        row.innerHTML = `
            <select class="form-control modal-ench-select">
                ${ENCHANTMENTS_DB.map(e => `<option value="${e.id}" ${e.id === defaultId ? 'selected' : ''}>${e.name}</option>`).join('')}
            </select>
            <select class="form-control modal-level-select" style="width: 80px;">
                ${Array.from({ length: initialEnch.maxLevel }, (_, i) => `<option value="${i + 1}" ${i + 1 === selectedLvl ? 'selected' : ''}>${toRoman(i + 1)}</option>`).join('')}
            </select>
            <button type="button" class="btn-remove-row">&times;</button>
        `;

        const enchSelect = row.querySelector('.modal-ench-select');
        const levelSelect = row.querySelector('.modal-level-select');

        enchSelect.addEventListener('change', () => {
            const ench = ENCHANT_MAP.get(enchSelect.value);
            if (ench) {
                levelSelect.innerHTML = Array.from({ length: ench.maxLevel }, (_, i) => `<option value="${i + 1}" ${i + 1 === ench.maxLevel ? 'selected' : ''}>${toRoman(i + 1)}</option>`).join('');
                levelSelect.value = ench.maxLevel;
            }
        });

        row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());
        modalEnchBuilder.appendChild(row);
    }

    modalSaveBtn.addEventListener('click', () => {
        const name = document.getElementById('modal-book-name').value.trim() || `Book ${customBooksInventory.length + 1}`;
        const uses = parseInt(document.getElementById('modal-book-uses').value, 10) || 0;

        const enchants = {};
        modalEnchBuilder.querySelectorAll('.sim-enchant-row').forEach(row => {
            const id = row.querySelector('.modal-ench-select').value;
            const lvl = parseInt(row.querySelector('.modal-level-select').value, 10) || 1;
            enchants[id] = lvl;
        });

        if (Object.keys(enchants).length === 0) {
            alert('Please add at least one enchantment to this book!');
            return;
        }

        customBooksInventory.push({
            id: `cb_${Date.now()}_${Math.random()}`,
            name,
            anvilUses: uses,
            enchantments: enchants
        });

        renderCustomBooksUI();
        closeCustomBookModal();
    });

    function renderCustomBooksUI() {
        customBooksContainer.innerHTML = '';
        customBooksInventory.forEach((book, bIdx) => {
            const card = document.createElement('div');
            card.className = 'custom-book-card';

            const enchTags = Object.entries(book.enchantments)
                .map(([id, lvl]) => `<span class="enchant-tag">${formatEnchantmentDisplay(id, lvl)}</span>`)
                .join(' ');

            card.innerHTML = `
                <div class="custom-book-header">
                    <span class="custom-book-title">📖 ${book.name} <span class="badge badge-info">Uses: ${book.anvilUses} (PWP: ${getPWP(book.anvilUses)} lvl)</span></span>
                    <button type="button" class="btn-remove-row btn-remove-custom-book" data-idx="${bIdx}">&times;</button>
                </div>
                <div class="custom-book-enchants-list">
                    ${enchTags || '<span class="text-muted">No enchantments</span>'}
                </div>
            `;

            card.querySelector('.btn-remove-custom-book').addEventListener('click', () => {
                customBooksInventory.splice(bIdx, 1);
                renderCustomBooksUI();
            });

            customBooksContainer.appendChild(card);
        });
    }

    // Run Optimizer Algorithm
    runBtn.addEventListener('click', () => {
        const selectedCategory = itemTypeSelect.value;
        const baseUses = parseInt(document.getElementById('opt-base-uses').value, 10) || 0;
        const ignoreIncompatibility = ignoreIncompCheckbox.checked;

        // Show non-blocking loading status
        runBtn.disabled = true;
        runBtn.innerHTML = '⏳ Calculating Optimal Tree...';

        setTimeout(() => {
            let solution = null;

            if (optimizerMode === 'standard') {
                const checkboxes = enchantListContainer.querySelectorAll('.opt-ench-checkbox:checked');
                const desiredEnchantments = [];

                checkboxes.forEach(cb => {
                    const id = cb.getAttribute('data-id');
                    const levelSelect = enchantListContainer.querySelector(`.opt-ench-level[data-id="${id}"]`);
                    const level = levelSelect ? (parseInt(levelSelect.value, 10) || 1) : (ENCHANT_MAP.get(id)?.maxLevel || 1);
                    desiredEnchantments.push({ id, level });
                });

                if (desiredEnchantments.length === 0) {
                    alert('Please select at least one desired enchantment!');
                    runBtn.disabled = false;
                    runBtn.innerHTML = '⚡ Calculate Optimal Combination Tree';
                    return;
                }

                solution = findOptimalCombinationTree({
                    baseItemType: selectedCategory,
                    baseItemUses: baseUses,
                    desiredEnchantments,
                    edition: currentEdition
                });
            } else {
                if (customBooksInventory.length === 0) {
                    alert('Please add at least one book to your custom inventory!');
                    runBtn.disabled = false;
                    runBtn.innerHTML = '⚡ Calculate Optimal Combination Tree';
                    return;
                }

                const baseItem = {
                    id: 'GEAR',
                    name: `Base ${capitalize(selectedCategory)}`,
                    anvilUses: baseUses,
                    isBook: false,
                    enchantments: {}
                };

                const initialBooks = customBooksInventory.map((b, i) => ({
                    id: b.id || `CB_${i + 1}`,
                    name: b.name || `Book ${i + 1}`,
                    anvilUses: b.anvilUses || 0,
                    isBook: true,
                    enchantments: { ...b.enchantments }
                }));

                solution = findOptimalCombinationTreeFromItems({
                    baseItem,
                    initialBooks,
                    edition: currentEdition,
                    ignoreIncompatibility
                });
            }

            renderOptimizerSolution(solution);
            runBtn.disabled = false;
            runBtn.innerHTML = '⚡ Calculate Optimal Combination Tree';
        }, 10);
    });
}

function renderOptimizerSolution(solution) {
    const emptyState = document.getElementById('optimizer-empty-state');
    const resultsContainer = document.getElementById('optimizer-results');

    if (!solution) {
        emptyState.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        alert('⚠️ Unable to find a combination order that stays below 39 levels for these enchantments! Try reducing previous anvil uses or conflicting enchantments.');
        return;
    }

    emptyState.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    // Update Metric Cards
    document.getElementById('metric-total-levels').textContent = `${solution.totalCost} Lvl`;
    document.getElementById('metric-total-xp').textContent = `${getLevelTotalXP(solution.totalCost).toLocaleString()} XP Points`;
    document.getElementById('metric-max-step').textContent = `${solution.maxStepCost} Lvl`;
    document.getElementById('metric-total-steps').textContent = `${solution.steps.length}`;
    document.getElementById('metric-final-pwp').textContent = `${solution.finalItem.anvilUses > 0 ? getPWP(solution.finalItem.anvilUses) : 0} Lvl`;
    document.getElementById('metric-final-uses').textContent = `${solution.finalItem.anvilUses} Uses`;

    // Dynamically update max-step status badge
    const maxStepStatus = document.getElementById('metric-max-step-status');
    if (maxStepStatus) {
        if (solution.maxStepCost >= 35) {
            maxStepStatus.className = 'metric-sub text-warning';
            maxStepStatus.textContent = '⚠️ High Cost Step';
        } else {
            maxStepStatus.className = 'metric-sub text-success';
            maxStepStatus.textContent = '✔ Safe (≤ 34 Lvl)';
        }
    }

    // Populate summary badges in card header
    const summaryBadges = document.getElementById('solution-summary-badges');
    if (summaryBadges) {
        summaryBadges.innerHTML = `
            <span class="badge badge-accent">${solution.totalCost} Total Lvl</span>
            <span class="badge badge-info">${solution.steps.length} Steps</span>
            <span class="badge ${solution.maxStepCost >= 35 ? 'badge-warning' : 'badge-success'}">Max Step: ${solution.maxStepCost} Lvl</span>
        `;
    }

    // Render Steps Timeline
    const timeline = document.getElementById('steps-timeline');
    timeline.innerHTML = '';

    solution.steps.forEach((step, idx) => {
        const card = document.createElement('div');
        card.className = `step-card ${step.cost > 30 ? 'warning-step' : ''}`;

        const enchantmentsSummary = Object.entries(step.resultingEnchantments)
            .map(([id, lvl]) => formatEnchantmentDisplay(id, lvl))
            .join(', ');

        card.innerHTML = `
            <div class="step-number-badge">${idx + 1}</div>
            <div class="step-details">
                <div class="step-title">Combine <span>${step.targetName}</span> + <span>${step.sacrificeName}</span></div>
                <div class="step-components">Resulting Enchantments: <span>${enchantmentsSummary}</span></div>
            </div>
            <div class="step-cost-badge">${step.cost} Levels</div>
        `;
        timeline.appendChild(card);
    });

    // Render Tree Visualizer Representation
    const treeContainer = document.getElementById('tree-container');
    treeContainer.innerHTML = `<p class="section-desc">Tree hierarchy generated with ${solution.steps.length} sequential operations. Total cost: <strong>${solution.totalCost} Levels</strong>.</p>`;
}

// ==========================================================================
// TAB 2: SINGLE STEP ANVIL SIMULATOR UI LOGIC
// ==========================================================================

function initSimulatorTab() {
    const btnAddTarget = document.getElementById('btn-add-target-enchant');
    const btnAddSacrifice = document.getElementById('btn-add-sacrifice-enchant');

    btnAddTarget.addEventListener('click', () => addSimEnchantRow('sim-target-enchantments'));
    btnAddSacrifice.addEventListener('click', () => addSimEnchantRow('sim-sacrifice-enchantments'));

    // Event Listeners for Live Calculation
    const simInputs = [
        'sim-target-type', 'sim-target-uses', 'sim-rename-checkbox', 'sim-material-repair',
        'sim-sacrifice-type', 'sim-sacrifice-uses'
    ];

    simInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateSimulator);
    });

    // Add 1 default enchantment row to each for demo
    addSimEnchantRow('sim-target-enchantments', 'sharpness', 5);
    addSimEnchantRow('sim-sacrifice-enchantments', 'unbreaking', 3);

    updateSimulator();
}

function addSimEnchantRow(containerId, defaultId = 'protection', defaultLevel = null) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'sim-enchant-row';

    const initialEnch = ENCHANT_MAP.get(defaultId) || ENCHANTMENTS_DB[0];
    const selectedLvl = defaultLevel !== null ? defaultLevel : initialEnch.maxLevel;

    row.innerHTML = `
        <select class="form-control sim-ench-select">
            ${ENCHANTMENTS_DB.map(e => `<option value="${e.id}" ${e.id === defaultId ? 'selected' : ''}>${e.name}</option>`).join('')}
        </select>
        <select class="form-control sim-level-select" style="width: 80px;">
            ${Array.from({ length: initialEnch.maxLevel }, (_, i) => `<option value="${i + 1}" ${i + 1 === selectedLvl ? 'selected' : ''}>${toRoman(i + 1)}</option>`).join('')}
        </select>
        <button type="button" class="btn-remove-row">&times;</button>
    `;

    const enchSelect = row.querySelector('.sim-ench-select');
    const levelSelect = row.querySelector('.sim-level-select');

    enchSelect.addEventListener('change', () => {
        const ench = ENCHANT_MAP.get(enchSelect.value);
        if (ench) {
            levelSelect.innerHTML = Array.from({ length: ench.maxLevel }, (_, i) => `<option value="${i + 1}" ${i + 1 === ench.maxLevel ? 'selected' : ''}>${toRoman(i + 1)}</option>`).join('');
            levelSelect.value = ench.maxLevel;
        }
        updateSimulator();
    });

    row.querySelector('.btn-remove-row').addEventListener('click', () => {
        row.remove();
        updateSimulator();
    });

    levelSelect.addEventListener('change', updateSimulator);

    container.appendChild(row);
    updateSimulator();
}

function updateSimulator() {
    const targetUses = parseInt(document.getElementById('sim-target-uses').value, 10) || 0;
    const sacrificeUses = parseInt(document.getElementById('sim-sacrifice-uses').value, 10) || 0;
    const isBookSacrifice = document.getElementById('sim-sacrifice-type').value === 'book';
    const isRename = document.getElementById('sim-rename-checkbox').checked;
    const materialRepairCount = parseInt(document.getElementById('sim-material-repair').value, 10) || 0;

    // Collect Target Enchantments
    const targetEnchants = {};
    document.querySelectorAll('#sim-target-enchantments .sim-enchant-row').forEach(row => {
        const id = row.querySelector('.sim-ench-select').value;
        const lvl = parseInt(row.querySelector('.sim-level-select').value, 10) || 1;
        targetEnchants[id] = lvl;
    });

    // Collect Sacrifice Enchantments
    const sacrificeEnchants = {};
    document.querySelectorAll('#sim-sacrifice-enchantments .sim-enchant-row').forEach(row => {
        const id = row.querySelector('.sim-ench-select').value;
        const lvl = parseInt(row.querySelector('.sim-level-select').value, 10) || 1;
        sacrificeEnchants[id] = lvl;
    });

    const targetItem = { name: 'Target Item', anvilUses: targetUses, enchantments: targetEnchants };
    const sacrificeItem = { name: 'Sacrifice Item', anvilUses: sacrificeUses, isBook: isBookSacrifice, enchantments: sacrificeEnchants };

    const res = calculateAnvilStep({
        targetItem,
        sacrificeItem,
        edition: currentEdition,
        isRename,
        materialRepairCount
    });

    // Update Displays
    document.getElementById('sim-target-pwp-display').textContent = `PWP: ${res.targetPWP} lvl`;
    document.getElementById('sim-sacrifice-pwp-display').textContent = `PWP: ${res.sacrificePWP} lvl`;

    document.getElementById('calc-target-pwp').textContent = `${res.targetPWP} levels`;
    document.getElementById('calc-sacrifice-pwp').textContent = `${res.sacrificePWP} levels`;
    document.getElementById('calc-enchant-cost').textContent = `${res.enchantmentCost} levels`;
    document.getElementById('calc-incompatible-cost').textContent = `${res.incompatibleCount} levels`;
    document.getElementById('calc-repair-rename-cost').textContent = `${res.repairCost + res.renameCost} levels`;

    const totalEl = document.getElementById('calc-total-cost');
    totalEl.textContent = `${res.totalLevelCost} Levels`;

    const badge = document.getElementById('sim-too-expensive-badge');
    if (res.isTooExpensive) {
        badge.className = 'badge badge-danger';
        badge.textContent = '❌ TOO EXPENSIVE! (>= 40 Levels)';
        totalEl.classList.remove('highlight-emerald');
        totalEl.classList.add('text-danger');
    } else {
        badge.className = 'badge badge-success';
        badge.textContent = '✔ Valid Anvil Operation (<= 39 Levels)';
        totalEl.classList.remove('text-danger');
        totalEl.classList.add('highlight-emerald');
    }

    document.getElementById('res-anvil-uses').textContent = `${res.resultingUses} uses`;
    document.getElementById('res-pwp').textContent = `${res.resultingPWP} levels (${res.resultingUses > 0 ? `2^${res.resultingUses} - 1` : '0'})`;

    const enchSummary = Object.entries(res.resultingEnchantments)
        .map(([id, lvl]) => `${ENCHANT_MAP.get(id)?.name || id} ${toRoman(lvl)}`)
        .join(', ');
    document.getElementById('res-enchants-list').textContent = enchSummary || 'None';
}

// ==========================================================================
// TAB 3: PWP & MULTIPLIERS INSPECTOR LOGIC
// ==========================================================================

function initInspectorTab() {
    const tbody = document.getElementById('multipliers-tbody');
    const searchInput = document.getElementById('inspector-search');

    function renderTable(filterText = '') {
        tbody.innerHTML = '';
        const searchLower = filterText.toLowerCase();

        const filtered = ENCHANTMENTS_DB.filter(e => 
            e.name.toLowerCase().includes(searchLower) || (e.group && e.group.toLowerCase().includes(searchLower))
        );

        filtered.forEach(ench => {
            const tr = document.createElement('tr');
            // Build conflict info from group + pairwise conflicts
            let conflictLabels = [];
            if (ench.group) {
                const groupName = INCOMPATIBILITY_GROUPS[ench.group.toUpperCase()]?.name || ench.group;
                conflictLabels.push(groupName);
            }
            for (const [a, b] of PAIRWISE_CONFLICTS) {
                if (ench.id === a) conflictLabels.push(`vs ${ENCHANT_MAP.get(b)?.name || b}`);
                if (ench.id === b) conflictLabels.push(`vs ${ENCHANT_MAP.get(a)?.name || a}`);
            }
            const conflictDisplay = conflictLabels.length > 0
                ? conflictLabels.map(l => `<span class="badge badge-danger">${l}</span>`).join(' ')
                : '<span class="text-muted">None</span>';

            tr.innerHTML = `
                <td><strong>${ench.name}</strong></td>
                <td>${toRoman(ench.maxLevel)} (${ench.maxLevel})</td>
                <td><span class="badge badge-accent">&times;${ench.bookMultiplier}</span></td>
                <td><span class="badge badge-info">&times;${ench.itemMultiplier}</span></td>
                <td>${conflictDisplay}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    searchInput.addEventListener('input', (e) => renderTable(e.target.value));
    renderTable(); // Initial render
}

// ==========================================================================
// TAB 4: XP CALCULATOR UI LOGIC
// ==========================================================================

function initXPCalculatorTab() {
    const startInput = document.getElementById('xp-start-level');
    const targetInput = document.getElementById('xp-target-level');

    function updateXP() {
        const startLvl = parseInt(startInput.value, 10) || 0;
        const targetLvl = parseInt(targetInput.value, 10) || 0;

        const diffPoints = getXPPointsBetween(startLvl, targetLvl);
        const totalPoints = getLevelTotalXP(targetLvl);
        const mobsNeeded = Math.ceil(diffPoints / 5);

        document.getElementById('xp-diff-points').textContent = `${diffPoints.toLocaleString()} XP Points`;
        document.getElementById('xp-total-points').textContent = `${totalPoints.toLocaleString()} XP Points`;
        document.getElementById('xp-mobs-needed').textContent = `${mobsNeeded.toLocaleString()} Mobs`;
    }

    startInput.addEventListener('input', updateXP);
    targetInput.addEventListener('input', updateXP);
    updateXP();
}

