-- Shorten the cylindrical container product title. Size, lid, and hinges stay in details.

update public.catalog_products
set name = 'Stainless Steel Cylindrical Container'
where slug = 'stainless-steel-cylindrical-container-25-dia-x-32-height-with-half-open-lid-heavy-duty-hinges';
