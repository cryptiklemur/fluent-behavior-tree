import BehaviorTreeStatus from "../BehaviorTreeStatus";
import NodeEnumerator from "../NodeEnumerator";
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
    private children: BehaviorTreeNodeInterface[];

    /**
     * Enumerator to keep state
     */
    private enumerator?: NodeEnumerator;

    public constructor(public readonly name: string) {
    }

    public init(): void {
        this.enumerator = new NodeEnumerator(this.children);
    }

    public async tick(time: TimeData): Promise<BehaviorTreeStatus> {
        if (this.enumerator === null) {
            this.init();
        }

        if (this.enumerator.current !== null) {
            this.enumerator.next();
        }

        while (this.enumerator.current !== null) {
            const status = await this.enumerator.current.tick(time);
            if (status !== BehaviorTreeStatus.Failure) {
                if (status === BehaviorTreeStatus.Success) {
                    this.enumerator.reset();
                }

                return status;
            }

            if (!this.enumerator.hasNext()) {
                break;
            }
        }
        this.enumerator.reset();

        return BehaviorTreeStatus.Failure;
    }

    public addChild(child: BehaviorTreeNodeInterface): void {
        this.children.push(child);
    }
}
