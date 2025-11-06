
export type Chronicle<State> = {
	// [abc] d [efg]
	//    \   \   \
	//     \   \   future
	//      \   present
	//       past
	past: State[]
	present: State
	future: State[]
}

