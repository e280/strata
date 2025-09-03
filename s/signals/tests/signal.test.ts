
import {Science, test, expect} from "@e280/science"
import {signal} from "../fns.js"

export default Science.suite({
	"get/set value": test(async() => {
		const count = signal(0)
		expect(count.value).is(0)

		count.value++
		expect(count.value).is(1)

		count.value = 5
		expect(count.value).is(5)
	}),

	"set and publish returns value": test(async() => {
		const count = signal(0)
		expect(count.value).is(0)
		expect(await count.set(1)).is(1)
		expect(await count.publish(2)).is(2)
	}),

	"syntax interop": test(async() => {
		const count = signal(0)
		count.value = 1
		expect(count.get()).is(1)
	}),

	"on": Science.suite({
		"on is not debounced": test(async() => {
			const count = signal(1)
			let runs = 0
			count.on(() => void runs++)
			await count.set(2)
			await count.set(3)
			expect(runs).is(2)
		}),

		"on only fires on change": test(async() => {
			const count = signal(1)
			let runs = 0
			count.on(() => void runs++)
			await count.set(2)
			await count.set(2)
			expect(runs).is(1)
		}),

		"on circularity forbidden": test(async() => {
			const count = signal(1)
			let runs = 0
			count.on(async() => {
				await count.set(99)
				runs++
			})
			expect(async() => {
				await count.set(2)
			}).throwsAsync()
			expect(runs).is(0)
		}),
	}),
})

