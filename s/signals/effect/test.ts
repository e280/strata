
import {Science, test, expect} from "@e280/science"
import {watch} from "./watch.js"
import {effect} from "./effect.js"
import {signal} from "../signal/fn.js"

export default Science.suite({
	"watch": Science.suite({
		"responder gets value": test(async() => {
			const count = signal(1)
			let collected = 0
			watch(
				() => count(),
				x => { collected = x }
			)
			expect(collected).is(0)
			await count(2)
			expect(collected).is(2)
		}),

		"responder not called until change": test(async() => {
			const count = signal(1)
			let calls = 0
			watch(
				() => count(),
				() => { calls++ }
			)
			expect(calls).is(0)
			await count(2)
			expect(calls).is(1)
		}),

		"watch updates dynamic dependencies": test(async() => {
			const toggle = signal(true)
			const a = signal(1)
			const b = signal(10)

			let collected = 0

			watch(
				() => toggle() ? a() : b(),
				x => { collected = x }
			)

			await a(2)
			expect(collected).is(2)

			await toggle(false)
			expect(collected).is(10)

			collected = 0
			await a(3)
			expect(collected).is(0)

			await b(11)
			expect(collected).is(11)
		})
	}),

	"tracks signal changes": test(async() => {
		const count = signal(1)
		let doubled = 0

		effect(() => doubled = count.value * 2)
		expect(doubled).is(2)

		await count.set(3)
		expect(doubled).is(6)
	}),

	"correct signal effect order": test(async() => {
		let order: string[] = []
		const count = signal(0)

		effect(() => {
			if (count.value)
				order.push("effect")
		})

		order.push("before")
		await count.set(1)
		order.push("after")

		expect(order.length).is(3)
		expect(order[0]).is("before")
		expect(order[1]).is("effect")
		expect(order[2]).is("after")
	}),

	"simple effect called the correct number of times": test(async() => {
		const count = signal(0)
		let runs = 0
		effect(() => { count(); runs++ })
		expect(runs).is(1)
		await count(1)
		expect(runs).is(2)
		await count(2)
		expect(runs).is(3)
	}),

	"is only called when signal actually changes": test(async() => {
		const count = signal(1)
		let runs = 0
		effect(() => {
			count.get()
			runs++
		})
		expect(runs).is(1)
		await count.set(999)
		expect(runs).is(2)
		await count.set(999)
		expect(runs).is(2)
	}),

	"debounced": test(async() => {
		const count = signal(1)
		let runs = 0
		effect(() => {
			count.get()
			runs++
		})
		expect(runs).is(1)
		count.value++
		count.value++
		await count.set(count.get() + 1)
		expect(runs).is(2)
	}),

	"can be disposed": test(async() => {
		const count = signal(1)
		let doubled = 0

		const dispose = effect(() => doubled = count.value * 2)
		expect(doubled).is(2)

		await count.set(3)
		expect(doubled).is(6)

		dispose()
		await count.set(4)
		expect(doubled).is(6) // old value
	}),

	"signal set promise waits for effects": test(async() => {
		const count = signal(1)
		let doubled = 0

		effect(() => doubled = count.value * 2)
		expect(doubled).is(2)

		await count.set(3)
		expect(doubled).is(6)
	}),

	"only runs on change": test(async() => {
		const sig = signal("a")
		let runs = 0

		effect(() => {
			sig.value
			runs++
		})
		expect(runs).is(1)

		await sig.set("a")
		expect(runs).is(1)

		await sig.set("b")
		expect(runs).is(2)
	}),
})

