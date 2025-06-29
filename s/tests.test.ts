
import {Science} from "@e280/science"
import tree from "./tree/tree.test.js"
import signals from "./signals/signals.test.js"

await Science.run({
	tree,
	signals,
})

