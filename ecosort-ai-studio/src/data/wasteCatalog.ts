import {
  AmbiguityRule,
  SearchResolution,
  WasteCategoryId,
  WasteCategorySpec,
  WasteItem,
} from '../types/ecosort';

export const WASTE_CATEGORIES: Record<WasteCategoryId, WasteCategorySpec> = {
  wet: {
    id: 'wet',
    name: 'Wet & Organic Waste',
    shortName: 'Wet',
    binDesignation: 'Green Compost Bin',
    tagline: 'Biodegradable kitchen scraps and organic matter',
    summary:
      'All compostable, moisture-rich food leftovers, peels, and yard trimmings that break down naturally into compost or biogas.',
    preparationRule:
      'Drain excess liquids before placing in the bin. Keep plastic bags, wrappers, and cutlery completely out of the wet stream.',
    collectionRoute: 'Daily curbside organics collection or home compost unit',
    dos: [
      'Drain soups, curries, and cooking water before binning food scraps',
      'Use certified compostable liners or line the bin with dry newspaper',
      'Include fruit peels, vegetable trimmings, coffee grounds, and eggshells',
    ],
    donts: [
      'Never toss plastic produce bags or twist-ties into wet waste',
      'Do not pour liquid cooking oil down the drain or into loose compost',
      'Keep pet waste, diapers, and sanitary items out of municipal compost',
    ],
    examples: [
      'Fruit & vegetable peels',
      'Coffee grounds & paper filters',
      'Cooked food leftovers',
      'Eggshells & tea leaves',
    ],
  },
  dry: {
    id: 'dry',
    name: 'Dry & Recyclable Waste',
    shortName: 'Dry',
    binDesignation: 'Sage / Blue Dry Bin',
    tagline: 'Clean, dry paper, plastics, glass, and metals',
    summary:
      'Non-biodegradable, clean packaging and materials suitable for material recovery facilities (MRFs) and recycling plants.',
    preparationRule:
      'Empty, rinse lightly, and air-dry containers. One wet or greasy item can spoil an entire batch of recyclable paper.',
    collectionRoute: 'Scheduled dry-stream curbside pickup or neighborhood MRF',
    dos: [
      'Rinse food jars, milk cartons, and beverage cans before sorting',
      'Flatten corrugated cardboard boxes to save bin volume',
      'Keep paper and cardboard completely dry and oil-free',
    ],
    donts: [
      'Do not include grease-soaked pizza boxes or food-stained paper plates',
      'Avoid bagging dry recyclables inside tied black plastic trash bags',
      'Never mix loose broken glass without wrapping or labeling',
    ],
    examples: [
      'Rinsed PET plastic bottles',
      'Clean cardboard & newspapers',
      'Aluminum & steel cans',
      'Rinsed glass jars & Tetra Paks',
    ],
  },
  ewaste: {
    id: 'ewaste',
    name: 'E-waste & Electronics',
    shortName: 'E-waste',
    binDesignation: 'Authorized E-waste Drop-off',
    tagline: 'Devices, cables, circuit boards, and small appliances',
    summary:
      'Discarded electrical or electronic equipment containing recoverable metals and regulated components that must never enter landfill bins.',
    preparationRule:
      'Back up and factory-reset personal devices before drop-off. Remove loose batteries if detachable and handle cracked screens carefully.',
    collectionRoute: 'Municipal E-waste collection center or certified retail take-back',
    dos: [
      'Wipe personal data and remove SIM/SD cards from phones and laptops',
      'Bundle power cords, chargers, and small peripherals together',
      'Store intact devices in a dry box until scheduled e-waste drop-off',
    ],
    donts: [
      'Never crush, dismantle, or burn circuit boards or CRT monitors',
      'Do not place chargers, earbuds, or small gadgets in Dry plastic recycling',
      'Avoid tossing lithium-powered devices into compacting collection trucks',
    ],
    examples: [
      'Old smartphones & tablets',
      'Charging cables & adapters',
      'Keyboards, mice & earbuds',
      'Small kitchen appliances & LEDs',
    ],
  },
  hazardous: {
    id: 'hazardous',
    name: 'Hazardous Household Waste',
    shortName: 'Hazardous',
    binDesignation: 'Sealed Hazard Collection',
    tagline: 'Toxic, flammable, corrosive, or medical-risk materials',
    summary:
      'Materials that pose chemical, fire, environmental, or biological injury risks to sanitation workers and groundwater if mixed with standard waste.',
    preparationRule:
      'Keep products in their original labeled containers with lids tightly sealed. Never mix different chemicals together.',
    collectionRoute: 'Designated municipal Household Hazardous Waste (HHW) facility',
    dos: [
      'Tape the terminals of lithium or button-cell batteries before storage',
      'Keep household chemicals in original containers with readable labels',
      'Use rigid puncture-proof containers for sharps or broken fluorescent glass',
    ],
    donts: [
      'Never pour paint, solvents, or pesticides into sinks or storm drains',
      'Do not compress aerosol cans or puncture pressurized containers',
      'Never dispose of mercury thermometers or CFL tubes in regular bins',
    ],
    examples: [
      'Lithium & button-cell batteries',
      'Solvent paints & thinners',
      'Expired medicines & sharps',
      'CFL bulbs & strong cleaners',
    ],
  },
};

export const CATEGORY_ORDER: WasteCategoryId[] = [
  'wet',
  'dry',
  'ewaste',
  'hazardous',
];

export const WASTE_ITEMS: WasteItem[] = [
  // WET ITEMS
  {
    id: 'banana-peel',
    name: 'Fruit & Vegetable Peels',
    category: 'wet',
    aliases: [
      'banana peel',
      'orange peel',
      'apple core',
      'vegetable scraps',
      'veggie peels',
      'onion skins',
      'potato peels',
      'kitchen scraps',
    ],
    keywords: ['fruit', 'vegetable', 'peel', 'peels', 'scraps', 'rind', 'core'],
    explanation:
      'Raw plant matter decomposes rapidly and provides nitrogen-rich feedstock for municipal composting and anaerobic digesters.',
    disposalSteps: [
      'Remove any small plastic PLU produce stickers from fruit skins.',
      'Place peels directly into your green Wet/Organic bin or kitchen caddy.',
      'If using a liner, confirm it meets certified compostable standards (ASTM D6400 / EN 13432).',
    ],
    preparationTip: 'Keep a lidded countertop caddy lined with newspaper to control odors between pickups.',
    commonMistake: 'Leaving plastic produce stickers or rubber bands attached to leafy greens.',
    dropOffChannel: 'Curbside Green Compost Bin / Home Compost',
  },
  {
    id: 'coffee-grounds',
    name: 'Coffee Grounds & Paper Filters',
    category: 'wet',
    aliases: ['coffee grounds', 'used coffee', 'coffee filter', 'tea leaves', 'tea grounds', 'loose tea'],
    keywords: ['coffee', 'grounds', 'filter', 'tea', 'espresso', 'puck'],
    explanation:
      'Spent coffee grounds and unbleached paper filters are nutrient-dense organic matter that compost cleanly.',
    disposalSteps: [
      'Let hot coffee grounds or tea leaves cool slightly.',
      'Empty grounds and plain paper filters together into the Wet Waste bin.',
      'If you use plastic or foil single-serve coffee pods, empty the grounds into Wet waste and check pod recyclability separately.',
    ],
    preparationTip: 'Ensure tea bags do not contain synthetic nylon mesh or metal staples before composting.',
    commonMistake: 'Tossing foil-sealed plastic coffee pods whole into the Wet bin.',
    dropOffChannel: 'Curbside Green Compost Bin',
  },
  {
    id: 'cooked-leftovers',
    name: 'Cooked Food Leftovers',
    category: 'wet',
    aliases: ['leftover food', 'cooked rice', 'spoiled food', 'bread', 'pasta', 'meat scraps', 'bones'],
    keywords: ['food', 'leftover', 'leftovers', 'cooked', 'rice', 'bread', 'rotten', 'meal'],
    explanation:
      'Municipal composting and biogas facilities process cooked grains, dairy, and small food scraps safely at controlled temperatures.',
    disposalSteps: [
      'Scrape leftovers out of plastic takeout containers or foil wraps.',
      'Drain excessive broth, gravy, or liquid before placing food in the Wet bin.',
      'Rinse the empty takeout container to see if it qualifies for Dry recycling.',
    ],
    preparationTip: 'Freeze meat or fish trimmings in a paper wrap until collection morning to prevent odors.',
    commonMistake: 'Throwing the entire sealed plastic takeout box with food still inside.',
    dropOffChannel: 'Curbside Green Compost Bin',
  },
  {
    id: 'eggshells',
    name: 'Eggshells',
    category: 'wet',
    aliases: ['egg shells', 'eggshell', 'crushed eggshells'],
    keywords: ['egg', 'eggshell', 'eggshells', 'shell'],
    explanation:
      'Eggshells are natural calcium carbonate that break down slowly and enrich finished municipal compost.',
    disposalSteps: [
      'Crack or lightly crush shells so they take up less volume and decompose faster.',
      'Place shells in the Wet/Organic bin.',
      'Recycle the clean paperboard egg carton separately in Dry waste (if clean and unstained).',
    ],
    preparationTip: 'Store the cardboard egg carton in Dry waste unless raw egg leaked onto it.',
    commonMistake: 'Putting foam polystyrene egg cartons in either Wet or Dry recycling.',
    dropOffChannel: 'Curbside Green Compost Bin',
  },
  {
    id: 'greasy-pizza-box',
    name: 'Grease-Soaked Pizza Box & Soiled Paper',
    category: 'wet',
    aliases: ['greasy pizza box', 'oil stained cardboard', 'food soiled paper', 'used paper napkin', 'paper towel'],
    keywords: ['greasy', 'pizza', 'soiled', 'napkin', 'tissue', 'oily'],
    explanation:
      'Food grease and oils bind to paper fibers and cannot be separated during pulping, ruining clean paper recycling batches.',
    disposalSteps: [
      'Tear the pizza box in half: place the clean, oil-free lid in Dry cardboard recycling.',
      'Tear up the grease-soaked bottom half and place it in the Wet/Compost bin.',
      'Do the same for uncoated paper napkins stained with food.',
    ],
    preparationTip: 'Only compost unbleached or non-glossy paper; glossy coated food wrappers belong in residual trash.',
    commonMistake: 'Dropping an entire cheese-stained pizza box into the clean Dry paper bin.',
    dropOffChannel: 'Curbside Green Compost Bin (for soiled uncoated paper)',
  },
  {
    id: 'garden-trimmings',
    name: 'Garden & Houseplant Trimmings',
    category: 'wet',
    aliases: ['dead leaves', 'grass clippings', 'pruned branches', 'wilted flowers', 'plant trimmings'],
    keywords: ['garden', 'leaves', 'grass', 'flowers', 'plant', 'yard', 'twigs'],
    explanation:
      'Yard trimmings, dried leaves, and cut flowers provide essential carbon ("brown") balance in municipal compost windrows.',
    disposalSteps: [
      'Shake off heavy clumps of soil or pebbles.',
      'Cut woody stems shorter than 30 cm if placing in a residential Wet bin.',
      'Remove decorative plastic floral wraps, wire, or foam blocks before binning.',
    ],
    preparationTip: 'Keep flower bouquet plastic sleeves out—they shred into microplastics in compost.',
    dropOffChannel: 'Curbside Green Compost Bin / Yard Waste Collection',
  },
  {
    id: 'cooking-oil-small',
    name: 'Used Cooking Oil',
    category: 'wet',
    aliases: ['used cooking oil', 'vegetable oil', 'frying oil', 'kitchen oil'],
    keywords: ['cooking', 'frying', 'vegetable', 'olive', 'canola'],
    explanation:
      'Small absorbed amounts of cooking oil can compost, while larger liquid volumes must be sealed and taken to biofuel collection rather than poured down drains.',
    disposalSteps: [
      'Never pour liquid cooking oil down kitchen sinks—it solidifies and blocks city sewers.',
      'For small pan residue, wipe with an uncoated paper towel and place the towel in Wet waste.',
      'For larger volumes (deep frying), cool completely, pour into a sealed bottle, and drop off at a municipal cooking-oil/biofuel collection point.',
    ],
    preparationTip: 'Do not mix cooking oil with automotive motor oil—they require completely different recovery streams.',
    safetyWarning: 'Wait until oil reaches room temperature before pouring into any container.',
    dropOffChannel: 'Wet Bin (small absorbed residue) or Municipal Biofuel Drop-off (liquid)',
  },

  // DRY ITEMS
  {
    id: 'pet-plastic-bottle',
    name: 'Rinsed PET Plastic Bottle',
    category: 'dry',
    aliases: ['plastic bottle', 'water bottle', 'soda bottle', 'pet bottle', 'juice bottle'],
    keywords: ['pet', 'water', 'soda', 'drink', 'beverage', 'bottle'],
    explanation:
      'Clear and tinted PET (#1) beverage bottles are among the highest-value recyclable plastics when empty and clean.',
    disposalSteps: [
      'Empty all remaining liquid completely.',
      'Give the bottle a quick rinse and shake dry.',
      'Keep the plastic cap screwed back on (modern MRFs recover caps attached to bottles) and place in Dry waste.',
    ],
    preparationTip: 'Lightly crush vertically if space is limited, but avoid flattening completely if your local optical sorter prefers round shapes.',
    commonMistake: 'Leaving half-full water or sugary drinks inside, which leaks onto Dry paper.',
    dropOffChannel: 'Dry / Recyclable Bin',
  },
  {
    id: 'clean-cardboard',
    name: 'Clean Corrugated Cardboard Box',
    category: 'dry',
    aliases: ['cardboard box', 'shipping box', 'amazon box', 'clean pizza box', 'corrugated box', 'carton box'],
    keywords: ['cardboard', 'shipping', 'corrugated', 'parcel', 'delivery'],
    explanation:
      'Clean, dry corrugated cardboard fibers can be repulped multiple times into new packaging.',
    disposalSteps: [
      'Remove bubble wrap, foam inserts, and air pillows inside the box.',
      'Peel away excess heavy packing tape where practical.',
      'Flatten boxes completely so they stay dry and fit cleanly inside the Dry bin.',
    ],
    preparationTip: 'Keep cardboard sheltered from rain; waterlogged fibers lose strength and are rejected at sorting facilities.',
    commonMistake: 'Putting wet or oil-stained cardboard into the Dry paper stream.',
    dropOffChannel: 'Dry / Recyclable Bin',
  },
  {
    id: 'aluminum-can',
    name: 'Aluminum & Tin Cans',
    category: 'dry',
    aliases: ['soda can', 'beer can', 'aluminum can', 'tin can', 'soup can', 'food tin'],
    keywords: ['aluminum', 'tin', 'can', 'cans', 'metal', 'beverage'],
    explanation:
      'Aluminum and steel food cans are infinitely recyclable and require up to 95% less energy to reprocess than virgin ore.',
    disposalSteps: [
      'Empty and rinse soup, sauce, or drink residue thoroughly.',
      'Place detached sharp tin lids inside the can and pinch the top slightly closed for worker safety.',
      'Drop into the Dry/Recyclable bin.',
    ],
    preparationTip: 'Do not crush aluminum cans flat if your municipality uses automated eddy-current sorting drums.',
    safetyWarning: 'Watch for sharp metal edges on opened food tins.',
    dropOffChannel: 'Dry / Recyclable Bin',
  },
  {
    id: 'glass-jar',
    name: 'Rinsed Glass Jars & Bottles',
    category: 'dry',
    aliases: ['glass jar', 'jam jar', 'glass bottle', 'sauce jar', 'wine bottle'],
    keywords: ['glass', 'jar', 'jars', 'sauce', 'jam', 'wine'],
    explanation:
      'Container glass (bottles and jars) melts cleanly into new glass products without losing purity.',
    disposalSteps: [
      'Empty food or sauce completely and rinse the inside.',
      'Remove metal screw lids and place both lid and jar separately in the Dry bin.',
      'Paper labels do not need to be peeled off.',
    ],
    preparationTip: 'Never place drinking glasses, Pyrex bakeware, mirrors, or window glass here—they melt at different temperatures.',
    safetyWarning: 'If glass is shattered, wrap shards tightly in thick cardboard, label "Broken Glass", and follow local residual/drop-off rules rather than leaving loose shards in Dry sorting.',
    dropOffChannel: 'Dry / Recyclable Bin (or Municipal Glass Bank)',
  },
  {
    id: 'tetra-pak',
    name: 'Milk & Juice Cartons (Tetra Pak)',
    category: 'dry',
    aliases: ['milk carton', 'juice carton', 'tetra pak', 'aseptic carton', 'soy milk carton'],
    keywords: ['carton', 'tetra', 'milk', 'juice', 'aseptic'],
    explanation:
      'Aseptic beverage cartons combine high-grade paperboard with thin protective layers that specialized hydrapulpers recover.',
    disposalSteps: [
      'Empty the carton completely and rinse lightly with a splash of water.',
      'Drain dry, re-attach the plastic cap, and flatten the carton.',
      'Place in the Dry/Recyclable bin.',
    ],
    preparationTip: 'Unrinsed milk cartons create sour odors and attract pests at sorting centers.',
    commonMistake: 'Leaving spoiled milk inside before tossing.',
    dropOffChannel: 'Dry / Recyclable Bin',
  },
  {
    id: 'newspaper-office-paper',
    name: 'Newspapers, Magazines & Office Paper',
    category: 'dry',
    aliases: ['newspaper', 'magazine', 'office paper', 'printer paper', 'mail', 'envelopes', 'notebook'],
    keywords: ['paper', 'newspaper', 'magazine', 'mail', 'envelope', 'book', 'flyer'],
    explanation:
      'Dry printed paper and notebooks are prime cellulose fiber for recycled paper mills.',
    disposalSteps: [
      'Remove plastic polybags from newspapers and magazines.',
      'Tear off plastic spiral bindings from notebooks before recycling pages.',
      'Keep paper stacked flat and completely dry inside the Dry bin.',
    ],
    preparationTip: 'Shredded paper should be placed inside a closed paper bag so loose confetti does not blow away at the sorting plant.',
    commonMistake: 'Including waxed paper cups or thermal store receipts (which often contain BPA/BPS coatings).',
    dropOffChannel: 'Dry / Recyclable Bin',
  },
  {
    id: 'hdpe-jug',
    name: 'HDPE Detergent & Milk Jugs (#2 Plastic)',
    category: 'dry',
    aliases: ['detergent bottle', 'shampoo bottle', 'milk jug', 'hdpe bottle', 'bleach bottle empty'],
    keywords: ['detergent', 'shampoo', 'hdpe', 'jug', 'laundry', 'conditioner'],
    explanation:
      'Rigid #2 HDPE bottles (milk jugs, laundry detergent, shampoo bottles) are sturdy, widely accepted plastics when completely empty.',
    disposalSteps: [
      'Use up all product and rinse detergent or shampoo residue thoroughly.',
      'Drain dry and reattach screw caps (remove pump springs if metallic).',
      'Place in the Dry/Recyclable bin.',
    ],
    preparationTip: 'Note: If a container held toxic pesticides or automotive chemicals rather than household soap, treat it as Hazardous instead.',
    commonMistake: 'Throwing bottles still half-full of detergent or soap.',
    dropOffChannel: 'Dry / Recyclable Bin',
  },

  // E-WASTE ITEMS
  {
    id: 'smartphone',
    name: 'Old Smartphone or Tablet',
    category: 'ewaste',
    aliases: ['old phone', 'smartphone', 'mobile phone', 'broken phone', 'tablet', 'ipad', 'cell phone'],
    keywords: ['phone', 'smartphone', 'mobile', 'tablet', 'ipad', 'cellphone'],
    explanation:
      'Mobile devices contain recoverable gold, copper, and rare-earth elements alongside lithium-ion batteries that can catch fire if crushed.',
    disposalSteps: [
      'Back up photos and contacts, then sign out of cloud accounts and perform a full factory reset.',
      'Remove SIM and microSD memory cards.',
      'Deliver the intact device to a certified E-waste drop-off kiosk or municipal collection drive.',
    ],
    preparationTip: 'Never throw a phone with a swollen battery into regular bins or mail drop-boxes.',
    safetyWarning: 'If the battery is visibly swollen, punctured, or hot, isolate it in a non-flammable container and take directly to a Hazardous/Battery facility.',
    dropOffChannel: 'Authorized E-waste Drop-off Center',
  },
  {
    id: 'charging-cables',
    name: 'Charging Cables, Cords & Power Adapters',
    category: 'ewaste',
    aliases: ['charging cable', 'usb cable', 'power cord', 'phone charger', 'laptop charger', 'extension cord', 'wires'],
    keywords: ['cable', 'cord', 'charger', 'adapter', 'usb', 'wire', 'wires'],
    explanation:
      'Cables contain valuable copper wiring coated in PVC/plastic insulation, and chargers house small circuit boards; they tangle sorting machinery in Dry recycling.',
    disposalSteps: [
      'Coil cables neatly and secure with a paper twist-tie or string.',
      'Keep power bricks and adapters intact—do not cut wires.',
      'Drop off at an E-waste collection bin or electronics retailer take-back counter.',
    ],
    preparationTip: 'Check if working USB-C or standard adapters can be donated to a local community repair café first.',
    commonMistake: 'Putting tangled cords into the Dry plastic recycling bin where they jam spinning sorting screens ("tanglers").',
    dropOffChannel: 'Authorized E-waste Drop-off Center',
  },
  {
    id: 'laptop-computer',
    name: 'Laptop, Desktop & Computer Peripherals',
    category: 'ewaste',
    aliases: ['laptop', 'old computer', 'keyboard', 'computer mouse', 'monitor', 'webcam', 'router'],
    keywords: ['laptop', 'computer', 'keyboard', 'mouse', 'monitor', 'router', 'modem'],
    explanation:
      'Computers, routers, keyboards, and monitors contain circuit boards, heavy metals, and specialized plastics governed by e-waste regulations.',
    disposalSteps: [
      'Erase or physically remove storage drives containing sensitive personal data.',
      'Keep removable batteries attached or bring them separately to battery/e-waste intake.',
      'Take equipment to a municipal e-waste facility or scheduled neighborhood e-waste drive.',
    ],
    preparationTip: 'Many municipal centers offer certified data-destruction or working refurbishment intake.',
    safetyWarning: 'Never smash LCD/CRT monitor glass; older screens may contain mercury backlights or leaded glass.',
    dropOffChannel: 'Authorized E-waste Drop-off Center',
  },
  {
    id: 'earbuds-headphones',
    name: 'Broken Headphones & Wireless Earbuds',
    category: 'ewaste',
    aliases: ['headphones', 'earbuds', 'airpods', 'broken earphones', 'bluetooth speaker'],
    keywords: ['headphones', 'earbuds', 'earphones', 'headset', 'speaker', 'audio'],
    explanation:
      'Wireless earbuds and headphones contain miniature lithium-ion cells, magnets, and soldered electronics that create fire risks in standard trash.',
    disposalSteps: [
      'Place earbuds inside their charging case if applicable.',
      'Do not attempt to pry open glued wireless earbuds to extract the tiny battery.',
      'Bring to a municipal E-waste drop-off point or electronics retailer bin.',
    ],
    preparationTip: 'Even tiny wireless earbuds can spark fires inside garbage truck compactors.',
    safetyWarning: 'Contains embedded lithium micro-batteries—keep completely out of Wet and Dry bins.',
    dropOffChannel: 'Authorized E-waste Drop-off Center',
  },
  {
    id: 'led-bulb',
    name: 'LED Light Bulb',
    category: 'ewaste',
    aliases: ['led bulb', 'led light', 'led lamp'],
    keywords: ['led', 'diode', 'lamp'],
    explanation:
      'Unlike incandescent bulbs, LED bulbs contain driver circuit boards, aluminum heat sinks, and electronic components classified as small e-waste.',
    disposalSteps: [
      'Allow the bulb to cool completely before handling.',
      'Place intact LED bulbs in a padded sleeve or box so they do not crack.',
      'Drop off at an E-waste or lighting collection bin at hardware stores or municipal depots.',
    ],
    preparationTip: 'Check the base carefully: spiral-shaped fluorescent bulbs (CFLs) contain mercury and belong in Hazardous waste, not regular LED bins.',
    commonMistake: 'Putting LED or CFL bulbs into the Dry glass jar bin.',
    dropOffChannel: 'Authorized E-waste / Lighting Drop-off',
  },
  {
    id: 'small-appliances',
    name: 'Broken Small Household Appliances',
    category: 'ewaste',
    aliases: ['toaster', 'electric kettle', 'hair dryer', 'iron', 'blender', 'microwave'],
    keywords: ['toaster', 'kettle', 'dryer', 'blender', 'appliance', 'microwave', 'coffee maker'],
    explanation:
      'Small electrical appliances contain copper motors, heating elements, and circuit switches recoverable through e-waste shredding and metal separation.',
    disposalSteps: [
      'Unplug, empty any water/crumbs, and wrap the attached power cord neatly.',
      'Keep the appliance intact rather than tossing in curbside metal/Dry bins.',
      'Deliver to a municipal E-waste depot or bulky electronics collection event.',
    ],
    preparationTip: 'Consider a community repair café if only a cord or fuse failed.',
    dropOffChannel: 'Municipal E-waste / Bulky Electronics Depot',
  },
  {
    id: 'printer-cartridge',
    name: 'Used Ink & Toner Cartridges',
    category: 'ewaste',
    aliases: ['ink cartridge', 'toner cartridge', 'printer ink', 'laser toner'],
    keywords: ['ink', 'toner', 'cartridge', 'printer'],
    explanation:
      'Printer cartridges contain residual chemical toner/ink, microchips, and specialized composite plastics that contaminate Dry recycling.',
    disposalSteps: [
      'Seal the used cartridge inside a zip bag or the replacement cartridge box to prevent leaks.',
      'Return to an office-supply take-back box or municipal E-waste counter.',
    ],
    preparationTip: 'Never tap out loose toner powder indoors—fine toner dust is an inhalation irritant.',
    safetyWarning: 'Avoid inhaling loose laser toner dust.',
    dropOffChannel: 'Retail Take-back / Municipal E-waste Counter',
  },

  // HAZARDOUS ITEMS
  {
    id: 'alkaline-aa-battery',
    name: 'Household Alkaline Batteries (AA / AAA / 9V)',
    category: 'hazardous',
    aliases: ['aa battery', 'aaa battery', 'alkaline battery', '9v battery', 'd battery', 'duracell'],
    keywords: ['alkaline', 'aa', 'aaa', '9v', 'dry cell'],
    explanation:
      'Single-use household batteries must be kept out of curbside bins to prevent metal leaching and accidental short-circuit sparks.',
    disposalSteps: [
      'Store spent batteries in a dry plastic tub away from metal coins or keys.',
      'Place a strip of non-conductive clear tape over both ends of 9V batteries to prevent terminal contact.',
      'Drop off at a municipal battery collection kiosk or grocery/hardware battery bin.',
    ],
    preparationTip: 'Do not store loose batteries in metal tins where terminals can bridge and heat up.',
    safetyWarning: 'Tape 9V terminals—touching terminals can generate enough heat to ignite paper.',
    dropOffChannel: 'Battery Drop-off Kiosk / HHW Facility',
  },
  {
    id: 'lithium-battery',
    name: 'Lithium-Ion, Power Bank & Button Batteries',
    category: 'hazardous',
    aliases: ['lithium battery', 'laptop battery', 'power bank', 'coin cell', 'button battery', 'watch battery', 'li-ion'],
    keywords: ['lithium', 'li-ion', 'powerbank', 'button', 'coin', 'rechargeable'],
    explanation:
      'Lithium batteries store high energy density and pose severe thermal-runaway fire hazards if punctured, crushed, or exposed to moisture.',
    disposalSteps: [
      'Tape exposed metal contacts individually with electrical or clear packing tape.',
      'Keep out of Wet, Dry, and regular curbside trash completely.',
      'Take directly to a certified Household Hazardous Waste (HHW) center or battery recycler.',
    ],
    preparationTip: 'Keep button-cell batteries securely taped and stored out of reach of children and pets.',
    safetyWarning: 'High fire & ingestion hazard. Never compress, puncture, or submerge swollen lithium batteries.',
    dropOffChannel: 'Household Hazardous Waste (HHW) / Battery Depot',
  },
  {
    id: 'cfl-fluorescent-bulb',
    name: 'CFL & Fluorescent Light Tubes',
    category: 'hazardous',
    aliases: ['cfl bulb', 'fluorescent tube', 'tube light', 'mercury bulb', 'spiral bulb'],
    keywords: ['cfl', 'fluorescent', 'tube', 'mercury', 'halogen'],
    explanation:
      'Compact fluorescent lamps (CFLs) and linear tube lights contain small amounts of toxic mercury vapor sealed inside the glass.',
    disposalSteps: [
      'Handle gently to avoid breakage; place inside the original cardboard sleeve or padded box.',
      'Bring intact bulbs to a municipal HHW depot or participating hardware store drop-off.',
    ],
    preparationTip: 'If a CFL breaks indoors, ventilate the room for 15 minutes and scoop glass/powder with stiff cardboard—never vacuum.',
    safetyWarning: 'Contains mercury vapor. Never toss in regular glass recycling or curbside trash.',
    dropOffChannel: 'Household Hazardous Waste (HHW) / Hardware Drop-off',
  },
  {
    id: 'paint-solvents',
    name: 'Leftover Paint, Varnish & Solvents',
    category: 'hazardous',
    aliases: ['paint can', 'oil paint', 'latex paint', 'paint thinner', 'turpentine', 'varnish', 'wood stain'],
    keywords: ['paint', 'varnish', 'thinner', 'turpentine', 'solvent', 'stain', 'lacquer'],
    explanation:
      'Liquid paints, thinners, and varnishes contain volatile organic compounds (VOCs) and heavy metals that pollute waterways and ignite in compactors.',
    disposalSteps: [
      'Keep paint or solvent tightly sealed in its original labeled metal or plastic can.',
      'Never pour leftover paint down sinks, toilets, or street storm drains.',
      'Deliver sealed cans to a municipal Household Hazardous Waste facility or PaintCare drop-off.',
    ],
    preparationTip: 'Do not mix oil-based solvents with water-based latex paint.',
    safetyWarning: 'Flammable vapors and aquatic toxicity hazard. Keep away from heat sources.',
    dropOffChannel: 'Household Hazardous Waste (HHW) Facility',
  },
  {
    id: 'expired-medicine',
    name: 'Expired Medicines & Pharmaceuticals',
    category: 'hazardous',
    aliases: ['expired medicine', 'old pills', 'antibiotics', 'cough syrup', 'prescription drugs', 'vitamins'],
    keywords: ['medicine', 'medicines', 'pills', 'tablets', 'syrup', 'pharmaceutical', 'prescription', 'drugs'],
    explanation:
      'Flushing or trashing pharmaceuticals introduces active compounds into municipal water systems and creates accidental poisoning risks.',
    disposalSteps: [
      'Keep medications in original blister packs or bottles (black out personal prescription info on labels).',
      'Return to a participating pharmacy take-back kiosk or municipal HHW drug drop-off.',
      'Never flush pills or liquid syrups down the toilet.',
    ],
    preparationTip: 'Place empty outer cardboard medicine boxes in Dry recycling once bottles are removed.',
    safetyWarning: 'Keep securely away from children; do not flush into wastewater.',
    dropOffChannel: 'Pharmacy Take-Back Kiosk / HHW Collection',
  },
  {
    id: 'household-chemicals',
    name: 'Strong Cleaners, Bleach & Pesticides',
    category: 'hazardous',
    aliases: ['bleach', 'drain cleaner', 'pesticide', 'insecticide', 'rat poison', 'weed killer', 'ammonia', 'oven cleaner'],
    keywords: ['bleach', 'cleaner', 'pesticide', 'insecticide', 'herbicide', 'chemical', 'ammonia', 'acid'],
    explanation:
      'Corrosive cleaners, pesticides, and garden poisons react violently when mixed and harm sanitation workers and groundwater.',
    disposalSteps: [
      'Leave unused liquid inside its original container with the hazard label intact.',
      'Never mix bleach with ammonia or acidic cleaners—doing so releases toxic chlorine gas.',
      'Drop off tightly sealed containers at your municipal HHW facility.',
    ],
    preparationTip: 'Store upright inside a secondary plastic tray during transport.',
    safetyWarning: 'Corrosive / toxic chemical hazard. Never pour pesticides or drain cleaners onto soil or storm drains.',
    dropOffChannel: 'Household Hazardous Waste (HHW) Facility',
  },
  {
    id: 'motor-oil',
    name: 'Used Motor Oil & Automotive Fluids',
    category: 'hazardous',
    aliases: ['motor oil', 'engine oil', 'car oil', 'brake fluid', 'antifreeze', 'coolant'],
    keywords: ['motor', 'engine', 'automotive', 'antifreeze', 'coolant', 'brake'],
    explanation:
      'A single liter of used motor oil can contaminate hundreds of thousands of liters of freshwater with heavy metals and hydrocarbons.',
    disposalSteps: [
      'Drain used motor oil into a clean, leak-proof plastic jug with a tight screw cap.',
      'Never mix motor oil with antifreeze, gasoline, or household cooking oil.',
      'Take to an automotive service center or municipal HHW used-oil tank.',
    ],
    preparationTip: 'Place used oil filters inside a sealed zip bag when delivering to the collection tank.',
    safetyWarning: 'Toxic & petroleum pollutant. Keep strictly separate from Wet/Dry bins and storm drains.',
    dropOffChannel: 'Municipal HHW / Certified Auto Service Center',
  },
  {
    id: 'aerosol-spray',
    name: 'Pressurized Aerosol Cans (With Product Remaining)',
    category: 'hazardous',
    aliases: ['aerosol can', 'spray paint', 'hairspray', 'bug spray', 'wd40'],
    keywords: ['aerosol', 'spray', 'pressurized', 'wd40'],
    explanation:
      'Pressurized aerosol cans containing leftover propellants, spray paint, or solvents can explode when crushed in garbage or recycling trucks.',
    disposalSteps: [
      'Check if the can is completely empty and depressurized (only if it held non-toxic food/air, check local metal rules).',
      'If any spray paint, insecticide, or propellant remains, keep the nozzle cap on and deliver to HHW.',
      'Never puncture, burn, or flatten pressurized aerosol cans.',
    ],
    preparationTip: 'Keep spray cans away from hot car trunks during transport.',
    safetyWarning: 'Explosion & flammability risk under compaction or heat.',
    dropOffChannel: 'Household Hazardous Waste (HHW) Facility',
  },
  {
    id: 'mercury-thermometer',
    name: 'Mercury Thermometer & Medical Sharps',
    category: 'hazardous',
    aliases: ['thermometer', 'mercury thermometer', 'syringes', 'needles', 'lancets', 'sharps'],
    keywords: ['thermometer', 'mercury', 'syringe', 'needles', 'sharps', 'lancet'],
    explanation:
      'Old glass thermometers contain liquid elemental mercury, while needles/sharps cause severe needle-stick injury hazards to sorting staff.',
    disposalSteps: [
      'Place medical needles/lancets immediately into an FDA-cleared rigid sharps container (never loose in bags).',
      'Seal mercury thermometers inside a padded double-bagged rigid jar.',
      'Deliver to a municipal HHW facility or hospital/pharmacy sharps return kiosk.',
    ],
    preparationTip: 'Label rigid containers clearly ("SHARPS — DO NOT RECYCLE") per local health guidance.',
    safetyWarning: 'Biohazard / acute mercury toxicity hazard. Never place in Wet, Dry, or loose curbside trash.',
    dropOffChannel: 'HHW Depot / Pharmacy Sharps Kiosk',
  },
];

// Explicit deterministic ambiguity rules for underspecified or multi-category terms
export const AMBIGUITY_RULES: AmbiguityRule[] = [
  {
    triggers: ['pizza box', 'pizza'],
    reason:
      'Pizza boxes depend on grease level: clean cardboard tops belong in Dry recycling, while cheese- and oil-soaked bottoms belong in Wet compost.',
    candidateIds: ['clean-cardboard', 'greasy-pizza-box'],
    clarifyingQuestion: 'Is the cardboard clean and dry, or soaked with grease and cheese?',
  },
  {
    triggers: ['box', 'cardboard'],
    reason:
      'Clean corrugated boxes are Dry recyclables, whereas food-grease-soaked boxes belong in Wet waste.',
    candidateIds: ['clean-cardboard', 'greasy-pizza-box'],
    clarifyingQuestion: 'Select the condition that matches your box:',
  },
  {
    triggers: ['battery', 'batteries'],
    reason:
      'Battery handling depends on chemistry and size: household alkaline, lithium/button cells, and embedded device batteries have distinct safety steps.',
    candidateIds: ['lithium-battery', 'alkaline-aa-battery', 'smartphone'],
    clarifyingQuestion: 'Which battery type are you disposing of?',
  },
  {
    triggers: ['oil'],
    reason:
      'Cooking oil and automotive motor oil go to completely separate recovery streams and must never be mixed.',
    candidateIds: ['cooking-oil-small', 'motor-oil'],
    clarifyingQuestion: 'Is this household cooking oil or automotive motor oil?',
  },
  {
    triggers: ['bulb', 'light bulb', 'lightbulb', 'light', 'lamp'],
    reason:
      'LED bulbs are processed as E-waste electronics, whereas CFL and fluorescent tubes contain mercury and require Hazardous intake.',
    candidateIds: ['led-bulb', 'cfl-fluorescent-bulb'],
    clarifyingQuestion: 'Is the bulb an LED or a fluorescent/CFL tube?',
  },
  {
    triggers: ['bottle', 'container'],
    reason:
      'Disposal depends on material and previous contents: rinsed PET/HDPE/glass bottles go to Dry recycling, while chemical or motor-oil containers are Hazardous.',
    candidateIds: ['pet-plastic-bottle', 'glass-jar', 'hdpe-jug', 'household-chemicals'],
    clarifyingQuestion: 'Which type of bottle or container do you have?',
  },
  {
    triggers: ['paper'],
    reason:
      'Clean office paper and newspapers belong in Dry recycling, while food-stained napkins and greasy paper belong in Wet compost.',
    candidateIds: ['newspaper-office-paper', 'greasy-pizza-box'],
    clarifyingQuestion: 'Is the paper clean and dry, or soiled with food/grease?',
  },
  {
    triggers: ['carton'],
    reason:
      'Clean milk/juice Tetra Paks are Dry recyclables; ensure cartons are rinsed before sorting.',
    candidateIds: ['tetra-pak', 'clean-cardboard'],
    clarifyingQuestion: 'Select the carton type:',
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function singularizeToken(token: string): string {
  if (token.length > 4 && token.endsWith('ies')) {
    return token.slice(0, -3) + 'y';
  }
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) {
    return token.slice(0, -1);
  }
  return token;
}

function getItemsByIds(ids: string[]): WasteItem[] {
  return ids
    .map((id) => WASTE_ITEMS.find((item) => item.id === id))
    .filter((item): item is WasteItem => Boolean(item));
}

export function resolveWasteQuery(rawQuery: string): SearchResolution {
  const normalized = normalizeText(rawQuery);

  if (!normalized) {
    return {
      status: 'empty',
      query: rawQuery,
      relatedMatches: [],
      ambiguousCandidates: [],
    };
  }

  // 1. Check exact item name or exact alias first (deterministic priority)
  const exactMatch = WASTE_ITEMS.find((item) => {
    const itemName = normalizeText(item.name);
    if (itemName === normalized) return true;
    return item.aliases.some((alias) => normalizeText(alias) === normalized);
  });

  if (exactMatch) {
    // Special guard: if user specifically typed "pizza box" exact, check ambiguity rule if it's an explicit multi-condition trigger
    const exactAmbiguity = AMBIGUITY_RULES.find((rule) =>
      rule.triggers.some((trigger) => normalizeText(trigger) === normalized)
    );
    if (exactAmbiguity) {
      return {
        status: 'ambiguous',
        query: rawQuery,
        relatedMatches: [],
        ambiguousCandidates: getItemsByIds(exactAmbiguity.candidateIds),
        reason: exactAmbiguity.reason,
        clarifyingQuestion: exactAmbiguity.clarifyingQuestion,
      };
    }

    const related = WASTE_ITEMS.filter(
      (item) => item.category === exactMatch.category && item.id !== exactMatch.id
    ).slice(0, 3);

    return {
      status: 'matched',
      query: rawQuery,
      primaryMatch: exactMatch,
      relatedMatches: related,
      ambiguousCandidates: [],
    };
  }

  // 2. Check explicit deterministic ambiguity triggers
  const ambiguityRule = AMBIGUITY_RULES.find((rule) =>
    rule.triggers.some((trigger) => normalizeText(trigger) === normalized)
  );
  if (ambiguityRule) {
    return {
      status: 'ambiguous',
      query: rawQuery,
      relatedMatches: [],
      ambiguousCandidates: getItemsByIds(ambiguityRule.candidateIds),
      reason: ambiguityRule.reason,
      clarifyingQuestion: ambiguityRule.clarifyingQuestion,
    };
  }

  // 3. Deterministic token scoring across item name, aliases, and keywords
  const queryTokens = normalized
    .split(' ')
    .filter((t) => t.length >= 2)
    .map(singularizeToken);

  if (queryTokens.length === 0) {
    return {
      status: 'unknown',
      query: rawQuery,
      relatedMatches: [],
      ambiguousCandidates: [],
      reason:
        'Please enter a descriptive item name (at least 2 characters) so EcoSort can apply catalog sorting rules.',
      uncertaintyGuidance: [
        'Try searching by material or object name, such as "coffee grounds", "PET bottle", "charging cable", or "paint can".',
        'Browse the four categories in the Segregation Guide if you are unsure of the exact name.',
      ],
    };
  }

  const scored = WASTE_ITEMS.map((item) => {
    const searchableStrings = [
      normalizeText(item.name),
      ...item.aliases.map(normalizeText),
      ...item.keywords.map(normalizeText),
    ];
    const searchableTokens = new Set(
      searchableStrings.flatMap((str) => str.split(' ').map(singularizeToken))
    );

    let score = 0;
    let matchedTokenCount = 0;

    for (const token of queryTokens) {
      if (searchableTokens.has(token)) {
        matchedTokenCount += 1;
        score += 3;
      } else if (searchableStrings.some((str) => str.includes(token) && token.length >= 4)) {
        matchedTokenCount += 1;
        score += 1;
      }
    }

    // Bonus for full phrase substring inside alias or name
    if (
      normalizeText(item.name).includes(normalized) ||
      item.aliases.some((alias) => normalizeText(alias).includes(normalized))
    ) {
      score += 4;
    }

    return { item, score, matchedTokenCount };
  })
    .filter((entry) => entry.matchedTokenCount > 0 && entry.score >= 3)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      status: 'unknown',
      query: rawQuery,
      relatedMatches: [],
      ambiguousCandidates: [],
      reason: `EcoSort cannot verify a disposal category for "${rawQuery.trim()}" using our deterministic catalog rules.`,
      uncertaintyGuidance: [
        'We do not guess unverified items because mis-sorting can contaminate clean recycling or create compactor safety hazards.',
        'Check packaging for resin codes, battery/chemical hazard icons, or electronic markings.',
        'Keep unverified chemicals, batteries, or electrical parts out of Wet and Dry curbside bins until confirmed with your local municipal helpline.',
      ],
    };
  }

  const topScore = scored[0].score;
  const topCandidates = scored.filter((entry) => entry.score >= topScore - 1);
  const distinctCategories = new Set(topCandidates.map((c) => c.item.category));

  // If multiple categories tie or closely compete, return deterministic ambiguity instead of guessing
  if (distinctCategories.size > 1 && queryTokens.length <= 2) {
    return {
      status: 'ambiguous',
      query: rawQuery,
      relatedMatches: [],
      ambiguousCandidates: topCandidates.slice(0, 4).map((c) => c.item),
      reason: `"${rawQuery.trim()}" matches items across ${distinctCategories.size} different waste categories depending on material or condition.`,
      clarifyingQuestion: 'Select the exact item that best matches what you are holding:',
    };
  }

  // Require all tokens to match if multi-word query had unrelated mystery qualifiers (e.g., "radioactive banana")
  const best = scored[0];
  if (queryTokens.length >= 2 && best.matchedTokenCount < queryTokens.length && best.score < 6) {
    return {
      status: 'unknown',
      query: rawQuery,
      relatedMatches: [],
      ambiguousCandidates: [],
      reason: `EcoSort found partial word overlap for "${rawQuery.trim()}" but cannot confirm the full item safely.`,
      uncertaintyGuidance: [
        'Try searching with simpler keywords (for example, "banana peel" or "motor oil") or verify directly from the 4-stream Segregation Guide.',
        'If the item contains chemicals, unknown liquids, or batteries, treat it cautiously and verify with your municipal HHW desk.',
      ],
    };
  }

  return {
    status: 'matched',
    query: rawQuery,
    primaryMatch: best.item,
    relatedMatches: scored
      .slice(1, 4)
      .map((s) => s.item)
      .filter((i) => i.id !== best.item.id),
    ambiguousCandidates: [],
  };
}

export function filterCatalogItems(
  query: string,
  categoryFilter: WasteCategoryId | 'all'
): WasteItem[] {
  const normalized = normalizeText(query);
  return WASTE_ITEMS.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }
    if (!normalized) return true;
    const haystack = [
      item.name,
      ...item.aliases,
      ...item.keywords,
      item.explanation,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
