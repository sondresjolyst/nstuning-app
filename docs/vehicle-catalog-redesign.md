# Vehicle catalog redesign

> **Naming note (as built):** the middle level keeps its original name **Variant**
> — the `CarVariant` entity/table is *not* renamed. An earlier draft below called it
> "Generation"; read every "Generation" / `CarGeneration` as "Variant" / `CarVariant`.
> The level covers both generations (8P, E46) and trims/specs (GL, T5, Turbo).

## Problem

The catalog is a strict 4-level tree: **brand → model → variant → engine**, where each
engine is owned by exactly one variant (`CarEngine.VariantId`, cascade delete).

Two things break:

1. **Engine coupling.** An engine belongs to one variant, so the same engine
   (EA888 across VW/Audi/Seat, B27A across Volvo 240/260) must be re-entered under
   every variant. Engine *swaps* (a non-factory motor in a car) can't be expressed
   at all.

2. **Label redundancy.** The display label blindly joins all levels
   (`[carMake, carModel, trim, year]`). It reads well when every level adds new
   info, badly when levels overlap:

   | Brand | Model | Variant | Engine | Label | Verdict |
   |-------|-------|---------|--------|-------|---------|
   | Saab  | 99    | GL      | 2.0L   | Saab 99 GL 2.0L | clean — trim adds info |
   | Audi  | A3    | 8P      | 1.4 TFSI | Audi A3 8P 1.4 TFSI | clean — generation adds info |
   | Volvo | 240   | 242     | B27A   | Volvo 240 242 B27A | **redundant** — 242 *is* the 240 |

   Root cause: the middle slot is overloaded (trim / generation / body style), and
   for series-named cars the model (240) and the body (242) get split into two
   forced levels even though people just say **"Volvo 242"**.

## Target model

Decouple two independent dimensions — **vehicle** and **engine** — and separate
*picker organization* from the *display label*.

```
Brand
 └ [Family]          optional grouping folder — picker only, NEVER in label
    └ Model          spoken name — always in label   (242, A3, M3, 99)
       + Generation  optional — in label when present (8P, E46, GL, T5)
Engine catalog       separate, picked independently — in label  (B27A, 1.4 TFSI)
```

- **Family** = a folder for browsing only (Volvo "240 series", BMW "3 Series").
  Groups bodies/models together in the picker; never appears in the label.
- **Model** = what people actually say. This is the label's anchor.
- **Generation** = optional qualifier (was "variant"). Only shows when set.
- **Engine** = its own catalog. Picked independently of the vehicle, so swaps and
  shared engines are native. Optional *fitment* links record factory engines per
  model for suggestions, but never restrict the pick.

### Resulting tree (mockup)

```
Volvo
 ├ 240 series        ← Family (folder)
 │  ├ 242
 │  ├ 244
 │  └ 245
 ├ 260 series        ← Family
 │  ├ 262 / 264 / 265
 └ 850               ← no family, flat model
    + T5, T5-R       ← generations

BMW
 └ 3 Series          ← Family
    ├ 320i  → E46
    ├ 330i  → E90
    └ M3    → E36 / E46 / E92

Audi
 ├ A3 → 8L / 8P / 8V
 └ A4 → B5 / B6 / B8

Saab
 └ 99 → GL / EMS / Turbo
```

### Resulting labels  (brand + model + generation + engine)

```
Volvo 242 B27A
Volvo 850 T5  B5234T
BMW M3 E46  S54B32
Audi A3 8P  1.8T 20v
Saab 99 GL  2.0L
Volvo 242  2JZ-GTE        ← engine swap, native
```

## Schema changes (nstuning-api)

Current:

```
CarBrand    Id, Name
CarModel    Id, BrandId, Name
CarVariant  Id, ModelId, Name
CarEngine   Id, VariantId, Name            ← coupled
```

Target:

```
CarBrand       Id, Name                                   unchanged
CarModel       Id, BrandId, Family?, Name                 + nullable Family (string)
CarGeneration  Id, ModelId, Name                          renamed from CarVariant
CarEngine      Id, BrandId?, Name                         drop VariantId; add nullable BrandId
CarModelEngine ModelId, EngineId  (PK both)               NEW — M:N factory fitment, optional
```

Notes:

- **Family as a string on `CarModel`** (not a new table). It's only a folder label;
  a string avoids an extra table + CRUD + FK migration. Grouping in the picker =
  group a brand's models by their `Family` value (null = flat under brand).
  *(Alternative: a `CarFamily` entity for first-class rename/reorder. Heavier. Pick
  during review — see Open decisions.)*
- **`CarEngine.BrandId` nullable** — groups engines in the picker (B27A under Volvo)
  while still allowing any engine to be picked for any car (swaps). Null = global.
- **`CarModelEngine`** records factory engines per model so the form can suggest
  "engines normally fitted to this model" without restricting the choice.

## Data migration (production has live catalog data)

DynoRun rows store denormalized strings and have **no FK** into the catalog, so
**no dyno run is affected** — migration is purely a catalog reshape.

EF migration steps:

1. `CarVariant` → rename table/entity to `CarGeneration` (column-compatible:
   `Id, ModelId, Name`). Pure rename, data preserved.
2. `CarEngine`: add nullable `BrandId`, then **flatten + dedupe**:
   - For each existing engine, set `BrandId = engine.Variant.Model.Brand.Id`.
   - Dedupe by `(BrandId, lower(Name))` — collapse duplicates created by the old
     per-variant ownership into one catalog row.
3. Backfill `CarModelEngine` from the old ownership chain: for every original
   engine, insert `(engine.Variant.ModelId, dedupedEngineId)` (distinct). This
   preserves "which engines belonged to which model" as fitment links.
4. Drop `CarEngine.VariantId` and its FK/cascade.
5. Add nullable `CarModel.Family` (defaults null — flat, same as today).

What migration **cannot** do automatically: the Volvo "240 vs 242" cleanup. After
migration the data still reads `model=240, generation=242`. Fixing it is a manual
admin edit using the new tools — move `240` into `Family`, promote `242` to the
model name. Document this as a one-time post-migration cleanup; consider a helper
script if there are many series-named brands.

## API changes (nstuning-api)

- `GET /api/vehicles/tree` — `BrandTree` gains family grouping; `ModelTree` carries
  `family` + `generations` (was `variants`) + `factoryEngineIds`. Add a separate
  top-level `engines` catalog list (or a sibling `GET /api/vehicles/engines`).
- Vehicles feature slices:
  - `Variants.cs` → `Generations.cs` (rename, same CRUD shape).
  - `Engines.cs` → decouple from variant: `POST /api/vehicles/engines`
    (optional `brandId`), `PUT/DELETE` unchanged; add
    `POST/DELETE /api/vehicles/models/{modelId}/engines/{engineId}` for fitment links.
  - `Models.cs` — accept optional `family` on create/rename.
- `VehicleContracts.cs` records updated accordingly.

## Frontend changes (nstuning-app)

- `vehicleService.ts` — new node shape: `BrandNode { families?, models }`,
  `ModelNode { family?, generations, factoryEngineIds }`, plus a flat `engines`
  catalog; rename `variant*` calls to `generation*`; add fitment + engine-catalog calls.
- `admin/vehicles/page.tsx` (builder) — render the family grouping layer; rename
  "variant" UI to "generation"; add a separate **Engine catalog** editor and a
  per-model factory-engine multi-select. Family is an optional field on a model row.
- `DynoRunForm.tsx` — selects become: Make → Model (grouped by family in the
  dropdown) → Generation (optional) → Engine (own dropdown from the catalog,
  factory engines listed first, but any selectable). Cascade no longer forces
  generation before engine.
- `DynoRunCard.tsx` / detail page — label rule:
  `[carMake, carModel, trim/generation, year]` stays, but `carModel` now holds the
  spoken name (242, not 240) so the label is correct by construction. Family is
  never part of the label.

## Decisions (settled)

1. **Family** → **string field** on `CarModel` (nullable). No `CarFamily` entity.
2. **Engine catalog scope** → **brand-tagged, all pickable**: `CarEngine.BrandId`
   nullable for grouping; picker shows all engines (swap-friendly).
3. **Fitment level** → **model level** (`CarModelEngine` M:N).
```
