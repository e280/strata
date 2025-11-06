
![](https://i.imgur.com/h7FohWa.jpeg)



<br/><br/>

# ⛏️ strata

### get in loser, we're managing state
📦 `npm install @e280/strata`  
✨ it's all about automagically rerendering ui when data changes  
🦝 powers auto-reactivity in our view library [@e280/sly](https://github.com/e280/sly)  
🧙‍♂️ probably my tenth state management library, lol  
🧑‍💻 a project by https://e280.org/  

🚦 [**signals**](#signals) — ephemeral view-level state  
🔮 [**prism**](#prism) — app-level state tree  
🪄 [**tracker**](#tracker) — reactivity integration hub  



<br/><br/>

<a id="signals"></a>

## 🍋 strata signals
> *ephemeral view-level state*

```ts
import {signal, effect} from "@e280/strata"
```

### 🚦 each signal holds a value
- **make signal**
  ```ts
  const $count = signal(0)
  ```
  > *maybe you like the `$` prefix convention for signals?*
- **read signal**
  ```ts
  $count() // 0
  ```
- **write signal**
  ```ts
  $count(1)
  ```
- **write signal *(and await all downstream effects)***
  ```ts
  await $count(2)
  ```
  > *this is supposed to impress you*

### 🚦 pick your poison
- **signal hipster-fn syntax**
  ```ts
  $count()        // read
  await $count(2) // write
  ```
- **signal get/set syntax**
  ```ts
  $count.get()        // read
  await $count.set(2) // write
  ```
- **signal .value accessor syntax**
  ```ts
  $count.value     // read
  $count.value = 2 // write
  ```
  value pattern is super nice for these vibes
  ```ts
  $count.value++
  $count.value += 1
  ```

### 🚦 effects
- **effects run when the relevant signals change**
  ```ts
  effect(() => console.log($count()))
    // 1
    // the system detects '$count' is relevant

  $count.value++
    // 2
    // when $count is changed, the effect fn is run
  ```

### 🚦 `signal.derived` and `signal.lazy` are computed signals
- **signal.derived**  
  is for combining signals, like a formula
  ```ts
  const $a = signal(1)
  const $b = signal(10)
  const $product = signal.derived(() => $a() * $b())

  $product() // 10

  // change a dependency,
  // and the derived signal is automatically updated
  await $a(2)

  $product() // 20
  ```
- **signal.lazy**  
  is for making special optimizations.  
  it's like derived, except it cannot trigger effects,  
  because it's so damned lazy, it only computes the value on read, and only when necessary.  
  > *i repeat: lazy signals cannot trigger effects!*

### 🚦 core primitive classes
- **the hipster-fn syntax has a slight performance cost**
- **you can instead use the core primitive classes**
  ```ts
  const $count = new Signal(1)
  ```
  core signals work mostly the same
  ```ts
  // ✅ legal
  $count.get()
  $count.set(2)
  ```
  except you cannot directly invoke them
  ```ts
  // ⛔ illegal on core primitives
  $count()
  $count(2)
  ```
- **same thing for derived/lazy**
  ```ts
  const $product = new Derived(() => $a() * $b())
  ```
  ```ts
  const $product = new Lazy(() => $a() * $b())
  ```
- **conversions**
  - all core primitives (signal/derived/lazy) have a convert-to-hipster-fn method
    ```ts
    new Signal(1).fn() // SignalFn<number>, hipster-fn
    ```
  - and all hipster fns (signal/derived/lazy) have a `.core` property to get the primitive
    ```ts
    signal(0).core // Signal<number>, primitive instance
    ```

### 🚦 types
- **`Signaly<V>`** — can be `Signal<V>` or `Derived<V>` or `Lazy<V>`
  - these are types for the core primitive classes
- **`SignalyFn<V>`** — can be `SignalFn<V>` or `DerivedFn<V>` or `LazyFn<V>`
  - these `*Fn` types are for the hipster-fn-syntax enabled variants



<br/><br/>

<a id="prism"></a>

## 🍋 strata prism
> *persistent app-level state*

- single-source-of-truth state tree
- no spooky-dookie proxy magic — just god's honest javascript
- immutable except for `mutate(fn)` calls
- use many lenses, efficient reactivity
- chrono provides undo/redo history
- persistence, localstorage, cross-tab sync

### 🔮 prism and lenses
- **import prism**
    ```ts
    import {Prism} from "@e280/strata"
    ```
- **prism is a state tree**
    ```ts
    const prism = new Prism({
      snacks: {
        peanuts: 8,
        bag: ["popcorn", "butter"],
        person: {
          name: "chase",
          incredi: true,
        },
      },
    })
    ```
- **create lenses, which are views into state subtrees**
    ```ts
    const snacks = prism.lens(state => state.snacks)
    const person = snacks.lens(state => state.person)
    ```
    - you can lens another lens
- **lenses provide immutable access to state**
    ```ts
    snacks.state.peanuts // 8
    person.state.name // "chase"
    ```
- **only formal mutations can change state**
    ```ts
    snacks.state.peanuts++
      // ⛔ error: casual mutations forbidden
    ```
    ```ts
    snacks.mutate(state => state.peanuts++)
      // ✅ only proper mutations can make state changes

    snacks.state.peanuts // 9
    ```
- **array mutations are unironically based, actually**
    ```ts
    await snacks.mutate(state => state.bag.push("salt"))
    ```

### 🔮 chrono for time travel
- **import stuff**
    ```ts
    import {Chrono, chronicle} from "@e280/strata"
    ```
- **create a chronicle in your state**
    ```ts
    const prism = new Prism({

        // chronicle stores history
        //        👇
      snacks: chronicle({
        peanuts: 8,
        bag: ["popcorn", "butter"],
        person: {
          name: "chase",
          incredi: true,
        },
      }),
    })
    ```
    - *big-brain moment:* the whole chronicle *itself* is stored in the state.. serializable.. think persistence — user can close their project, reopen, and their undo/redo history is still chillin' — *brat girl summer*
- **create a chrono-wrapped lens to interact with your chronicle**
    ```ts
    const snacks = new Chrono(64, prism.lens(state => state.snacks))
      //                      👆
      // how many past snapshots to store
    ```
- **mutations will advance history,** and undo/redo works
    ```ts
    snacks.mutate(s => s.peanuts = 101)

    snacks.undo()
      // back to 8 peanuts

    snacks.redo()
      // forward to 101 peanuts
    ```
- **check how many undoable or redoable steps are available**
    ```ts
    snacks.undoable // 1
    snacks.redoable // 0
    ```
- **you can make sub-lenses of a chrono,** all their mutations advance history too
- **plz pinky-swear right now,** that you won't create a chrono under a lens under another chrono 💀

### 🔮 persistence to localStorage
- **import prism**
    ```ts
    import {Vault, LocalStore} from "@e280/strata"
    ```
- **create a local storage store**
    ```ts
    const store = new LocalStore("myAppState")
    ```
- **make a vault for your prism**
    ```ts
    const vault = new Vault({
      prism,
      store,
      version: 1, // 👈 bump this when you break your state schema!
    })
    ```
    - `store` type is compatible with [`@e280/kv`](https://github.com/e280/kv)
- **cross-tab sync (load on storage events)**
    ```ts
    store.onStorageEvent(vault.load)
    ```
- **initial load**
    ```ts
    await vault.load()
    ```



<br/><br/>

<a id="tracker"></a>

## 🍋 strata tracker
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
    import {microbounce} from "@e280/stz"
    const myDebouncedRerenderFn = microbounce(myRerenderFn)
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



<br/><br/>

## 🧑‍💻 strata is by e280
free and open source by https://e280.org/  
join us if you're cool and good at dev  

