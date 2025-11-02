
import {suite, test, expect} from "@e280/science"

import {Prism} from "./prism.js"
import {effect} from "../signals/core/effect.js"

export default suite.only({
	"prism": suite({
		"get and set state": test(async() => {
			const prism = new Prism({count: 1})
			expect(prism.get().count).is(1)
			await prism.set({count: 2})
			expect(prism.get().count).is(2)
		}),
	}),

	"lens": suite({
		"get state": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			expect(lens.state.count).is(1)
		}),

		"state is immutable": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			expect(() => (lens.state as any).count++).throws()
		}),

		"proper mutation": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			await lens.mutate(s => s.count++)
			expect(lens.state.count).is(2)
			await lens.mutate(s => s.count++)
			expect(lens.state.count).is(3)
		}),

		"state after mutation is frozen": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s)
			await lens.mutate(s => s.data = {count: 2})
			expect(lens.state.data.count).is(2)
			expect(() => (lens.state.data as any).count++).throws()
		}),

		"effect reacts": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			let happenings = 0
			const stop = effect(() => {
				void lens.state.count
				happenings++
			})
			await lens.mutate(s => s.count++)
			expect(happenings).is(2)
			stop()
		}),

		"lens.on is debounced": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			let happenings = 0
			const stop = lens.on(() => void happenings++)
			await Promise.all([
				lens.mutate(s => s.count++),
				lens.mutate(s => s.count++),
			])
			expect(happenings).is(1)
			stop()
		}),

		"array pushes are reactive": test(async() => {
			const prism = new Prism({data: {array: ["lol"]}})
			const lens = prism.lens(s => s.data)
			let happenings = 0
			const stop = lens.on(() => void happenings++)
			await lens.mutate(s => s.array.push("lmao"))
			expect(happenings).is(1)
			expect(lens.state.array.length).is(2)
			stop()
		}),

		"sync coherence": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			const p1 = lens.mutate(s => s.count++)
			expect(lens.state.count).is(2)
			const p2 = lens.mutate(s => s.count++)
			expect(lens.state.count).is(3)
			await p1
			await p2
		}),

		"nullable selector": test(async() => {
			type S = {a?: {b: {count: number}}}
			const prism = new Prism<S>({a: {b: {count: 1}}})
			const lens = prism.lens(s => s.a?.b)
			expect(lens.state?.count).is(1)
			await prism.set({a: undefined})
			expect(lens.state?.count).is(undefined)
		}),

		"deep composition": test(async() => {
			const prism = new Prism({a: {b: {count: 1}}})
			const lensA = prism.lens(s => s.a)
			const lensB = lensA.lens(s => s.b)
			expect(prism.get().a.b.count).is(1)
			expect(lensA.state.b.count).is(1)
			expect(lensB.state.count).is(1)
		}),

		"deep mutations": test(async() => {
			const prism = new Prism({a: {b: {count: 1}}})
			const lensA = prism.lens(s => s.a)
			const lensB = lensA.lens(s => s.b)
			await lensB.mutate(s => s.count++)
			expect(prism.get().a.b.count).is(2)
			expect(lensA.state.b.count).is(2)
			expect(lensB.state.count).is(2)
		}),
	}),

	// "branch": Science.suite({
	// 	"composition": Science.test(async () => {
	// 		const trunk = new Tree({a: {b: {c: 0}}})
	// 		const a = trunk.branch(s => s.a)
	// 		const b = a.branch(s => s.b)
	// 		expect(trunk.state.a.b.c).is(0)
	// 		expect(b.state.c).is(0)
	// 	}),
	//
	// 	"deep mutations": Science.test(async () => {
	// 		const trunk = new Tree({a: {b: {c: 0}}})
	// 		const a = trunk.branch(s => s.a)
	// 		const b = a.branch(s => s.b)
	// 		await b.mutate(b => { b.c = 101 })
	// 		expect(trunk.state.a.b.c).is(101)
	// 		expect(a.state.b.c).is(101)
	// 		expect(b.state.c).is(101)
	// 		await a.mutate(a => { a.b = {c: 102} })
	// 		expect(trunk.state.a.b.c).is(102)
	// 		expect(a.state.b.c).is(102)
	// 		expect(b.state.c).is(102)
	// 		await trunk.mutate(s => { s.a = {b: {c: 103}} })
	// 		expect(trunk.state.a.b.c).is(103)
	// 		expect(a.state.b.c).is(103)
	// 		expect(b.state.c).is(103)
	// 	}),
	//
	// 	"branch.on ignores outside mutations": Science.test(async() => {
	// 		const trunk = new Tree({a: {x: 0}, b: {x: 0}})
	// 		const a = trunk.branch(s => s.a)
	// 		const b = trunk.branch(s => s.b)
	// 		let counted = 0
	// 		b.on(() => {counted++})
	// 		expect(counted).is(0)
	// 		await a.mutate(a => a.x = 1)
	// 		expect(counted).is(0)
	// 	}),
	//
	// 	"effects ignore outside mutations": Science.test(async() => {
	// 		const trunk = new Tree({a: {x: 0}, b: {x: 0}})
	// 		const a = trunk.branch(s => s.a)
	// 		const b = trunk.branch(s => s.b)
	// 		let counted = 0
	// 		effect(() => {
	// 			void b.state.x
	// 			counted++
	// 		})
	// 		expect(counted).is(1)
	// 		await a.mutate(a => a.x++)
	// 		expect(counted).is(1)
	// 	}),
	//
	// 	"forbid submutation in mutation": Science.test(async() => {
	// 		const trunk = new Tree({a: {b: 0}})
	// 		const a = trunk.branch(s => s.a)
	// 		await expect(async() => {
	// 			let promise!: Promise<any>
	// 			await trunk.mutate(() => {
	// 				promise = a.mutate(() => {})
	// 			})
	// 			await promise
	// 		}).throwsAsync()
	// 	}),
	//
	// 	"forbid mutation in submutation": Science.test(async() => {
	// 		const trunk = new Tree({a: {b: 0}})
	// 		const a = trunk.branch(s => s.a)
	// 		await expect(async() => {
	// 			let promise!: Promise<any>
	// 			await a.mutate(() => {
	// 				promise = trunk.mutate(() => {})
	// 			})
	// 			await promise
	// 		}).throwsAsync()
	// 	}),
	// }),
	//
	// // "chronobranch": (() => {
	// // 	const setup = () => {
	// // 		const trunk = new Tree({
	// // 			chron: Tree.chronicle({count: 0}),
	// // 		})
	// // 		const chron = trunk.chronobranch(64, s => s.chron)
	// // 		return {trunk, chron}
	// // 	}
	// //
	// // 	return Science.suite({
	// // 		"get state": Science.test(async() => {
	// // 			const {chron} = setup()
	// // 			expect(chron.state.count).is(0)
	// // 		}),
	// //
	// // 		"mutate": Science.test(async() => {
	// // 			const {chron} = setup()
	// // 			expect(chron.state.count).is(0)
	// // 			await chron.mutate(s => s.count++)
	// // 			expect(chron.state.count).is(1)
	// // 			await chron.mutate(s => s.count++)
	// // 			expect(chron.state.count).is(2)
	// // 		}),
	// //
	// // 		"undoable/redoable": Science.test(async() => {
	// // 			const {chron} = setup()
	// // 			expect(chron.undoable).is(0)
	// // 			expect(chron.redoable).is(0)
	// // 			expect(chron.state.count).is(0)
	// // 			await chron.mutate(s => s.count++)
	// // 			expect(chron.undoable).is(1)
	// // 			await chron.mutate(s => s.count++)
	// // 			expect(chron.undoable).is(2)
	// // 			await chron.undo()
	// // 			expect(chron.undoable).is(1)
	// // 			expect(chron.redoable).is(1)
	// // 			await chron.undo()
	// // 			expect(chron.undoable).is(0)
	// // 			expect(chron.redoable).is(2)
	// // 			await chron.redo()
	// // 			expect(chron.undoable).is(1)
	// // 			expect(chron.redoable).is(1)
	// // 		}),
	// //
	// // 		"undo": Science.test(async() => {
	// // 			const {chron} = setup()
	// // 			await chron.mutate(s => s.count++)
	// // 			await chron.undo()
	// // 			expect(chron.state.count).is(0)
	// // 		}),
	// //
	// // 		"redo": Science.test(async() => {
	// // 			const {chron} = setup()
	// // 			await chron.mutate(s => s.count++)
	// // 			await chron.undo()
	// // 			expect(chron.state.count).is(0)
	// // 			await chron.redo()
	// // 			expect(chron.state.count).is(1)
	// // 		}),
	// //
	// // 		"undo/redo well ordered": Science.test(async() => {
	// // 			const {chron} = setup()
	// // 			await chron.mutate(s => s.count++)
	// // 			await chron.mutate(s => s.count++)
	// // 			await chron.mutate(s => s.count++)
	// // 			expect(chron.state.count).is(3)
	// //
	// // 			await chron.undo()
	// // 			expect(chron.state.count).is(2)
	// //
	// // 			await chron.undo()
	// // 			expect(chron.state.count).is(1)
	// //
	// // 			await chron.redo()
	// // 			expect(chron.state.count).is(2)
	// //
	// // 			await chron.redo()
	// // 			expect(chron.state.count).is(3)
	// //
	// // 			await chron.undo()
	// // 			expect(chron.state.count).is(2)
	// //
	// // 			await chron.undo()
	// // 			expect(chron.state.count).is(1)
	// //
	// // 			await chron.undo()
	// // 			expect(chron.state.count).is(0)
	// // 		}),
	// //
	// // 		"undo nothing does nothing": Science.test(async() => {
	// // 			const {chron} = setup()
	// // 			await chron.undo()
	// // 			expect(chron.state.count).is(0)
	// // 		}),
	// //
	// // 		"redo nothing does nothing": Science.test(async() => {
	// // 			const {chron} = setup()
	// // 			await chron.redo()
	// // 			expect(chron.state.count).is(0)
	// // 		}),
	// //
	// // 		"undo 2x": Science.test(async() => {
	// // 			const {chron} = setup()
	// // 			await chron.mutate(s => s.count++)
	// // 			await chron.mutate(s => s.count++)
	// // 			expect(chron.state.count).is(2)
	// // 			await chron.undo(2)
	// // 			expect(chron.state.count).is(0)
	// // 		}),
	// //
	// // 		"redo 2x": Science.test(async() => {
	// // 			const {chron} = setup()
	// // 			await chron.mutate(s => s.count++)
	// // 			await chron.mutate(s => s.count++)
	// // 			expect(chron.state.count).is(2)
	// // 			await chron.undo(2)
	// // 			expect(chron.state.count).is(0)
	// // 			await chron.redo(2)
	// // 			expect(chron.state.count).is(2)
	// // 		}),
	// //
	// // 		"substrata mutations are tracked": Science.test(async() => {
	// // 			const strata = new Trunk({
	// // 				chron: Trunk.chronicle({
	// // 					group: {count: 0},
	// // 				}),
	// // 			})
	// // 			const chron = strata.chronobranch(64, s => s.chron)
	// // 			const group = chron.branch(s => s.group)
	// // 			expect(group.state.count).is(0)
	// // 			await group.mutate(g => g.count = 101)
	// // 			expect(group.state.count).is(101)
	// // 			await chron.undo()
	// // 			expect(group.state.count).is(0)
	// // 		}),
	// // 	})
	// // })(),
})


