import StackFrame from "./stackframe";

export default function getCurrentState(stack: StackFrame[]): StackFrame {
    const currentState: StackFrame = {
        vars: {},
        funcs: {},
    };

    for (const frame of stack) {
        for (const [key, value] of Object.entries(frame.vars)) {
            currentState.vars[key] = value;
        }

        for (const [key, value] of Object.entries(frame.funcs)) {
            currentState.funcs[key] = value;
        }
    }

    return currentState;
}
