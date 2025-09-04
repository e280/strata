
# `@e280/strata` changelog
- 🟥 breaking change
- 🔶 deprecation or possible breaking change
- 🍏 harmless addition, fix, or enhancement



<br/>

## v0.2

### v0.2.0
- 🟥 signal rework
  - 🟥 renamed `Signaloid` to `Signaly`
  - 🟥 renamed `LazySignal` to `Lazy` (now its a class)
  - 🟥 renamed `DerivedSignal` to `Derive` (now its a class)
  - 🟥 reworked hipster fn syntax
    - old bad
      ```ts
      count()
      await count(2)
      ```
    - new good
      ```ts
      const cool = count.fn()
      cool()
      await cool(2)
      ```
    - see new `signal.fn(1)` as well to mint fresh ones



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

