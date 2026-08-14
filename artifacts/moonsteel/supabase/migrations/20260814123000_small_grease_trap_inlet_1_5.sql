-- Small grease trap inlet is 1.5″, not 1″.

update public.catalog_products
set details = replace(details, E'• Inlet: 1″\n', E'• Inlet: 1.5″\n')
where slug = 'grease-trap-grease-interceptor'
  and details like E'%• Inlet: 1″%';
