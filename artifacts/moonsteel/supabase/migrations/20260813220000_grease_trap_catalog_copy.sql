-- Normalize grease trap catalog titles, details, and display order.
-- Large → Medium → Small. Volume is labelled as gross tank volume, not GPM.

update public.catalog_products
set
  name = 'Grease Trap Large',
  sort_order = 10,
  details = $details$Large grease interceptor that separates fats, oils, and grease from kitchen wastewater.

Specifications
• Size: 48″ × 24″ × 24″
• Gross tank volume: ~119.7 gal / 453 L
• Material: 1.50mm AISI 304

Suitable for hotels, catering, and high-volume kitchens. Custom sizes available on request.$details$
where slug = 'grease-trap-large';

update public.catalog_products
set
  name = 'Grease Trap Medium',
  sort_order = 20,
  details = $details$Medium grease interceptor that separates fats, oils, and grease from kitchen wastewater.

Specifications
• Size: 24″ × 18″ × 18″
• Gross tank volume: ~33.7 gal / 128 L
• Material: 1.50mm AISI 304
• Inlet: 3″
• Outlet: 3″
• Internals: Removable baffles

Suitable for restaurants and moderate commercial kitchens. Custom sizes available on request.$details$
where slug = 'stainless-steel-grease-trap-33-gpm';

update public.catalog_products
set
  name = 'Grease Trap Small',
  sort_order = 30,
  details = $details$Small grease interceptor that separates fats, oils, and grease from kitchen wastewater.

Specifications
• Size: 22″ × 15″ × 12″
• Gross tank volume: ~17.1 gal / 65 L
• Material: 1.50mm AISI 304
• Inlet: 38 mm
• Outlet: 50 mm
• Internals: 1× bucket, 1× baffle
• Grease holding capacity: 9.5 kg

Suitable for cafés and light-duty sinks. Custom sizes available on request.$details$
where slug = 'grease-trap-grease-interceptor';
