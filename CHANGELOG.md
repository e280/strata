
# `@e280/strata` changelog
- 🟥 breaking change
- 🔶 deprecation or possible breaking change
- 🍏 harmless addition, fix, or enhancement

<br/>

## v0.0

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

