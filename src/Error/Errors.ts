enum Errors {
    NO_NODES                   = "Cannot create a behavior tree with zero nodes.",
    SPLICE_UNNESTED_TREE       = "Cannot splice an unnested sub-tree. There must be a parent-tree.",
    INVERTER_NO_CHILDREN       = "InverterNode must have a child node!",
    INVERTER_MULTIPLE_CHILDREN = "Can't add more than a single child to InverterNode!",
    UNNESTED_ACTION_NODE       = "Can't create an unnested ActionNode. It must be a leaf node.",
}

export default Errors;
