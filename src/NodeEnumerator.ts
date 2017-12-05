import BehaviorTreeNodeInterface from "./Node/BehaviorTreeNodeInterface";

export default class NodeEnumerator implements Iterable<BehaviorTreeNodeInterface> {
    private currentIndex: number = 0;

    public get current(): BehaviorTreeNodeInterface {
        return this.nodes[this.currentIndex]
    }

    public constructor(public nodes: BehaviorTreeNodeInterface[]) {
        this.nodes = nodes;
    }

    public [Symbol.iterator](): Iterator<BehaviorTreeNodeInterface> {
        return {
            next: (): IteratorResult<BehaviorTreeNodeInterface> => {
                let result;

                if (this.currentIndex < this.nodes.length) {
                    result = {value: this.current, done: false};
                    this.next();
                } else {
                    result = {done: true};
                }

                return result;
            }
        }
    }

    public next(): number {
        return this.currentIndex++;
    }

    public hasNext(): boolean {
        return this.nodes[this.currentIndex + 1] !== undefined;
    }

    public reset(): void {
        this.currentIndex = 0;
    }
}
