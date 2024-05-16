import { DateObject, JsonValidator, Result, Variable, v } from "@";
import { util, z } from "zod";

describe('Variable', () => {
    it('should test immutability', () => {
        const v0: Variable<number> = new Variable<number>();
        const v1 = v0.optional();
        const v2 = v1.default(10);
        const v3 = v0.from('NAME');

        // Immutability checks        
        expect(v0.isOptional).toEqual(false);
        expect(v1.isOptional).toEqual(true);
        expect(v2.isOptional).toEqual(false);
        expect(v3.isOptional).toEqual(false);

        expect(v0.defaultTo).toEqual(undefined);
        expect(v1.defaultTo).toEqual(undefined);
        expect(v2.defaultTo).toEqual(10);
        expect(v3.defaultTo).toEqual(undefined);

        expect(v0.name).toEqual(undefined);
        expect(v1.name).toEqual(undefined);
        expect(v2.name).toEqual(undefined);
        expect(v3.name).toEqual('NAME');
    });

    it('should test .required method', () => {
        const v0 = new Variable();

        // .required method tests
        expect(v0.parse().success).toEqual(false);
        expect(v0.parse('').success).toEqual(false);
    });

    it('should test .optional method', () => {
        const v0 = new Variable().optional();

        // .optional method tests
        expect(v0.parse()).toEqual(Result.success(undefined));
        expect(v0.parse('').success).toEqual(false);
    });

    it('should test .defaultTo method', () => {
        const v0 = new Variable<number>().default(10);

        // .defaultTo method tests
        expect(v0.parse()).toEqual(Result.success(10));
        expect(v0.parse('').success).toEqual(false);
    });

    it('should test .name method', () => {
        const v0 = new Variable<number>().from('A');
        const v1 = v0.transform(value => Result.success(Boolean(value)));
        const v2 = v1.from('B');
        const v3 = v2.else(v0.from('C'));
        const v4 = v3.from('D');

        expect(v0.name).toBe('A');
        expect(v1.name).toBe('A');
        expect(v2.name).toBe('B');
        expect(v3.name).toBe('B');
        expect(v4.name).toBe('D');
    });
});

describe('BooleanVariable', () => {
    const v0 = v.boolean();

    it('should parse true values', () => {

        expect(v0.parse('t')).toEqual(Result.success(true));
        expect(v0.parse('true')).toEqual(Result.success(true));
        expect(v0.parse('1')).toEqual(Result.success(true));
    });

    it('should parse false values', () => {
        expect(v0.parse('f')).toEqual(Result.success(false));
        expect(v0.parse('false')).toEqual(Result.success(false));
        expect(v0.parse('0')).toEqual(Result.success(false));
    });

    it('should fail to parse invalid boolean values', () => {

        expect(v0.parse('2').success).toEqual(false);
    });
});

describe('NumberVariable', () => {
    const v1 = v.number();

    it('should parse valid numbers', () => {
        expect(v1.parse('1')).toEqual(Result.success(1));
        expect(v1.parse('1.23')).toEqual(Result.success(1.23));
    });

    it('should fail to parse invalid numbers', () => {
        expect(v1.parse('asb').success).toEqual(false);
        expect(v1.parse('')).toEqual(Result.failure(['must be a number']));
    });

    it('should apply min constraint', () => {
        const v2 = v1.min(5);

        expect(v2.parse('6')).toEqual(Result.success(6));
        expect(v2.parse('4').success).toEqual(false);
    });

    it('should apply max constraint', () => {
        const v3 = v1.max(10);

        expect(v3.parse('9')).toEqual(Result.success(9));
        expect(v3.parse('11').success).toEqual(false);
    });

    it('should apply min and max constraints', () => {
        const v4 = v1.min(5).max(10);

        expect(v4.parse('7')).toEqual(Result.success(7));
        expect(v4.parse('4').success).toEqual(false);
        expect(v4.parse('11').success).toEqual(false);
    });
});

describe('IntegerVariable', () => {
    const v1 = v.integer();

    it('should parse valid integers', () => {
        expect(v1.parse('123')).toEqual(Result.success(123));
        expect(v1.parse('0b1101')).toEqual(Result.success(13)); // Binary representation
        expect(v1.parse('0x1A')).toEqual(Result.success(26));   // Hexadecimal representation
    });

    it('should fail to parse invalid integers', () => {
        expect(v1.parse('12.34').success).toEqual(false);
        expect(v1.parse('abc').success).toEqual(false);
    });

    it('should apply min constraint', () => {
        const v2 = v1.min(5);

        expect(v2.parse('6')).toEqual(Result.success(6));
        expect(v2.parse('4').success).toEqual(false);
    });

    it('should apply max constraint', () => {
        const v3 = v1.max(10);

        expect(v3.parse('9')).toEqual(Result.success(9));
        expect(v3.parse('11').success).toEqual(false);
    });

    it('should apply min and max constraints', () => {
        const v4 = v1.min(5).max(10);

        expect(v4.parse('7')).toEqual(Result.success(7));
        expect(v4.parse('4').success).toEqual(false);
        expect(v4.parse('11').success).toEqual(false);
    });
});

describe('StringVariable', () => {
    const v1 = v.string();

    it('should parse valid strings without validators', () => {
        expect(v1.parse('hello')).toEqual(Result.success('hello'));
        expect(v1.parse('123')).toEqual(Result.success('123'));
    });

    it('should apply custom validators', () => {
        const isUppercase = (value: string) => {
            return value === value.toUpperCase()
                ? Result.success(value)
                : Result.failure(['must be uppercase']);
        };

        function hasDigits(value: string) {
            return /\d/.test(value)
                ? Result.success(value)
                : Result.failure(['must contain digits']);
        };

        const v2 = v1.validate(isUppercase, 'isUpperCase').validate(hasDigits, 'hasDigits');

        expect(v2.parse('HELLO123')).toEqual(Result.success('HELLO123'));
        expect(v2.parse('123')).toEqual(Result.success('123'));
        expect(v2.parse('!@#')).toEqual(Result.success('!@#'));
        expect(v2.parse('!@#a')).toEqual(Result.failure(['must be uppercase', 'must contain digits']));
        expect(v2.parse('hello')).toEqual(Result.failure(['must be uppercase', 'must contain digits']));
    });

    it('should apply regex validators', () => {
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        const noWhitespaceRegex = /^\S+$/;

        const v3 = v1.regex(alphanumericRegex, 'AlphaNumeric').regex(noWhitespaceRegex);

        expect(v3.parse('Hello123')).toEqual(Result.success('Hello123'));
        expect(v3.parse('with space').success).toEqual(false);
        expect(v3.parse('special characters!').success).toEqual(false);
    });

    it('should validate UUIDs', () => {
        const vUUID = v1.uuid();

        expect(vUUID.parse('550e8400-e29b-41d4-a716-446655440000')).toEqual(Result.success('550e8400-e29b-41d4-a716-446655440000'));
        expect(vUUID.parse('invalid-uuid')).toEqual(Result.failure(['must be a uuid']));
    });

    it('should validate email addresses', () => {
        const vEmail = v1.email();

        expect(vEmail.parse('example@example.com')).toEqual(Result.success('example@example.com'));
        expect(vEmail.parse('invalid-email')).toEqual(Result.failure(['must be an email']));
    });
});

describe('EnumVariable', () => {

    it('should parse literals', () => {
        const v1 = v.literal('ORANGE');
        const v2 = v.literal('ORANGE').insensitive();

        expect(v1.parse('orange').success).toBe(false);
        expect(v1.parse('ORANGE').success).toBe(true);
        expect(v2.parse('orange')).toEqual(Result.success('ORANGE'));
        expect(v2.parse('ORANGE')).toEqual(Result.success('ORANGE'));
    });

    it('should parse valid enum values', () => {
        const v1 = v.enum().value('red').value('green').value('blue');

        expect(v1.parse('red')).toEqual(Result.success('red'));
        expect(v1.parse('GREEN').success).toEqual(false);   // Case-sensitive by default
        expect(v1.parse('Blue').success).toEqual(false);    // Case-sensitive by default        
    });

    it('should fail to parse invalid enum values', () => {
        const v2 = v.enum().value('apple').value('orange').value('banana');

        expect(v2.parse('grape').success).toEqual(false);
        expect(v2.parse('').success).toEqual(false);
    });

    it('should handle case-insensitive enum values', () => {
        const v3 = v.enum().value('dog').value('cat').value('fish').insensitive();

        expect(v3.parse('Cat')).toEqual(Result.success('cat'));
        expect(v3.parse('FISH')).toEqual(Result.success('fish'));
        expect(v3.parse('parrot').success).toEqual(false);
    });

    it('should handle case-sensitive enum values', () => {
        const v4 = v.enum().value('car').value('bus').value('train').sensitive();

        expect(v4.parse('train')).toEqual(Result.success('train'));
        expect(v4.parse('BuS').success).toEqual(false);
        expect(v4.parse('bicycle').success).toEqual(false);
    });
});

describe('DateObjectVariable', () => {
    const v1 = v.dateobj();

    it('should parse valid date objects in default format', () => {
        expect(v1.parse('2022-01-09T11:12:34.939')).toEqual(DateObject.from({ year: 2022, month: 1, day: 9, hour: 11, minute: 12, second: 34, ms: 939 }));
        expect(v1.parse('2022-01-09 11:12:34.939')).toEqual(DateObject.from({ year: 2022, month: 1, day: 9, hour: 11, minute: 12, second: 34, ms: 939 }));

        expect(v1.parse('2022-01-09 11:12Z')).toEqual(DateObject.from({ year: 2022, month: 1, day: 9, hour: 11, minute: 12, tzutc: 'Z' }));
        expect(v1.parse('2022-01-09 11:12:34Z')).toEqual(DateObject.from({ year: 2022, month: 1, day: 9, hour: 11, minute: 12, second: 34, tzutc: 'Z' }));
        expect(v1.parse('2022-01-09 11:12:34.939Z')).toEqual(DateObject.from({ year: 2022, month: 1, day: 9, hour: 11, minute: 12, second: 34, ms: 939, tzutc: 'Z' }));
    });

    it('should fail to parse invalid date objects', () => {
        expect(v1.parse('invalid').success).toEqual(false);
        expect(v1.parse('2022-13-09').success).toEqual(false);
        expect(v1.parse('2022-01-32').success).toEqual(false);
        expect(v1.parse('2022-01-09 25:30').success).toEqual(false);
        expect(v1.parse('2022-01-09 12:30:70').success).toEqual(false);
    });

    it('should parse valid date objects in custom format', () => {
        const customFormat = /^(?<year>\d{4})\-(?<month>\d{2})\-(?<day>\d{2}) (?<hour>\d{2}):(?<minute>\d{2})$/;

        const v2 = v1.format(customFormat, true);

        expect(v2.parse('2022-01-09 12:30')).toEqual(DateObject.from({ year: 2022, month: 1, day: 9, hour: 12, minute: 30 }));
    });

    it('should fail to parse date objects with custom format', () => {
        const customFormat = /^(?<year>\d{4})\-(?<month>\d{2})\-(?<day>\d{2}) (?<hour>\d{2}):(?<minute>\d{2})$/;
        const v3 = v1.format(customFormat, true);

        expect(v3.parse('2022-01-09').success).toEqual(false);
        expect(v3.parse('2022-01-09 12:30:45').success).toEqual(false);
    });

    it('should ensure date objects in "date" format', () => {
        const v4 = v.dateobj('date');

        expect(v4.parse('2022')).toEqual(DateObject.from({ year: 2022 }));
        expect(v4.parse('2022-01')).toEqual(DateObject.from({ year: 2022, month: 1 }));
        expect(v4.parse('2022-01-09')).toEqual(DateObject.from({ year: 2022, month: 1, day: 9 }));

        expect(v4.parse('2022-01-09 12:30:45').success).toEqual(false);
    });
});

describe('DateVariable', () => {
    const v0 = v.jsdate(); // Using the v.date alias

    it('should parse valid date objects', () => {
        expect(v0.parse('2022-01-09')).toEqual(Result.success(new Date(2022, 0, 9, 0, 0, 0, 0)));
        expect(v0.parse('2022-01-09 12:30')).toEqual(Result.success(new Date(2022, 0, 9, 12, 30, 0, 0)));
    });

    it('should fail to parse invalid date objects', () => {
        expect(v0.parse('invalid').success).toEqual(false);
        expect(v0.parse('2022-13-09').success).toEqual(false);
        expect(v0.parse('2022-01-32').success).toEqual(false);
        expect(v0.parse('2022-01-09 25:30').success).toEqual(false);
        expect(v0.parse('2022-01-09 12:30:70').success).toEqual(false);
    });
});

describe('JsonVariable', () => {
    const validJsonString = '{"name": "John", "age": 25}';
    const invalidJsonString = 'invalid-json-string';

    describe('jsonVar', () => {
        it('should parse valid JSON string without validator', () => {
            const v1 = v.json();

            expect(v1.parse(validJsonString)).toEqual(Result.success(JSON.parse(validJsonString)));
        });

        it('should fail to parse invalid JSON string without validator', () => {
            const v2 = v.json();

            expect(v2.parse(invalidJsonString).success).toEqual(false);
        });

        it('should parse valid JSON string with custom validator', () => {
            const validator = (data: any) => {
                if (data && data.name && typeof data.age === 'number') {
                    return Result.success(data);
                } else {
                    return Result.failure(['Invalid JSON structure']);
                }
            };

            const v3 = v.json(validator);

            expect(v3.parse(validJsonString)).toEqual(Result.success(JSON.parse(validJsonString)));
        });

        it('should fail to parse invalid JSON string with custom validator', () => {
            const validator = (data: any) => {
                if (data && data.name && typeof data.age === 'number') {
                    return Result.success(data);
                } else {
                    return Result.failure(['Invalid JSON structure']);
                }
            };

            const v4 = v.json(validator);

            expect(v4.parse(invalidJsonString).success).toEqual(false);
        });
    });

    describe('tsonVar', () => {
        const zodType = z.object({
            name: z.string(),
            age: z.number(),
        });

        const zodValidator = (data: any) => {
            const result = zodType.safeParse(data);

            if (result.success)
                return Result.success(result.data);
            else
                return Result.failure(result.error.issues.map(issue => issue.message));

        };

        it('should parse valid JSON string with ZodType validator', () => {

            const v5 = v.json(zodValidator);

            expect(v5.parse(validJsonString)).toEqual(Result.success(JSON.parse(validJsonString)));
        });

        it('should fail to parse invalid JSON string with ZodType validator', () => {
            const zodType = z.object({
                name: z.string(),
                age: z.number(),
            });

            const v6 = v.json(zodValidator);

            expect(v6.parse(invalidJsonString).success).toEqual(false);
        });
    });
});