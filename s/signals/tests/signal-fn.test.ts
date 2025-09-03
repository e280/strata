
import {Science, test, expect} from "@e280/science"
import {signal} from "../fns.js"

export default Science.suite({
	"get/set": test(async() => {
		const count = signal.fn(0)
		expect(count()).is(0)

		count.value++
		expect(count()).is(1)
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

