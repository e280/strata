
import {nap} from "@e280/stz"
import {Science, expect} from "@e280/science"

import {Trunk} from "./parts/trunk.js"
import {effect} from "../signals/parts/effect.js"

export default Science.suite({
	"trunk": Science.suite({
		"get state": Science.test(async() => {
			const trunk = new Trunk({count: 0})
			expect(trunk.state().count).is(0)
		}),

		"state is immutable": Science.test(async() => {
			const trunk = new Trunk({count: 0})
			expect(() => (trunk.state() as any).count++).throws()
		}),

		"run a proper mutation": Science.test(async() => {
			const trunk = new Trunk({count: 0})
			expect(trunk.state().count).is(0)
			await trunk.mutate(state => state.count++)
			expect(trunk.state().count).is(1)
			await trunk.mutate(state => state.count++)
			expect(trunk.state().count).is(2)
		}),

		"forbidden mutation nesting": Science.test(async() => {
			const trunk = new Trunk({count: 0})
			await expect(async() => {
				let promise!: Promise<any>
				await trunk.mutate(() => {
					promise = trunk.mutate(() => {})
				})
				await promise
			}).throwsAsync()
		}),

		"state after mutation is frozen": Science.test(async () => {
			const trunk = new Trunk({x: 1})
			await trunk.mutate(s => { s.x = 2 })
			expect(() => (trunk.state() as any).x = 3).throws()
		}),

		// TODO
		"effect reacts": Science.test.skip(async() => {
			const trunk = new Trunk({count: 0})
			await nap(10)
			let mutationCount = 0
			effect(() => {
				void trunk.state().count
				mutationCount++
			})
			expect(mutationCount).is(1)
			await trunk.mutate(state => state.count++)
			expect(mutationCount).is(2)
		}),

	// 	"watch is debounced": Science.test(async() => {
	// 		const strata = new Trunk({count: 0})
	// 		let mutationCount = 0
	// 		strata.watch.sub(() => {mutationCount++})
	// 		const promise = strata.mutate(state => state.count++)
	// 		expect(mutationCount).is(0)
	// 		await promise
	// 		expect(mutationCount).is(1)
	// 	}),
	//
	// 	"watch is fired when array item is pushed": Science.test(async() => {
	// 		const strata = new Trunk({items: ["hello", "world"]})
	// 		let mutationCount = 0
	// 		strata.watch.sub(() => {mutationCount++})
	// 		await strata.mutate(state => state.items.push("lol"))
	// 		expect(mutationCount).is(1)
	// 		expect(strata.state.items.length).is(3)
	// 	}),
	//
	// 	"prevent mutation loops": Science.test(async() => {
	// 		const strata = new Trunk({count: 0})
	// 		let mutationCount = 0
	// 		strata.watch.sub(async() => {
	// 			mutationCount++
	// 			if (mutationCount > 100)
	// 				return
	// 			await strata.mutate(s => s.count++)
	// 		})
	// 		await expect(async() => {
	// 			await strata.mutate(state => state.count++)
	// 		}).throwsAsync()
	// 		expect(mutationCount).is(1)
	// 	}),
	// }),
	//
	// "substrata": Science.suite({
	// 	"get state": Science.test(async() => {
	// 		const strata = new Trunk({count: 0, sub: {rofls: 0}})
	// 		const substrata = strata.branch(s => s.sub)
	// 		expect(substrata.state.rofls).is(0)
	// 	}),
	//
	// 	"nullable selector": Science.test(async () => {
	// 		const strata = new Trunk({
	// 			a: {b: 0}  as (null | {b: number}),
	// 		})
	// 		const a = strata.branch(s => s.a)
	// 		expect(strata.state.a?.b).is(0)
	// 		expect(a.state?.b).is(0)
	// 		await a.mutate(a => { a!.b = 1 })
	// 		expect(strata.state.a?.b).is(1)
	// 		expect(a.state?.b).is(1)
	// 		await strata.mutate(s => s.a = null)
	// 		expect(strata.state.a?.b).is(undefined)
	// 		expect(a.state?.b).is(undefined)
	// 	}),
	//
	// 	"composition": Science.test(async () => {
	// 		const strata = new Trunk({a: {b: {c: 0}}})
	// 		const a = strata.branch(s => s.a)
	// 		const b = a.branch(s => s.b)
	// 		expect(strata.state.a.b.c).is(0)
	// 		expect(b.state.c).is(0)
	// 	}),
	//
	// 	"deep mutations": Science.test(async () => {
	// 		const strata = new Trunk({a: {b: {c: 0}}})
	// 		const a = strata.branch(s => s.a)
	// 		const b = a.branch(s => s.b)
	// 		await b.mutate(b => { b.c = 101 })
	// 		expect(strata.state.a.b.c).is(101)
	// 		expect(a.state.b.c).is(101)
	// 		expect(b.state.c).is(101)
	// 		await a.mutate(a => { a.b = {c: 102} })
	// 		expect(strata.state.a.b.c).is(102)
	// 		expect(a.state.b.c).is(102)
	// 		expect(b.state.c).is(102)
	// 		await strata.mutate(s => { s.a = {b: {c: 103}} })
	// 		expect(strata.state.a.b.c).is(103)
	// 		expect(a.state.b.c).is(103)
	// 		expect(b.state.c).is(103)
	// 	}),
	//
	// 	"watch ignores outside mutations": Science.test(async() => {
	// 		const strata = new Trunk({a: {x: 0}, b: {x: 0}})
	// 		const a = strata.branch(s => s.a)
	// 		const b = strata.branch(s => s.b)
	// 		let counted = 0
	// 		b.watch.sub(() => {counted++})
	// 		await a.mutate(a => a.x = 1)
	// 		expect(counted).is(0)
	// 	}),
	//
	// 	"forbid submutation in mutation": Science.test(async() => {
	// 		const strata = new Trunk({a: {b: 0}})
	// 		const a = strata.branch(s => s.a)
	// 		await expect(async() => {
	// 			let promise!: Promise<any>
	// 			await strata.mutate(() => {
	// 				promise = a.mutate(() => {})
	// 			})
	// 			await promise
	// 		}).throwsAsync()
	// 	}),
	//
	// 	"forbid mutation in submutation": Science.test(async() => {
	// 		const strata = new Trunk({a: {b: 0}})
	// 		const a = strata.branch(s => s.a)
	// 		await expect(async() => {
	// 			let promise!: Promise<any>
	// 			await a.mutate(() => {
	// 				promise = strata.mutate(() => {})
	// 			})
	// 			await promise
	// 		}).throwsAsync()
	// 	}),
	}),

	// "chronstrata": (() => {
	// 	const setup = () => {
	// 		const strata = new Trunk({
	// 			chron: Trunk.chronicle({count: 0}),
	// 		})
	// 		const chron = strata.chronobranch(64, s => s.chron)
	// 		return {strata, chron}
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

