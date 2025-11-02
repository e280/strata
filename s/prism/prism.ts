
import {Lens} from "./lens.js"

/** state mangagement source-of-truth */
export class Prism<State> {
	#state: State
	#lenses = new Set<Lens<any>>()

	constructor(state: State) {
		this.#state = state
	}

	getState() {
		return this.#state
	}

	async setState(state: State) {
		this.#state = state
		await Promise.all([...this.#lenses].map(lens => lens.update()))
	}

	lens<State2>(selector: (state: State) => State2) {
		const lens = new Lens<State2>({
			getState: () => selector(this.#state),
			mutate: async fn => {
				const result = fn(selector(this.#state))
				await this.setState(this.#state)
				return result
			},
		})
		this.#lenses.add(lens)
		return lens
	}
}

