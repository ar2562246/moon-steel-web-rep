-- Align grease trap internals in catalog copy.
-- Small: 1 bucket, 1 baffle (already set).
-- Medium: 1 bucket, 1 baffle.
-- Large: 2 buckets, 2 compartments.

update public.catalog_products
set details = $details$Medium grease interceptor that separates fats, oils, and grease from kitchen wastewater.

Specifications
• Size: 24″ × 18″ × 18″
• Flow: 34 GPM
• Gross tank volume: ~33.7 gal / 128 L
• Material: 1.50mm AISI 304
• Inlet: 3″
• Outlet: 3″
• Internals: 1× bucket, 1× baffle

Suitable for restaurants and moderate commercial kitchens. Custom sizes available on request.$details$
where slug = 'stainless-steel-grease-trap-33-gpm';

update public.catalog_products
set details = $details$Large grease interceptor that separates fats, oils, and grease from kitchen wastewater.

Specifications
• Size: 48″ × 24″ × 24″
• Flow: 120 GPM
• Gross tank volume: ~119.7 gal / 453 L
• Material: 1.50mm AISI 304
• Inlet: 4″
• Outlet: 4″
• Internals: 2× buckets, 2× compartments

Suitable for hotels, catering, and high-volume kitchens. Custom sizes available on request.$details$
where slug = 'grease-trap-large';

update public.catalog_products
set details = replace(details, '• Internals: Removable baffles', '• Internals: 1× bucket, 1× baffle')
where slug = 'grease-trap-grease-interceptor'
  and details like '%Removable baffles%';
