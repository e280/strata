
import {expect, Science} from "@e280/science"
import {Strata} from "./parts/strata.js"

await Science.run({
	"strata": Science.suite({
		"get state": Science.test(async() => {
			const strata = new Strata({count: 0})
			expect(strata.state.count).is(0)
		}),

		"state is immutable": Science.test(async() => {
			const strata = new Strata({count: 0})
			expect(() => strata.state.count++).throws()
		}),

		"run a proper mutation": Science.test(async() => {
			const strata = new Strata({count: 0})
			expect(strata.state.count).is(0)
			await strata.mutate(state => state.count++)
			expect(strata.state.count).is(1)
			await strata.mutate(state => state.count++)
			expect(strata.state.count).is(2)
		}),

		"forbidden mutation nesting": Science.test(async() => {
			const strata = new Strata({count: 0})
			await expect(async() => {
				let promise!: Promise<any>
				await strata.mutate(() => {
					promise = strata.mutate(() => {})
				})
				await promise
			}).throwsAsync()
		}),

		"state after mutation is frozen": Science.test(async () => {
			const strata = new Strata({x: 1})
			await strata.mutate(s => { s.x = 2 })
			expect(() => strata.state.x = 3).throws()
		}),

		"onMutation is published": Science.test(async() => {
			const strata = new Strata({count: 0})
			let mutationCount = 0
			strata.onMutation.sub(() => {mutationCount++})
			await strata.mutate(state => state.count++)
			expect(mutationCount).is(1)
		}),

		"onMutation is debounced": Science.test(async() => {
			const strata = new Strata({count: 0})
			let mutationCount = 0
			strata.onMutation.sub(() => {mutationCount++})
			const promise = strata.mutate(state => state.count++)
			expect(mutationCount).is(0)
			await promise
			expect(mutationCount).is(1)
		}),

		"onMutation is fired when array item is pushed": Science.test(async() => {
			const strata = new Strata({items: ["hello", "world"]})
			let mutationCount = 0
			strata.onMutation.sub(() => {mutationCount++})
			await strata.mutate(state => state.items.push("lol"))
			expect(mutationCount).is(1)
			expect(strata.state.items.length).is(3)
		}),
	}),

	"substrata": Science.suite({
		"get state": Science.test(async() => {
			const strata = new Strata({count: 0, sub: {rofls: 0}})
			const substrata = strata.substrata(s => s.sub)
			expect(substrata.state.rofls).is(0)
		}),

		"nullable selector": Science.test(async () => {
			const strata = new Strata({
				a: {b: 0}  as (null | {b: number}),
			})
			const a = strata.substrata(s => s.a)
			expect(strata.state.a?.b).is(0)
			expect(a.state?.b).is(0)
			await a.mutate(a => { a!.b = 1 })
			expect(strata.state.a?.b).is(1)
			expect(a.state?.b).is(1)
			await strata.mutate(s => s.a = null)
			expect(strata.state.a?.b).is(undefined)
			expect(a.state?.b).is(undefined)
		}),

		"composition": Science.test(async () => {
			const strata = new Strata({a: {b: {c: 0}}})
			const a = strata.substrata(s => s.a)
			const b = a.substrata(s => s.b)
			expect(strata.state.a.b.c).is(0)
			expect(b.state.c).is(0)
		}),

		"deep mutations": Science.test(async () => {
			const strata = new Strata({a: {b: {c: 0}}})
			const a = strata.substrata(s => s.a)
			const b = a.substrata(s => s.b)
			await b.mutate(b => { b.c = 101 })
			expect(strata.state.a.b.c).is(101)
			expect(a.state.b.c).is(101)
			expect(b.state.c).is(101)
			await a.mutate(a => { a.b = {c: 102} })
			expect(strata.state.a.b.c).is(102)
			expect(a.state.b.c).is(102)
			expect(b.state.c).is(102)
			await strata.mutate(s => { s.a = {b: {c: 103}} })
			expect(strata.state.a.b.c).is(103)
			expect(a.state.b.c).is(103)
			expect(b.state.c).is(103)
		}),

		"onMutation ignores outside mutations": Science.test(async() => {
			const strata = new Strata({a: {x: 0}, b: {x: 0}})
			const a = strata.substrata(s => s.a)
			const b = strata.substrata(s => s.b)
			let counted = 0
			b.onMutation.sub(() => {counted++})
			await a.mutate(a => a.x = 1)
			expect(counted).is(0)
		}),

		"forbid submutation in mutation": Science.test(async() => {
			const strata = new Strata({a: {b: 0}})
			const a = strata.substrata(s => s.a)
			await expect(async() => {
				let promise!: Promise<any>
				await strata.mutate(() => {
					promise = a.mutate(() => {})
				})
				await promise
			}).throwsAsync()
		}),

		"forbid mutation in submutation": Science.test(async() => {
			const strata = new Strata({a: {b: 0}})
			const a = strata.substrata(s => s.a)
			await expect(async() => {
				let promise!: Promise<any>
				await a.mutate(() => {
					promise = strata.mutate(() => {})
				})
				await promise
			}).throwsAsync()
		}),
	}),

	"historical": (() => {
		const setup = () => {
			const strata = new Strata({
				groceries: Strata.chronicle([] as string[]),
			})
			const groceries = strata.historical(64, s => s.groceries)
			return {strata, groceries}
		}

		return Science.suite({
			"get state": Science.test(async() => {
				const {groceries} = setup()
				expect(groceries.state.length).is(0)
			}),

			"mutate": Science.test(async() => {
				const {groceries} = setup()
				expect(groceries.state.length).is(0)
				await groceries.mutate(s => s.push("hello"))
				expect(groceries.state.length).is(1)
			}),

			"undo": Science.test(async() => {
				const {groceries} = setup()
				await groceries.mutate(s => s.push("hello"))
				await groceries.undo()
				expect(groceries.state.length).is(0)
			}),

			"redo": Science.test(async() => {
				const {groceries} = setup()
				await groceries.mutate(s => s.push("hello"))
				await groceries.undo()
				await groceries.redo()
				expect(groceries.state.length).is(1)
			}),
		})
	})(),
})

