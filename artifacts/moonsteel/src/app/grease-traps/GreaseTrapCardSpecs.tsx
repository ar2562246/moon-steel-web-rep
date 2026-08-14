import { greaseTrapCardSpecsForProduct } from "@/app/grease-traps/grease-traps-data";

export function GreaseTrapCardSpecsList({ product }: { product: { slug: string; details: string } }) {
  const specs = greaseTrapCardSpecsForProduct(product);
  if (!specs.size && !specs.inlet && !specs.outlet) return null;

  return (
    <dl className="mt-3 space-y-2 text-sm">
      {specs.size ? (
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Size</dt>
          <dd className="text-right font-medium text-foreground">{specs.size}</dd>
        </div>
      ) : null}
      {specs.inlet || specs.outlet ? (
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Inlet / Outlet</dt>
          <dd className="font-medium text-foreground">
            {[specs.inlet, specs.outlet].filter(Boolean).join(" / ")}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}
