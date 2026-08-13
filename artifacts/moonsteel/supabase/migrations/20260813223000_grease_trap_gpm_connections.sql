-- Add nominal GPM to grease trap titles/specs and set inlet/outlet sizes.

update public.catalog_products
set
  name = 'Grease Trap Large 120 GPM',
  details = $details$Large grease interceptor that separates fats, oils, and grease from kitchen wastewater.

Specifications
• Size: 48″ × 24″ × 24″
• Flow: 120 GPM
• Gross tank volume: ~119.7 gal / 453 L
• Material: 1.50mm AISI 304
• Inlet: 4″
• Outlet: 4″

Suitable for hotels, catering, and high-volume kitchens. Custom sizes available on request.$details$
where slug = 'grease-trap-large';

update public.catalog_products
set
  name = 'Grease Trap Medium 34 GPM',
  details = $details$Medium grease interceptor that separates fats, oils, and grease from kitchen wastewater.

Specifications
• Size: 24″ × 18″ × 18″
• Flow: 34 GPM
• Gross tank volume: ~33.7 gal / 128 L
• Material: 1.50mm AISI 304
• Inlet: 3″
• Outlet: 3″
• Internals: Removable baffles

Suitable for restaurants and moderate commercial kitchens. Custom sizes available on request.$details$
where slug = 'stainless-steel-grease-trap-33-gpm';

update public.catalog_products
set
  name = 'Grease Trap Small 17 GPM',
  details = $details$Small grease interceptor that separates fats, oils, and grease from kitchen wastewater.

Specifications
• Size: 22″ × 15″ × 12″
• Flow: 17 GPM
• Gross tank volume: ~17.1 gal / 65 L
• Material: 1.50mm AISI 304
• Inlet: 1″
• Outlet: 2″
• Internals: 1× bucket, 1× baffle
• Grease holding capacity: 9.5 kg

Suitable for cafés and light-duty sinks. Custom sizes available on request.$details$
where slug = 'grease-trap-grease-interceptor';
