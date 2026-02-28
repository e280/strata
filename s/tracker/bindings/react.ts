
import {tracker} from "../tracker.js"

export function react(react: {
		useState: <X>(x: X) => [value: X, set: (fn: (x: X) => void) => void]
		useEffect: (fn: () => void) => void
	}) {

	const useStrata = <X>(fn: () => X) => {
		const [, setTick] = react.useState(0)
		const {seen, result} = tracker.observe(fn)

		react.useEffect(() => {
			const rerender = async() => setTick(tick => tick + 1)
			const stoppers = [...seen].map(item => tracker.subscribe(item, rerender))
			return () => stoppers.forEach(stop => stop())
		})

		return result
	}

	const component = <P extends object, R>(render: (props: P) => R) => {
		function c(props: P) {
			const [, setTick] = react.useState(0)
			const {seen, result} = tracker.observe(() => render(props))

			react.useEffect(() => {
				const rerender = async() => setTick(tick => tick + 1)
				const stoppers = [...seen].map(item => tracker.subscribe(item, rerender))
				return () => stoppers.forEach(stop => stop())
			})

			return result
		}

		c.displayName = (render as any).displayName ?? render.name ?? "Component"
		return c
	}

	return {component, useStrata}
}

