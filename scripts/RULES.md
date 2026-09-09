# Rules for Scripts (`scripts/RULES.md`)

## 1. Idempotency
- All maintenance scripts MUST be **idempotent**: running a script twice should produce the exact same outcome without duplicating records or corrupting state.

## 2. Zero Domain Logic
- Scientific simulations, mathematical formulas, and business engines MUST NOT be placed in `scripts/`.
- Domain computation belongs exclusively in `engines/`.

## 3. Clear In-Code Documentation
- Every script must begin with a docstring stating its purpose, required arguments, and expected side effects.
