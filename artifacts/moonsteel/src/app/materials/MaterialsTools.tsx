"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildingOptions,
  recommendForBuilding,
  recommendFromCalculator,
  recommendFromWizard,
  type BuildingType,
  type CalcEnvironment,
  type EquipmentType,
  type WizardBudget,
  type WizardFood,
  type WizardLocation,
} from "@/app/materials/materials-data";

function ResultCard({
  grade,
  reasons,
  extras,
}: {
  grade: string;
  reasons?: string[];
  extras?: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="layer-2 mt-5 rounded-xl p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Recommended material
      </p>
      <p className="mt-1 text-2xl font-display font-semibold text-primary">{grade}</p>
      {reasons?.length ? (
        <ul className="mt-3 space-y-1.5">
          {reasons.map((reason) => (
            <li key={reason} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {extras?.length ? (
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          {extras.map((item) => (
            <div key={item.label} className="rounded-lg bg-muted/40 px-3 py-2">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {item.label}
              </dt>
              <dd className="text-sm font-medium text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <Link
        href="/#contact"
        className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Get quote
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function GradeSelector() {
  const [selected, setSelected] = useState<BuildingType>("restaurant");
  const result = useMemo(() => recommendForBuilding(selected), [selected]);

  return (
    <section id="grade-selector" className="mb-16 scroll-mt-28">
      <div className="mb-6 max-w-2xl">
        <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
          Interactive Grade Selector
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          What are you building? Get an instant material recommendation.
        </p>
      </div>
      <div className="layer-1 rounded-2xl p-5 md:p-7">
        <div className="flex flex-wrap gap-2">
          {buildingOptions.map((option) => (
            <OptionButton
              key={option.id}
              active={selected === option.id}
              onClick={() => setSelected(option.id)}
            >
              {option.label}
            </OptionButton>
          ))}
        </div>
        <ResultCard grade={result.grade} reasons={result.reasons} />
      </div>
    </section>
  );
}

export function MaterialWizard() {
  const [location, setLocation] = useState<WizardLocation | null>(null);
  const [food, setFood] = useState<WizardFood | null>(null);
  const [budget, setBudget] = useState<WizardBudget | null>(null);

  const result =
    location && food && budget ? recommendFromWizard(location, food, budget) : null;

  return (
    <section id="material-wizard" className="mb-16 scroll-mt-28">
      <div className="mb-6 max-w-2xl">
        <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
          Help Me Choose
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Answer three questions for a guided grade recommendation.
        </p>
      </div>
      <div className="layer-1 space-y-6 rounded-2xl p-5 md:p-7">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            1. Where will the equipment be installed?
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["indoor", "Indoor"],
                ["coastal", "Coastal"],
                ["chemical", "Chemical"],
                ["food-factory", "Food Factory"],
              ] as const
            ).map(([id, label]) => (
              <OptionButton key={id} active={location === id} onClick={() => setLocation(id)}>
                {label}
              </OptionButton>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">2. Will it touch food?</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["yes", "Yes"],
                ["no", "No"],
              ] as const
            ).map(([id, label]) => (
              <OptionButton key={id} active={food === id} onClick={() => setFood(id)}>
                {label}
              </OptionButton>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">3. Budget?</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["economy", "Economy"],
                ["standard", "Standard"],
                ["premium", "Premium"],
              ] as const
            ).map(([id, label]) => (
              <OptionButton key={id} active={budget === id} onClick={() => setBudget(id)}>
                {label}
              </OptionButton>
            ))}
          </div>
        </div>
        {result ? <ResultCard grade={result.grade} reasons={result.reasons} /> : null}
      </div>
    </section>
  );
}

export function MaterialCalculator() {
  const [equipment, setEquipment] = useState<EquipmentType>("sink");
  const [environment, setEnvironment] = useState<CalcEnvironment>("restaurant");
  const [nearSea, setNearSea] = useState(false);
  const result = useMemo(
    () => recommendFromCalculator(equipment, environment, nearSea),
    [equipment, environment, nearSea],
  );

  return (
    <section id="material-calculator" className="mb-16 scroll-mt-28">
      <div className="mb-6 max-w-2xl">
        <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
          Material Calculator
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Quick estimate for grade, thickness, and finish.
        </p>
      </div>
      <div className="layer-1 rounded-2xl p-5 md:p-7">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Equipment type</span>
            <select
              className="layer-2 w-full rounded-lg px-3 py-2.5 text-sm"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value as EquipmentType)}
            >
              <option value="sink">Sink</option>
              <option value="table">Table</option>
              <option value="shelf">Shelf</option>
              <option value="hood">Hood</option>
              <option value="cabinet">Cabinet</option>
              <option value="custom">Custom fabrication</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Environment</span>
            <select
              className="layer-2 w-full rounded-lg px-3 py-2.5 text-sm"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as CalcEnvironment)}
            >
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="hospital">Hospital</option>
              <option value="lab">Laboratory</option>
              <option value="industrial">Industrial</option>
            </select>
          </label>
          <div className="text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Near the sea?</span>
            <div className="flex gap-2">
              <OptionButton active={!nearSea} onClick={() => setNearSea(false)}>
                No
              </OptionButton>
              <OptionButton active={nearSea} onClick={() => setNearSea(true)}>
                Yes
              </OptionButton>
            </div>
          </div>
        </div>
        <ResultCard
          grade={result.grade}
          extras={[
            { label: "Thickness", value: result.thickness },
            { label: "Finish", value: result.finish },
          ]}
        />
      </div>
    </section>
  );
}

export function DecisionTree() {
  const [food, setFood] = useState<"yes" | "no" | null>(null);
  const [sea, setSea] = useState<"yes" | "no" | null>(null);
  const [welding, setWelding] = useState<"yes" | "no" | null>(null);
  const [decorative, setDecorative] = useState<"yes" | "no" | null>(null);

  let grade: string | null = null;
  if (food === "no") {
    if (decorative === "yes") grade = "AISI 430";
    else if (decorative === "no") grade = "AISI 304 (or project-specified)";
  } else if (food === "yes") {
    if (sea === "yes") {
      grade = welding === "yes" ? "AISI 316L" : welding === "no" ? "AISI 316" : null;
    } else if (sea === "no") {
      grade = welding === "yes" ? "AISI 304L" : welding === "no" ? "AISI 304" : null;
    }
  }

  return (
    <section className="mb-16">
      <div className="mb-6 max-w-2xl">
        <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
          Which Stainless Steel Do I Need?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Follow the decision path for a fast engineering answer.
        </p>
      </div>
      <div className="layer-1 space-y-5 rounded-2xl p-5 md:p-7">
        <div>
          <p className="mb-2 text-sm font-medium">Will it contact food?</p>
          <div className="flex flex-wrap gap-2">
            <OptionButton
              active={food === "yes"}
              onClick={() => {
                setFood("yes");
                setDecorative(null);
              }}
            >
              Yes
            </OptionButton>
            <OptionButton
              active={food === "no"}
              onClick={() => {
                setFood("no");
                setSea(null);
                setWelding(null);
              }}
            >
              No
            </OptionButton>
          </div>
        </div>

        {food === "yes" ? (
          <div>
            <p className="mb-2 text-sm font-medium">Near the sea / high chlorides?</p>
            <div className="flex flex-wrap gap-2">
              <OptionButton active={sea === "yes"} onClick={() => setSea("yes")}>
                Yes
              </OptionButton>
              <OptionButton active={sea === "no"} onClick={() => setSea("no")}>
                No
              </OptionButton>
            </div>
          </div>
        ) : null}

        {food === "no" ? (
          <div>
            <p className="mb-2 text-sm font-medium">Decorative / non-food panel only?</p>
            <div className="flex flex-wrap gap-2">
              <OptionButton active={decorative === "yes"} onClick={() => setDecorative("yes")}>
                Yes → 430
              </OptionButton>
              <OptionButton active={decorative === "no"} onClick={() => setDecorative("no")}>
                No
              </OptionButton>
            </div>
          </div>
        ) : null}

        {food === "yes" && sea ? (
          <div>
            <p className="mb-2 text-sm font-medium">Need heavy / extensive welding?</p>
            <div className="flex flex-wrap gap-2">
              <OptionButton active={welding === "yes"} onClick={() => setWelding("yes")}>
                Yes → {sea === "yes" ? "316L" : "304L"}
              </OptionButton>
              <OptionButton active={welding === "no"} onClick={() => setWelding("no")}>
                No → {sea === "yes" ? "316" : "304"}
              </OptionButton>
            </div>
          </div>
        ) : null}

        {grade ? (
          <ResultCard
            grade={grade}
            reasons={["Based on food contact, environment, and welding needs"]}
          />
        ) : null}
      </div>
    </section>
  );
}
