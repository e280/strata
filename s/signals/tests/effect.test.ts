
import {Science, test, expect} from "@e280/science"
import {signal} from "../fns.js"
import {effect} from "../effect.js"

export default Science.suite({
	"tracks signal changes": test(async() => {
		const count = signal(1)
		let doubled = 0

		effect(() => doubled = count.value * 2)
		expect(doubled).is(2)

		await count.set(3)
		expect(doubled).is(6)
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

