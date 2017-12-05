import test from "ava";
import StateData from "../../src/StateData";
import ActionNode from "../../src/Node/ActionNode";
import BehaviorTreeStatus from "../../src/BehaviorTreeStatus";

test("can run action", async (assert) => {
    const state       = new StateData();
    let invokeCount  = 0;
    const testObject = new ActionNode(
        "some-action",
        async (s) => {
            assert.is(state, s);
            ++invokeCount;

            return BehaviorTreeStatus.Running;
        }
    );

    assert.is(BehaviorTreeStatus.Running, await testObject.tick(state));
    assert.is(1, invokeCount);
});


test("state is available to nodes", async (assert) => {
    const state = new StateData(0, {test: 'foo', bar: 'baz'});
    const testObject = new ActionNode("some-action", async (s) => {
        assert.is(state.state.test, s.state.test);

        return BehaviorTreeStatus.Success
    });

    assert.is(BehaviorTreeStatus.Success, await testObject.tick(state));
});
