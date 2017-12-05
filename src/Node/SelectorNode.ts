import BehaviorTreeStatus from "../BehaviorTreeStatus";
import TimeData from "../TimeData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";
import ParentBehaviorTreeNodeInterface from "./ParentBehaviorTreeNodeInterface";

/**
 * Selects the first node that succeeds. Tries successive nodes until it finds one that doesn't fail.
 *
 * @property {string} name - The name of the node.
 */
export default class SelectorNode implements ParentBehaviorTreeNodeInterface {
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
            if (status !== BehaviorTreeStatus.Failure) {
                return status;
            }
        }

        return BehaviorTreeStatus.Failure;
    }

    public addChild(child: BehaviorTreeNodeInterface): void {
        this.children.push(child);
    }
}
