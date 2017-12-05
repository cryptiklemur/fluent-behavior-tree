import test from "ava";
import * as TypeMoq from "typemoq";
import TimeData from "../../src/TimeData";
import BehaviorTreeNodeInterface from "../../src/Node/BehaviorTreeNodeInterface";
import BehaviorTreeStatus from "../../src/BehaviorTreeStatus";
import SequenceNode from "../../src/Node/SequenceNode";

let testObject: SequenceNode;

function init(): void {
    testObject = new SequenceNode("some-sequence");
}

test("can run all children in order", async (assert) => {
    init();
    const time    = new TimeData();
    let callOrder = 0;

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(time))
              .returns(() => {
                  assert.is(1, ++callOrder);

                  return Promise.resolve(BehaviorTreeStatus.Success)
              });

    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild2.setup(async (m) => await m.tick(time))
              .returns(() => {
                  assert.is(2, ++callOrder);

                  return Promise.resolve(BehaviorTreeStatus.Success)
              });

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    assert.is(BehaviorTreeStatus.Success, await testObject.tick(time));
    assert.is(2, callOrder);
    mockChild1.verify((m) => m.tick(time), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(time), TypeMoq.Times.once());
});

test("when first child is running, second child is supressed", async (assert) => {
    init();
    const time = new TimeData();

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(time))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Running));
    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    assert.is(BehaviorTreeStatus.Running, await testObject.tick(time));
    mockChild1.verify((m) => m.tick(time), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(time), TypeMoq.Times.never());
});

test("when first child fails, then entire sequence fails", async (assert) => {
    init();
    const time = new TimeData();

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(time))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Failure));
    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    assert.is(BehaviorTreeStatus.Failure, await testObject.tick(time));
    mockChild1.verify((m) => m.tick(time), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(time), TypeMoq.Times.never());
});

test("when second child fails, then entire sequence fails", async (assert) => {
    init();
    const time = new TimeData();

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(time))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Success));
    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild2.setup(async (m) => await m.tick(time))
              .returns(() => Promise.resolve(BehaviorTreeStatus.Failure));

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    assert.is(BehaviorTreeStatus.Failure, await testObject.tick(time));
    mockChild1.verify((m) => m.tick(time), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(time), TypeMoq.Times.once());
});
