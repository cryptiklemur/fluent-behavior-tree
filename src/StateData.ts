/**
 * Represents time and state. Used to pass time values to behavior tree nodes.
 *
 * @property {number} deltaTime - The current time of this state representation
 * @property {object} state     - Any state data you would like to pass to the nodes.
 */
export default class StateData {
    public constructor(public readonly deltaTime: number = 0, public readonly state: any = {}) {
    }
}
