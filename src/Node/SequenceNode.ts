import BehaviorTreeStatus from "../BehaviorTreeStatus";
import TimeData from "../TimeData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";
import ParentBehaviorTreeNodeInterface from "./ParentBehaviorTreeNodeInterface";

/**
 * Runs child nodes in sequence, until one fails.
 *
 * @property {string} name - The name of the node.
 */
export default class SequenceNode implements ParentBehaviorTreeNodeInterface {
    /**
     * List of child nodes.
     *
     * @type {BehaviorTreeNodeInterface[]}
     */
    private children: BehaviorTreeNodeInterface[] = [];

    public constructor(public readonly name: string) {
    }

    public async tick(time: TimeData): Promise<BehaviorTreeStatus> {
        for (const child of this.children) {
            const status: BehaviorTreeStatus = await child.tick(time);
            if (status !== BehaviorTreeStatus.Success) {
                return status;
            }
        }

        return BehaviorTreeStatus.Success;
    }

    public addChild(child: BehaviorTreeNodeInterface): void {
        this.children.push(child);
    }
}
