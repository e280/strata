
import {suite, test, expect} from "@e280/science"

import {Prism} from "./prism.js"
import {Chrono} from "./chrono/chrono.js"
import {chronicle} from "./chrono/chronicle.js"
import {effect} from "../signals/core/effect.js"

export default suite({
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
			await lensA.mutate(s => s.b = {count: 3})
			expect(prism.get().a.b.count).is(3)
			expect(lensA.state.b.count).is(3)
			expect(lensB.state.count).is(3)
		}),

		"outside mutations ignored": test(async() => {
			const prism = new Prism({a: {count: 1}, b: {count: 101}})
			const lensA = prism.lens(s => s.a)
			const lensB = prism.lens(s => s.b)
			let happeningsA = 0
			let happeningsB = 0
			const stopA = lensA.on(() => void happeningsA++)
			const stopB = lensB.on(() => void happeningsA++)
			await lensA.mutate(s => s.count++)
			expect(happeningsA).is(1)
			expect(happeningsB).is(0)
			stopA()
			stopB()
		}),

		"outside mutations ignored for effects": test(async() => {
			const prism = new Prism({a: {count: 1}, b: {count: 101}})
			const lensA = prism.lens(s => s.a)
			const lensB = prism.lens(s => s.b)
			let happeningsA = 0
			let happeningsB = 0
			const stopA = effect(() => {
				void lensA.state.count
				happeningsA++
			})
			const stopB = effect(() => {
				void lensB.state.count
				happeningsB++
			})
			await lensA.mutate(s => s.count++)
			expect(happeningsA).is(2)
			expect(happeningsB).is(1)
			stopA()
			stopB()
		}),
	}),

	"chrono": suite({
		"get present state": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			expect(chrono.state.count).is(1)
		}),

		"mutation": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			await chrono.mutate(s => s.count++)
			expect(chrono.state.count).is(2)
			await chrono.mutate(s => s.count++)
			expect(chrono.state.count).is(3)
		}),

		"undoable/redoable": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			expect(chrono.undoable).is(0)
			expect(chrono.redoable).is(0)
			await chrono.mutate(s => s.count++)
			expect(chrono.undoable).is(1)
			await chrono.mutate(s => s.count++)
			expect(chrono.undoable).is(2)
			await chrono.undo()
			expect(chrono.undoable).is(1)
			expect(chrono.redoable).is(1)
			await chrono.undo()
			expect(chrono.undoable).is(0)
			expect(chrono.redoable).is(2)
			await chrono.redo()
			expect(chrono.undoable).is(1)
			expect(chrono.redoable).is(1)
		}),

		"undo": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)

			await chrono.mutate(s => s.count++)
			expect(chrono.state.count).is(2)

			await chrono.undo()
			expect(chrono.state.count).is(1)
		}),

		"sync undo": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)

			chrono.mutate(s => s.count++)
			expect(chrono.state.count).is(2)

			chrono.undo()
			expect(chrono.state.count).is(1)
		}),

		"redo": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)

			await chrono.mutate(s => s.count++)
			expect(chrono.state.count).is(2)

			await chrono.undo()
			expect(chrono.state.count).is(1)

			await chrono.redo()
			expect(chrono.state.count).is(2)
		}),

		"undo/redo is orderly": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)

			await chrono.mutate(s => s.count++)
			await chrono.mutate(s => s.count++)
			await chrono.mutate(s => s.count++)
			expect(chrono.state.count).is(4)

			await chrono.undo()
			expect(chrono.state.count).is(3)

			await chrono.undo()
			expect(chrono.state.count).is(2)

			await chrono.redo()
			expect(chrono.state.count).is(3)

			await chrono.redo()
			expect(chrono.state.count).is(4)

			await chrono.undo()
			expect(chrono.state.count).is(3)

			await chrono.undo()
			expect(chrono.state.count).is(2)

			await chrono.undo()
			expect(chrono.state.count).is(1)
		}),

		"undo nothing does nothing": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			await chrono.undo()
			expect(chrono.state.count).is(1)
		}),

		"redo nothing does nothing": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			await chrono.redo()
			expect(chrono.state.count).is(1)
		}),

		"undo 2x": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			await chrono.mutate(s => s.count++)
			await chrono.mutate(s => s.count++)
			await chrono.mutate(s => s.count++)
			expect(chrono.state.count).is(4)
			await chrono.undo(2)
			expect(chrono.state.count).is(2)
		}),

		"redo 2x": test(async() => {
			const prism = new Prism({data: chronicle({count: 1})})
			const lens = prism.lens(s => s.data)
			const chrono = new Chrono(64, lens)
			await chrono.mutate(s => s.count++)
			await chrono.mutate(s => s.count++)
			await chrono.mutate(s => s.count++)
			expect(chrono.state.count).is(4)
			await chrono.undo(2)
			expect(chrono.state.count).is(2)
			await chrono.redo(2)
			expect(chrono.state.count).is(4)
		}),

		"sublens mutations are undoable": test(async() => {
			const prism = new Prism({data: chronicle({a: {count: 1}})})
			const chrono = new Chrono(64, prism.lens(s => s.data))
			const sublens = chrono.lens(s => s.a)
			expect(sublens.state.count).is(1)
			await sublens.mutate(s => s.count++)
			expect(sublens.state.count).is(2)
			await chrono.undo()
			expect(sublens.state.count).is(1)
		}),
	}),
})

