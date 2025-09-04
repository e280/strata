
import {Science, test, expect} from "@e280/science"
import {signal} from "../porcelain.js"

export default Science.suite({
	"get and set": test(async() => {
		const count = signal.fn(0)
		expect(count()).is(0)

		count(count() + 1)
		expect(count()).is(1)
	}),

	"old get and set still work": test(async() => {
		const count = signal.fn(0)
		expect(count.get()).is(0)

		count.set(count.get() + 1)
		expect(count.get()).is(1)
	}),

	"interop": test(async() => {
		const count = signal.fn(0)

		count(1)
		expect(count()).is(1)
		expect(count.get()).is(1)
		expect(count.value).is(1)

		count.set(2)
		expect(count()).is(2)
		expect(count.get()).is(2)
		expect(count.value).is(2)

		count.value = 3
		expect(count()).is(3)
		expect(count.get()).is(3)
		expect(count.value).is(3)
	}),

	".on 'this' interrogation": test(async() => {
		const count = signal.fn(0)
		expect(count()).is(0)

		let reported = count()
		count.on(x => {reported = x})

		count(1)
		expect(reported).is(1)

		count.on.clear()
		count(2)
		expect(reported).is(1)
	}),
})

