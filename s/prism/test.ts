
import {suite, test, expect} from "@e280/science"

import {Prism} from "./prism.js"
import {effect} from "../signals/effect.js"
import {Chrono} from "./chrono/chrono.js"
import {chronicle} from "./chrono/chronicle.js"
import { batch } from "../signals/batch.js"

export default suite({
	"prism": suite({
		"get/set state": test(async() => {
			const prism = new Prism({count: 1})
			expect(prism.get().count).is(1)
			prism.set({count: 2})
			expect(prism.get().count).is(2)
		}),

		"get/set state can trigger effects": test(async() => {
			const prism = new Prism({count: 1})
			let triggered = 0
			effect(() => {
				void prism.get().count
				triggered++
			})
			expect(triggered).is(1)
			prism.set({count: 2})
			expect(triggered).is(2)
		}),
	}),

	"lens": suite({
		"get state": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			expect(lens.frozen.count).is(1)
		}),

		"state is immutable": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			expect(() => (lens.frozen as any).count++).throws()
		}),

		"proper mutation": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			lens.mutate(s => s.count++)
			expect(lens.frozen.count).is(2)
			lens.mutate(s => s.count++)
			expect(lens.frozen.count).is(3)
		}),

		"state after mutation is frozen": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s)
			lens.mutate(s => s.data = {count: 2})
			expect(lens.frozen.data.count).is(2)
			expect(() => (lens.frozen.data as any).count++).throws()
		}),

		"effect reacts": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			let happenings = 0
			effect(() => {
				void lens.frozen.count
				happenings++
			})
			lens.mutate(s => s.count++)
			expect(happenings).is(2)
		}),

		"effects can be batched": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			let happenings = 0
			effect(() => {
				void lens.frozen.count
				happenings++
			})
			batch(() => {
				lens.mutate(s => s.count++)
				lens.mutate(s => s.count++)
			})
			expect(happenings).is(2)
		}),

		"array pushes are reactive": test(async() => {
			const prism = new Prism({data: {array: ["lol"]}})
			const lens = prism.lens(s => s.data)
			let happenings = 0
			effect(() => {
				void lens.state
				happenings++
			})
			lens.mutate(s => s.array.push("lmao"))
			expect(happenings).is(2)
			expect(lens.frozen.array.length).is(2)
		}),

		"sync coherence": test(async() => {
			const prism = new Prism({data: {count: 1}})
			const lens = prism.lens(s => s.data)
			lens.mutate(s => s.count++)
			expect(lens.frozen.count).is(2)
			lens.mutate(s => s.count++)
			expect(lens.frozen.count).is(3)
		}),

		"nullable selector": test(async() => {
			type S = {a?: {b: {count: number}}}
			const prism = new Prism<S>({a: {b: {count: 1}}})
			const lens = prism.lens(s => s.a?.b)
			expect(lens.frozen?.count).is(1)
			prism.set({a: undefined})
			expect(lens.frozen?.count).is(undefined)
		}),

		"deep composition": test(async() => {
			const prism = new Prism({a: {b: {count: 1}}})
			const lensA = prism.lens(s => s.a)
			const lensB = lensA.lens(s => s.b)
			expect(prism.get().a.b.count).is(1)
			expect(lensA.frozen.b.count).is(1)
			expect(lensB.frozen.count).is(1)
		}),

		"deep mutations": test(async() => {
			const prism = new Prism({a: {b: {count: 1}}})
			const lensA = prism.lens(s => s.a)
			const lensB = lensA.lens(s => s.b)
			lensB.mutate(s => s.count++)
			expect(prism.get().a.b.count).is(2)
			expect(lensA.frozen.b.count).is(2)
			expect(lensB.frozen.count).is(2)
			lensA.mutate(s => s.b = {count: 3})
			expect(prism.get().a.b.count).is(3)
			expect(lensA.frozen.b.count).is(3)
			expect(lensB.frozen.count).is(3)
		}),

		"outside mutations ignored": test(async() => {
			const prism = new Prism({a: {count: 1}, b: {count: 101}})
			const lensA = prism.lens(s => s.a)
			const lensB = prism.lens(s => s.b)
			let happeningsA = 0
			let happeningsB = 0
			effect(() => {
				void lensA.state
				happeningsA++
			})
			effect(() => {
				void lensB.state
				happeningsB++
			})
			lensA.mutate(s => s.count++)
			expect(happeningsA).is(2)
			expect(happeningsB).is(1)
		}),

		"outside mutations ignored for effects": test(async() => {
			const prism = new Prism({a: {count: 1}, b: {count: 101}})
			const lensA = prism.lens(s => s.a)
			const lensB = prism.lens(s => s.b)
			let happeningsA = 0
			let happeningsB = 0
			effect(() => {
				void lensA.frozen.count
				happeningsA++
			})
			effect(() => {
				void lensB.frozen.count
				happeningsB++
			})
			lensA.mutate(s => s.count++)
			expect(happeningsA).is(2)
			expect(happeningsB).is(1)
		}),
	}),

	"chrono": suite({
		"get present state": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			expect(chrono.frozen.count).is(1)
		}),

		"mutation": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			chrono.mutate(s => s.count++)
			expect(chrono.frozen.count).is(2)
			chrono.mutate(s => s.count++)
			expect(chrono.frozen.count).is(3)
		}),

		"undoable/redoable": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			expect(chrono.undoable).is(0)
			expect(chrono.redoable).is(0)
			chrono.mutate(s => s.count++)
			expect(chrono.undoable).is(1)
			chrono.mutate(s => s.count++)
			expect(chrono.undoable).is(2)
			chrono.undo()
			expect(chrono.undoable).is(1)
			expect(chrono.redoable).is(1)
			chrono.undo()
			expect(chrono.undoable).is(0)
			expect(chrono.redoable).is(2)
			chrono.redo()
			expect(chrono.undoable).is(1)
			expect(chrono.redoable).is(1)
		}),

		"undo": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)

			chrono.mutate(s => s.count++)
			expect(chrono.frozen.count).is(2)

			chrono.undo()
			expect(chrono.frozen.count).is(1)
		}),

		"sync undo": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)

			chrono.mutate(s => s.count++)
			expect(chrono.frozen.count).is(2)

			chrono.undo()
			expect(chrono.frozen.count).is(1)
		}),

		"redo": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)

			chrono.mutate(s => s.count++)
			expect(chrono.frozen.count).is(2)

			chrono.undo()
			expect(chrono.frozen.count).is(1)

			chrono.redo()
			expect(chrono.frozen.count).is(2)
		}),

		"undo/redo is orderly": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)

			chrono.mutate(s => s.count++)
			chrono.mutate(s => s.count++)
			chrono.mutate(s => s.count++)
			expect(chrono.frozen.count).is(4)

			chrono.undo()
			expect(chrono.frozen.count).is(3)

			chrono.undo()
			expect(chrono.frozen.count).is(2)

			chrono.redo()
			expect(chrono.frozen.count).is(3)

			chrono.redo()
			expect(chrono.frozen.count).is(4)

			chrono.undo()
			expect(chrono.frozen.count).is(3)

			chrono.undo()
			expect(chrono.frozen.count).is(2)

			chrono.undo()
			expect(chrono.frozen.count).is(1)
		}),

		"undo nothing does nothing": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			chrono.undo()
			expect(chrono.frozen.count).is(1)
		}),

		"redo nothing does nothing": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			chrono.redo()
			expect(chrono.frozen.count).is(1)
		}),

		"undo 2x": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			chrono.mutate(s => s.count++)
			chrono.mutate(s => s.count++)
			chrono.mutate(s => s.count++)
			expect(chrono.frozen.count).is(4)
			chrono.undo(2)
			expect(chrono.frozen.count).is(2)
		}),

		"redo 2x": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			chrono.mutate(s => s.count++)
			chrono.mutate(s => s.count++)
			chrono.mutate(s => s.count++)
			expect(chrono.frozen.count).is(4)
			chrono.undo(2)
			expect(chrono.frozen.count).is(2)
			chrono.redo(2)
			expect(chrono.frozen.count).is(4)
		}),

		"sublens mutations are undoable": test(async() => {
			const prism = new Prism({data: chronicle({a: {count: 1}})})
			const chrono = new Chrono(64, prism.lens(s => s.data))
			const sublens = chrono.lens(s => s.a)
			expect(sublens.frozen.count).is(1)
			sublens.mutate(s => s.count++)
			expect(sublens.frozen.count).is(2)
			chrono.undo()
			expect(sublens.frozen.count).is(1)
		}),
	}),
})

