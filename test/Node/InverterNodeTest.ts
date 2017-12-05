import test from "ava";
import * as TypeMoq from "typemoq";
import TimeData from "../../src/TimeData";
import InverterNode from "../../src/Node/InverterNode";
import BehaviorTreeNodeInterface from "../../src/Node/BehaviorTreeNodeInterface";
import BehaviorTreeStatus from "../../src/BehaviorTreeStatus";
import BehaviorTreeError from "../../src/Error/BehaviorTreeError";

let testObject: InverterNode;
test.beforeEach(() => {
    testObject = new InverterNode("some-node");
});

test.afterEach.always(() => {
    testObject = undefined;
});

test("ticking with no child node throws error", async (assert) => {
    try {
        await testObject.tick(new TimeData());
        assert.throws(() => {
        }, null, "should have thrown");
    } catch (e) {
        assert.is(e.message, "InverterNode must have a child node!");
    }
});

test("inverts success of child node", async (assert) => {
    const time          = new TimeData();
    const mockChildNode = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();

    mockChildNode
        .setup(async (m) => await m.tick(time))
        .returns(() => Promise.resolve(BehaviorTreeStatus.Success));

    testObject.addChild(mockChildNode.object);
    assert.is(BehaviorTreeStatus.Failure, await testObject.tick(time));
    mockChildNode.verify((m) => m.tick(time), TypeMoq.Times.once());
});

test("inverts failure of child node", async (assert) => {
    const time          = new TimeData();
    const mockChildNode = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();

    mockChildNode
        .setup(async (m) => await m.tick(time))
        .returns(() => Promise.resolve(BehaviorTreeStatus.Failure));

    testObject.addChild(mockChildNode.object);
    assert.is(BehaviorTreeStatus.Success, await testObject.tick(time));
    mockChildNode.verify((m) => m.tick(time), TypeMoq.Times.once());
});

test("pass through running of child node", async (assert) => {
    const time          = new TimeData();
    const mockChildNode = TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>();

    mockChildNode
        .setup(async (m) => await m.tick(time))
        .returns(() => Promise.resolve(BehaviorTreeStatus.Running));

    testObject.addChild(mockChildNode.object);
    assert.is(BehaviorTreeStatus.Running, await testObject.tick(time));
    mockChildNode.verify((m) => m.tick(time), TypeMoq.Times.once());
});

test("adding more than a single child throws exception", async (assert) => {
    testObject.addChild(TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>() as any);
    const error = assert.throws(
        () => testObject.addChild(TypeMoq.Mock.ofType<BehaviorTreeNodeInterface>() as any),
        BehaviorTreeError,
    );
    assert.is(error.message, "Can't add more than a single child to InverterNode!");
});
