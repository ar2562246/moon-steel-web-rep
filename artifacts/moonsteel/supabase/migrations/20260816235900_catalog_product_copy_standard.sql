-- Standardize catalog product names and details.
-- Template: lead paragraph, Specifications bullets, Suitable for… / custom sizes.
-- Slugs are unchanged.

update public.catalog_products
set
  name = 'Grease Trap Large 120 GPM',
  details = $details$Large grease interceptor that separates fats, oils, and grease from kitchen wastewater before it enters the drain.

Specifications
• Material: 1.50 mm AISI 304 stainless steel
• Size: 48″ × 24″ × 24″
• Flow: 120 GPM
• Gross tank volume: ~119.7 gal / 453 L
• Inlet: 4″
• Outlet: 4″
• Internals: 2× buckets, 2× compartments

Suitable for hotels, catering, and high-volume kitchens. Custom sizes available on request.
$details$
where slug = 'grease-trap-large';

update public.catalog_products
set
  name = 'Hand Wash Sink',
  details = $details$Hand wash sink for staff hygiene at the point of use in kitchens, restaurants, and laboratories.

Specifications
• Material: 1.50 mm AISI 304 stainless steel
• Sink: 500 × 400 × 150 mm
• Use: Hand washing

Suitable for commercial kitchens, restaurants, and laboratories. Custom sizes available on request.
$details$
where slug = 'hand-wash-sink';

update public.catalog_products
set
  name = 'Grease Trap Medium 34 GPM',
  details = $details$Medium grease interceptor that separates fats, oils, and grease from kitchen wastewater before it enters the drain.

Specifications
• Material: 1.50 mm AISI 304 stainless steel
• Size: 24″ × 18″ × 18″
• Flow: 34 GPM
• Gross tank volume: ~33.7 gal / 128 L
• Inlet: 3″
• Outlet: 3″
• Internals: 1× bucket, 1× baffle

Suitable for restaurants and moderate commercial kitchens. Custom sizes available on request.
$details$
where slug = 'stainless-steel-grease-trap-33-gpm';

update public.catalog_products
set
  name = 'Mop Sink',
  details = $details$Janitorial mop sink for washing mops and cleaning tools in a dedicated service area.

Specifications
• Material: 1.50 mm AISI 304 stainless steel (top and sink)
• Legs: 38 × 38 × 1.50 mm square tube AISI 304
• Feet: Adjustable
• Use: Mop and tool washing

Suitable for janitorial rooms in kitchens, hotels, and institutions. Custom sizes available on request.
$details$
where slug = 'mop-sink';

update public.catalog_products
set
  name = 'Grease Trap Small 17 GPM',
  details = $details$Small grease interceptor that separates fats, oils, and grease from kitchen wastewater before it enters the drain.

Specifications
• Material: 1.50 mm AISI 304 stainless steel
• Size: 22″ × 15″ × 12″
• Flow: 17 GPM
• Gross tank volume: ~17.1 gal / 65 L
• Inlet: 1.5″
• Outlet: 2″
• Internals: 1× bucket, 1× baffle
• Grease holding capacity: 9.5 kg

Suitable for cafés and light-duty sinks. Custom sizes available on request.
$details$
where slug = 'grease-trap-grease-interceptor';

update public.catalog_products
set
  name = 'Work Table without Undershelf',
  details = $details$Open-base work table for prep stations that need clearance under the top for bins, mobile equipment, or cleaning access.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Legs: 38 × 38 × 1.50 mm square tube AISI 304
• Feet: Adjustable

Suitable for commercial kitchen prep lines. Custom sizes and splashback options available on request.
$details$
where slug = 'work-table-without-under-shelf';

update public.catalog_products
set
  name = 'Work Table with 1 Undershelf',
  details = $details$Work table with one undershelf for stable, easy-to-clean prep stations in commercial kitchens.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Undershelf: 1.20 mm AISI 304 stainless steel
• Legs: 38 × 38 × 1.50 mm square tube AISI 304
• Feet: Adjustable

Suitable for commercial kitchen prep lines. Custom sizes and splashback options available on request.
$details$
where slug = 'work-table-with-1-under-shelf';

update public.catalog_products
set
  name = 'Work Table with 2 Undershelves',
  details = $details$Work table with two undershelves for prep stations that need extra storage under the worktop.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Shelves: 1.20 mm AISI 304 stainless steel
• Legs: 38 × 38 × 1.50 mm square tube AISI 304
• Feet: Adjustable

Suitable for commercial kitchen prep lines. Custom sizes and splashback options available on request.
$details$
where slug = 'work-table-with-2-under-shelves';

update public.catalog_products
set
  name = 'Work Table with 1 Undershelf and 1 Overshelf',
  details = $details$Work table with one undershelf and one overshelf for storage above and below the work surface.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Shelves: 1.20 mm AISI 304 stainless steel
• Legs: 38 × 38 × 1.50 mm square tube AISI 304
• Feet: Adjustable

Suitable for commercial kitchen prep lines. Custom sizes and splashback options available on request.
$details$
where slug = 'work-table-with-1-under-shelf-and-1-over-shelf';

update public.catalog_products
set
  name = 'Work Table with 2 Undershelves and 2 Overshelves',
  details = $details$Work table with two undershelves and two overshelves for high-storage prep stations.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Shelves: 1.20 mm AISI 304 stainless steel
• Legs: 38 × 38 × 1.50 mm square tube AISI 304
• Feet: Adjustable

Suitable for busy commercial kitchen prep lines. Custom sizes and splashback options available on request.
$details$
where slug = 'work-table-with-2-under-shelf-and-2-over-shelf';

update public.catalog_products
set
  name = 'Trolley',
  details = $details$General-purpose trolley for moving goods around commercial kitchens and service areas.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Mobility: 4″ wheels

Suitable for kitchens, stores, and service corridors. Custom sizes, shelf counts, and castor options available on request.
$details$
where slug = 'trolley';

update public.catalog_products
set
  name = 'Platform Trolley',
  details = $details$Heavy-duty platform trolley with handle for moving loads around kitchens, stores, and production floors.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Frame: 38 × 38 × 1.50 mm square tube AISI 304
• Handle: 31 × 1.50 mm diameter round tube AISI 304

Suitable for kitchens, stores, and production floors. Custom platform sizes and wheel options available on request.
$details$
where slug = 'platform-trolley';

update public.catalog_products
set
  name = 'Double Bowl Sink Table',
  details = $details$Two-bowl sink table for dishwashing and prep washdown in professional kitchens.

Specifications
• Top and sinks: 1.50 mm AISI 304 stainless steel
• Legs: 38 × 38 × 1.50 mm square tube AISI 304
• Bracing: 25 × 25 × 1.50 mm square tube AISI 304

Suitable for restaurants, hotels, and institutional kitchens. Custom bowl sizes, drainboards, and overall dimensions available on request.
$details$
where slug = 'double-bowl-sink-table';

update public.catalog_products
set
  name = 'Interlocking Box Drain Grating',
  details = $details$Interlocking box-type floor drain grating with an under-channel that collects and directs wastewater.

Specifications
• Material: 1.50 mm AISI 304 stainless steel
• Grating strip: 1″ (25 mm) wide
• Construction: Mechanically assembled interlocking strips
• Opening: 25 mm clear spacing
• Pattern: Square / box grid
• Channel: 1.50 mm AISI 304 tray under the grating
• Finish: Smooth; brushed or satin available

Suitable for commercial kitchens, hotels, restaurants, food-processing areas, and industrial wash floors. Width, length, channel depth, and outlet position can be customized.
$details$
where slug = 'ss-304-interlocking-box-drain-grating-with-drainage-channel';

update public.catalog_products
set
  name = 'Single Bowl Sink Table',
  details = $details$Single-bowl sink table for prep washdown and utility washing in professional kitchens.

Specifications
• Top and sink: 1.50 mm AISI 304 stainless steel
• Legs: 38 × 38 × 1.50 mm square tube AISI 304
• Bracing: 25 × 25 × 1.50 mm square tube AISI 304

Suitable for restaurants, hotels, and institutional kitchens. Custom bowl sizes, drainboards, and overall dimensions available on request.
$details$
where slug = 'single-bowl-sink-table';

update public.catalog_products
set
  name = 'Triple Bowl Sink Table',
  details = $details$Three-bowl sink table for wash–rinse–sanitize workflows in professional kitchens.

Specifications
• Top and sinks: 1.50 mm AISI 304 stainless steel
• Legs: 38 × 38 × 1.50 mm square tube AISI 304
• Bracing: 25 × 25 × 1.50 mm square tube AISI 304

Suitable for restaurants, hotels, and institutional kitchens. Custom bowl sizes, drainboards, and overall dimensions available on request.
$details$
where slug = 'triple-bowl-sink-table';

update public.catalog_products
set
  name = 'Counter with Sliding Doors',
  details = $details$Base counter with sliding-door understorage for worktops where swing clearance is limited.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Body: 1.20 mm AISI 304 stainless steel
• Storage: Sliding doors

Suitable for commercial kitchens and prep rooms. Custom sizes available on request.
$details$
where slug = 'counter-with-sliding-doors';

update public.catalog_products
set
  name = 'Wall Cabinet with Sliding Doors',
  details = $details$Wall-mounted cabinet with sliding doors for storage above workstations where swing clearance is limited.

Specifications
• Material: 1.20 mm AISI 304 stainless steel
• Storage: Sliding doors
• Mounting: Wall hung

Suitable for kitchens and prep rooms. Custom widths, depths, and heights available on request.
$details$
where slug = 'wall-cabinet-with-sliding-doors';

update public.catalog_products
set
  name = 'Counter with Flap Doors',
  details = $details$Base counter with flap-door understorage for kitchens, bakeries, and foodservice prep stations.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Body: 1.20 mm AISI 304 stainless steel
• Storage: Flap doors

Suitable for commercial kitchens and bakeries. Custom sizes available on request.
$details$
where slug = 'counter-with-flap-doors';

update public.catalog_products
set
  name = 'Wall Cabinet with Flap Doors',
  details = $details$Wall-mounted cabinet with flap doors for dry storage above prep and cook lines.

Specifications
• Material: 1.20 mm AISI 304 stainless steel
• Storage: Flap doors
• Mounting: Wall hung

Suitable for commercial kitchens. Custom widths, depths, and heights available on request.
$details$
where slug = 'wall-cabinet-with-flap-doors';

update public.catalog_products
set
  name = 'Counter with 4 Drawers and Flap Doors',
  details = $details$Base counter with four drawers and flap doors for organized storage under the work surface.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Body: 1.20 mm AISI 304 stainless steel
• Storage: 4 drawers and flap doors

Suitable for kitchens and prep areas. Custom sizes and drawer layouts available on request.
$details$
where slug = 'counter-with-4-drawers-and-flap-doors';

update public.catalog_products
set
  name = 'Counter with Sink',
  details = $details$Work counter with an integrated sink bowl for prep and wash stations.

Specifications
• Top and sink: 1.50 mm AISI 304 stainless steel
• Body: 1.20 mm AISI 304 stainless steel

Suitable for commercial kitchen prep and wash stations. Custom bowl sizes, drainboards, and layouts available on request.
$details$
where slug = 'counter-with-sink';

update public.catalog_products
set
  name = 'Double Tray Trolley',
  details = $details$Mobile trolley for moving pans and trays between prep, cooking, and service.

Specifications
• Frame: 25 × 25 × 1.50 mm square tube AISI 304
• Slides: 38 × 38 × 1.50 mm angle AISI 304
• Configuration: Double tray capacity

Suitable for commercial kitchens. Custom heights and tray counts available on request.
$details$
where slug = 'double-tray-trolley';

update public.catalog_products
set
  name = 'Single Tray Trolley',
  details = $details$Mobile trolley for moving pans and trays through prep, cook, and service areas.

Specifications
• Frame: 25 × 25 × 1.50 mm square tube AISI 304
• Slides: 38 × 38 × 1.50 mm angle AISI 304
• Configuration: Single tray capacity

Suitable for commercial kitchens. Custom heights available on request.
$details$
where slug = 'single-tray-trolley';

update public.catalog_products
set
  name = 'Counter with Tray Slider',
  details = $details$Serving counter with an integrated tray slider for cafeteria and buffet lines.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Body: 1.20 mm AISI 304 stainless steel
• Tray slider: 25 mm diameter × 1.50 mm round tube AISI 304

Suitable for cafeterias and buffet lines. Custom lengths and configurations available on request.
$details$
where slug = 'counter-with-tray-slider';

update public.catalog_products
set
  name = 'Cutlery Counter with Tray Slider',
  details = $details$Cutlery counter with tray slider and GN pan openings for self-service and buffet lines.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Body: 1.20 mm AISI 304 stainless steel
• Tray slider: 25 mm diameter × 1.50 mm round tube AISI 304
• Capacity: 4 GN pans

Suitable for cafeterias and buffet lines. Custom sizes available on request.
$details$
where slug = 'cutlery-counter-with-tray-slider';

update public.catalog_products
set
  name = 'Cold Bin Marie',
  details = $details$Refrigerated bain-marie for holding chilled food pans at service temperature on serving lines.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Body: 1.20 mm AISI 304 stainless steel
• Tray slider: 25 mm diameter × 1.50 mm round tube AISI 304
• Capacity: 4 GN pans
• Refrigeration: Danfoss compressor with Muller copper coil
• Power: 220 V single phase

Suitable for commercial kitchens and cafeterias. Custom sizes and pan configurations available on request.
$details$
where slug = 'cold-bin-marie';

update public.catalog_products
set
  name = 'Hot Bin Marie',
  details = $details$Heated bain-marie for holding hot food pans on serving lines.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Body: 1.20 mm AISI 304 stainless steel
• Tray slider: 25 mm diameter × 1.50 mm round tube AISI 304
• Capacity: 4 GN pans
• Power: 220 V single phase

Suitable for cafeterias, hotels, and institutional kitchens. Custom pan counts and lengths available on request.
$details$
where slug = 'hot-bin-marie';

update public.catalog_products
set
  name = 'Self Service Line',
  details = $details$Complete self-service serving line combining cold, hot, and cutlery stations for guest choice with less staff load.

Specifications
• Top: 1.50 mm AISI 304 stainless steel
• Body: 1.20 mm AISI 304 stainless steel
• Tray slider: 25 mm diameter × 1.50 mm round tube AISI 304
• Includes: 1× counter with drawer, 1× cutlery counter, 1× cold bin marie, 1× hot bin marie

Suitable for cafeterias and institutional dining. Module mix and overall length can be customized to the layout.
$details$
where slug = 'self-service-line';

update public.catalog_products
set
  name = 'Corner Shelf',
  details = $details$Wall-mounted corner shelf for bathrooms, washrooms, and utility spaces that need a rust-resistant, easy-to-clean surface.

Specifications
• Material: 1.00 mm AISI 304 stainless steel
• Finish: Food-grade, rust resistant
• Mounting: Corner wall install

Suitable for washrooms and utility rooms. Custom sizes available on request.
$details$
where slug = 'corner-shelf';

update public.catalog_products
set
  name = 'Cold Room Net Rack',
  details = $details$Cold-room net rack that lets air move around stored goods while remaining corrosion resistant.

Specifications
• Net: 3.00 mm AISI 304 stainless steel
• Pillars and frame: 38 × 38 × 3.00 mm angle AISI 304

Suitable for refrigerated stores and cold rooms. Custom shelf counts and overall dimensions available on request.
$details$
where slug = 'net-rack-for-cold-room';

update public.catalog_products
set
  name = 'Wall-Mounted Exhaust Hood',
  details = $details$Wall-mounted exhaust canopy that captures grease-laden vapor at the cookline.

Specifications
• Body: 1.20 mm AISI 304 stainless steel
• Filters: 0.5 mm AISI 304 baffle-type grease filters

Suitable for commercial cooklines. Custom lengths, depths, and lighting options available on request.
$details$
where slug = 'exhaust-hood-wall-mounted';

update public.catalog_products
set
  name = 'Custom Fryer',
  details = $details$Custom-fabricated fryer built to the kitchen layout and required capacity.

Specifications
• Material: AISI 304 stainless steel
• Construction: Made to order

Suitable for commercial kitchens. Burner type, tank size, and controls are specified per project.
$details$
where slug = 'fryer-custom-made';

update public.catalog_products
set
  name = 'Island Exhaust Hood',
  details = $details$Island exhaust canopy for cooklines open on more than one side, with double-line baffle filtration.

Specifications
• Body: 1.20 mm AISI 304 stainless steel
• Filters: 0.5 mm AISI 304 baffle-type grease filters (double line)
• Grill: Double aluminium grill

Suitable for open and island cooklines. Custom canopy sizes and filter layouts available on request.
$details$
where slug = 'exhaust-hood-island-type';

update public.catalog_products
set
  name = 'Storage Rack',
  details = $details$Storage rack for dry stores, cold rooms, and kitchen back-of-house inventory.

Specifications
• Shelves: 1.20 mm AISI 304 stainless steel
• Pillars: 38 × 38 × 3.00 mm angle AISI 304

Suitable for stores and cold rooms. Custom heights, widths, and shelf counts available on request.
$details$
where slug = 'racks-for-storage';

update public.catalog_products
set
  name = 'Garbage and Linen Chute System',
  details = $details$Vertical garbage and linen chute system for multi-storey buildings, taking waste or linen from each floor to a central collection point.

Specifications
• Garbage chute: Floor doors discharge to a ground-level compactor or dumpster
• Linen chute: Sends soiled linen from floor pantries to a central laundry point
• Chute tube (typical): 24″ diameter, 1.50 mm AISI 304 with sound-deadening material
• Doors (typical): 1.50 mm AISI 304; 57 × 73 cm; net opening 45 × 45 cm; ~30 L; bottom hinged with electromagnetic lock
• Ventilation (typical): Axial fan, 1500 CFM at terminal
• Controls (typical): PLC panel with floor status, interlocking, and water-jet clean system

Suitable for hotels, hospitals, and multi-storey buildings. Door count, diameter, and electrical package are engineered per building. Installation and commissioning available as a complete package.
$details$
where slug = 'trash-garbage-and-linen-chutes-and-chute-systems';

update public.catalog_products
set
  name = 'Drain Channel',
  details = $details$Floor drain channel for commercial kitchens and wash areas.

Specifications
• Material: AISI 304 stainless steel
• Sizing: Custom lengths and widths
• Options: Gratings and outlet positions to site drawings

Suitable for kitchens and wash floors. Custom sizes available on request.
$details$
where slug = 'drain-channel';

update public.catalog_products
set
  name = 'Floor Grating Drain Channel',
  details = $details$Heavy-duty drain channel with load-bearing grating for kitchen floors and wet process areas.

Specifications
• Channel: 1.50 mm AISI 304 stainless steel
• Grating: 6.00 mm AISI 304 stainless steel
• Duty: Heavy-duty floor installation

Suitable for commercial kitchens and wet process floors. Custom lengths, widths, and outlet positions available on request.
$details$
where slug = 'floor-grating-drain-channel';

update public.catalog_products
set
  name = 'Stainless Steel Tongs',
  details = $details$Food-grade tongs for gripping, flipping, and serving in commercial kitchens.

Specifications
• Material: 1.00 mm AISI 304 stainless steel
• Design: Spring-action arms with curved gripping ends
• Use: Grilling, frying, plating, and general food handling

Suitable for commercial kitchens. Custom lengths available on request.
$details$
where slug = 'stainless-steel-tong';

update public.catalog_products
set
  name = 'Stock Pot Stove',
  details = $details$Heavy-duty stock pot stove for boiling large batches of stocks, soups, stews, pasta, and seafood.

Specifications
• Material: AISI 304 stainless steel
• Cooking surface: Wide, flat surface for large stock pots
• Heat source: High-output gas burners or electric elements (model dependent), individually controllable
• Design: Reinforced multi-layer base for even heat

Suitable for professional kitchens and catering. Burner count, fuel type, and overall size specified per project.
$details$
where slug = 'stainless-steel-stock-pot-stove';

update public.catalog_products
set
  name = 'Glove and Hair Net Dispenser',
  details = $details$Wall-mounted dispenser for gloves and PPE at the point of use in clean work areas.

Specifications
• Material: AISI 304 stainless steel (AISI 316 available on request)
• Mounting: Wall-mounted with covered keyhole slots
• Design: Gravity-fed slots with beveled edges; bottom basin catches loose items
• Lid: Pivot lid with sloped top
• Options: Single or multi-chamber models

Suitable for foodservice, medical, pharmaceutical, and industrial sites. Holds gloves, hair nets, shoe covers, and face masks. Custom chamber counts and finishes available on request.
$details$
where slug = 's-s-dispenser';

update public.catalog_products
set
  name = 'Stainless Steel Cylindrical Container',
  details = $details$Mobile cylindrical container with a half-open lid for hygienic food-grade or industrial storage.

Specifications
• Material: 1.50 mm AISI 304 stainless steel
• Size: 25″ diameter × 32″ height
• Lid: Half-open on heavy-duty stainless hinges
• Mobility: 3″ mild steel heavy-duty caster wheels
• Finish: Matte or mirror polish

Suitable for food processing, commercial kitchens, and industrial storage. Optional full lid, lock, bottom drain, handles, or rubberized wheels available on request.
$details$
where slug = 'stainless-steel-cylindrical-container-25-dia-x-32-height-with-half-open-lid-heavy-duty-hinges';

update public.catalog_products
set
  name = 'Service Trolley',
  details = $details$Three-shelf service trolley for moving dishes, cutlery, and supplies in kitchens, catering, and hospitality.

Specifications
• Overall size: 890 × 540 × 930 mm (W × D × H)
• Material: AISI 304 stainless steel
• Shelves: 3 (each 830 × 505 mm)
• Load capacity: 40 kg per shelf / 120 kg total
• Board spacing: 27 cm
• Mobility: 4 castors (2 with brakes)
• Supply: Ships disassembled; quick assembly on site

Suitable for kitchens, catering, and hospitality. Custom shelf counts and dimensions available on request.
$details$
where slug = 's-s-service-trolley';
