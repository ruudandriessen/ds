# ds

`ds` is a small TypeScript library for building a minimal set of type-safe data structures.

The intent is to keep the surface area narrow:

- minimal APIs
- predictable behavior
- strong static types
- no unnecessary abstraction

## Status

This library is in an early stage. The goal is to grow it into a focused collection of core data structures rather than a large utility grab bag.

## Design Principles

- Type safety first. Public APIs should preserve useful TypeScript information instead of erasing it.
- Minimal by default. Each structure should expose the smallest API that still feels complete.
- Explicit tradeoffs. If a structure has performance or ergonomics costs, they should be obvious from the API.
- Standard TypeScript. The library should feel natural in plain TypeScript projects without extra tooling.

## Scope

The project is intended for a simple set of reusable data structures that are:

- easy to understand
- small enough to audit
- practical in application code
- consistent in naming and behavior

## Local Development

Install dependencies:

```bash
bun install
```

Use the package in local development from `index.ts` and add new structures as the public API takes shape.
