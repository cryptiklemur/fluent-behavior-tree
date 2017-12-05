import BehaviorTreeStatus from "../BehaviorTreeStatus";
import TimeData from "../TimeData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";
import ParentBehaviorTreeNodeInterface from "./ParentBehaviorTreeNodeInterface";

/**
 * Runs child's nodes in parallel.
 *
 * @property {string} name                 - The name of the node.
 * @property {number} requiredToFail    - Number of child failures required to terminate with failure.
 * @property {number} requiredToSucceed - Number of child successes required to terminate with success.
 */
export default class ParallelNode implements ParentBehaviorTreeNodeInterface {
    /**
     * List of child nodes.
     *
     * @type {BehaviorTreeNodeInterface[]}
     */
    private children: BehaviorTreeNodeInterface[] = [];

    public constructor(
        public readonly name: string,
        public readonly requiredToFail: number,
        public readonly requiredToSucceed: number,
    ) {
    }

    public async tick(time: TimeData): Promise<BehaviorTreeStatus> {
        let succeeded = 0;
        let failed    = 0;

        for (const child of this.children) {
            let status: BehaviorTreeStatus;
            try {
                status = await child.tick(time);
            } catch (e) {
                status = BehaviorTreeStatus.Failure;
            }

            switch (status) {
                case BehaviorTreeStatus.Success:
                    ++succeeded;
                    break;
                case BehaviorTreeStatus.Failure:
                    ++failed;
                    break;
            }
        }

        if (this.requiredToSucceed > 0 && succeeded >= this.requiredToSucceed) {
            return BehaviorTreeStatus.Success;
        }
        if (this.requiredToFail > 0 && failed >= this.requiredToFail) {
            return BehaviorTreeStatus.Failure;
        }

        return BehaviorTreeStatus.Running;
    }

    public addChild(child: BehaviorTreeNodeInterface): void {
        this.children.push(child);
    }
}
