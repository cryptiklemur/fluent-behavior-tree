import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";

export default interface ParentBehaviorTreeNodeInterface extends BehaviorTreeNodeInterface {
    /**
     * Add a child node to the selector.
     *
     * @param {BehaviorTreeNodeInterface} child
     */
    addChild(child: BehaviorTreeNodeInterface): void;
}
