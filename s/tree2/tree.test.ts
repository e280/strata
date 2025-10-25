
import {nap} from "@e280/stz"
import {Science, expect} from "@e280/science"

import {Tree} from "./tree.js"
import {effect} from "../signals/core/effect.js"

export default Science.suite({
	"tree": Science.suite({
		"get state": Science.test(async() => {
			const trunk = new Tree({count: 0})
			expect(trunk.state.count).is(0)
		}),

		"state is immutable": Science.test(async() => {
			const trunk = new Tree({count: 0})
			expect(() => (trunk.state as any).count++).throws()
		}),

		"run a proper mutation": Science.test(async() => {
			const trunk = new Tree({count: 0})
			expect(trunk.state.count).is(0)
			await trunk.mutate(state => state.count++)
			expect(trunk.state.count).is(1)
			await trunk.mutate(state => state.count++)
			expect(trunk.state.count).is(2)
		}),

		"forbidden mutation nesting": Science.test(async() => {
			const trunk = new Tree({count: 0})
			await expect(async() => {
				let promise!: Promise<any>
				await trunk.mutate(() => {
					promise = trunk.mutate(() => {})
				})
				await promise
			}).throwsAsync()
		}),

		"state after mutation is frozen": Science.test(async () => {
			const trunk = new Tree({x: 1})
			await trunk.mutate(s => { s.x = 2 })
			expect(() => (trunk.state as any).x = 3).throws()
		}),

		"effect reacts to trunk mutation": Science.test(async() => {
			const trunk = new Tree({count: 0})
			await nap(10)
			let mutationCount = 0
			effect(() => {
				void trunk.state.count
				mutationCount++
			})
			expect(mutationCount).is(1)
			await trunk.mutate(state => state.count++)
			expect(mutationCount).is(2)
		}),

		"trunk.on is debounced": Science.test(async() => {
			const trunk = new Tree({count: 0})
			let mutationCount = 0
			trunk.on.sub(() => {mutationCount++})
			await Promise.all([
				trunk.mutate(state => state.count++),
				trunk.mutate(state => state.count++),
				trunk.mutate(state => state.count++),
			])
			expect(mutationCount).is(1)
		}),

		"listeners are fired when array item is pushed": Science.test(async() => {
			const trunk = new Tree({items: ["hello", "world"]})
			let mutationCount = 0
			trunk.on.sub(() => {mutationCount++})
			await trunk.mutate(state => state.items.push("lol"))
			expect(mutationCount).is(1)
			expect(trunk.state.items.length).is(3)
		}),

		"sync coherence": Science.test(async() => {
			const trunk = new Tree({count: 0})
			const p1 = trunk.mutate(s => s.count++)
			expect(trunk.state.count).is(1)
			const p2 = trunk.mutate(s => s.count++)
			expect(trunk.state.count).is(2)
			await p1
			await p2
		}),
	}),

	"branch": Science.suite({
		"get state": Science.test(async() => {
			const trunk = new Tree({count: 0, sub: {rofls: 0}})
			const branch = trunk.branch(s => s.sub)
			expect(branch.state.rofls).is(0)
		}),

		"mutation triggers effect": Science.test(async() => {
			const trunk = new Tree({a: {x: 0}})
			const branch = trunk.branch(s => s.a)
			expect(branch.state.x).is(0)
			let triggered = 0
			effect(() => {
				void branch.state.x
				triggered++
			})
			expect(triggered).is(1)
			await branch.mutate(s => s.x++)
			expect(triggered).is(2)
		}),

		"sync coherence": Science.test(async() => {
			const trunk = new Tree({count: 0, sub: {rofls: 0}})
			const branch = trunk.branch(s => s.sub)
			expect(branch.state.rofls).is(0)
			const p = branch.mutate(s => s.rofls++)
			expect(branch.state.rofls).is(1)
			await p
		}),

		"nullable selector": Science.test(async () => {
			const trunk = new Tree({
				a: {b: 0} as (null | {b: number}),
			})
			const a = trunk.branch(s => s.a)
			expect(trunk.state.a?.b).is(0)
			expect(a.state?.b).is(0)
			await a.mutate(a => { a!.b = 1 })
			expect(trunk.state.a?.b).is(1)
			expect(a.state?.b).is(1)
			await trunk.mutate(s => s.a = null)
			expect(trunk.state.a?.b).is(undefined)
			expect(a.state?.b).is(undefined)
		}),

		"composition": Science.test(async () => {
			const trunk = new Tree({a: {b: {c: 0}}})
			const a = trunk.branch(s => s.a)
			const b = a.branch(s => s.b)
			expect(trunk.state.a.b.c).is(0)
			expect(b.state.c).is(0)
		}),

		"deep mutations": Science.test(async () => {
			const trunk = new Tree({a: {b: {c: 0}}})
			const a = trunk.branch(s => s.a)
			const b = a.branch(s => s.b)
			await b.mutate(b => { b.c = 101 })
			expect(trunk.state.a.b.c).is(101)
			expect(a.state.b.c).is(101)
			expect(b.state.c).is(101)
			await a.mutate(a => { a.b = {c: 102} })
			expect(trunk.state.a.b.c).is(102)
			expect(a.state.b.c).is(102)
			expect(b.state.c).is(102)
			await trunk.mutate(s => { s.a = {b: {c: 103}} })
			expect(trunk.state.a.b.c).is(103)
			expect(a.state.b.c).is(103)
			expect(b.state.c).is(103)
		}),

		"branch.on ignores outside mutations": Science.test(async() => {
			const trunk = new Tree({a: {x: 0}, b: {x: 0}})
			const a = trunk.branch(s => s.a)
			const b = trunk.branch(s => s.b)
			let counted = 0
			b.on(() => {counted++})
			expect(counted).is(0)
			await a.mutate(a => a.x = 1)
			expect(counted).is(0)
		}),

		"effects ignore outside mutations": Science.test(async() => {
			const trunk = new Tree({a: {x: 0}, b: {x: 0}})
			const a = trunk.branch(s => s.a)
			const b = trunk.branch(s => s.b)
			let counted = 0
			effect(() => {
				void b.state.x
				counted++
			})
			expect(counted).is(1)
			await a.mutate(a => a.x++)
			expect(counted).is(1)
		}),

		"forbid submutation in mutation": Science.test(async() => {
			const trunk = new Tree({a: {b: 0}})
			const a = trunk.branch(s => s.a)
			await expect(async() => {
				let promise!: Promise<any>
				await trunk.mutate(() => {
					promise = a.mutate(() => {})
				})
				await promise
			}).throwsAsync()
		}),

		"forbid mutation in submutation": Science.test(async() => {
			const trunk = new Tree({a: {b: 0}})
			const a = trunk.branch(s => s.a)
			await expect(async() => {
				let promise!: Promise<any>
				await a.mutate(() => {
					promise = trunk.mutate(() => {})
				})
				await promise
			}).throwsAsync()
		}),
	}),

	// "chronobranch": (() => {
	// 	const setup = () => {
	// 		const trunk = new Tree({
	// 			chron: Tree.chronicle({count: 0}),
	// 		})
	// 		const chron = trunk.chronobranch(64, s => s.chron)
	// 		return {trunk, chron}
	// 	}
	//
	// 	return Science.suite({
	// 		"get state": Science.test(async() => {
	// 			const {chron} = setup()
	// 			expect(chron.state.count).is(0)
	// 		}),
	//
	// 		"mutate": Science.test(async() => {
	// 			const {chron} = setup()
	// 			expect(chron.state.count).is(0)
	// 			await chron.mutate(s => s.count++)
	// 			expect(chron.state.count).is(1)
	// 			await chron.mutate(s => s.count++)
	// 			expect(chron.state.count).is(2)
	// 		}),
	//
	// 		"undoable/redoable": Science.test(async() => {
	// 			const {chron} = setup()
	// 			expect(chron.undoable).is(0)
	// 			expect(chron.redoable).is(0)
	// 			expect(chron.state.count).is(0)
	// 			await chron.mutate(s => s.count++)
	// 			expect(chron.undoable).is(1)
	// 			await chron.mutate(s => s.count++)
	// 			expect(chron.undoable).is(2)
	// 			await chron.undo()
	// 			expect(chron.undoable).is(1)
	// 			expect(chron.redoable).is(1)
	// 			await chron.undo()
	// 			expect(chron.undoable).is(0)
	// 			expect(chron.redoable).is(2)
	// 			await chron.redo()
	// 			expect(chron.undoable).is(1)
	// 			expect(chron.redoable).is(1)
	// 		}),
	//
	// 		"undo": Science.test(async() => {
	// 			const {chron} = setup()
	// 			await chron.mutate(s => s.count++)
	// 			await chron.undo()
	// 			expect(chron.state.count).is(0)
	// 		}),
	//
	// 		"redo": Science.test(async() => {
	// 			const {chron} = setup()
	// 			await chron.mutate(s => s.count++)
	// 			await chron.undo()
	// 			expect(chron.state.count).is(0)
	// 			await chron.redo()
	// 			expect(chron.state.count).is(1)
	// 		}),
	//
	// 		"undo/redo well ordered": Science.test(async() => {
	// 			const {chron} = setup()
	// 			await chron.mutate(s => s.count++)
	// 			await chron.mutate(s => s.count++)
	// 			await chron.mutate(s => s.count++)
	// 			expect(chron.state.count).is(3)
	//
	// 			await chron.undo()
	// 			expect(chron.state.count).is(2)
	//
	// 			await chron.undo()
	// 			expect(chron.state.count).is(1)
	//
	// 			await chron.redo()
	// 			expect(chron.state.count).is(2)
	//
	// 			await chron.redo()
	// 			expect(chron.state.count).is(3)
	//
	// 			await chron.undo()
	// 			expect(chron.state.count).is(2)
	//
	// 			await chron.undo()
	// 			expect(chron.state.count).is(1)
	//
	// 			await chron.undo()
	// 			expect(chron.state.count).is(0)
	// 		}),
	//
	// 		"undo nothing does nothing": Science.test(async() => {
	// 			const {chron} = setup()
	// 			await chron.undo()
	// 			expect(chron.state.count).is(0)
	// 		}),
	//
	// 		"redo nothing does nothing": Science.test(async() => {
	// 			const {chron} = setup()
	// 			await chron.redo()
	// 			expect(chron.state.count).is(0)
	// 		}),
	//
	// 		"undo 2x": Science.test(async() => {
	// 			const {chron} = setup()
	// 			await chron.mutate(s => s.count++)
	// 			await chron.mutate(s => s.count++)
	// 			expect(chron.state.count).is(2)
	// 			await chron.undo(2)
	// 			expect(chron.state.count).is(0)
	// 		}),
	//
	// 		"redo 2x": Science.test(async() => {
	// 			const {chron} = setup()
	// 			await chron.mutate(s => s.count++)
	// 			await chron.mutate(s => s.count++)
	// 			expect(chron.state.count).is(2)
	// 			await chron.undo(2)
	// 			expect(chron.state.count).is(0)
	// 			await chron.redo(2)
	// 			expect(chron.state.count).is(2)
	// 		}),
	//
	// 		"substrata mutations are tracked": Science.test(async() => {
	// 			const strata = new Trunk({
	// 				chron: Trunk.chronicle({
	// 					group: {count: 0},
	// 				}),
	// 			})
	// 			const chron = strata.chronobranch(64, s => s.chron)
	// 			const group = chron.branch(s => s.group)
	// 			expect(group.state.count).is(0)
	// 			await group.mutate(g => g.count = 101)
	// 			expect(group.state.count).is(101)
	// 			await chron.undo()
	// 			expect(group.state.count).is(0)
	// 		}),
	// 	})
	// })(),
})

