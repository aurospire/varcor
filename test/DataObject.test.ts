import nodefs from 'fs';
import { DataObjectBuilder } from '@/data';

describe('DataObjectBuilder', () => {

    test('Immutability', () => {
        const data1 = { key1: 'value1' };
        const data2 = { key2: 'value2' };

        let builder1 = new DataObjectBuilder();
        let builder2 = builder1.addDataObject(data1);
        let builder3 = builder1.addDataObject(data2);
        let builder4 = builder2.addDataObject(data2);

        expect(builder1.toDataObject()).toEqual({});
        expect(builder2.toDataObject()).toEqual(data1);
        expect(builder3.toDataObject()).toEqual(data2);
        expect(builder4.toDataObject()).toEqual({ ...data1, ...data2 });
    });

    test('.addDataObject', () => {
        const data = { key1: 'value1', key2: 'value2' };

        let builder = new DataObjectBuilder();

        builder = builder.addDataObject(data);

        expect(builder.toDataObject()).toEqual(data);
    });

    test('.addEnv', () => {
        let builder = new DataObjectBuilder();

        builder = builder.addEnv();

        expect(builder.toDataObject()).toEqual(process.env);
    });

    test('.addObject', () => {
        const data = { key1: 10, key2: true };

        const expected = { key1: '10', key2: 'true' };

        let builder = new DataObjectBuilder();

        builder = builder.addObject(data);

        expect(builder.toDataObject()).toEqual(expected);
    });

    test('.addJsonFormat', () => {
        const data = { key1: 'value1', key2: 'value2' };
        const json = JSON.stringify(data);

        let builder = new DataObjectBuilder();

        builder = builder.addJsonFormat(json);

        expect(builder.toDataObject()).toEqual(data);
    });

    test('.addDotEnvFormat', () => {
        const envString = `
KEY1=value1
KEY2=value2
`;
        const data = { KEY1: 'value1', KEY2: 'value2' };

        let builder = new DataObjectBuilder();

        builder = builder.addDotEnvFormat(envString);

        expect(builder.toDataObject()).toEqual(data);
    });

    describe('.addJsonFile', () => {
        const filePath = 'test.json';

        test('existing file', () => {
            const data = { key1: 'value1', key2: 'value2' };

            const json = JSON.stringify(data);

            let builder = new DataObjectBuilder();

            builder = builder.addJsonFile(filePath, { fileExists: () => true, readFile: () => json });

            expect(builder.toDataObject()).toEqual(data);
        });

        test('missing true condition required file', () => {
            let builder = new DataObjectBuilder();

            expect(() => builder.addJsonFile(filePath, { fileExists: () => false, when: true, optional: false })).toThrow();
        });

        test('missing false condition required file', () => {
            let builder = new DataObjectBuilder();

            expect(() => builder.addJsonFile(filePath, { fileExists: () => false, when: false, optional: false })).not.toThrow();
        });

        test('missing true condition optional file', () => {
            let builder = new DataObjectBuilder();

            expect(() => builder.addJsonFile(filePath, { fileExists: () => false, when: true, optional: true })).not.toThrow();
        });

        test('missing false condition optional file', () => {
            let builder = new DataObjectBuilder();

            expect(() => builder.addJsonFile(filePath, { fileExists: () => false, when: false, optional: true })).not.toThrow();
        });
    });

    describe('.addDotEnvFile', () => {
        const filePath = '.env';

        test('existing file', () => {
            const data = { key1: 'value1', key2: 'value2' };

            const dotenv = `
            key1=value1
            key2=value2
            `;

            let builder = new DataObjectBuilder();

            builder = builder.addDotEnvFile(filePath, { fileExists: () => true, readFile: () => dotenv });

            expect(builder.toDataObject()).toEqual(data);
        });

        test('missing true condition required file', () => {
            let builder = new DataObjectBuilder();

            expect(() => builder.addDotEnvFile(filePath, { fileExists: () => false, when: true, optional: false })).toThrow();
        });

        test('missing false condition required file', () => {
            let builder = new DataObjectBuilder();

            expect(() => builder.addDotEnvFile(filePath, { fileExists: () => false, when: false, optional: false })).not.toThrow();
        });

        test('missing true condition optional file', () => {
            let builder = new DataObjectBuilder();

            expect(() => builder.addDotEnvFile(filePath, { fileExists: () => false, when: true, optional: true })).not.toThrow();
        });

        test('missing false condition optional file', () => {
            let builder = new DataObjectBuilder();

            expect(() => builder.addDotEnvFile(filePath, { fileExists: () => false, when: false, optional: true })).not.toThrow();
        });
    });
});
