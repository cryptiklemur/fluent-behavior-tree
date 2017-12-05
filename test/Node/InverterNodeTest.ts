import test from "ava";
import * as TypeMoq from "typemoq";
import StateData from "../../src/StateData";
import InverterNode from "../../src/Node/InverterNode";
import BehaviorTreeNodeInterface from "../../src/Node/BehaviorTreeNodeInterface";
import BehaviorTreeStatus from "../../src/BehaviorTreeStatus";
import BehaviorTreeError from "../../src/Error/BehaviorTreeError";
import Errors from "../../src/Error/Errors";

let testObject: InverterNode;
test.beforeEach(() => {
    testObject = new InverterNode("some-node");
});

test.afterEach.always(() => {
    testObject = undefined;
});

test("ticking with no child node throws error", async (assert) => {
    try {
        await testObject.tick(new StateData());
    } catch (e) {
        assert.throws(() => {throw e}, BehaviorTreeError, "should have thrown");
        assert.is(e.message, Errors.INVERTER_NO_CHILDREN);
    }
});

test("inverts success of child node", async (assert) => {
    const state          = new StateData();
    const mockChildNode = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();

    mockChildNode
        .setup(async (m) => await m.tick(state))
        .returns(() => Promise.resolve(BehaviorTreeStatus.Success));

    testObject.addChild(mockChildNode.object);
    assert.is(BehaviorTreeStatus.Failure, await testObject.tick(state));
    mockChildNode.verify((m) => m.tick(state), TypeMoq.Times.once());
});

test("inverts failure of child node", async (assert) => {
    const state          = new StateData();
    const mockChildNode = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();

    mockChildNode
        .setup(async (m) => await m.tick(state))
        .returns(() => Promise.resolve(BehaviorTreeStatus.Failure));

    testObject.addChild(mockChildNode.object);
    assert.is(BehaviorTreeStatus.Success, await testObject.tick(state));
    mockChildNode.verify((m) => m.tick(state), TypeMoq.Times.once());
});

test("pass through running of child node", async (assert) => {
    const state          = new StateData();
    const mockChildNode = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();

    mockChildNode
        .setup(async (m) => await m.tick(state))
        .returns(() => Promise.resolve(BehaviorTreeStatus.Running));

    testObject.addChild(mockChildNode.object);
    assert.is(BehaviorTreeStatus.Running, await testObject.tick(state));
    mockChildNode.verify((m) => m.tick(state), TypeMoq.Times.once());
});

test("adding more than a single child throws exception", async (assert) => {
    testObject.addChild(TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>() as any);
    const error = assert.throws(
        () => testObject.addChild(TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>() as any),
        BehaviorTreeError,
    );
    assert.is(error.message, Errors.INVERTER_MULTIPLE_CHILDREN);
});
