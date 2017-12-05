import test from "ava";
import * as TypeMoq from "typemoq";
import StateData from "../../src/StateData";
import BehaviorTreeNodeInterface from "../../src/Node/BehaviorTreeNodeInterface";
import BehaviorTreeStatus from "../../src/BehaviorTreeStatus";
import ParallelNode from "../../src/Node/ParallelNode";

const util = require('util');

let testObject: ParallelNode;

function init(requiredToFail: number = 0, requiredToSucceed: number = 0): void {
    testObject = new ParallelNode("some-parallel", requiredToFail, requiredToSucceed);
}

test("runs all nodes in order", async (assert) => {
    init();
    const state    = new StateData();
    let callOrder = 0;

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(state))
              .returns(() => {
                  assert.is(1, ++callOrder);

                  return Promise.resolve(BehaviorTreeStatus.Running)
              });

     const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild2.setup(async (m) => await m.tick(state))
              .returns(() => {
                  assert.is(2, ++callOrder);

                  return Promise.resolve(BehaviorTreeStatus.Running)
              });

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    assert.is(BehaviorTreeStatus.Running, await testObject.tick(state));
    assert.is(2, callOrder);
    mockChild1.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(state), TypeMoq.Times.once());
});

test("fails when required number of children fail", async (assert) => {
    init(2, 2);
    const state = new StateData();

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(state))
              .returns(() => {
                  return Promise.resolve(BehaviorTreeStatus.Failure)
              });

    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild2.setup(async (m) => await m.tick(state))
              .returns(() => {
                  return Promise.resolve(BehaviorTreeStatus.Failure)
              });

    const mockChild3 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild3.setup(async (m) => await m.tick(state))
              .returns(() => {
                  return Promise.resolve(BehaviorTreeStatus.Running)
              });

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    testObject.addChild(mockChild3.object);

    assert.is(BehaviorTreeStatus.Failure, await testObject.tick(state));

    mockChild1.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild3.verify((m) => m.tick(state), TypeMoq.Times.once());
});

test("succeeds when required number of children succeed", async (assert) => {
    init(2, 2);
    const state = new StateData();

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(state))
              .returns(() => {
                  return Promise.resolve(BehaviorTreeStatus.Success)
              });

    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild2.setup(async (m) => await m.tick(state))
              .returns(() => {
                  return Promise.resolve(BehaviorTreeStatus.Success)
              });

    const mockChild3 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild3.setup(async (m) => await m.tick(state))
              .returns(() => {
                  return Promise.resolve(BehaviorTreeStatus.Running)
              });

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);
    testObject.addChild(mockChild3.object);

    assert.is(BehaviorTreeStatus.Success, await testObject.tick(state));

    mockChild1.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild3.verify((m) => m.tick(state), TypeMoq.Times.once());
});

test("continues to run if the required number of children neither succeed or fail", async (assert) => {
    init(2, 2);
    const state = new StateData();

    const mockChild1 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild1.setup(async (m) => await m.tick(state))
              .returns(() => {
                  return Promise.resolve(BehaviorTreeStatus.Success)
              });

    const mockChild2 = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();
    mockChild2.setup(async (m) => await m.tick(state))
              .returns(() => {
                  return Promise.resolve(BehaviorTreeStatus.Failure)
              });

    testObject.addChild(mockChild1.object);
    testObject.addChild(mockChild2.object);

    assert.is(BehaviorTreeStatus.Running, await testObject.tick(state));

    mockChild1.verify((m) => m.tick(state), TypeMoq.Times.once());
    mockChild2.verify((m) => m.tick(state), TypeMoq.Times.once());
});
