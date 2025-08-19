
![](https://i.imgur.com/h7FohWa.jpeg)

<br/>

# ⛏️ strata

### get in loser, we're managing state
📦 `npm install @e280/strata`  
🧙‍♂️ probably my tenth state management library, lol  
💁 it's all about rerendering ui when data changes  
🦝 used by our view library [@e280/sly](https://github.com/e280/sly)  
🧑‍💻 a project by https://e280.org/

🚦 **signals** — ephemeral view-level state  
🌳 **tree** — persistent app-level state  
🪄 **tracker** — reactivity integration hub  

<br/>

## 🚦 strata signals
> *ephemeral view-level state*

```ts
import {signal, effect, computed} from "@e280/strata"
```

### 🚦 each signal holds a value
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

### 🚦 pick your poison
- **signal hipster fn syntax**
  ```ts
  count() // get
  await count(2) // set
  ```
  > *you'd better appreciate this damn hipster syntax, because it makes the implementation cursed, lol* 💀
- **signal get/set syntax**
  ```ts
  count.get() // get
  await count.set(2) // set
  ```
- **signal .value accessor syntax**
  ```ts
  count.value // get
  count.value = 2 // set
  ```
  value pattern is nice for this vibe
  ```ts
  count.value++
  count.value += 1
  ```

### 🚦 effects
- **effects run when the relevant signals change**
  ```ts
  effect(() => console.log(count()))
    // 1
    // the system detects 'count' is relevant

  count.value++
    // 2
    // when count is changed, the effect fn is run
  ```

### 🚦 `signal.derive` and `signal.lazy` are computed signals
- **signal.derive**  
  is for combining signals
  ```ts
  const a = signal(1)
  const b = signal(10)
  const product = signal.derive(() => a() * b())

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
  > *i repeat: lazy signals cannot trigger effects!*

<br/>

## 🌳 strata trees
> *persistent app-level state*

```ts
import {Trunk} from "@e280/strata"
```

- single-source-of-truth state tree
- immutable except for `mutate(fn)` calls
- localStorage persistence, cross-tab sync, undo/redo history
- no spooky-dookie proxy magic — just god's honest javascript

#### 🌳 `Trunk` is your app's state tree root
- better stick to json-friendly serializable data
  ```ts
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

#### 🌳 formal mutations to change state
- ⛔ informal mutations are denied
  ```ts
  trunk.state.count++ // error is thrown
  ```
- ✅ formal mutations are allowed
  ```ts
  await trunk.mutate(s => s.count++)
  ```

#### 🌳 `Branch` is a view into a subtree
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

#### 🌳 `on` to watch for mutations
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

### 🌳 fancy advanced usage
> *only discerning high-class aristocrats are permitted beyond this point*

#### 🌳 `Trunk.setup` for localStorage persistence etc
- it automatically handles persistence to localStorage and cross-tab synchronization
- simple setup
  ```ts
  const {trunk} = await Trunk.setup({
    version: 1, // 👈 bump whenever you change state schema!
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

#### 🌳 `Chronobranch` for undo/redo history
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

## 🪄 strata tracker
> *reactivity integration hub*

```ts
import {tracker} from "@e280/strata/tracker"
```

if you're some kinda framework author, making a new ui thing, or a new state concept -- then you can use the `tracker` to jack into the strata reactivity system, and suddenly your stuff will be fully strata-compatible, reactin' and triggerin' with the best of 'em.

the tracker is agnostic and independent, and doesn't know about strata specifics like signals or trees -- and it would be perfectly reasonable for you to use strata solely to integrate with the tracker, thus making your stuff reactivity-compatible with other libraries that use the tracker, like [sly](https://github.com/e280/sly).

note, the *items* that the tracker tracks can be any object, or symbol.. the tracker cares about the identity of the item, not the value (tracker holds them in a WeakMap to avoid creating a memory leak)..

### 🪄 integrate your ui's reactivity
- we need to imagine you have some prerequisites
    - `myRenderFn` -- your fn that might access some state stuff
    - `myRerenderFn` -- your fn that is called when some state stuff changes
    - it's okay if these are the same fn, but they don't have to be
- `tracker.observe` to check what is touched by a fn
    ```ts
    // 🪄 run myRenderFn and collect seen items
    const {seen, result} = tracker.observe(myRenderFn)

    // a set of items that were accessed during myRenderFn
    seen

    // the value returned by myRenderFn
    result
    ```
- it's a good idea to debounce your rerender fn
    ```ts
    import {debounce} from "@e280/stz"
    const myDebouncedRerenderFn = debounce(0, myRerenderFn)
    ```
- `tracker.subscribe` to respond to changes
    ```ts
    const stoppers: (() => void)[] = []

    // loop over every seen item
    for (const item of seen) {

      // 🪄 react to changes
      const stop = tracker.subscribe(item, myDebouncedRerenderFn)

      stoppers.push(stop)
    }

    const stopReactivity = () => stoppers.forEach(stop => stop())
    ```

### 🪄 integrate your own novel state concepts
- as an example, we'll invent the simplest possible signal
    ```ts
    export class SimpleSignal<Value> {
      constructor(private value: Value) {}

      get() {

        // 🪄 tell the tracker this signal was accessed
        tracker.notifyRead(this)

        return this.value
      }

      async set(value: Value) {
        this.value = value

        // 🪄 tell the tracker this signal has changed
        await tracker.notifyWrite(this)
      }
    }
    ```

<br/>

## 🧑‍💻 an e280 project
free and open source by https://e280.org/  
join us if you're cool and good at dev  

