import { greeting } from '@/index';

describe('New Jest Typescript Project', () => {
    it('works if set up correctly', () => {
        expect(true).toBeTruthy();
    });
    
    it('testing import', () => {
        expect(greeting()).toBe('Hello, aurospire! Welcome to the varcor project!');
    });
});
