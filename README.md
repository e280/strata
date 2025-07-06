
![](https://i.imgur.com/h7FohWa.jpeg)

<br/>

# ⛏️ strata

### get in loser, we're managing state
📦 `npm install @e280/strata`  
🧙‍♂️ probably my tenth state management library, lol  
💁 it's all about rerendering ui when data changes  

🚦 **signals** — ephemeral view-level state  
🌳 **tree** — persistent app-level state  
🪄 **tracker** — reactivity integration hub  

<br/>

> [!TIP]  
> incredibly, signals and trees are interoperable.  
> that means, effects and computeds are responsive to changes in tree state.  

<br/>

## 🚦 signals — *ephemeral view-level state*
```ts
import {signal, effect, computed} from "@e280/strata"
```

### each signal holds a value
- **create a signal**
  ```ts
  const count = signal(0)
  ```
- **read a signal**
  ```ts
  count() // 0
  ```
- **set a signal**
  ```ts
  count(1)
  ```
- **set a signal, and await effect propagation**
  ```ts
  await count(2)
  ```

### pick your poison
- **signals hipster fn syntax**
  ```ts
  count() // get
  await count(2) // set
  ```
  > to achieve this hipster syntax i had to make the implementation so damn cursed, lol 💀
- **signals get/set syntax**
  ```ts
  count.get() // get
  await count.set(2) // set
  ```
- **signals .value accessor syntax**
  ```ts
  count.value // get
  count.value = 2 // set
  ```
  value pattern is nice for this vibe
  ```ts
  count.value++
  count.value += 1
  ```

### effects
- **effects run when the relevant signals change**
  ```ts
  effect(() => console.log(count()))
    // 1
    // the system detects 'count' is relevant

  count.value++
    // 2
    // when count is changed, the effect fn is run
  ```

### `signal.derive` and `signal.lazy` are computed signals
- **signal.derive**  
  is for combining signals
  ```ts
  const a = signal(1)
  const b = signal(10)
  const product = signal.derive(() => a() + b())

  product() // 10

  // change a dependency,
  // and the derived signal is automatically updated
  await a.set(2)

  product() // 20
  ```
- **signal.lazy**  
  is for making special optimizations.  
  it's like derive, except it cannot trigger effects,  
  because it's so lazy it only computes the value on read, and only when necessary.  
  > ⚠️ *i repeat: lazy signals cannot trigger effects!*

<br/>

## 🌳 tree — *persistent app-level state*
- single-source-of-truth state tree
- immutable except for `mutate(fn)` calls
- localStorage persistence, cross-tab sync, undo/redo history
- no spooky-dookie proxy magic — just god's honest javascript

#### `Trunk` is your app's state tree root
- better stick to json-friendly serializable data
  ```ts
  import {Trunk} from "@e280/strata"

  const trunk = new Trunk({
    count: 0,
    snacks: {
      peanuts: 8,
      bag: ["popcorn", "butter"],
    },
  })

  trunk.state.count // 0
  trunk.state.snacks.peanuts // 8
  ```

#### formal mutations to change state
- ⛔ informal mutations are denied
  ```ts
  trunk.state.count++ // error is thrown
  ```
- ✅ formal mutations are allowed
  ```ts
  await trunk.mutate(s => s.count++)
  ```

#### `Branch` is a view into a subtree
- it's a lens, make lots of them, pass 'em around your app
  ```ts
  const snacks = trunk.branch(s => s.snacks)
  ```
- run branch mutations
  ```ts
  await snacks.mutate(s => s.peanuts++)
  ```
- array mutations are unironically based, actually
  ```ts
  await snacks.mutate(s => s.bag.push("salt"))
  ```
- you can branch a branch

#### watch for mutations
- on the trunk, we can listen deeply for mutations within the whole tree
  ```ts
  trunk.on(s => console.log(s.count))
  ```
- whereas branch listeners don't care about changes outside their scope
  ```ts
  snacks.on(s => console.log(s.peanuts))
  ```
- on returns a fn to stop listening
  ```ts
  const stop = trunk.on(s => console.log(s.count))
  stop() // stop listening
  ```

### only discerning high-class aristocrats are permitted beyond this point

#### `Trunk.setup` for localStorage persistence etc
- simple setup
  ```ts
  const {trunk} = await Trunk.setup({
    version: 1, // 👈 bump whenever your change state schema!
    initialState: {count: 0},
  })
  ```
  - uses localStorage by default
- it's compatible with [`@e280/kv`](https://github.com/e280/kv)
  ```ts
  import {Kv, StorageDriver} from "@e280/kv"

  const kv = new Kv(new StorageDriver())
  const store = kv.store<any>("appState")

  const {trunk} = await Trunk.setup({
    version: 1,
    initialState: {count: 0},
    persistence: {
      store,
      onChange: StorageDriver.onStorageEvent,
    },
  })
  ```

#### `Chronobranch` for undo/redo history
- first, put a `Chronicle` into your state tree
  ```ts
  const trunk = new Trunk({
    count: 0,
    snacks: Trunk.chronicle({
      peanuts: 8,
      bag: ["popcorn", "butter"],
    }),
  })
  ```
  - *big-brain moment:* the whole chronicle *itself* is stored in the state.. serializable.. think persistence — user can close their project, reopen, and their undo/redo history is still chillin' — *brat girl summer*
- second, make a `Chronobranch` which is like a branch, but is concerned with history
  ```ts
  const snacks = trunk.chronobranch(64, s => s.snacks)
    //                               \
    //               how many past snapshots to store
  ```
- mutations will advance history (undoable/redoable)
  ```ts
  await snacks.mutate(s => s.peanuts = 101)

  await snacks.undo()
    // back to 8 peanuts

  await snacks.redo()
    // forward to 101 peanuts
  ```
- you can check how many undoable or redoable steps are available
  ```ts
  snacks.undoable // 2
  snacks.redoable // 1
  ```
- chronobranch can have its own branches — all their mutations advance history
- plz pinky-swear right now, that you won't create a chronobranch under a branch under another chronobranch 💀

<br/>

## 🪄 tracker — integrations
- ```ts
  import {tracker} from "@e280/strata/tracker"
  ```
- all reactivity is orchestrated by the `tracker`
- if you are integrating a new state object, or a new view layer that needs to react to state changes, just read [tracker.ts](./s/tracker/tracker.ts)

<br/>

## a buildercore e280 project
free and open source by https://e280.org/  
join us if you're cool and good at dev  

