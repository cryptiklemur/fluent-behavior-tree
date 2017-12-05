import test from "ava";
import * as TypeMoq from "typemoq";
import StateData from "../../src/StateData";
import BehaviorTreeNodeInterface from "../../src/Node/BehaviorTreeNodeInterface";
import BehaviorTreeStatus from "../../src/BehaviorTreeStatus";
import SelectorNode from "../../src/Node/SelectorNode";

let testObject: SelectorNode;

function init(): void {
    testObject = new SelectorNode("some-selector");
}

test("runs the first node if it succeeds", async (assert) => {
    init();
    const state    = new StateData();

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(state))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Success));

     const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    assert.is(BehaviorTreeStatus.Success, await testObject.tick(state));
    mockChild1.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(state), TypeMoq.Times.never());
});

test("stops on the first node when it is running", async (assert) => {
    init();
    const state = new StateData();

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(state))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Running));

    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    assert.is(BehaviorTreeStatus.Running, await testObject.tick(state));
    mockChild1.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(state), TypeMoq.Times.never());
});

test("runs the second node if the first fails", async (assert) => {
    init();
    const state = new StateData();

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(state))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Failure));

    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild2.setup(async (m) => await m.tick(state))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Success));

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    assert.is(BehaviorTreeStatus.Success, await testObject.tick(state));
    mockChild1.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(state), TypeMoq.Times.once());
});

test("fails when all children fail", async (assert) => {
    init();
    const state = new StateData();

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(state))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Failure));

    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild2.setup(async (m) => await m.tick(state))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Failure));

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    assert.is(BehaviorTreeStatus.Failure, await testObject.tick(state));
    mockChild1.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(state), TypeMoq.Times.once());
});

test("only evaluates the current node", async (assert) => {
    init();
    const state = new StateData();
    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(state))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Failure));
    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild2.setup(async (m) =>  await m.tick(state))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Running));
    const mockChild3 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild3.setup(async (m) => await m.tick(state))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Success));

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    testObject.addChild(mockChild3.object);

    assert.is(BehaviorTreeStatus.Running, await testObject.tick(state));
    assert.is(BehaviorTreeStatus.Running, await testObject.tick(state));

    mockChild1.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(state), TypeMoq.Times.exactly(2));
    mockChild3.verify((m) => m.tick(state), TypeMoq.Times.never());
});
