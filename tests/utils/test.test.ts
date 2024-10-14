const sum = (num1: number, num2: number): number =>{
    return num1 + num2;
}

import { describe, test, expect } from "@jest/globals"

describe('Sum function', () =>{
    test('Returns correct value', () =>{
        expect(sum(2, 3)).toEqual(5)
    })
})
