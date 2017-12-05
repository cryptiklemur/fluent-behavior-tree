import BehaviorTreeStatus from "../BehaviorTreeStatus";
import TimeData from "../TimeData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";

/**
 * A behavior tree leaf node for running an action
 *
 * @property {string}                                 name - The name of the node
 * @property {(time: TimeData) => BehaviorTreeStatus} fn   - Function to invoke for the action.
 */
export default class ActionNode implements BehaviorTreeNodeInterface {
    public constructor(
        public readonly name: string,
        public readonly fn: (time: TimeData) => Promise<BehaviorTreeStatus>,
    ) {
    }

    public async tick(time: TimeData): Promise<BehaviorTreeStatus> {
        return await this.fn(time);
    }
}
