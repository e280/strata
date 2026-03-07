
import {Science} from "@e280/science"

import lazy from "./lazy/test.js"
import signal from "./signal/test.js"
import derived from "./derived/test.js"

export default Science.suite({
	lazy,
	signal,
	derived,
})

