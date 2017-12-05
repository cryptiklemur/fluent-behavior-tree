import BehaviorTreeStatus from "../BehaviorTreeStatus";
import StateData from "../StateData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";

/**
 * A behavior tree leaf node for running an action
 *
 * @property {string}                                   name - The name of the node
 * @property {(state: StateData) => BehaviorTreeStatus} fn   - Function to invoke for the action.
 */
export default class ActionNode implements BehaviorTreeNodeInterface {
    public constructor(
        public readonly name: string,
        public readonly fn: (state: StateData) => Promise<BehaviorTreeStatus>,
    ) {
    }

    public async tick(state: StateData): Promise<BehaviorTreeStatus> {
        return await this.fn(state);
    }
}
