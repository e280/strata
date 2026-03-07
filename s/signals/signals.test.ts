
import {Science} from "@e280/science"

import lazy from "./tests/lazy2.test.js"
import signal from "./tests/signal2.test.js"
import derived from "./tests/derived2.test.js"

export default Science.suite({
	lazy,
	signal,
	derived,
})

