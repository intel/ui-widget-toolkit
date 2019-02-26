var SimpleBuffer = require('../../../src/core/utilities').SimpleBuffer;
var RingBuffer = require('../../../src/core/utilities').RingBuffer;

describe("Simple Buffer", function () {
    it("basic", function () {
        'use strict';
        let buffer = new SimpleBuffer();
        for (let i = 0; i < 10; ++i) {
            expect(buffer.length()).toBe(i);
            buffer.push({ x: i, y: 0 });
        }

        for (let i = 0; i < buffer.length(); ++i) {
            expect(buffer.get(i).x).toBe(i);
        }
        expect(buffer._data.length).toBe(10);
    });

    it("useInitialArray", function () {
        'use strict';

        let input = [];
        for (let i = 0; i < 20; ++i) {
            input.push({ x: i, y: 0 });
        }

        let buffer = new SimpleBuffer(input);
        for (let i = 0; i < buffer.length(); ++i) {
            expect(buffer.get(i).x).toBe(i);
        }
        expect(buffer.length()).toBe(20);
        expect(buffer._data.length).toBe(20);
    });

    it("growInitialArray", function () {
        'use strict';

        let input = [];
        for (let i = 0; i < 20; ++i) {
            input.push({ x: i, y: 0 });
        }

        let buffer = new SimpleBuffer(input);

        for (let i = 0; i < 20; ++i) {
            buffer.push({ x: i + 20, y: 0 });
        }

        for (let i = 0; i < buffer.length(); ++i) {
            expect(buffer.get(i).x).toBe(i);
        }
        expect(buffer.length()).toBe(40);
        expect(buffer._data.length).toBe(40);
    });
});

describe("Ring Buffer", function () {
    it("basic", function () {
        'use strict';
        let buffer = new RingBuffer(10);
        for (let i = 0; i < 10; ++i) {
            expect(buffer.length()).toBe(i);
            buffer.push({ x: i, y: 0 });
        }

        for (let i = 0; i < buffer.length(); ++i) {
            expect(buffer.get(i).x).toBe(i);
        }
        expect(buffer._data.length).toBe(10);
    });

    it("useRing", function () {
        'use strict';
        let buffer = new RingBuffer(10);
        for (let i = 0; i < 20; ++i) {
            if (i < 10) {
                expect(buffer.length()).toBe(i);
            } else {
                expect(buffer.length()).toBe(10);
            }
            buffer.push({ x: i, y: 0 });
        }
        for (let i = 0; i < buffer.length(); ++i) {
            expect(buffer.get(i).x).toBe(i + 10);
        }
        expect(buffer._data.length).toBe(10);
    });

    it("useRingMultipleTimes", function () {
        'use strict';
        let buffer = new RingBuffer(10);
        for (let i = 0; i < 500; ++i) {
            if (i < 10) {
                expect(buffer.length()).toBe(i);
            } else {
                expect(buffer.length()).toBe(10);
            }
            buffer.push({ x: i, y: 0 });
        }
        for (let i = 0; i < buffer.length(); ++i) {
            expect(buffer.get(i).x).toBe(i + 490);
        }
        expect(buffer._data.length).toBe(10);
    });
});

