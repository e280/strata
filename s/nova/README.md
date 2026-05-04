
![](https://i.imgur.com/h7FohWa.jpeg)



<br/><br/>

# ⛏️ strata

### get in loser, we're managing state
📦 `npm install @e280/strata`  
✨ it's basically about automagically rerendering ui when data changes  
🦝 powers auto-reactivity in our view library [@e280/sly](https://github.com/e280/sly)  
🧙‍♂️ probably my tenth state management library, lol  
🧑‍💻 a project by https://e280.org/  

🚦 [**#signals,**](#signals) sweet little bundles of state  
🔮 [**#prism,**](#prism) bigger centralized state trees  
⌛ [**#wait,**](#wait) async state helpers *(think loading spinners)*  
🪄 [**#tracker,**](#tracker) agnostic reactivity integration hub  
⚛️ [**#react,**](#react) optional bindings for react  



<br/><br/>

<a id="signals"></a>

## 🍋 strata signals
> *reactive bundles of joy*

```ts
import {signal, derived, effect, batch} from "@e280/strata"
```

### 🚦 signal
- **a signal holds a value**
  ```ts
  const $count = signal(1)
  ```
  > *we kinda like the `$` convention for signals*
- **read the signal**
  ```ts
  $count() // 1
  ```
- **write the signal**
  ```ts
  $count(2)
  ```

### 🚦 derived
- **combine signals like a formula**
  ```ts
  const $alpha = signal(1)
  const $bravo = signal(10)
  const $product = derived(() => $alpha() * $bravo())
  ```
- **it automatically updates**
  ```ts
  $product() // 10
  $alpha(2)
  $product() // 🪄 20
  ```
- **btw,**  
  deriveds are lazy, only run the fn when demanded.  
  also, they have a `.dispose()` fn if you need to stop them.  

### 🚦 effects
- **effects run when the relevant signals change**
  ```ts
  effect(() => console.log($count()))
    // 2
    // the system detects '$count' is relevant

  $count(3)
    // 3
    // when $count is changed, the effect fn is run
  ```
- **btw,**  
  you can also pass an optional second fn param, which receives what the first fn returns, and is not called initially.  
  also, effect returns a dispose fn if you need to stop it.  

### 🚦 batch
- **optimize multiple writes into one fat update**
  ```ts
  // call downstream effects only once
  batch(() => {
    $count(4)
    $count(5)
    $count(6)
  })
  ```

### 🚦 types
- **`Signal<Value>`** — it's a signal fn
- **`Derived<Value>`**  — it's a derived fn
- **`Valuable<Value>`** — could be `Signal<Value>` or `Derived<Value>`



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
- **`lens.state` is a cloned mutable snapshot with chill typings**
    ```ts
    snacks.state.peanuts // 8
    person.state.name // "chase"

    snacks.state.peanuts++
      // ⛔ attempted state mutation: silently ignored
    ```
- **`lens.frozen` provides a deep-frozen immutable snapshot with strict typings**
    ```ts
    snacks.frozen.peanuts // 8 (readonly)
    person.frozen.name // "chase" (readonly)

    snacks.frozen.peanuts++
      // ⛔ attempted frozen mutation: throw errors
    ```
- **only formal mutations can actually change state**
    ```ts
    snacks.mutate(state => state.peanuts++)
      // ✅ formal mutations to change state

    snacks.state.peanuts // 9
    ```
- **array mutations are unironically based, actually**
    ```ts
    snacks.mutate(state => state.bag.push("salt"))
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

<a id="wait"></a>

## 🍋 strata wait
> *tiny async state helpers*

***wait*** is small. *pending, ok, err.*  
it extends [stz's ok/err](https://github.com/e280/stz#ok).  
it's like, for your ui, showing little loading spinners and branching when stuff is loading.  

### ⌛ good things come to those who wait
- **import stuff**
    ```ts
    import {ok, err, nap} from "@e280/stz"
    import {wait, waitFormal} from "@e280/strata"
    ```
- **wrap any async operation in a fancy wait**
    ```ts
    // wrap any async operation in a fancy wait
    const $wait = wait(async() => {
      await nap(100)
      if (Math.random() > 0.5) return 123
      else throw new Error("bad luck!")
    })
    ```
    - btw you can pass a promise instead of an async fn
- **check if it's done**
    ```ts
    console.log($wait().done)
      // false -- sorry bro, its not ready yet
    ```
- **okay, we can actually await for the result**
    ```ts
    const result = await $wait.result

    if (result.ok)
      console.log(result.value)
        // 123
    else
      console.error(result.error)
        // Error: bad luck!
    ```

### ⌛ waitFormal is persnickety belt-and-suspenders mode
- **you can get super explicit about the types**
    ```ts
    const $wait = waitFormal<number, "unlucky" | "bad roll">(async() => {
      if (Math.random() > 0.5)
        return ok(123)

      if (Math.random() < 0.01)
        return err("unlucky")

      else
        return err("bad roll")
    })
    ```

### ⌛ wait, there's more
- maker
    ```ts
    makeWait<number>() // pending
    makeWait(ok(123))
    makeWait(err("uh oh"))
    ```
- status checkers
    ```ts
    isWaitPending($wait())
    isWaitDone($wait()) // ok or err
    isWaitOk($wait())
    isWaitErr($wait())
    ```
- value grabbers
    ```ts
    waitGetOk($wait()) // 123 | undefined
    waitNeedOk($wait()) // 123 (or throws an error)
    ```
    ```ts
    waitGetErr($wait()) // "bad roll" | undefined
    waitNeedErr($wait()) // "bad roll" (or throws an error)
    ```
- quick selector
    ```ts
    const text = waitSelect($wait(), {
      pending: () => "still loading...",
      ok: value => `ready: ${value}`,
      err: error => `ack! ${error}`,
    })
    ```



<br/><br/>

<a id="tracker"></a>

## 🍋 strata tracker
> *reactivity integration hub*

```ts
import {tracker} from "@e280/strata/tracker"
```

this is the inner sanctum of strata. use the tracker to jack into the reactivity system, you can make anything fully strata-compatible and you'll be reactin' and triggerin' with the best of 'em. the tracker is also what you'll need if you're trying to create bindings for your own frontend framework to trigger your ui to rerender and stuff.

### 🪄 invent your own novel state concept
- let's invent a very simple thing, so you can see how simple the tracker really is.
  ```ts
  export class BoomerSignal<Value> {
    constructor(private value: Value) {}

    get() {
      tracker.read(this) // 🪄 inform tracker our thing was accessed
      return this.value
    }
    
    set(value: Value) {
      this.value = value
      tracker.write(this) // 🪄 inform tracker our thing was changed
    }
  }
  ```
- boom, that's it! now we have a new reactive thing we can use, and it'll rerender our ui or whatever.
  ```ts
  const $count = new BoomerSignal(1)

  effect(() => console.log($count.get()))
    // 1

  $count.set(2)
    // 2
  ```

### 🪄 integrate your ui framework for auto-rerendering
- use `tracker.observe` to check what is touched by a fn
- use `tracker.subscribe` to subscribe to the seen items that `observe` returns
- see the [source code](./tracker/tracker.ts)



<br/><br/>

<a id="react"></a>

## 🍋 react bindings

```ts
```

### ⚛️ setup your `strata.ts` module
```ts
import * as react from "react"
import {reactBindings} from "@e280/strata"

export const {
  component,
  useTracked,
  useOnce,
  useSignal,
  useDerived,
} = reactBindings(react)
```

### ⚛️ `component` enables fully automatic reactive re-rendering
```ts
import {signal} from "@e280/strata"
import {component} from "./strata.js"

const $count = signal(0)

export const MyCounter = component(() => {
  const add = () => $count($count() + 1)
  return <button onClick={add}>{$count()}</button>
})
```

### ⚛️ `useTracked` for a manual hands-on approach (plays nicer with hmr)
```ts
import {signal} from "@e280/strata"
import {useTracked} from "./strata.js"

const $count = signal(0)

export const MyCounter = () => {
  const count = useTracked(() => $count())
  const add = () => $count($count() + 1)
  return <button onClick={add}>{count}</button>
}
```

### ⚛️ `useSignal` for local component state (and `useDerived`)
```ts
import {useSignal} from "./strata.js"

export const MyCounter = () => {
  const $count = useSignal(0)
  const add = () => $count($count() + 1)
  return <button onClick={add}>{$count()}</button>
}
```



<br/><br/>

## 🧑‍💻 strata is by e280
free and open source by https://e280.org/  
join us if you're cool and good at dev  

