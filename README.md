
![](https://i.imgur.com/h7FohWa.jpeg)

# ⛏️ strata

**my 10th state management library, probably**
- 📦 `npm install @e280/strata`
- single-source-of-truth state tree
- immutable except for `mutate(fn)` calls
- no spooky-dookie proxy magic — just god's honest javascript
- undo/redo history, cross-tab sync, localStorage persistence

<br/>

## get in loser, we're managing state

### `Strata` is your app's state tree root
- better stick to json-friendly serializable data
  ```ts
  import {Strata} from "@e280/strata"

  const strata = new Strata({
    count: 0,
    snacks: {
      peanuts: 8,
      bag: ["popcorn", "butter"],
    },
  })

  strata.state.count // 0
  strata.state.snacks.peanuts // 8
  ```

### formal mutations to change state
- ⛔ informal mutations are denied
  ```ts
  strata.state.count++ // error is thrown
  ```
- ✅ formal mutations are allowed
  ```ts
  await strata.mutate(s => s.count++)
  ```

### `Substrata` is a view into a subtree
- it's a lens, make lots of them, pass 'em around your app
  ```ts
  const snacks = strata.substrata(s => s.snacks)
  ```
- run substrata mutations
  ```ts
  await snacks.mutate(s => s.peanuts++)
  ```
- array mutations are unironically based, actually
  ```ts
  await snacks.mutate(s => s.bag.push("salt"))
  ```
- you can make a substrata of another substrata

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

## only high-class discerning aristocrats permitted beyond this point

### `Chronstrata` for undo/redo history
- first, put a `Chronicle` into your state tree
  ```ts
  const strata = new Strata({
    count: 0,
    snacks: Strata.chronicle({
      peanuts: 8,
      bag: ["popcorn", "butter"],
    }),
  })
  ```
  - *big-brain moment:* the whole chronicle *itself* is stored in the state.. serializable.. think persistence — user can close their project, reopen, and their undo/redo history is still chillin' — *brat girl summer*
- second, make a `Chronstrata` which is like a substrata
  ```ts
  const snacks = strata.chronstrata(64, s => s.snacks)
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
  snacks.undoable // 0

  await snacks.mutate(s => s.peanuts = 101)
  await snacks.mutate(s => s.peanuts = 102)
  await snacks.mutate(s => s.peanuts = 103)

  snacks.undoable // 3

  await snacks.undo()

  snacks.undoable // 2
  snacks.redoable // 1
  ```
- chronstrata can have its own substrata — all their mutations advance history
- plz pinky-swear right now, that you won't create a chronstrata under a substrata under a chronstrata

<br/>

## a buildercore e280 project
free and open source by https://e280.org/  
join us if you're cool and good at dev  

