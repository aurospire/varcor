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

            // mockfs.existsSync.mockReturnValueOnce(true);

            // mockfs.readFileSync.mockReturnValueOnce(json);

            let builder = new DataObjectBuilder();

            builder = builder.addJsonFile(filePath);

            expect(builder.toDataObject()).toEqual(data);
        });

        test('missing true condition required file', () => {
            // mockfs.existsSync.mockReturnValueOnce(false);

            let builder = new DataObjectBuilder();

            expect(() => builder.addJsonFile(filePath, true, false)).toThrow();
        });

        test('missing false condition required file', () => {
            // mockfs.existsSync.mockReturnValueOnce(false);

            let builder = new DataObjectBuilder();

            expect(() => builder.addJsonFile(filePath, false, false)).not.toThrow();
        });

        test('missing true condition optional file', () => {
            // mockfs.existsSync.mockReturnValueOnce(false);

            let builder = new DataObjectBuilder();

            expect(() => builder.addJsonFile(filePath, true, true)).not.toThrow();
        });

        test('missing false condition optional file', () => {
            // mockfs.existsSync.mockReturnValueOnce(false);

            let builder = new DataObjectBuilder();

            expect(() => builder.addJsonFile(filePath, false, true)).not.toThrow();
        });
    });
    describe('.addDotEnvFile', () => {
        const filePath = '.env';

        test('existing file', () => {
            //             const data = { key1: 'value1', key2: 'value2' };

            //             const dotenv = `
            // key1=value1
            // key2=value2
            // `;
            //             // mockfs.existsSync.mockReturnValueOnce(true);

            //             // mockfs.readFileSync.mockReturnValueOnce(dotenv);

            //             let builder = new DataObjectBuilder();

            //             const result = builder.addDotEnvFile(filePath);

            //             console.log('RESULT === BUILDER', result === builder);

            //             expect(result.toDataObject()).toEqual(data);
        });

        test('missing true condition required file', () => {
            // mockfs.existsSync.mockReturnValueOnce(false);

            let builder = new DataObjectBuilder();

            expect(() => builder.addDotEnvFile(filePath, true, false)).toThrow();
        });

        test('missing false condition required file', () => {
            // mockfs.existsSync.mockReturnValueOnce(false);

            let builder = new DataObjectBuilder();

            expect(() => builder.addDotEnvFile(filePath, false, false)).not.toThrow();
        });

        test('missing true condition optional file', () => {
            // mockfs.existsSync.mockReturnValueOnce(false);

            let builder = new DataObjectBuilder();

            expect(() => builder.addDotEnvFile(filePath, true, true)).not.toThrow();
        });

        test('missing false condition optional file', () => {
            // mockfs.existsSync.mockReturnValueOnce(false);

            let builder = new DataObjectBuilder();

            expect(() => builder.addDotEnvFile(filePath, false, true)).not.toThrow();
        });
    });


    // test('Read and parse .env file', () => {
    //     const filePath = '.env';
    //     const fileContent = 'key1=value1\nkey2=value2';
    //     jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
    //     jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(fileContent);

    //     const result = builder.addDotEnvFile(filePath).toDataObject();

    //     expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    // });

    // test('Read and parse JSON file - file does not exist', () => {
    //     const filePath = 'nonexistent.json';
    //     jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);

    //     expect(() => builder.addJsonFile(filePath, true, true).toDataObject()).not.toThrow();
    // });

    // test('Read and parse .env file - file does not exist', () => {
    //     const filePath = 'nonexistent.env';
    //     jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);

    //     expect(() => builder.addDotEnvFile(filePath, true, true).toDataObject()).not.toThrow();
    // });

    // test('Read and parse JSON file - file missing and mustExist is true', () => {
    //     const filePath = 'nonexistent.json';
    //     jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);

    //     expect(() => builder.addJsonFile(filePath, true, false).toDataObject()).toThrowError('Missing File nonexistent.json');
    // });

    // test('Read and parse .env file - file missing and mustExist is true', () => {
    //     const filePath = 'nonexistent.env';
    //     jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);

    //     expect(() => builder.addDotEnvFile(filePath, true, false).toDataObject()).toThrowError('Missing File nonexistent.env');
    // });
});
