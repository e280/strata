
import {Science, test, expect} from "@e280/science"

import {effect} from "./parts/effect.js"
import {signal} from "./parts/signal.js"
import {computed} from "./parts/computed.js"

export default Science.suite({
	"signal get/set value": test(async() => {
		const count = signal(0)
		expect(count.value).is(0)

		count.value++
		expect(count.value).is(1)

		count.value = 5
		expect(count.value).is(5)
	}),

	"signal fn syntax": test(async() => {
		const count = signal(0)
		expect(count()).is(0)

		count(count() + 1)
		expect(count()).is(1)

		count(5)
		expect(count()).is(5)
	}),

	"signal syntax interop": test(async() => {
		const count = signal(0)

		count.value = 1
		expect(count()).is(1)
	}),

	"effect tracks signal changes": test(async() => {
		const count = signal(1)
		let doubled = 0

		const eff = effect(() => doubled = count.value * 2)

		await eff.wait
		expect(doubled).is(2)

		count.value = 3
		await eff.wait
		expect(doubled).is(6)
	}),

	"effect only runs on change": test(async() => {
		const sig = signal("a")
		let runs = 0

		const eff = effect(() => {
			sig.value
			runs++
		})
		await eff.wait
		expect(runs).is(1)

		sig.value = "a"
		await eff.wait
		expect(runs).is(1)

		sig.value = "b"
		await eff.wait
		expect(runs).is(2)
	}),

	"computed values": test(async() => {
		const a = signal(2)
		const b = signal(3)
		const sum = computed(() => a.value + b.value)
		expect(sum.value).is(5)

		a.value = 5
		await sum.wait
		expect(sum.value).is(8)

		b.value = 7
		await sum.wait
		expect(sum.value).is(12)
	}),

	"computed is lazy": test(async() => {
		const a = signal(1)
		let runs = 0

		const comp = computed(() => {
			runs++
			return a.value * 10
		})

		await comp.wait
		expect(runs).is(1)
		expect(comp.value).is(10)
		expect(runs).is(1)

		a.value = 2
		await comp.wait
		expect(runs).is(1)
		expect(comp.value).is(20)
		expect(runs).is(2)
	}),
})

