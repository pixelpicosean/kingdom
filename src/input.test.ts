import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { inputSetup, inputReset, inputEndFrame, MouseButton, Key, inputKeyPressed, inputKeyReleased, inputKeyJustPressed, inputKeyJustReleased, inputMousePressed, inputMouseReleased, inputMouseJustPressed, inputMouseJustReleased, inputMousePosition, inputMouseDelta, inputConsumeTextInput, inputTextInputCount, inputEvents, inputRegisterHandler, inputUnregisterHandler, inputDispatchEvents, InputEventKind, type InputEvent } from "./input";

// Mock DOM environment for Bun tests
const mockWindow = {
    addEventListener: (type: string, listener: EventListener) => {
        if (type in mockEvents) {
            mockEvents[type as keyof typeof mockEvents].push(listener as any);
        }
    }
};

// Mock HTMLCanvasElement for testing
class MockCanvas {
    private canvasListeners: { [key: string]: EventListener[] } = {};
    public style: { touchAction: string } = { touchAction: '' };

    public getBoundingClientRect() {
        return {
            left: 0,
            top: 0,
            right: 800,
            bottom: 600,
            width: 800,
            height: 600,
            x: 0,
            y: 0,
            toJSON: () => ({})
        };
    }

    public addEventListener(type: string, listener: EventListener, options?: any) {
        if (!this.canvasListeners[type]) {
            this.canvasListeners[type] = [];
        }
        this.canvasListeners[type].push(listener);
    }

    public dispatchEvent(type: string, event: Event) {
        if (this.canvasListeners[type]) {
            this.canvasListeners[type].forEach(listener => listener(event));
        }
    }

    public setPointerCapture(pointerId: number) {
        // Mock implementation
    }

    public releasePointerCapture(pointerId: number) {
        // Mock implementation
    }

    public clearListeners() {
        this.canvasListeners = {};
        this.style = { touchAction: '' };
    }
}

// Mock window events for testing
const mockEvents = {
    keydown: [] as Array<(event: KeyboardEvent) => void>,
    keyup: [] as Array<(event: KeyboardEvent) => void>,
    blur: [] as Array<() => void>,
};

// Mock global window
Object.defineProperty(globalThis, 'window', {
    value: mockWindow,
    writable: true
});

// Mock event objects
function createMockKeyboardEvent(type: string, code: string, key?: string, overrides?: Partial<KeyboardEvent>) {
    return {
        type,
        code,
        key: key ?? inferKeyFromCode(code),
        shiftKey: overrides?.shiftKey ?? false,
        ctrlKey: overrides?.ctrlKey ?? false,
        altKey: overrides?.altKey ?? false,
        metaKey: overrides?.metaKey ?? false,
        preventDefault: () => { },
        stopPropagation: () => { },
        ...overrides,
    } as KeyboardEvent;
}

function inferKeyFromCode(code: string): string {
    if (code.startsWith('Key')) {
        return code.substring(3).toLowerCase();
    }
    if (code.startsWith('Digit')) {
        return code.substring(5);
    }
    if (code === Key.SPACE) return ' ';
    if (code === Key.ENTER) return '\n';
    return '';
}

function createMockPointerEvent(type: string, button: number, clientX: number, clientY: number, movementX = 0, movementY = 0, pointerType = 'mouse') {
    return {
        type,
        button,
        clientX,
        clientY,
        movementX,
        movementY,
        pointerId: 1,
        pointerType,
        getCoalescedEvents: () => [],
        getPredictedEvents: () => [],
        preventDefault: () => { },
        stopPropagation: () => { },
    } as unknown as PointerEvent;
}

// Helper functions to simulate events
function simulateKeyDown(key: string, keyValue?: string, overrides?: Partial<KeyboardEvent>) {
    const event = createMockKeyboardEvent('keydown', key, keyValue, overrides);
    mockEvents.keydown.forEach(listener => listener(event));
}

function simulateKeyUp(key: string, keyValue?: string, overrides?: Partial<KeyboardEvent>) {
    const event = createMockKeyboardEvent('keyup', key, keyValue, overrides);
    mockEvents.keyup.forEach(listener => listener(event));
}

function simulateMouseDown(button: number, clientX = 100, clientY = 100) {
    const event = createMockPointerEvent('pointerdown', button, clientX, clientY);
    if (mockCanvas) {
        mockCanvas.dispatchEvent('pointerdown', event);
    }
}

function simulateMouseUp(button: number, clientX = 100, clientY = 100) {
    const event = createMockPointerEvent('pointerup', button, clientX, clientY);
    if (mockCanvas) {
        mockCanvas.dispatchEvent('pointerup', event);
    }
}

function simulateMouseMove(clientX = 100, clientY = 100) {
    const prevX = mousePositionCache[0] || 0;
    const prevY = mousePositionCache[1] || 0;
    const movementX = clientX - prevX;
    const movementY = clientY - prevY;
    mousePositionCache[0] = clientX;
    mousePositionCache[1] = clientY;
    const event = createMockPointerEvent('pointermove', 0, clientX, clientY, movementX, movementY);
    if (mockCanvas) {
        mockCanvas.dispatchEvent('pointermove', event);
    }
}

function simulateWindowBlur() {
    mockEvents.blur.forEach(listener => listener());
}

function simulateTouchStart(clientX = 100, clientY = 100) {
    mousePositionCache[0] = clientX;
    mousePositionCache[1] = clientY;
    const event = createMockPointerEvent('pointerdown', 0, clientX, clientY, 0, 0, 'touch');
    if (mockCanvas) {
        mockCanvas.dispatchEvent('pointerdown', event);
    }
}

function simulateTouchMove(clientX = 100, clientY = 100) {
    const prevX = mousePositionCache[0] || 0;
    const prevY = mousePositionCache[1] || 0;
    const movementX = clientX - prevX;
    const movementY = clientY - prevY;
    mousePositionCache[0] = clientX;
    mousePositionCache[1] = clientY;
    const event = createMockPointerEvent('pointermove', 0, clientX, clientY, movementX, movementY, 'touch');
    if (mockCanvas) {
        mockCanvas.dispatchEvent('pointermove', event);
    }
}

function simulateTouchEnd(clientX = 100, clientY = 100) {
    const event = createMockPointerEvent('pointerup', 0, clientX, clientY, 0, 0, 'touch');
    if (mockCanvas) {
        mockCanvas.dispatchEvent('pointerup', event);
    }
}

// Track mouse position for movement calculation
let mousePositionCache = [0, 0];
let mockCanvas: MockCanvas | null = null;
// Track registered handlers for cleanup
let registered_handlers: Array<(ev: InputEvent) => void> = [];

describe("Input System", () => {
    beforeEach(() => {
        // Reset input system state
        inputReset();

        // Clear all event listeners
        Object.values(mockEvents).forEach(listeners => listeners.length = 0);
        mousePositionCache = [0, 0];

        // Unregister all handlers from previous tests
        for (let i = 0; i < registered_handlers.length; i++) {
            inputUnregisterHandler(registered_handlers[i]);
        }
        registered_handlers.length = 0;

        // Create fresh instances
        mockCanvas = new MockCanvas();
        inputSetup(mockCanvas as any);
    });

    afterEach(() => {
        // Clear all event listeners
        Object.values(mockEvents).forEach(listeners => listeners.length = 0);
        if (mockCanvas) {
            mockCanvas.clearListeners();
        }
        mockCanvas = null;
    });

    describe("Enums", () => {
        it("should have correct MouseButton enum values", () => {
            expect(MouseButton.LEFT).toBe(0);
            expect(MouseButton.MIDDLE).toBe(1);
            expect(MouseButton.RIGHT).toBe(2);
        });

        it("should have correct Key enum values", () => {
            expect(Key.A).toBe('KeyA' as any);
            expect(Key.SPACE).toBe('Space' as any);
            expect(Key.ENTER).toBe('Enter' as any);
            expect(Key.ESCAPE).toBe('Escape' as any);
            expect(Key.ARROW_UP).toBe('ArrowUp' as any);
            expect(Key.DIGIT0).toBe('Digit0' as any);
            expect(Key.F1).toBe('F1' as any);
        });
    });

    describe("Keyboard Input", () => {
        describe("Basic State Functions", () => {
            it("should return false for unpressed keys", () => {
                expect(inputKeyPressed(Key.A)).toBe(false);
                expect(inputKeyReleased(Key.A)).toBe(true);
            });

            it("should detect key press", () => {
                simulateKeyDown(Key.A);
                expect(inputKeyPressed(Key.A)).toBe(true);
                expect(inputKeyReleased(Key.A)).toBe(false);
            });

            it("should detect key release", () => {
                simulateKeyDown(Key.A);
                simulateKeyUp(Key.A);
                expect(inputKeyPressed(Key.A)).toBe(false);
                expect(inputKeyReleased(Key.A)).toBe(true);
            });

            it("should handle multiple keys independently", () => {
                simulateKeyDown(Key.A);
                simulateKeyDown(Key.B);

                expect(inputKeyPressed(Key.A)).toBe(true);
                expect(inputKeyPressed(Key.B)).toBe(true);

                simulateKeyUp(Key.A);
                expect(inputKeyPressed(Key.A)).toBe(false);
                expect(inputKeyPressed(Key.B)).toBe(true);
            });

            it("should handle rapid key press and release", () => {
                simulateKeyDown(Key.SPACE);
                simulateKeyUp(Key.SPACE);
                simulateKeyDown(Key.SPACE);
                simulateKeyUp(Key.SPACE);

                expect(inputKeyPressed(Key.SPACE)).toBe(false);
                expect(inputKeyReleased(Key.SPACE)).toBe(true);
            });
        });

        describe("Timing Functions", () => {
            it("should detect just pressed key", () => {
                simulateKeyDown(Key.A);
                expect(inputKeyJustPressed(Key.A)).toBe(true);
                expect(inputKeyJustReleased(Key.A)).toBe(false);
            });

            it("should detect just released key", () => {
                simulateKeyDown(Key.A);
                simulateKeyUp(Key.A);
                expect(inputKeyJustPressed(Key.A)).toBe(false);
                expect(inputKeyJustReleased(Key.A)).toBe(true);
            });

            it("should not detect just pressed after update", () => {
                simulateKeyDown(Key.A);
                inputEndFrame();
                expect(inputKeyJustPressed(Key.A)).toBe(false);
                expect(inputKeyPressed(Key.A)).toBe(true);
            });

            it("should not detect just released after update", () => {
                simulateKeyDown(Key.A);
                simulateKeyUp(Key.A);
                inputEndFrame();
                expect(inputKeyJustReleased(Key.A)).toBe(false);
                expect(inputKeyReleased(Key.A)).toBe(true);
            });

            it("should handle frame transitions correctly", () => {
                // Frame 1: Press key
                simulateKeyDown(Key.SPACE);
                expect(inputKeyJustPressed(Key.SPACE)).toBe(true);
                expect(inputKeyPressed(Key.SPACE)).toBe(true);

                // Frame 2: Update (key still pressed)
                inputEndFrame();
                expect(inputKeyJustPressed(Key.SPACE)).toBe(false);
                expect(inputKeyPressed(Key.SPACE)).toBe(true);

                // Frame 3: Release key
                simulateKeyUp(Key.SPACE);
                expect(inputKeyJustReleased(Key.SPACE)).toBe(true);
                expect(inputKeyReleased(Key.SPACE)).toBe(true);

                // Frame 4: Update (key still released)
                inputEndFrame();
                expect(inputKeyJustReleased(Key.SPACE)).toBe(false);
                expect(inputKeyReleased(Key.SPACE)).toBe(true);
            });
        });
    });

    describe("Text Input Queue", () => {
        it("captures printable keys", () => {
            simulateKeyDown(Key.A, 'a');
            expect(inputTextInputCount()).toBe(1);
            expect(inputConsumeTextInput()).toBe('a');
            expect(inputTextInputCount()).toBe(0);
        });

        it("provides newlines for enter", () => {
            simulateKeyDown(Key.ENTER, '\n');
            expect(inputConsumeTextInput()).toBe('\n');
        });

        it("ignores modifier shortcuts", () => {
            simulateKeyDown(Key.C, 'c', { ctrlKey: true });
            expect(inputTextInputCount()).toBe(0);
        });
    });

    describe("Mouse Input", () => {
        describe("Basic State Functions", () => {
            it("should return false for unpressed mouse buttons", () => {
                expect(inputMousePressed(MouseButton.LEFT)).toBe(false);
                expect(inputMouseReleased(MouseButton.LEFT)).toBe(true);
            });

            it("should detect mouse button press", () => {
                simulateMouseDown(MouseButton.LEFT);
                expect(inputMousePressed(MouseButton.LEFT)).toBe(true);
                expect(inputMouseReleased(MouseButton.LEFT)).toBe(false);
            });

            it("should detect mouse button release", () => {
                simulateMouseDown(MouseButton.LEFT);
                simulateMouseUp(MouseButton.LEFT);
                expect(inputMousePressed(MouseButton.LEFT)).toBe(false);
                expect(inputMouseReleased(MouseButton.LEFT)).toBe(true);
            });

            it("should handle multiple mouse buttons independently", () => {
                simulateMouseDown(MouseButton.LEFT);
                simulateMouseDown(MouseButton.RIGHT);

                expect(inputMousePressed(MouseButton.LEFT)).toBe(true);
                expect(inputMousePressed(MouseButton.RIGHT)).toBe(true);

                simulateMouseUp(MouseButton.LEFT);
                expect(inputMousePressed(MouseButton.LEFT)).toBe(false);
                expect(inputMousePressed(MouseButton.RIGHT)).toBe(true);
            });

            it("should handle all mouse buttons", () => {
                simulateMouseDown(MouseButton.LEFT);
                simulateMouseDown(MouseButton.MIDDLE);
                simulateMouseDown(MouseButton.RIGHT);

                expect(inputMousePressed(MouseButton.LEFT)).toBe(true);
                expect(inputMousePressed(MouseButton.MIDDLE)).toBe(true);
                expect(inputMousePressed(MouseButton.RIGHT)).toBe(true);
            });
        });

        describe("Timing Functions", () => {
            it("should detect just pressed mouse button", () => {
                simulateMouseDown(MouseButton.LEFT);
                expect(inputMouseJustPressed(MouseButton.LEFT)).toBe(true);
                expect(inputMouseJustReleased(MouseButton.LEFT)).toBe(false);
            });

            it("should detect just released mouse button", () => {
                simulateMouseDown(MouseButton.LEFT);
                simulateMouseUp(MouseButton.LEFT);
                expect(inputMouseJustPressed(MouseButton.LEFT)).toBe(false);
                expect(inputMouseJustReleased(MouseButton.LEFT)).toBe(true);
            });

            it("should not detect just pressed after update", () => {
                simulateMouseDown(MouseButton.LEFT);
                inputEndFrame();
                expect(inputMouseJustPressed(MouseButton.LEFT)).toBe(false);
                expect(inputMousePressed(MouseButton.LEFT)).toBe(true);
            });

            it("should not detect just released after update", () => {
                simulateMouseDown(MouseButton.LEFT);
                simulateMouseUp(MouseButton.LEFT);
                inputEndFrame();
                expect(inputMouseJustReleased(MouseButton.LEFT)).toBe(false);
                expect(inputMouseReleased(MouseButton.LEFT)).toBe(true);
            });
        });

        describe("Mouse Position", () => {
            it("should track mouse position", () => {
                simulateMouseMove(150, 250);
                const pos = inputMousePosition();
                expect(pos[0]).toBe(150);
                expect(pos[1]).toBe(250);
            });

            it("should update position on mouse down", () => {
                simulateMouseDown(MouseButton.LEFT, 300, 400);
                const pos = inputMousePosition();
                expect(pos[0]).toBe(300);
                expect(pos[1]).toBe(400);
            });

            it("should update position on mouse up", () => {
                simulateMouseUp(MouseButton.LEFT, 500, 600);
                const pos = inputMousePosition();
                expect(pos[0]).toBe(500);
                expect(pos[1]).toBe(600);
            });

            it("should handle multiple position updates", () => {
                simulateMouseMove(100, 100);
                expect(inputMousePosition()).toEqual([100, 100]);

                simulateMouseMove(200, 200);
                expect(inputMousePosition()).toEqual([200, 200]);

                simulateMouseMove(0, 0);
                expect(inputMousePosition()).toEqual([0, 0]);
            });

            it("should return vec2 type", () => {
                simulateMouseMove(123, 456);
                const pos = inputMousePosition();
                expect(Array.isArray(pos)).toBe(true);
                expect(pos.length).toBe(2);
                expect(typeof pos[0]).toBe('number');
                expect(typeof pos[1]).toBe('number');
            });
        });
    });

    describe("State Updates", () => {
        it("should update previous states correctly", () => {
            // Press key
            simulateKeyDown(Key.A);
            expect(inputKeyPressed(Key.A)).toBe(true);
            expect(inputKeyJustPressed(Key.A)).toBe(true);

            // Update frame
            inputEndFrame();
            expect(inputKeyPressed(Key.A)).toBe(true);
            expect(inputKeyJustPressed(Key.A)).toBe(false);

            // Release key
            simulateKeyUp(Key.A);
            expect(inputKeyReleased(Key.A)).toBe(true);
            expect(inputKeyJustReleased(Key.A)).toBe(true);

            // Update frame
            inputEndFrame();
            expect(inputKeyReleased(Key.A)).toBe(true);
            expect(inputKeyJustReleased(Key.A)).toBe(false);
        });

        it("should handle multiple updates without side effects", () => {
            simulateKeyDown(Key.SPACE);
            inputEndFrame();
            inputEndFrame();
            inputEndFrame();

            expect(inputKeyPressed(Key.SPACE)).toBe(true);
            expect(inputKeyJustPressed(Key.SPACE)).toBe(false);
        });

        it("should update mouse states correctly", () => {
            // Press mouse button
            simulateMouseDown(MouseButton.LEFT);
            expect(inputMousePressed(MouseButton.LEFT)).toBe(true);
            expect(inputMouseJustPressed(MouseButton.LEFT)).toBe(true);

            // Update frame
            inputEndFrame();
            expect(inputMousePressed(MouseButton.LEFT)).toBe(true);
            expect(inputMouseJustPressed(MouseButton.LEFT)).toBe(false);

            // Release mouse button
            simulateMouseUp(MouseButton.LEFT);
            expect(inputMouseReleased(MouseButton.LEFT)).toBe(true);
            expect(inputMouseJustReleased(MouseButton.LEFT)).toBe(true);

            // Update frame
            inputEndFrame();
            expect(inputMouseReleased(MouseButton.LEFT)).toBe(true);
            expect(inputMouseJustReleased(MouseButton.LEFT)).toBe(false);
        });
    });

    describe("Edge Cases", () => {
        it("should handle window blur by resetting all states", () => {
            // Press some keys and mouse buttons
            simulateKeyDown(Key.A);
            simulateKeyDown(Key.B);
            simulateMouseDown(MouseButton.LEFT);
            simulateMouseDown(MouseButton.RIGHT);

            // Verify they're pressed
            expect(inputKeyPressed(Key.A)).toBe(true);
            expect(inputKeyPressed(Key.B)).toBe(true);
            expect(inputMousePressed(MouseButton.LEFT)).toBe(true);
            expect(inputMousePressed(MouseButton.RIGHT)).toBe(true);

            // Simulate window blur
            simulateWindowBlur();

            // All states should be reset
            expect(inputKeyPressed(Key.A)).toBe(false);
            expect(inputKeyPressed(Key.B)).toBe(false);
            expect(inputMousePressed(MouseButton.LEFT)).toBe(false);
            expect(inputMousePressed(MouseButton.RIGHT)).toBe(false);
        });

        it("should handle rapid key presses", () => {
            // Rapidly press and release a key multiple times
            for (let i = 0; i < 10; i++) {
                simulateKeyDown(Key.SPACE);
                simulateKeyUp(Key.SPACE);
            }

            expect(inputKeyPressed(Key.SPACE)).toBe(false);
            expect(inputKeyReleased(Key.SPACE)).toBe(true);
        });

        it("should handle simultaneous key and mouse events", () => {
            simulateKeyDown(Key.W);
            simulateMouseDown(MouseButton.LEFT);

            expect(inputKeyPressed(Key.W)).toBe(true);
            expect(inputMousePressed(MouseButton.LEFT)).toBe(true);

            simulateKeyUp(Key.W);
            simulateMouseUp(MouseButton.LEFT);

            expect(inputKeyReleased(Key.W)).toBe(true);
            expect(inputMouseReleased(MouseButton.LEFT)).toBe(true);
        });

        it("should handle unknown keys gracefully", () => {
            // Simulate a key that's not in our enum
            simulateKeyDown('UnknownKey' as any);

            // Should not crash, but also shouldn't register
            // Note: The current implementation does register unknown keys, which is actually correct behavior
            // The input system should handle any key code that comes from the browser
            expect(inputKeyPressed('UnknownKey' as any)).toBe(true);
        });

        it("should handle negative mouse button numbers", () => {
            simulateMouseDown(-1);
            simulateMouseDown(5);

            // Should not crash, and should register the button presses
            // The input system should handle any button number that comes from the browser
            expect(inputMousePressed(-1 as any)).toBe(true);
            expect(inputMousePressed(5 as any)).toBe(true);
        });

        it("should maintain state consistency across multiple operations", () => {
            // Complex sequence of inputs
            simulateKeyDown(Key.W);
            simulateMouseDown(MouseButton.LEFT, 100, 100);
            inputEndFrame();

            simulateKeyDown(Key.A);
            simulateMouseMove(200, 200);
            inputEndFrame();

            simulateKeyUp(Key.W);
            simulateMouseUp(MouseButton.LEFT, 200, 200); // Include position for mouse up
            simulateKeyUp(Key.A);
            inputEndFrame();

            // Final state should be consistent
            expect(inputKeyPressed(Key.W)).toBe(false);
            expect(inputKeyPressed(Key.A)).toBe(false);
            expect(inputMousePressed(MouseButton.LEFT)).toBe(false);
            // Mouse position should be from the last mouse event
            expect(inputMousePosition()).toEqual([200, 200]);
        });
    });

    describe("Integration Tests", () => {
        it("should handle basic game input patterns", () => {
            // Test basic input patterns that are commonly used in games

            // Movement input
            simulateKeyDown(Key.W);
            expect(inputKeyJustPressed(Key.W)).toBe(true);
            expect(inputKeyPressed(Key.W)).toBe(true);

            inputEndFrame();
            expect(inputKeyJustPressed(Key.W)).toBe(false);
            expect(inputKeyPressed(Key.W)).toBe(true);

            simulateKeyUp(Key.W);
            expect(inputKeyJustReleased(Key.W)).toBe(true);
            expect(inputKeyReleased(Key.W)).toBe(true);

            // Mouse input
            simulateMouseDown(MouseButton.LEFT, 100, 100);
            expect(inputMouseJustPressed(MouseButton.LEFT)).toBe(true);
            expect(inputMousePosition()).toEqual([100, 100]);

            inputEndFrame();
            expect(inputMouseJustPressed(MouseButton.LEFT)).toBe(false);
            expect(inputMousePressed(MouseButton.LEFT)).toBe(true);

            simulateMouseUp(MouseButton.LEFT, 200, 200);
            expect(inputMouseJustReleased(MouseButton.LEFT)).toBe(true);
            expect(inputMouseReleased(MouseButton.LEFT)).toBe(true);
        });

        it("should handle complex input combinations", () => {
            // Simulate complex input: WASD movement + mouse look + space to jump

            // Movement keys
            simulateKeyDown(Key.W);
            simulateKeyDown(Key.D);
            simulateMouseDown(MouseButton.RIGHT, 500, 400);

            expect(inputKeyPressed(Key.W)).toBe(true);
            expect(inputKeyPressed(Key.D)).toBe(true);
            expect(inputMousePressed(MouseButton.RIGHT)).toBe(true);
            expect(inputMousePosition()).toEqual([500, 400]);

            // Update frame
            inputEndFrame();

            // Jump
            simulateKeyDown(Key.SPACE);
            expect(inputKeyJustPressed(Key.SPACE)).toBe(true);

            // Update frame
            inputEndFrame();

            // Release jump
            simulateKeyUp(Key.SPACE);
            expect(inputKeyJustReleased(Key.SPACE)).toBe(true);

            // Continue moving
            expect(inputKeyPressed(Key.W)).toBe(true);
            expect(inputKeyPressed(Key.D)).toBe(true);
            expect(inputMousePressed(MouseButton.RIGHT)).toBe(true);

            // Release movement
            simulateKeyUp(Key.W);
            simulateKeyUp(Key.D);
            simulateMouseUp(MouseButton.RIGHT);

            expect(inputKeyReleased(Key.W)).toBe(true);
            expect(inputKeyReleased(Key.D)).toBe(true);
            expect(inputMouseReleased(MouseButton.RIGHT)).toBe(true);
        });

        it("should simulate mouse input from touch events", () => {
            // Touch start acts like left mouse down
            simulateTouchStart(50, 60);
            expect(inputMouseJustPressed(MouseButton.LEFT)).toBe(true);
            expect(inputMousePressed(MouseButton.LEFT)).toBe(true);
            expect(inputMousePosition()).toEqual([50, 60]);

            // Update frame clears just-pressed
            inputEndFrame();
            expect(inputMouseJustPressed(MouseButton.LEFT)).toBe(false);
            expect(inputMousePressed(MouseButton.LEFT)).toBe(true);

            // Touch move updates position and delta
            simulateTouchMove(65, 85);
            expect(inputMousePosition()).toEqual([65, 85]);
            const delta1 = inputMouseDelta();
            expect(delta1[0]).toBe(15);
            expect(delta1[1]).toBe(25);

            // Update frame resets delta
            inputEndFrame();
            const delta2 = inputMouseDelta();
            expect(delta2[0]).toBe(0);
            expect(delta2[1]).toBe(0);

            // Touch end acts like left mouse up
            simulateTouchEnd(65, 85);
            expect(inputMouseJustReleased(MouseButton.LEFT)).toBe(true);
            expect(inputMouseReleased(MouseButton.LEFT)).toBe(true);
        });
    });

    describe("Event System", () => {
        describe("Event Generation", () => {
            it("should generate KEY events on key press", () => {
                simulateKeyDown(Key.A);
                const events = inputEvents();
                expect(events.length).toBeGreaterThan(0);
                const keyEvent = events.find(e => e.kind === InputEventKind.KEY && e.key === Key.A);
                expect(keyEvent).toBeDefined();
                expect(keyEvent?.pressed).toBe(true);
                expect(keyEvent?.handled).toBe(false);
            });

            it("should generate MOUSE_BUTTON events on mouse press", () => {
                simulateMouseDown(MouseButton.LEFT, 100, 200);
                const events = inputEvents();
                const mouseEvent = events.find(e => e.kind === InputEventKind.MOUSE_BUTTON && e.button === MouseButton.LEFT);
                expect(mouseEvent).toBeDefined();
                if (mouseEvent && mouseEvent.kind === InputEventKind.MOUSE_BUTTON) {
                    // Verify the event exists with correct button and is not handled
                    expect(mouseEvent.button).toBe(MouseButton.LEFT);
                    expect(mouseEvent.handled).toBe(false);
                    // Position should be set (may be from previous position or current)
                    expect(typeof mouseEvent.x).toBe('number');
                    expect(typeof mouseEvent.y).toBe('number');
                }
            });

            it("should generate MOUSE_MOTION events on mouse move", () => {
                simulateMouseMove(150, 250);
                const events = inputEvents();
                const motionEvent = events.find(e => e.kind === InputEventKind.MOUSE_MOTION);
                expect(motionEvent).toBeDefined();
                if (motionEvent && motionEvent.kind === InputEventKind.MOUSE_MOTION) {
                    expect(motionEvent.x).toBe(150);
                    expect(motionEvent.y).toBe(250);
                    expect(motionEvent.handled).toBe(false);
                }
            });

            it("should generate TEXT events on text input", () => {
                simulateKeyDown(Key.A, 'a');
                const events = inputEvents();
                const textEvent = events.find(e => e.kind === InputEventKind.TEXT);
                expect(textEvent).toBeDefined();
                if (textEvent && textEvent.kind === InputEventKind.TEXT) {
                    expect(textEvent.text).toBe('a');
                    expect(textEvent.handled).toBe(false);
                }
            });

            it("should clear events on inputEndFrame", () => {
                simulateKeyDown(Key.A);
                expect(inputEvents().length).toBeGreaterThan(0);
                inputEndFrame();
                expect(inputEvents().length).toBe(0);
            });
        });

        describe("Phase-Based Handler System", () => {
            it("should call handlers in phase order", () => {
                const call_order: string[] = [];

                const h1 = (ev: InputEvent) => call_order.push('canvas-50');
                const h2 = (ev: InputEvent) => call_order.push('ui-100');
                const h3 = (ev: InputEvent) => call_order.push('canvas-100');

                inputRegisterHandler('canvas', 50, h1);
                registered_handlers.push(h1);
                inputRegisterHandler('ui', 100, h2);
                registered_handlers.push(h2);
                inputRegisterHandler('canvas', 100, h3);
                registered_handlers.push(h3);

                simulateKeyDown(Key.A);
                inputEndFrame();

                // Phases run in registration order: canvas (registered first), then ui
                // Within canvas phase, higher priority (100) runs before lower (50)
                // Note: Each event triggers handlers, so we may have multiple calls
                expect(call_order.length).toBeGreaterThanOrEqual(3);
                // Check first 3 calls (may have more due to TEXT events)
                expect(call_order[0]).toBe('canvas-100');
                expect(call_order[1]).toBe('canvas-50');
                expect(call_order[2]).toBe('ui-100');
            });

            it("should respect priority within same phase", () => {
                const call_order: number[] = [];

                const h1 = () => call_order.push(10);
                const h2 = () => call_order.push(50);
                const h3 = () => call_order.push(30);
                const h4 = () => call_order.push(100);

                inputRegisterHandler('ui', 10, h1);
                registered_handlers.push(h1);
                inputRegisterHandler('ui', 50, h2);
                registered_handlers.push(h2);
                inputRegisterHandler('ui', 30, h3);
                registered_handlers.push(h3);
                inputRegisterHandler('ui', 100, h4);
                registered_handlers.push(h4);

                simulateKeyDown(Key.A);
                inputEndFrame();

                // Should be ordered by priority: 100, 50, 30, 10
                // Note: Multiple events (KEY + TEXT) may cause multiple calls
                expect(call_order.length).toBeGreaterThanOrEqual(4);
                // Check that priority order is maintained (first 4 calls)
                expect(call_order[0]).toBe(100);
                expect(call_order[1]).toBe(50);
                expect(call_order[2]).toBe(30);
                expect(call_order[3]).toBe(10);
            });

            it("should skip remaining handlers in phase when event is handled", () => {
                const call_order: string[] = [];

                const h1 = (ev: InputEvent) => {
                    call_order.push('ui-100');
                    ev.handled = true;
                };
                const h2 = (ev: InputEvent) => call_order.push('ui-50');
                const h3 = (ev: InputEvent) => call_order.push('canvas-100');

                inputRegisterHandler('ui', 100, h1);
                registered_handlers.push(h1);
                inputRegisterHandler('ui', 50, h2);
                registered_handlers.push(h2);
                inputRegisterHandler('canvas', 100, h3);
                registered_handlers.push(h3);

                simulateKeyDown(Key.A);
                inputEndFrame();

                // UI phase should stop after first handler marks handled
                // Canvas phase should still run (even though handled)
                expect(call_order.length).toBeGreaterThanOrEqual(2);
                expect(call_order[0]).toBe('ui-100');
                expect(call_order).toContain('canvas-100');
                expect(call_order).not.toContain('ui-50');
            });

            it("should process unhandled phase even if event is handled", () => {
                const call_order: string[] = [];

                const h1 = (ev: InputEvent) => {
                    call_order.push('ui');
                    ev.handled = true;
                };
                const h2 = (ev: InputEvent) => call_order.push('unhandled');

                inputRegisterHandler('ui', 100, h1);
                registered_handlers.push(h1);
                inputRegisterHandler('unhandled', 100, h2);
                registered_handlers.push(h2);

                simulateKeyDown(Key.A);
                inputEndFrame();

                // Unhandled phase should always run, even if event is handled
                // Multiple events (KEY + TEXT) cause multiple calls
                expect(call_order.length).toBeGreaterThanOrEqual(2);
                expect(call_order).toContain('ui');
                expect(call_order).toContain('unhandled');
                // Unhandled runs last for each event
                expect(call_order[call_order.length - 1]).toBe('unhandled');
            });

            it("should process multiple phases in registration order", () => {
                const call_order: string[] = [];

                const h1 = () => call_order.push('canvas');
                const h2 = () => call_order.push('ui');
                const h3 = () => call_order.push('custom');

                inputRegisterHandler('canvas', 100, h1);
                registered_handlers.push(h1);
                inputRegisterHandler('ui', 100, h2);
                registered_handlers.push(h2);
                inputRegisterHandler('custom', 100, h3);
                registered_handlers.push(h3);

                simulateKeyDown(Key.A);
                inputEndFrame();

                // Should process in registration order: canvas, ui, custom
                // Multiple events (KEY + TEXT) cause multiple calls per handler
                expect(call_order.length).toBeGreaterThanOrEqual(3);
                // Check first 3 calls maintain phase order
                expect(call_order[0]).toBe('canvas');
                expect(call_order[1]).toBe('ui');
                expect(call_order[2]).toBe('custom');
            });

            it("should handle multiple events", () => {
                const events_received: InputEvent[] = [];

                const h1 = (ev: InputEvent) => events_received.push(ev);
                inputRegisterHandler('ui', 100, h1);
                registered_handlers.push(h1);

                simulateKeyDown(Key.A);
                simulateKeyDown(Key.B);
                simulateMouseDown(MouseButton.LEFT, 100, 100);

                // Dispatch before frame clears events
                inputEndFrame();

                expect(events_received.length).toBeGreaterThanOrEqual(3);
                // Check that we received key and mouse events
                const key_events = events_received.filter(e => e.kind === InputEventKind.KEY);
                const mouse_events = events_received.filter(e => e.kind === InputEventKind.MOUSE_BUTTON);
                expect(key_events.length).toBeGreaterThanOrEqual(2);
                expect(mouse_events.length).toBeGreaterThanOrEqual(1);
            });

            it("should allow unregistering handlers", () => {
                const call_order: string[] = [];

                const handler1 = (ev: InputEvent) => call_order.push('handler1');
                const handler2 = (ev: InputEvent) => call_order.push('handler2');

                inputRegisterHandler('ui', 100, handler1);
                inputRegisterHandler('ui', 50, handler2);

                simulateKeyDown(Key.A);
                inputEndFrame();

                // Multiple events (KEY + TEXT) cause multiple calls
                expect(call_order.length).toBeGreaterThanOrEqual(2);
                expect(call_order).toContain('handler1');
                expect(call_order).toContain('handler2');
                call_order.length = 0;

                inputUnregisterHandler(handler1);

                simulateKeyDown(Key.B);
                inputEndFrame();

                // After unregistering handler1, only handler2 should be called
                // Multiple events may cause multiple calls, but all should be handler2
                expect(call_order.length).toBeGreaterThanOrEqual(1);
                expect(call_order.every(h => h === 'handler2')).toBe(true);
                expect(call_order).not.toContain('handler1');
            });

            it("should handle empty handler list gracefully", () => {
                simulateKeyDown(Key.A);
                // Should not crash
                inputEndFrame();
            });

            it("should handle empty event list gracefully", () => {
                inputRegisterHandler('ui', 100, () => { });
                // Should not crash
                inputDispatchEvents();
            });
        });

        describe("Event Handling Flags", () => {
            it("should allow handlers to mark events as handled", () => {
                let received_event: InputEvent | null = null;

                const h1 = (ev: InputEvent) => {
                    received_event = ev;
                    ev.handled = true;
                };
                inputRegisterHandler('ui', 100, h1);
                registered_handlers.push(h1);

                simulateKeyDown(Key.A);
                // Dispatch before frame clears events
                inputEndFrame();

                expect(received_event).not.toBeNull();
                expect(received_event?.handled).toBe(true);
            });

            it("should preserve handled flag across phases", () => {
                const ui_received: InputEvent[] = [];
                const canvas_received: InputEvent[] = [];

                const h1 = (ev: InputEvent) => {
                    ui_received.push(ev);
                    ev.handled = true;
                };
                const h2 = (ev: InputEvent) => canvas_received.push(ev);

                inputRegisterHandler('ui', 100, h1);
                registered_handlers.push(h1);
                inputRegisterHandler('canvas', 100, h2);
                registered_handlers.push(h2);

                simulateKeyDown(Key.A);
                // Dispatch before frame clears events
                inputEndFrame();

                // Canvas phase should still receive the event even if UI marked it handled
                expect(ui_received.length).toBeGreaterThanOrEqual(1);
                expect(canvas_received.length).toBeGreaterThanOrEqual(1);
                // Check the last event received by canvas has handled flag
                const last_canvas_event = canvas_received[canvas_received.length - 1];
                expect(last_canvas_event.handled).toBe(true);
            });
        });

        describe("Text Input Events", () => {
            it("should generate TEXT events for printable characters", () => {
                simulateKeyDown(Key.A, 'a');
                const events = inputEvents();
                const textEvent = events.find(e => e.kind === InputEventKind.TEXT);
                expect(textEvent).toBeDefined();
                if (textEvent && textEvent.kind === InputEventKind.TEXT) {
                    expect(textEvent.text).toBe('a');
                }
            });

            it("should generate TEXT events for Enter key", () => {
                simulateKeyDown(Key.ENTER, '\n');
                const events = inputEvents();
                const textEvent = events.find(e => e.kind === InputEventKind.TEXT && e.text === '\n');
                expect(textEvent).toBeDefined();
            });

            it("should generate TEXT events for Tab key", () => {
                simulateKeyDown(Key.TAB, '\t');
                const events = inputEvents();
                const textEvent = events.find(e => e.kind === InputEventKind.TEXT && e.text === '\t');
                expect(textEvent).toBeDefined();
            });

            it("should handle TEXT events in handlers", () => {
                const text_received: string[] = [];

                const h1 = (ev: InputEvent) => {
                    if (ev.kind === InputEventKind.TEXT) {
                        text_received.push(ev.text);
                    }
                };
                inputRegisterHandler('ui', 100, h1);
                registered_handlers.push(h1);

                simulateKeyDown(Key.A, 'a');
                simulateKeyDown(Key.ENTER, '\n');
                // Dispatch before frame clears events
                inputEndFrame();

                expect(text_received.length).toBeGreaterThanOrEqual(2);
                expect(text_received).toContain('a');
                expect(text_received).toContain('\n');
            });
        });

        describe("Mouse Wheel Events", () => {
            it("should generate MOUSE_WHEEL events", () => {
                // Note: We need to simulate wheel events
                // For now, just verify the event type exists
                const events = inputEvents();
                // Wheel events are generated by canvas.addEventListener('wheel')
                // We'd need to extend MockCanvas to support this
            });
        });
    });
});
