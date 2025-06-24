
# ⛏️ strata

**my 10th state management library, probably**
- 📦 `npm install @e280/strata`
- single-source-of-truth state tree
- immutable except for `mutate(fn)` calls
- straightforward with no spooky proxy magic
- undo/redo history, cross-tab sync, localStorage persistence

## good state management

### establish a strata with some state
- better stick to json-friendly serializable data
  ```ts
  import {Strata} from "@e280/strata"

  const strata = new Strata({
    count: 0,
    stuff: {
      peanuts: 8,
      items: ["hello", "world"],
    },
  })

  strata.state.count // 0
  strata.state.stuff.peanuts // 8
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
  const stuff = strata.substrata(s => s.stuff)
  ```
- run substrata mutations
  ```ts
  await stuff.mutate(s => s.peanuts++)
  ```
- array mutations are cool, actually
  ```ts
  await stuff.mutate(s => s.items.push("lol"))
  ```

### onMutation events
- you can listen to global mutations on the strata
  ```ts
  strata.onMutation(s => console.log(s.count))
  ```

- substrata listeners don't care about outside changes
  ```ts
  stuff.onMutation(s => console.log(s.peanuts))
  ```

- onMutation returns a fn to stop listening
  ```ts
  const stop = strata.onMutation(s => console.log(s.count))
  stop() // stop listening
  ```

## a buildercore e280 project
free and open source by https://e280.org/  
join us if you're cool and good at dev  

