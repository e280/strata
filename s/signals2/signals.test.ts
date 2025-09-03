
import {Science, test, expect, spy} from "@e280/science"
import {effect} from "./effect.js"
import {derive, lazy, signal} from "./fns.js"

export default Science.suite({
	"signal get/set value": test(async() => {
		const count = signal(0)
		expect(count.value).is(0)

		count.value++
		expect(count.value).is(1)

		count.value = 5
		expect(count.value).is(5)
	}),

	"signal set and publish returns value": test(async() => {
		const count = signal(0)
		expect(count.value).is(0)
		expect(await count.set(1)).is(1)
		expect(await count.publish(2)).is(2)
	}),

	"signal syntax interop": test(async() => {
		const count = signal(0)
		count.value = 1
		expect(count.get()).is(1)
	}),

	"signal on is not debounced": test(async() => {
		const count = signal(1)
		let runs = 0
		count.on(() => void runs++)
		await count.set(2)
		await count.set(3)
		expect(runs).is(2)
	}),

	"signal on only fires on change": test(async() => {
		const count = signal(1)
		let runs = 0
		count.on(() => void runs++)
		await count.set(2)
		await count.set(2)
		expect(runs).is(1)
	}),

	"signal on circularity forbidden": test(async() => {
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

	"effect tracks signal changes": test(async() => {
		const count = signal(1)
		let doubled = 0

		effect(() => doubled = count.value * 2)
		expect(doubled).is(2)

		await count.set(3)
		expect(doubled).is(6)
	}),

	"effect is only called when signal actually changes": test(async() => {
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

	"effects are debounced": test(async() => {
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

	"effects can be disposed": test(async() => {
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

	"effect only runs on change": test(async() => {
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

	"effect reacts to derived changes": test(async() => {
		const a = signal(1)
		const b = signal(10)
		const product = derive(() => a.value * b.value)

		let mutations = 0
		effect(() => {
			void product.get()
			mutations++
		})
		expect(product.value).is(10)
		expect(mutations).is(1)

		await a.set(2)
		expect(product.value).is(20)
		expect(mutations).is(2)

		await a.set(3)
		expect(product.value).is(30)
		expect(mutations).is(3)
	}),

	"effect doesn't overreact to derived": test(async() => {
		const a = signal(1)
		const b = signal(10)
		const product = signal.derive(() => a.value * b.value)

		const derivedSpy = spy(() => {})
		product.on(derivedSpy)

		let mutations = 0
		effect(() => {
			a.get()
			product.get()
			mutations++
		})
		expect(product.value).is(10)
		expect(mutations).is(1)
		expect(derivedSpy.spy.calls.length).is(0)

		await a.set(2)
		expect(product.value).is(20)
		expect(mutations).is(2)
		expect(derivedSpy.spy.calls.length).is(1)
	}),

	"derived.on": test(async() => {
		const a = signal(1)
		const b = signal(10)
		const product = signal.derive(() => a.value * b.value)
		expect(product.value).is(10)

		const mole = spy((_v: number) => {})
		product.on(mole)
		expect(mole.spy.calls.length).is(0)

		await a.set(2)
		expect(product.value).is(20)
		expect(mole.spy.calls.length).is(1)
		expect(mole.spy.calls[0].args[0]).is(20)
	}),

	"derived.on not called if result doesn't change": test(async() => {
		const a = signal(1)
		const b = signal(10)
		const product = signal.derive(() => a.value * b.value)
		expect(product.value).is(10)

		const mole = spy((_v: number) => {})
		product.on(mole)
		expect(mole.spy.calls.length).is(0)

		await a.set(2)
		expect(product.value).is(20)
		expect(mole.spy.calls.length).is(1)
		expect(mole.spy.calls[0].args[0]).is(20)

		await a.set(2)
		expect(product.value).is(20)
		expect(mole.spy.calls.length).is(1)
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

