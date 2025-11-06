
import {Chronicle} from "./types.js"

export function chronicle<State>(state: State): Chronicle<State> {
	return {
		past: [],
		present: state,
		future: [],
	}
}

