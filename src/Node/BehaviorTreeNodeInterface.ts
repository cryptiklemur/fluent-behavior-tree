import BehaviorTreeStatus from "../BehaviorTreeStatus";
import TimeData from "../TimeData";

export default interface BehaviorTreeNodeInterface {
    tick(time: TimeData): Promise<BehaviorTreeStatus>;
}
