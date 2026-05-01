
# `@e280/strata` changelog
- 🟥 breaking change
- 🔶 deprecation or possible breaking change
- 🍏 harmless addition, fix, or enhancement



<br/>

## v0.3

### v0.3.5
- 🍏 update deps

### v0.3.4
- 🍏 tweak readme, update deps

### v0.3.3
- 🍏 add `wait`

### v0.3.2
- 🔶 rename `EzStore` type to `Cubby`
- 🔶 `lens.state` is now a mutable state snapshot (was immutable before)
- 🔶 `lens.on(state => {})` now gives a mutable snapshot (was immutable before)
- 🍏 `lens.frozen` is now the immutable snapshot
- 🍏 `lens.onFrozen(frozen => {})` gives an immutable snapshot
- 🍏 update dependencies

### v0.3.1
- 🍏 improved react integration, added `useOnce`, `useSignal`, `useDerived` react hooks

### v0.3.0
- 🟥 reworked effects
  - 🟥 `collectorEffect` renamed to `watch`
  - 🍏 you can now pass values from the collector to the responder fns
  - 🍏 dynamic dependencies: effects now refresh the tracking whenever re-collecting
- 🟥 rewrote signal, derived, and lazy
  - 🟥 deleted hipster fn types `SignalFn`, `DerivedFn`, `LazyFn` (SignalFn becomes just `Signal` because now all signals are hipster fns!)
  - 🔶 all signals are now an unholy hybrid of class-based and hipster fns
  - 🍏 but most behaviors have not actually changed



<br/>

## v0.2

### v0.2.8
- 🍏 added react bindings!
- 🍏 update license year

### v0.2.7
- 🍏 update github action workflows for publishing

### v0.2.6
- 🍏 update dependencies

### v0.2.5
- 🍏 update dependencies

### v0.2.4
- 🍏 fix: reactivity for plain `prism.get()` and `prism.set()`
- 🍏 update dependencies

### v0.2.3
- 🔶 deprecated `Tree`, `Trunk`, `Branch` -- in favor of newer `Prism` and `Lens` systems (see readme!)
- 🍏 update dependencies

### v0.2.2
- 🔶 branch `.on` is no longer a full stz `Sub`, but is now a simple subscriber fn
- 🔶 "sync coherence" rework tree behavior, mutations now take immediate effect -- but as a consequence, mutation loop detection is no longer provided -- you used to get an error if you trigger a mutation from an effect that was triggered by a mutation, but now, no error is thrown, you are on your own
- 🔶 deprecated name `Options` in favor of more specific `TreeOptions`
- 🍏 update dependencies

### v0.2.1
- 🍏 update dependencies

### v0.2.0
- 🍏 add `RSet` and `RMap` reactive set/map
- 🍏 introduce and encourage new `$signal` naming convention in readme
- 🟥 signal rework. new implementation. mostly backwards-compatible.
  - 🟥 renamed type `Signaloid` to `SignalyFn`
  - 🟥 renamed type `Signal` to `SignalFn`
  - 🟥 renamed type `LazySignal` to `LazyFn`
  - 🟥 renamed type `DeriveSignal` to `DerivedFn`
  - 🟥 signal publish no longer takes a value (it publishes the sneak value)
  - 🟥 signal set now accepts second param forcePublish to enforce a publish during the set
  - 🍏 add type `Signaly` for (any signal-like core classes)
  - 🍏 add nice `.toString()` handlers, helpful for templating mistakes
  - 🍏 new primitive classes (without hipster syntax)
    - `new Signal(0)`
    - `new Lazy(formulaFn)`
    - `new Derived(formulaFn)`
    - these classes have a new `.fn()` method that returns a hipster fn
    - "porcelain" fns now return hipster-fn variants, `signal(0)`, `lazy(formulaFn)`, `derived(formulaFn)`



<br/>

## v0.1

### v0.1.0
- 🍏 moving to version range that allows non-breaking patches
- 🍏 update dependencies

## v0.0

### v0.0.0
- 🟥 tracker method renames
  - `see` -> `notifyRead`
  - `change` -> `notifyWrite`
  - `seen` -> `observe`
  - `changed` -> `subscribe`
  - the global tracker symbol has changed to `Symbol.for("e280.tracker")`
    - ***all*** strata packages must upgrade to this new version together at once, otherwise version mismatches will cause errors
    - hopefully this will be the last such change, this version of the tracker forever written in stone

### v0.0.0-10
- 🍏 tweak signal ergonomics:
  - `mySignal.set(123)` now returns a promise for `123`
  - `mySignal(123)` now returns a promise for `123`
  - `mySignal.publish(123)` now returns a promise for `123`

### v0.0.0-9
- 🍏 update dependencies
- 🍏 remove wildcard export paths (more formal exports)

### v0.0.0-8
- 🟥 signals rework
  - `computed` replaced by `signal.lazy`
  - new `signal.derive` is even betterer than old computed
- 🟥 big tree rework (trunk/branch/chronobranch)
  - reimplemented to use signals under the hood
  - renamed `tree.watch` to `tree.on`

### v0.0.0-7
- 🟥 fix `Trunk.setup` return names

### v0.0.0-6
- 🍏 added `signal`, `effect`, `computed`
- 🍏 added `tracker`
- 🟥 huge rewrite, with big renames
  - `Stratum` => `Tree`
  - `Strata` => `Trunk`
  - `Substrata` => `Branch`
  - `Chronstrata` => `Chronobranch`
  - `State` => `Trunkstate`
  - `Substate` => `Branchstate`

### v0.0.0-5
- 🟥 continually evolved the strata systems

### v0.0.0-0
- 🍏 first release

