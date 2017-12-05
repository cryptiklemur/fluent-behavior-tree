# Fluent Behavior Tree [![npm version](https://badge.fury.io/js/fluent-behavior-tree.svg)](https://badge.fury.io/js/fluent-behavior-tree)

This is a Typescript/Javascript implementation of https://github.com/codecapers/Fluent-Behaviour-Tree

JS/TS behaviour tree library with a fluent API.

For a background and walk-through please see [the accompanying article](http://www.what-could-possibly-go-wrong.com/fluent-behavior-trees-for-ai-and-game-logic/).

## Understanding Behaviour Trees

Here are some resources to help you understand behaviour trees:

- [Behaviour tree (Wikipedia)](https://en.wikipedia.org/wiki/Behavior_tree_(artificial_intelligence,_robotics_and_control))
- [Behavior trees for AI: How they work](http://www.gamasutra.com/blogs/ChrisSimpson/20140717/221339/Behavior_trees_for_AI_How_they_work.php)
- [Understanding Behaviour Trees](http://aigamedev.com/open/article/bt-overview/)
- [Introduction and implementation of Behaviour Trees](http://guineashots.com/2014/07/25/an-introduction-to-behavior-trees-part-1/)

## Installation

Install with npm:

```shell
npm install -s fluent-behavior-tree
```

## Usage

A behavior tree is created through *BehaviorTreeBuilder*. The tree is returned when the *build* function is called.

```
import {BehaviorTreeBuilder, BehaviorTreeStatus, TimeData} from "fluent-behavior-tree";

// ...

const builder = new BehaviorTreeBuilder();
this.tree = builder
    .sequence("my-sequence")
        .do("action1", async (t) => {
            // Action 1.

            return BehaviorTreeStatus.Success;
        })
        .do("action2", async (t) => {
            //Action 2.

            return BehaviorTreeStatus.Failure;
        })
    .end()
    .build();
```

Then, *Tick* the behavior tree on each *update* of your *loop*

```
public async update(deltaTime: number): Promise<void> {
    await this.tree.tick(new TimeData(deltaTime));
}
```

## Behavior Tree Status

Behavior tree nodes must return the following status codes:

* *BehaviorTreeStatus.Success*: The node has finished what it was doing and succeeded.
* *BehaviorTreeStatus.Failure*: The node has finished, but failed.
* *BehaviorTreeStatus.Running*: The node is still working on something.

## Node Types

### Action / Leaf-Node

Call the *do* function to create an action node at the leaves of the behavior tree.

```
.do("do-something", async (t) => {
    // ... Do something ...

    return BehaviorTreeStatus.Success;
});
```

The return value defines the status of the node. Return one of the statuses from above.

### Sequence

Runs each child node in sequence. Fails for the first child node that *fails*. Moves to the next child when the current running child *succeeds*. Stays on the current child node while it returns *running*. Succeeds when all child nodes have succeeded.

```
.sequence("my-sequence")
    .do("action1", async (t) => { // Run this.
        // Action 1.

        return BehaviorTreeStatus.Success;
    })
    .do("action2", async (t) => { // Then run this.
        //Action 2.

        return BehaviorTreeStatus.Failure;
    })
.end()
```

### Parallel

Runs all child nodes in parallel. Continues to run until a required number of child nodes have either *failed* or *succeeded*.

```
let numRequiredToFail: number = 2;
let numRequiredToSuccess: number = 2;

.parallel("my-parallel"m numRequiredtoFail, numRequiredToSucceed)
    .do("action1", async (t) => { // Run this at the same time as action2
        // Parallel action 1

        return BehaviorTreeStatus.Running;
    })
    .do("action12, async (t) => { // Run this at the same time as action1
        // Parallel action 2

        return BehaviorTreeStatus.Running;
    })
.end();
```

### Selector

Runs child nodes in sequence until it finds one that *succeeds*. Succeeds when it finds the first child that *succeeds*. For child nodes that *fail*, it moves forward to the next child node. While a child is *running* it stays on that child node without moving forward.

```
.selector("my-selector")
    .do("action1", async (t) => {
        // Action 1

        return BehaviorTreeStatus.Failure; // Fail, move onto the next child
    })
    .do("action2", async (t) => {
        // Action 2

        return BehaviorTreeStatus.Success; // Success, stop here.
    })
    .do("action3", async (t) => {
        // Action 3

        return BehaviorTreeStatus.Success; // Doesn't get this far.
    })
.end();
```

### Condition

The condition function is syntatic sugar for the *do* function. It allows the return of a boolean value that is then converted to *success* or *failure*. It is intended to be used with *Selector*.

```
.selector("my-selector")
    .Condition("condition1", async (t) => this.someBooleanConditional()) // Predicate that returns *true* or *false*
    .do("action1", async (t) => this.someAction()) // Action to run if the predicate evaluates to *true*
.end()
```

### Inverter

Inverts the *success* or *failure* of the child node. Continues running while the child node is *running*.

```
.inverter("inverter1")
    .do("action1", async (t) => BehaviourTreeStatus.Success) // *Success* will be inverted to *failure*.
.end()


.inverter("inverter1")
    .do("action1", async (t) => BehaviourTreeStatus.Failure) // *Failure* will be inverted to *success*.
.end()
```

## Nesting Behaviour Trees

Behaviour trees can be nested to any depth, for example:

```
.selector("parent")
    .sequence("child-1")
        ...
        .parallel("grand-child")
            ...
        .end()
        ...
    .end()
    .sequence("child-2")
        ...
    .end()
.end()
```

## Splicing a Sub-tree

Separately created sub-trees can be spliced into parent trees. This makes it easy to build behaviour trees from reusable components.

```
private createSubTree(): BehaviorTreeNodeInterface
{
    return new BehaviourTreeBuilder()
        .sequence("my-sub-tree")
            .do("action1", async (t) => {
                // Action 1.

                return BehaviourTreeStatus.Success;
            })
            .Do("action2", async (t) => {
                // Action 2.

                return BehaviourTreeStatus.Success;
            });
        .end()
        .build();
}

public startup(): void
{
    this.tree = new BehaviourTreeBuilder()
        .sequence("my-parent-sequence")
            .Splice(this.createSubTree()) // Splice the child tree in.
            .Splice(this.createSubTree()) // Splice again.
        .end()
        .build();
}
```
