import Stack from "ts-data.stack";
import BehaviorTreeStatus from "./BehaviorTreeStatus";
import BehaviorTreeError from "./Error/BehaviorTreeError";
import ActionNode from "./Node/ActionNode";
import BehaviorTreeNodeInterface from "./Node/BehaviorTreeNodeInterface";
import InverterNode from "./Node/InverterNode";
import ParallelNode from "./Node/ParallelNode";
import ParentBehaviorTreeNodeInterface from "./Node/ParentBehaviorTreeNodeInterface";
import SelectorNode from "./Node/SelectorNode";
import SequenceNode from "./Node/SequenceNode";
import TimeData from "./TimeData";
import Errors from "./Error/Errors";

export default class BehaviorTreeBuilder {
    /**
     * Last node created
     */
    private curNode?: BehaviorTreeNodeInterface;

    /**
     * Stack node nodes that we are build via the fluent API.
     *
     * @type {Stack<ParentBehaviorTreeNodeInterface>}
     */
    private parentNodeStack: Stack<ParentBehaviorTreeNodeInterface> = new Stack<ParentBehaviorTreeNodeInterface>();

    /**
     * Create an action node.
     *
     * @param {string} name
     * @param {(time: TimeData) => BehaviorTreeStatus} fn
     * @returns {BehaviorTreeBuilder}
     */
    public do(name: string, fn: (time: TimeData) => Promise<BehaviorTreeStatus>): BehaviorTreeBuilder {
        if (this.parentNodeStack.isEmpty()) {
            throw new BehaviorTreeError(Errors.UNNESTED_ACTION_NODE);
        }

        const actionNode = new ActionNode(name, fn);
        this.parentNodeStack.peek().addChild(actionNode);

        return this;
    }

    /**
     * Like an action node... but the function can return true/false and is mapped to success/failure.
     *
     * @param {string} name
     * @param {(time: TimeData) => boolean} fn
     * @returns {BehaviorTreeBuilder}
     */
    public condition(name: string, fn: (time: TimeData) => Promise<boolean>): BehaviorTreeBuilder {
        return this.do(name, async (t) => await fn(t) ? BehaviorTreeStatus.Success : BehaviorTreeStatus.Failure);
    }

    /**
     * Create an inverter node that inverts the success/failure of its children.
     *
     * @param {string} name
     * @returns {BehaviorTreeBuilder}
     */
    public inverter(name: string): BehaviorTreeBuilder {
        return this.addParentNode(new InverterNode(name));
    }

    /**
     * Create a sequence node.
     *
     * @param {string} name
     * @returns {BehaviorTreeBuilder}
     */
    public sequence(name: string): BehaviorTreeBuilder {
        return this.addParentNode(new SequenceNode(name));
    }

    /**
     * Create a parallel node.
     *
     * @param {string} name
     * @param {number} requiredToFail
     * @param {number} requiredToSucceed
     * @returns {BehaviorTreeBuilder}
     */
    public parallel(name: string, requiredToFail: number, requiredToSucceed: number): BehaviorTreeBuilder {
        return this.addParentNode(new ParallelNode(name, requiredToFail, requiredToSucceed));
    }

    /**
     * Create a selector node.
     *
     * @param {string} name
     * @returns {BehaviorTreeBuilder}
     */
    public selector(name: string): BehaviorTreeBuilder {
        return this.addParentNode(new SelectorNode(name));
    }

    /**
     * Splice a sub tree into the parent tree.
     *
     * @param {BehaviorTreeNodeInterface} subTree
     * @returns {BehaviorTreeBuilder}
     */
    public splice(subTree: BehaviorTreeNodeInterface): BehaviorTreeBuilder {
        if (this.parentNodeStack.isEmpty()) {
            throw new BehaviorTreeError(Errors.SPLICE_UNNESTED_TREE);
        }

        this.parentNodeStack.peek().addChild(subTree);

        return this;
    }

    /**
     * Build the actual tree
     * @returns {BehaviorTreeNodeInterface}
     */
    public build(): BehaviorTreeNodeInterface {
            if (!this.curNode) {
                throw new BehaviorTreeError(Errors.NO_NODES)
            }

            return this.curNode;
    }

    /**
     * Ends a sequence of children.
     *
     * @returns {BehaviorTreeBuilder}
     */
    public end(): BehaviorTreeBuilder {
        this.curNode = this.parentNodeStack.pop();

        return this;
    }

    /**
     * Adds the parent node to the parentNodeStack
     *
     * @param {ParentBehaviorTreeNodeInterface} node
     * @returns {BehaviorTreeBuilder}
     */
    private addParentNode(node: ParentBehaviorTreeNodeInterface): BehaviorTreeBuilder {
        if (!this.parentNodeStack.isEmpty()) {
            this.parentNodeStack.peek().addChild(node);
        }

        this.parentNodeStack.push(node);

        return this;
    }
}
