
import {Science} from "@e280/science"

import effect from "./tests/effect.test.js"
import signal from "./tests/signal.test.js"
import derived from "./tests/derived.test.js"
import lazy from "./tests/lazy.test.js"

import signal2 from "./tests/signal2.test.js"
import derived2 from "./tests/derived2.test.js"
import lazy2 from "./tests/lazy2.test.js"

export default Science.suite({
	effect,
	signal,
	derived,
	lazy,

	signal2,
	derived2,
	lazy2,
})

