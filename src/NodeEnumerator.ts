import BehaviorTreeNodeInterface from "./Node/BehaviorTreeNodeInterface";

export default class NodeEnumerator implements Iterable<BehaviorTreeNodeInterface> {
    public currentIndex: number = 0;

    public get current(): BehaviorTreeNodeInterface {
        return this.nodes[this.currentIndex];
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
            },
        };
    }

    public next(): boolean {
        if (this.hasNext()) {
            this.currentIndex++;

            return true;
        }

        return false;
    }

    public hasNext(): boolean {
        return !!this.nodes[this.currentIndex + 1];
    }

    public reset(): void {
        this.currentIndex = 0;
    }
}
