import test from "ava";
import BehaviorTreeBuilder from "../src/BehaviorTreeBuilder";
import BehaviorTreeError from "../src/Error/BehaviorTreeError";
import BehaviorTreeStatus from "../src/BehaviorTreeStatus";
import InverterNode from "../src/Node/InverterNode";
import StateData from "../src/StateData";
import SequenceNode from "../src/Node/SequenceNode";
import ParallelNode from "../src/Node/ParallelNode";
import SelectorNode from "../src/Node/SelectorNode";
import Errors from "../src/Error/Errors";

let testObject: BehaviorTreeBuilder;

function init(): void {
    testObject = new BehaviorTreeBuilder();
}

test("can't create a behavior tree with zero nodes", async (assert) => {
    init();

    const error = assert.throws(() => testObject.build(), BehaviorTreeError);
    assert.is(error.message, Errors.NO_NODES);
});

test("can't create an unested action node", async (assert) => {
    init();
    const error = assert.throws(() => {
        testObject.do("some-node-1", async () => BehaviorTreeStatus.Running).build();
    }, BehaviorTreeError);
    assert.is(error.message, Errors.UNNESTED_ACTION_NODE);
});

test("can create inverter node", async (assert) => {
    init();

    const node = testObject
        .inverter("some-inverter")
            .do("some-node", async () => BehaviorTreeStatus.Success)
        .end()
        .build();

    assert.is(InverterNode, node.constructor);
    assert.is(BehaviorTreeStatus.Failure, await node.tick(new StateData()));
});

test("can't create an unbalanced behavior tree", async (assert) => {
    init();

    const error = assert.throws(() => {
        testObject.inverter("some-inverter").do("some-node", async () => BehaviorTreeStatus.Success).build()
    }, BehaviorTreeError);

    assert.is(error.message, Errors.NO_NODES);
});

test("condition is syntactic sugar for do", async (assert) => {
    init();
    const node = testObject
        .inverter("some-inverter")
        .condition("some-node", async () => true)
        .end()
        .build();

    assert.is(InverterNode, node.constructor);
    assert.is(BehaviorTreeStatus.Failure, await node.tick(new StateData()));
});

test("can invert an inverter", async (assert) => {
    init();
    const node = testObject
        .inverter("some-inverter")
        .inverter("some-inverter")
        .do("some-node", async () => BehaviorTreeStatus.Success)
        .end()
        .end()
        .build();

    assert.is(InverterNode, node.constructor);
    assert.is(BehaviorTreeStatus.Success, await node.tick(new StateData()));
});

test("adding more than a single child to inverter throws exception", async (assert) => {
    init();
    const error = assert.throws(() => {
        testObject
            .inverter("some-inverter")
            .do("some-node", async () => BehaviorTreeStatus.Success)
            .do("some-node", async () => BehaviorTreeStatus.Success)
            .end()
            .build();
    }, BehaviorTreeError);

    assert.is(error.message, Errors.INVERTER_MULTIPLE_CHILDREN);
});

test("can create a sequence", async (assert) => {
    init();
    let invokeCount = 0;
    const sequence  = testObject
        .sequence("some-sequence")
            .do("some-action-1", async () => {
                ++invokeCount;

                return BehaviorTreeStatus.Success;
            })
            .do("some-action-2", async () => {
                ++invokeCount;

                return BehaviorTreeStatus.Success;
            })
        .end()
        .build();

    assert.is(SequenceNode, sequence.constructor);
    assert.is(BehaviorTreeStatus.Success, await sequence.tick(new StateData()));
    assert.is(2, invokeCount);
});

test("can create a parallel", async (assert) => {
    init();
    let invokeCount = 0;
    const parallel  = testObject
        .parallel("some-parallel", 2, 2)
            .do("some-action-1", async () => {
                ++invokeCount;

                return BehaviorTreeStatus.Success;
            })
            .do("some-action-2", async () => {
                ++invokeCount;

                return BehaviorTreeStatus.Success;
            })
        .end()
        .build();

    assert.is(ParallelNode, parallel.constructor);
    assert.is(BehaviorTreeStatus.Success, await parallel.tick(new StateData()));
    assert.is(2, invokeCount);
});

test("can create a selector", async (assert) => {
    init();
    let invokeCount = 0;
    const selector  = testObject
        .selector("some-parallel")
            .do("some-action-1", async () => {
                ++invokeCount;

                return BehaviorTreeStatus.Failure;
            })
            .do("some-action-2", async () => {
                ++invokeCount;

                return BehaviorTreeStatus.Success;
            })
        .end()
        .build();

    assert.is(SelectorNode, selector.constructor);
    assert.is(BehaviorTreeStatus.Success, await selector.tick(new StateData()));
    assert.is(2, invokeCount);
});

test("can splice sub tree", async (assert) => {
    init();
    let invokeCount = 0;
    const spliced = testObject
        .sequence("spliced")
            .do("test", async () => {
                ++invokeCount;

                return BehaviorTreeStatus.Success
            })
        .end()
        .build();

    const tree = testObject
        .sequence("parent-tree")
            .splice(spliced)
            .splice(spliced)
        .end()
        .build();

    await tree.tick(new StateData);

    assert.is(2, invokeCount);
});

test("splicing an unnested sub tree throws exception", async (assert) => {
    init();
    const error = assert.throws(() => {
        testObject.splice(
            testObject.sequence("spliced")
                .do("test", async () => BehaviorTreeStatus.Success)
                .end()
                .build()
        );
    }, BehaviorTreeError);
    assert.is(error.message, Errors.SPLICE_UNNESTED_TREE);
})
