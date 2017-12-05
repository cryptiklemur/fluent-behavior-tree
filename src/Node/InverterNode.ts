import BehaviorTreeStatus from "../BehaviorTreeStatus";
import BehaviorTreeError from "../Error/BehaviorTreeError";
import Errors from "../Error/Errors";
import TimeData from "../TimeData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";
import ParentBehaviorTreeNodeInterface from "./ParentBehaviorTreeNodeInterface";

/**
 * Decorator node that inverts the success/failure of its child.
 *
 * @property {string} name - The name of the node
 */
export default class InverterNode implements ParentBehaviorTreeNodeInterface {
    /**
     * The child to be inverted
     */
    private childNode?: BehaviorTreeNodeInterface;

    public constructor(public readonly name: string) {
    }

    public async tick(time: TimeData): Promise<BehaviorTreeStatus> {
        if (!this.childNode) {
            throw new BehaviorTreeError(Errors.INVERTER_NO_CHILDREN);
        }

        const result = await this.childNode.tick(time);
        if (result === BehaviorTreeStatus.Failure) {
            return BehaviorTreeStatus.Success;
        } else if (result === BehaviorTreeStatus.Success) {
            return BehaviorTreeStatus.Failure;
        }

        return result;
    }

    public addChild(child: BehaviorTreeNodeInterface): void {
        if (!!this.childNode) {
            throw new BehaviorTreeError(Errors.INVERTER_MULTIPLE_CHILDREN);
        }

        this.childNode = child;
    }
}
