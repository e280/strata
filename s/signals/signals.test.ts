
import {Science} from "@e280/science"

import signal from "./signal/test.js"
import derived from "./derived/test.js"
import lazy from "./lazy/test.js"
import effect from "./effect/test.js"

export default Science.suite({
	signal,
	derived,
	lazy,
	effect,
})

