
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
  const $count = signal(0)
  ```
  > *we kinda like the `$` convention for signals*
- **read the signal**
  ```ts
  $count() // 0
  ```
- **write the signal**
  ```ts
  $count(1)
  ```

### 🚦 derived
- **combine signals like a formula**
  ```ts
  const $alpha = signal(1)
  const $bravo = signal(10)
  const $product = derived(() => $alpha() * $bravo())
- **it automatically updates**
  ```ts
  $product() // 10
  $alpha(2)
  $product() // 🪄 20
  ```
- **btw,**  
  deriveds are lazy and don't run the formula fn unless actually demanded. also, they have a `.dispose()` fn you can use to stop them.

### 🚦 effects
- **effects run when the relevant signals change**
  ```ts
  effect(() => console.log($count()))
    // 1
    // the system detects '$count' is relevant

  $count(2)
    // 2
    // when $count is changed, the effect fn is run
  ```
- **btw,**  
  effects return a dispose fn you can use to stop them. also, you can optionally pass a second parameter fn that receives what the first fn returns, and it's not initially called.

### 🚦 types
- **`Signal<Value>`** — it's a signal fn
- **`Derived<Value>`**  — it's a derived fn
- **`Valuable<Value>`** — could be `Signal<Value>` or `Derived<Value>`



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
- put on your big-kid pants and have your ai agent read the [source code](./tracker/tracker.ts)
- use `tracker.observe` to check what is touched by a fn
- use `tracker.subscribe` to subscribe to the seen items that `observe` returns
- you'll figure it out, lol, or reach out to me on discord



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

