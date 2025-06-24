
# ⛏️ strata

**my 10th state management library, probably**
- 📦 `npm install @e280/strata`
- single-source-of-truth state tree
- immutable except for `mutate(fn)` calls
- straightforward with no spooky proxy magic
- undo/redo history, cross-tab sync, localStorage persistence

<br/>

## solid state management

### establish a strata with some state
- better stick to json-friendly serializable data
  ```ts
  import {Strata} from "@e280/strata"

  const strata = new Strata({
    count: 0,
    snacks: {
      peanuts: 8,
      bag: ["popcorn", "chocolate"],
    },
  })

  strata.state.count // 0
  strata.state.snacks.peanuts // 8
  ```

### how mutations work
- ⛔ informal mutations are denied
  ```ts
  strata.state.count++ // error is thrown
  ```
- ✅ formal mutation is allowed
  ```ts
  await strata.mutate(s => s.count++)
  ```

### substrata and selectors
- a substrata is a view into a subset of the state tree
  ```ts
  const snacks = strata.substrata(s => s.snacks)
  ```
- run substrata mutations
  ```ts
  await snacks.mutate(s => s.peanuts++)
  ```
- array mutations are cool, actually
  ```ts
  await snacks.mutate(s => s.bag.push("butter"))
  ```

### onMutation events
- you can listen to global mutations on the strata
  ```ts
  strata.onMutation(s => console.log(s.count))
  ```

- substrata listeners don't care about outside changes
  ```ts
  snacks.onMutation(s => console.log(s.peanuts))
  ```

- onMutation returns a fn to stop listening
  ```ts
  const stop = strata.onMutation(s => console.log(s.count))
  stop() // stop listening
  ```

<br/>

## fancy state management for fancy people

### chronstrata for undo/redo history
- put a `Chronicle` into your state tree
  ```ts
  const strata = new Strata({
    count: 0,
    snacks: Strata.chronicle({
      peanuts: 8,
      bag: ["popcorn", "chocolate"],
    }),
  })
  ```
- access the chronicle using the `Chronstrata` helper
  ```ts
  const snacks = strata.chronstrata(64, s => s.snacks)
  ```
- mutations will advance history (undoable/redoable)
  ```ts
  await snacks.mutate(s => s.peanuts = 101)

  await snacks.undo()
    // back to 8 peanuts

  await snacks.redo()
    // forward to 101 peanuts
  ```
- chronstrata can have its own substrata, and all such substrata mutations will advance history (undoable/redoable)

<br/>

## a buildercore e280 project
free and open source by https://e280.org/  
join us if you're cool and good at dev  

