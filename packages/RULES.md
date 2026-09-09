# Rules for Shared Packages (`packages/RULES.md`)

## 1. Circular Dependencies
- Circular imports between workspace packages are strictly forbidden.
- Dependency flow must be strictly unidirectional: `apps` $\to$ `packages` $\to$ `base types`.

## 2. Backward Compatibility
- Modifying or removing any field from `packages/shared-types` must be backward-compatible or include a staged deprecation cycle.

## 3. Pure TypeScript / Node Standards
- Packages in this directory must build cleanly using `tsup` with `.d.ts` declaration generation.
