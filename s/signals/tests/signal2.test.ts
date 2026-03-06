
import {Science, test, expect} from "@e280/science"
import {Signal, signal} from "../core2/signal.js"

export default Science.suite.only({
	// "signal instanceof Signal": test(async() => {
	// 	const count = signal(0)
	// 	expect(count instanceof Signal).ok()
	// }),

	"get() and set()": test(async() => {
		const count = signal(0)
		expect(count.get()).is(0)
		await count.set(1)
		expect(count.get()).is(1)
		count.set(2)
		expect(count.get()).is(2)
	}),

	".value": test(async() => {
		const count = signal(0)
		expect(count.value).is(0)
		count.value++
		expect(count.value).is(1)
		count.value = 5
		expect(count.value).is(5)
	}),

	"count() and count(1)": test(async() => {
		const count = signal(0)
		expect(count()).is(0)
		await count(1)
		expect(count()).is(1)
		count(2)
		expect(count()).is(2)
	}),

	"set with forcePublish returns value": test(async() => {
		const count = signal(0)
		expect(count.value).is(0)
		expect(await count.set(1)).is(1)
		expect(await count.set(2, true)).is(2)
	}),

	"syntax interop": test(async() => {
		const count = signal(0)

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

