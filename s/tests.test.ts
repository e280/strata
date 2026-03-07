
import {Science} from "@e280/science"

import prism from "./prism/prism.test.js"
import signals from "./signals/signals.test.js"
import tracker from "./tracker/tracker.test.js"

await Science.run({
	prism,
	signals,
	tracker,
})

