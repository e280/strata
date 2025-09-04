
import {Science, test, expect} from "@e280/science"
import {lazy, signal} from "../porcelain.js"

export default Science.suite({
	"lazy values": test(async() => {
		const a = signal(2)
		const b = signal(3)
		const sum = lazy(() => a.value + b.value)
		expect(sum.value).is(5)

		await a.set(5)
		expect(sum.value).is(8)

		await b.set(7)
		expect(sum.value).is(12)
	}),

	"lazy is lazy": test(async() => {
		const a = signal(1)
		let runs = 0

		const comp = lazy(() => {
			runs++
			return a.value * 10
		})

		expect(runs).is(0)
		expect(comp.value).is(10)
		expect(runs).is(1)

		await a.set(2)
		expect(runs).is(1)
		expect(comp.value).is(20)
		expect(runs).is(2)
	}),

	"lazy syntax": test(async() => {
		const a = signal(2)
		const b = signal(3)
		const sum = lazy(() => a.value + b.value)
		expect(sum.value).is(5)

		await a.set(5)
		expect(sum.value).is(8)
		expect(sum.get()).is(8)
	}),
})

