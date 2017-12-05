import test from "ava";
import TimeData from "../../src/TimeData";
import ActionNode from "../../src/Node/ActionNode";
import BehaviorTreeStatus from "../../src/BehaviorTreeStatus";

test("can run action", async (assert) => {
    const time       = new TimeData();
    let invokeCount  = 0;
    const testObject = new ActionNode(
        "some-action",
        async (t) => {
            assert.is(time, t);
            ++invokeCount;

            return BehaviorTreeStatus.Running;
        }
    );

    assert.is(BehaviorTreeStatus.Running, await testObject.tick(time));
    assert.is(1, invokeCount);
});
