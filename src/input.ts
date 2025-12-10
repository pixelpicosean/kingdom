import {
    vec2New,
    type vec2,
} from './math/vec2';

/**
 * High-level input event types (polled once per frame).
 *
 * This event-based API is complementary to the low-level poll-style APIs
 * (inputKeyPressed, inputMousePressed, etc.). Use events when you need:
 * - Phase-based processing (UI vs canvas)
 * - Event handling with priority ordering
 * - Text input (also available via inputConsumeTextInput queue API)
 *
 * Events are cleared each frame by inputEndFrame().
 */
export enum InputEventKind {
    MOUSE_BUTTON = 'mouse_button',
    MOUSE_MOTION = 'mouse_motion',
    MOUSE_WHEEL = 'mouse_wheel',
    KEY = 'key',
    TEXT = 'text',
}

/**
 * Input processing phases determine the order in which handlers receive events.
 *
 * Common phases:
 * - 'ui': UI systems (e.g., imgui) - typically runs first to mark events as handled
 * - 'canvas': Canvas systems - runs after UI
 * - 'unhandled': Always receives events, even if marked handled (for debugging/logging)
 *
 * Phases are processed in registration order. Within each phase, handlers run
 * in priority order (higher priority first). Once an event is marked handled
 * in a phase, remaining handlers in that phase are skipped, but subsequent
 * phases still process it (except 'unhandled' which always processes).
 */
export type InputPhase = string | 'unhandled';

export type InputEvent =
    | {
        kind: InputEventKind.MOUSE_BUTTON;
        pressed: boolean;
        button: MouseButton;
        x: number;
        y: number;
        handled: boolean;
    }
    | {
        kind: InputEventKind.MOUSE_MOTION;
        dx: number;
        dy: number;
        x: number;
        y: number;
        handled: boolean;
    }
    | {
        kind: InputEventKind.MOUSE_WHEEL;
        dx: number;
        dy: number;
        handled: boolean;
    }
    | {
        kind: InputEventKind.KEY;
        pressed: boolean;
        key: Key;
        meta_key: boolean;
        ctrl_key: boolean;
        alt_key: boolean;
        shift_key: boolean;
        handled: boolean;
    }
    | {
        kind: InputEventKind.TEXT;
        text: string;
        handled: boolean;
    };

/**
 * UI capture provider interface.
 *
 * Used by UI systems (like imgui) to report their input capture state.
 * This is separate from the capture owner system to allow UI systems to
 * query their own state without needing to track explicit capture requests.
 *
 * The capture owner system (inputRequestPointerCapture/inputRequestKeyboardFocus)
 * is for explicit capture requests that non-UI systems can check.
 */
export type InputUICaptureProvider = {
    wantsPointer: () => boolean;
    wantsKeyboard: () => boolean;
    pointerOverUI: () => boolean;
};

export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
}

export enum Key {
    // Letters
    A = 'KeyA', B = 'KeyB', C = 'KeyC', D = 'KeyD', E = 'KeyE', F = 'KeyF',
    G = 'KeyG', H = 'KeyH', I = 'KeyI', J = 'KeyJ', K = 'KeyK', L = 'KeyL',
    M = 'KeyM', N = 'KeyN', O = 'KeyO', P = 'KeyP', Q = 'KeyQ', R = 'KeyR',
    S = 'KeyS', T = 'KeyT', U = 'KeyU', V = 'KeyV', W = 'KeyW', X = 'KeyX',
    Y = 'KeyY', Z = 'KeyZ',

    // Numbers
    DIGIT0 = 'Digit0', DIGIT1 = 'Digit1', DIGIT2 = 'Digit2', DIGIT3 = 'Digit3',
    DIGIT4 = 'Digit4', DIGIT5 = 'Digit5', DIGIT6 = 'Digit6', DIGIT7 = 'Digit7',
    DIGIT8 = 'Digit8', DIGIT9 = 'Digit9',

    // Function keys
    F1 = 'F1', F2 = 'F2', F3 = 'F3', F4 = 'F4', F5 = 'F5', F6 = 'F6',
    F7 = 'F7', F8 = 'F8', F9 = 'F9', F10 = 'F10', F11 = 'F11', F12 = 'F12',

    // Arrow keys
    ARROW_UP = 'ArrowUp', ARROW_DOWN = 'ArrowDown', ARROW_LEFT = 'ArrowLeft', ARROW_RIGHT = 'ArrowRight',

    // Special keys
    SPACE = 'Space', ENTER = 'Enter', ESCAPE = 'Escape', TAB = 'Tab',
    SHIFT_LEFT = 'ShiftLeft', SHIFT_RIGHT = 'ShiftRight',
    CONTROL_LEFT = 'ControlLeft', CONTROL_RIGHT = 'ControlRight',
    ALT_LEFT = 'AltLeft', ALT_RIGHT = 'AltRight',
    META_LEFT = 'MetaLeft', META_RIGHT = 'MetaRight', // Cmd on Mac, Win on Windows

    // Other keys
    BACKSPACE = 'Backspace', DELETE = 'Delete', INSERT = 'Insert',
    HOME = 'Home', END = 'End', PAGE_UP = 'PageUp', PAGE_DOWN = 'PageDown',
    CAPS_LOCK = 'CapsLock', NUM_LOCK = 'NumLock', SCROLL_LOCK = 'ScrollLock',

    // Numpad
    NUMPAD0 = 'Numpad0', NUMPAD1 = 'Numpad1', NUMPAD2 = 'Numpad2', NUMPAD3 = 'Numpad3',
    NUMPAD4 = 'Numpad4', NUMPAD5 = 'Numpad5', NUMPAD6 = 'Numpad6', NUMPAD7 = 'Numpad7',
    NUMPAD8 = 'Numpad8', NUMPAD9 = 'Numpad9',
    NUMPAD_ADD = 'NumpadAdd', NUMPAD_SUBTRACT = 'NumpadSubtract',
    NUMPAD_MULTIPLY = 'NumpadMultiply', NUMPAD_DIVIDE = 'NumpadDivide',
    NUMPAD_ENTER = 'NumpadEnter', NUMPAD_DECIMAL = 'NumpadDecimal',

    // Punctuation
    SEMICOLON = 'Semicolon', EQUAL = 'Equal', COMMA = 'Comma', MINUS = 'Minus',
    PERIOD = 'Period', SLASH = 'Slash', BACKQUOTE = 'Backquote',
    BRACKET_LEFT = 'BracketLeft', BACKSLASH = 'Backslash', BRACKET_RIGHT = 'BracketRight',
    QUOTE = 'Quote',
}

/**
 * Initialize input system with canvas
 */
export function inputSetup(canvas_element: HTMLCanvasElement): void {
    if (initialized) return;
    canvas = canvas_element;
    canvas_rect = canvas.getBoundingClientRect();
    // Clear existing state
    mouse_buttons.clear();
    keys.clear();
    mouse_position[0] = 0;
    mouse_position[1] = 0;
    mouse_delta[0] = 0;
    mouse_delta[1] = 0;
    wheel_delta_x = 0;
    wheel_delta_y = 0;
    text_input_events.length = 0;
    setupEventListeners();
    initialized = true;
}

/**
 * Reset input system (for testing)
 */
export function inputReset(): void {
    initialized = false;
    canvas = null;
    canvas_rect = null;
    mouse_buttons.clear();
    keys.clear();
    mouse_position[0] = 0;
    mouse_position[1] = 0;
    mouse_delta[0] = 0;
    mouse_delta[1] = 0;
    wheel_delta_x = 0;
    wheel_delta_y = 0;
    text_input_events.length = 0;
    input_events.length = 0;
    input_handlers.length = 0;
    ui_capture_provider = null;
    pointer_capture_owner = null;
    keyboard_capture_owner = null;
    predicted_position[0] = 0;
    predicted_position[1] = 0;
}

/**
 * Begin input frame (call at the beginning of each frame).
 * Currently a no-op, but provided for symmetry with inputEndFrame.
 */
export function inputBeginFrame(): void {
    if (canvas) {
        canvas_rect = canvas.getBoundingClientRect();
    }
}

/**
 * End input frame (call at the end of each frame).
 *
 * This function:
 * - Dispatches all buffered events through registered handlers
 * - Clears events and resets deltas for the next frame
 * - Updates previous states for next frame's just-pressed/just-released checks
 */
export function inputEndFrame(): void {
    // Dispatch events before clearing them
    inputDispatchEvents();

    // Update previous states for next frame
    for (const [_, state] of keys) {
        state.previous = state.current;
    }

    for (const [_, state] of mouse_buttons) {
        state.previous = state.current;
    }

    mouse_delta[0] = 0;
    mouse_delta[1] = 0;
    wheel_delta_x = 0;
    wheel_delta_y = 0;
    input_events.length = 0;
    text_input_events.length = 0;
    predicted_position[0] = 0;
    predicted_position[1] = 0;
}

// Keyboard API
export function inputKeyPressed(key: Key): boolean {
    const state = keys.get(key);
    return state ? state.current : false;
}

export function inputKeyReleased(key: Key): boolean {
    return !inputKeyPressed(key);
}

export function inputKeyJustPressed(key: Key): boolean {
    const state = keys.get(key);
    return state ? state.current && !state.previous : false;
}

export function inputKeyJustReleased(key: Key): boolean {
    const state = keys.get(key);
    return state ? !state.current && state.previous : false;
}

// Mouse API
export function inputMousePressed(button: MouseButton): boolean {
    const state = mouse_buttons.get(button);
    return state ? state.current : false;
}

export function inputMouseReleased(button: MouseButton): boolean {
    return !inputMousePressed(button);
}

export function inputMouseJustPressed(button: MouseButton): boolean {
    const state = mouse_buttons.get(button);
    return state ? state.current && !state.previous : false;
}

export function inputMouseJustReleased(button: MouseButton): boolean {
    const state = mouse_buttons.get(button);
    return state ? !state.current && state.previous : false;
}

export function inputMousePosition(): vec2 {
    return mouse_position;
}

export function inputMouseDelta(): vec2 {
    return mouse_delta;
}

export function inputWheelDelta(): vec2 {
    return [wheel_delta_x, wheel_delta_y];
}

/**
 * Returns the browser's predicted pointer position.
 *
 * This is an extrapolated position based on pointer velocity, useful for
 * reducing perceived latency in drawing/dragging by rendering slightly ahead.
 *
 * Returns the furthest predicted position if available, otherwise falls back
 * to the current mouse position. This means you can always use it safely:
 *
 *   const pos = inputPredictedPosition(); // Always valid
 *   drawDragPreview(pos[0], pos[1]);
 *
 * The prediction is cleared each frame by inputEndFrame().
 */
export function inputPredictedPosition(): vec2 {
    if (predicted_position[0] !== 0 || predicted_position[1] !== 0) {
        return predicted_position;
    }
    return mouse_position;
}

/**
 * Returns whether a predicted position is available this frame.
 *
 * When false, inputPredictedPosition() returns the current mouse position.
 */
export function inputHasPrediction(): boolean {
    return predicted_position[0] !== 0 || predicted_position[1] !== 0;
}

/**
 * Text input queue API (poll-style).
 *
 * These functions provide a simple queue-based interface for consuming text input.
 * Text is also available as TEXT events in inputEvents() for phase-based handling.
 *
 * Use the queue API when you need simple poll-style consumption.
 * Use TEXT events when you need phase-based processing or priority ordering.
 */
export function inputConsumeTextInput(): string | null {
    if (text_input_events.length === 0) return null;
    return text_input_events.shift() ?? null;
}

export function inputPeekTextInput(): string | null {
    return text_input_events.length > 0 ? text_input_events[0] : null;
}

export function inputTextInputCount(): number {
    return text_input_events.length;
}

/**
 * Returns the list of high-level input events for the current frame.
 * This array is cleared by `inputEndFrame()`; consumers should read it before calling that.
 */
export function inputEvents(): InputEvent[] {
    return input_events;
}

/**
 * Register an input handler that will receive events in a specific phase and priority.
 * Higher priority handlers run earlier within the same phase.
 *
 * Handlers are grouped by phase and ordered by priority within each phase.
 * Common phases: 'ui' (UI systems), 'canvas' (canvas systems), 'unhandled' (always receives events).
 */
export function inputRegisterHandler(phase: InputPhase, priority: number, handler: InputHandler): void {
    const reg: InputHandlerRegistration = {
        phase,
        priority,
        handler,
    };

    // Find insertion point: after all handlers of earlier phases, and after
    // handlers of the same phase with higher priority
    let insert_index = input_handlers.length;
    let found_phase_start = false;

    for (let i = 0; i < input_handlers.length; i++) {
        const h = input_handlers[i];
        if (h.phase === phase) {
            found_phase_start = true;
            if (priority > h.priority) {
                insert_index = i;
                break;
            }
        } else if (found_phase_start) {
            // We've passed all handlers of this phase, insert here
            insert_index = i;
            break;
        }
    }

    input_handlers.splice(insert_index, 0, reg);
}

export function inputUnregisterHandler(handler: InputHandler): void {
    for (let i = 0; i < input_handlers.length; i++) {
        if (input_handlers[i].handler === handler) {
            input_handlers.splice(i, 1);
            return;
        }
    }
}

/**
 * Dispatch all buffered events through registered handlers.
 *
 * Events are processed in phase order:
 *  1. All non-'unhandled' phases (e.g., 'ui', 'canvas') in registration order
 *  2. 'unhandled' phase (always receives events, even if handled)
 *
 * Within each phase, handlers run in priority order (higher priority first).
 * For phases other than 'unhandled', if an event's `handled` flag is set to true,
 * further handlers in that phase are skipped for that event, but the next phase
 * still processes it (unless it's also marked handled).
 * The 'unhandled' phase always receives events (even if handled) so that
 * global listeners can inspect them if needed.
 */
export function inputDispatchEvents(): void {
    if (input_handlers.length === 0 || input_events.length === 0) {
        return;
    }

    // Build phase order from handler registration order
    const phase_order: InputPhase[] = [];
    const seen_phases = new Set<InputPhase>();
    for (let i = 0; i < input_handlers.length; i++) {
        const phase = input_handlers[i].phase;
        if (!seen_phases.has(phase)) {
            seen_phases.add(phase);
            if (phase !== 'unhandled') {
                phase_order.push(phase);
            }
        }
    }

    // Process events through phases in order
    for (let i = 0; i < input_events.length; i++) {
        const ev = input_events[i];

        // Process all non-unhandled phases in registration order
        for (let phase_idx = 0; phase_idx < phase_order.length; phase_idx++) {
            const phase = phase_order[phase_idx];
            const handled_before_phase = ev.handled;

            // Run all handlers for this phase
            for (let j = 0; j < input_handlers.length; j++) {
                const h = input_handlers[j];
                if (h.phase === phase) {
                    // Skip remaining handlers in this phase if event became handled during this phase
                    if (ev.handled && !handled_before_phase) {
                        break;
                    }
                    h.handler(ev);
                }
            }
        }

        // Process 'unhandled' phase last (always receives events, even if handled)
        for (let j = 0; j < input_handlers.length; j++) {
            const h = input_handlers[j];
            if (h.phase === 'unhandled') {
                h.handler(ev);
            }
        }
    }
}

export function inputRegisterUICaptureProvider(provider: InputUICaptureProvider): void {
    ui_capture_provider = provider;
}

export function inputPointerCapturedByUI(): boolean {
    return ui_capture_provider ? ui_capture_provider.wantsPointer() : false;
}

export function inputKeyboardCapturedByUI(): boolean {
    return ui_capture_provider ? ui_capture_provider.wantsKeyboard() : false;
}

export function inputPointerOverUI(): boolean {
    return ui_capture_provider ? ui_capture_provider.pointerOverUI() : false;
}

/**
 * Pointer capture owner API.
 *
 * Any system (UI or non-UI) can request pointer capture with a priority.
 * Higher priority owners win if multiple systems request capture in the same frame.
 *
 * This is complementary to InputUICaptureProvider - use this for explicit
 * capture requests that other systems can query via inputPointerOwner().
 * UI systems typically use both: InputUICaptureProvider for internal state
 * and this API for external visibility.
 */
export function inputRequestPointerCapture(owner_id: string, priority: number): void {
    if (pointer_capture_owner == null) {
        pointer_capture_owner = {
            id: owner_id,
            kind: 'pointer',
            priority,
        };
        return;
    }
    if (priority > pointer_capture_owner.priority) {
        pointer_capture_owner.id = owner_id;
        pointer_capture_owner.priority = priority;
    }
}

export function inputReleasePointerCapture(owner_id: string): void {
    if (pointer_capture_owner && pointer_capture_owner.id === owner_id) {
        pointer_capture_owner = null;
    }
}

export function inputPointerOwner(): string | null {
    return pointer_capture_owner ? pointer_capture_owner.id : null;
}

/**
 * Keyboard focus owner API.
 *
 * Similar to pointer capture but for keyboard input focus.
 *
 * This is complementary to InputUICaptureProvider - use this for explicit
 * focus requests that other systems can query via inputKeyboardOwner().
 * UI systems typically use both: InputUICaptureProvider for internal state
 * and this API for external visibility.
 */
export function inputRequestKeyboardFocus(owner_id: string, priority: number): void {
    if (keyboard_capture_owner == null) {
        keyboard_capture_owner = {
            id: owner_id,
            kind: 'keyboard',
            priority,
        };
        return;
    }
    if (priority > keyboard_capture_owner.priority) {
        keyboard_capture_owner.id = owner_id;
        keyboard_capture_owner.priority = priority;
    }
}

export function inputReleaseKeyboardFocus(owner_id: string): void {
    if (keyboard_capture_owner && keyboard_capture_owner.id === owner_id) {
        keyboard_capture_owner = null;
    }
}

export function inputKeyboardOwner(): string | null {
    return keyboard_capture_owner ? keyboard_capture_owner.id : null;
}

/**
 * Returns true if an input or textarea element is currently focused.
 *
 * This is useful for plugins that handle keyboard shortcuts (like Delete/Backspace)
 * to avoid interfering with text input in form fields.
 */
export function inputIsInputElementFocused(): boolean {
    const active_element = document.activeElement;
    if (!active_element) {
        return false;
    }
    const tag_name = active_element.tagName.toLowerCase();
    return tag_name === 'input' || tag_name === 'textarea';
}

////////////////////////////////////////////////////////////
// internal
////////////////////////////////////////////////////////////

interface InputState {
    current: boolean;
    previous: boolean;
}

interface InputCaptureOwner {
    id: string;
    kind: 'pointer' | 'keyboard';
    priority: number;
}

type InputHandler = (ev: InputEvent) => void;

interface InputHandlerRegistration {
    phase: InputPhase;
    priority: number;
    handler: InputHandler;
}

let initialized = false;
let mouse_position = vec2New(0, 0);
let mouse_delta = vec2New(0, 0);
let mouse_buttons = new Map<MouseButton, InputState>();
let keys = new Map<Key, InputState>();
let canvas: HTMLCanvasElement | null = null;
let wheel_delta_x = 0;
let wheel_delta_y = 0;
let text_input_events: string[] = [];
let ui_capture_provider: InputUICaptureProvider | null = null;
let input_events: InputEvent[] = [];
let pointer_capture_owner: InputCaptureOwner | null = null;
let keyboard_capture_owner: InputCaptureOwner | null = null;
let input_handlers: InputHandlerRegistration[] = [];
let canvas_rect: DOMRect | null = null;
let predicted_position: vec2 = vec2New(0, 0);

function updatePointerPosition(event: PointerEvent): void {
    if (canvas && canvas_rect) {
        mouse_position[0] = event.clientX - canvas_rect.left;
        mouse_position[1] = event.clientY - canvas_rect.top;
    }
}

function setKeyState(key: Key, pressed: boolean, event?: KeyboardEvent): void {
    const currentState = keys.get(key) || { current: false, previous: false };
    currentState.previous = currentState.current;
    currentState.current = pressed;
    keys.set(key, currentState);

    // Don't create InputEvent if an input/textarea is focused (let the browser handle it)
    // Exception: Allow Escape and Tab to pass through as they're commonly used for navigation
    if (typeof document !== 'undefined') {
        const active_element = document.activeElement;
        if (active_element) {
            const tag_name = active_element.tagName.toLowerCase();
            if ((tag_name === 'input' || tag_name === 'textarea') && key !== Key.ESCAPE && key !== Key.TAB) {
                return;
            }
        }
    }

    const ev: InputEvent = {
        kind: InputEventKind.KEY,
        pressed,
        key,
        meta_key: event ? event.metaKey : false,
        ctrl_key: event ? event.ctrlKey : false,
        alt_key: event ? event.altKey : false,
        shift_key: event ? event.shiftKey : false,
        handled: false,
    };
    input_events.push(ev);
}

function setMouseButtonState(button: MouseButton, pressed: boolean): void {
    const currentState = mouse_buttons.get(button) || { current: false, previous: false };
    currentState.previous = currentState.current;
    currentState.current = pressed;
    mouse_buttons.set(button, currentState);

    const ev: InputEvent = {
        kind: InputEventKind.MOUSE_BUTTON,
        pressed,
        button,
        x: mouse_position[0],
        y: mouse_position[1],
        handled: false,
    };
    input_events.push(ev);
}

function resetAllStates(): void {
    // Reset all keyboard states
    for (const [key, state] of keys) {
        state.previous = state.current;
        state.current = false;
    }

    // Reset all mouse button states
    for (const [button, state] of mouse_buttons) {
        state.previous = state.current;
        state.current = false;
    }
}

function setupEventListeners(): void {
    if (!canvas) return;

    // Disable default touch actions on canvas (pan, zoom, etc.)
    canvas.style.touchAction = 'none';

    // Keyboard events
    window.addEventListener('keydown', (event) => {
        const key = event.code as Key;
        setKeyState(key, true, event);
        enqueueTextInput(event);
    });

    window.addEventListener('keyup', (event) => {
        const key = event.code as Key;
        setKeyState(key, false, event);
    });

    // Pointer events (unified mouse + touch + pen)
    canvas.addEventListener('pointerdown', (event) => {
        const button = event.button as MouseButton;
        updatePointerPosition(event);
        setMouseButtonState(button, true);
        // Capture pointer for reliable tracking outside canvas
        canvas!.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener('pointerup', (event) => {
        const button = event.button as MouseButton;
        updatePointerPosition(event);
        setMouseButtonState(button, false);
        canvas!.releasePointerCapture(event.pointerId);
    });

    canvas.addEventListener('pointercancel', (event) => {
        // Treat cancel like releasing all buttons
        setMouseButtonState(MouseButton.LEFT, false);
        setMouseButtonState(MouseButton.MIDDLE, false);
        setMouseButtonState(MouseButton.RIGHT, false);
    });

    canvas.addEventListener('pointermove', (event) => {
        // Process all coalesced events for full resolution input
        const coalesced = event.getCoalescedEvents();
        if (coalesced.length > 0) {
            for (let i = 0; i < coalesced.length; i++) {
                processPointerMove(coalesced[i]);
            }
        } else {
            // Fallback if getCoalescedEvents not supported
            processPointerMove(event);
        }

        // Extract the furthest predicted position for reduced perceived latency
        predicted_position[0] = 0;
        predicted_position[1] = 0;
        if (event.getPredictedEvents && canvas_rect) {
            const predicted = event.getPredictedEvents();
            if (predicted.length > 0) {
                const last = predicted[predicted.length - 1];
                predicted_position[0] = last.clientX - canvas_rect.left;
                predicted_position[1] = last.clientY - canvas_rect.top;
            }
        }
    });

    // Trackpad pan/zoom deltas (consumer decides semantics)
    canvas.addEventListener('wheel', (event) => {
        wheel_delta_x += event.deltaX;
        wheel_delta_y += event.deltaY;
        const ev: InputEvent = {
            kind: InputEventKind.MOUSE_WHEEL,
            dx: event.deltaX,
            dy: event.deltaY,
            handled: false,
        };
        input_events.push(ev);
        event.preventDefault();
    }, { passive: false });

    // Prevent context menu on right click
    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // Handle window blur to reset all input states
    window.addEventListener('blur', () => {
        resetAllStates();
    });
}

function processPointerMove(event: PointerEvent): void {
    const prev_x = mouse_position[0];
    const prev_y = mouse_position[1];
    updatePointerPosition(event);

    // Use movementX/Y if available, otherwise calculate from position delta
    let dx: number;
    let dy: number;
    if (event.movementX !== undefined) {
        dx = event.movementX;
        dy = event.movementY;
    } else {
        dx = mouse_position[0] - prev_x;
        dy = mouse_position[1] - prev_y;
    }

    mouse_delta[0] += dx;
    mouse_delta[1] += dy;

    const ev: InputEvent = {
        kind: InputEventKind.MOUSE_MOTION,
        dx,
        dy,
        x: mouse_position[0],
        y: mouse_position[1],
        handled: false,
    };
    input_events.push(ev);
}

function enqueueTextInput(event: KeyboardEvent): void {
    if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
    }
    if (event.key == null) return;
    if (event.key.length === 1) {
        text_input_events.push(event.key);
        const ev: InputEvent = {
            kind: InputEventKind.TEXT,
            text: event.key,
            handled: false,
        };
        input_events.push(ev);
    } else if (event.key === 'Enter') {
        text_input_events.push('\n');
        const ev: InputEvent = {
            kind: InputEventKind.TEXT,
            text: '\n',
            handled: false,
        };
        input_events.push(ev);
    } else if (event.key === 'Tab') {
        text_input_events.push('\t');
        const ev: InputEvent = {
            kind: InputEventKind.TEXT,
            text: '\t',
            handled: false,
        };
        input_events.push(ev);
    }
}
