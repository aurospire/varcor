# varcor

`varcor` is a tool for streamlined management of config values, offering normalization and type enforcement.

## Installation

To get started with varcor, install the package via npm:

`npm install varcor`

## Result
The `Result` type is used to return values or errors throught varcor.

```typescript
type ResultSuccess<T> = { success: true; value: T; };

type ResultFailure<F> = { success: false; error: F; };

type Result<T, F> = ResultSuccess<T> | ResultFailure<F>;

// Helper methods
const Result = Object.seal({
    success: <T>(value: T): ResultSuccess<T> => ({ success: true, value }),
    failure: <F>(error: F): ResultFailure<F> => ({ success: false, error })
} as const);
```

## Variables
The `Variable` class is used to create an instance of a Variable validator/transformer.

### Common Functionalities

#### Parsing Values
The primary method of the class is `parse`. This will take an optional string and return a Result of `T` or a list of error strings.

```typescript
parse(value?: string | undefined): Result<T, string[]>
```

---
Variables are Immutable - each of the following methods will create a new Variable:

#### Making Variables Optional

Marks a variable as optional. Type of variable becomes T | undefined

```typescript
.optional(): Variable<T | undefined>

// type becomes string | undefined
const optionalVar = v.string().optional(); 
```

#### Setting Default Values

Sets a default value for the variable if value is undefined.

```typescript
.defaultTo(value: T): Variable<T> 

// if value is not supplied, result in default value
const defaultVar = v.string().defaultTo("defaultValue"); 
```

#### Variable Unions with Else

Allows variable type unions

```typescript
.else<S>(variable: Variable<S>): Variable<T | S>

// type becomes string | number
const stringOrNumber = v.string().else(v.number());
```

#### Applying Transformations

Applies a custom transformation function to the variable's value. An optional targetType can be provided for documentation purposes.

```typescript
type Transformer<I, O> = (value: I) => Result<O, string[]>

.transform<S>(transform: Transformer<T, S>, type?: string): Variable<S>

// type number|undefind becomes boolean
const isOdd = v.number().optional().transform(
    value => Result.success((Math.round(value || 0) % 2) === 1)
);
```

Transformations are particularly powerful, allowing for value conversion, additional validation and type conversion if necessary.

---
### Typed Variables and Helper Functions
**varcor** provides a series of helper functions designed to define and enforce the types and constraints of your environment variables:

#### Boolean Variables

Define boolean variables, interpreting various string values (`'true'`, `'false'`, `'1'`, `'0'`) as booleans.

```typescript
import { v } from 'varcor';

const DEBUG = v.boolean();
```

#### Number Variables

Define numeric environment variables, with support for minimum and maximum constraints.

```typescript
import { v } from 'varcor';

const PORT = v.number().min(3000).max(9000);
```

#### Integer Variables

Similar to number variables, but specifically for integer values.

```typescript
import { v } from 'varcor';

const RETRY_LIMIT = v.integer().min(1).max(5);
```

#### String Variables

Define string variables, with optional validators or regex pattern matching.

```typescript
import { v } from 'varcor';

const DATABASE_URL = v.string().regex(/mongodb:\/\/.+/, 'mongodb Url');

const MAIN_URL = v.string().url();

const EMAIL = v.string().email();

const UUID = v.string().uuid();

const PASSWORD = v.string().validate(value => 
    value.length > 10 && value.length < 20 
    ? Result.success(value)
    : Result.failure(['must be between 10 and 20 characters.'])
)
```

#### Enum Variables

Define enumerated string variables, ensuring the value matches one of the predefined options.

```typescript
import { v } from 'varcor';

const ENVIRONMENT = v.enum().value('development').value('production').value('test');
```

#### Date and Time Variables

Define variables for date and time, supporting a generic DateTime object, and both JavaScript `Date` objects and `luxon` DateTime objects.

Types:
```typescript
type DateType = 'date' | 'time' | 'datetime' | 'timeTz' | 'datetimeTz';

type DateObject = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    ms: number;
    tz: TimeZone;
};

// `from` defaults to DateTimeTz
v.dateobj:(from?: DateType): Variable<DateObject>

v.jsdate:(from?: DateType): Variable<Date>

v.luxdate:(from?: DateType): Variable<DateTime>

```

Usage:
```typescript
import { v } from 'varcor';

const OBJ_DATE = v.dateobj('datetimeTz')
const JS_DATE = v.jsdate('date');
const LUX_DATE = v.luxdate('time');
```

#### JSON Variables

Parse and validate JSON formatted string variables.

Types:
```typescript
type JsonValidator<T> = (data: any) => Result<T, string[]>;

v.json<T = any>(validator?: JsonValidator<T>): Variable<T>
```

Usage:
```typescript
import { v } from 'varcor';

const CONFIG = v.json().validate();
```

#### Zod Schema Validation

Leverage `zod` schemas for complex JSON object validation.

```typescript
import { z } from 'zod';
import { v } from 'varcor';

const MY_SCHEMA = z.object({ key: z.string() });
const CONFIG = v.tson(MY_SCHEMA);
```

## DataObject and DataObjectBuilder Usage

`DataObject` and `DataObjectBuilder` are utilities for managing  the configuration data within your applications. Here's how to use them effectively:

### DataObject

`DataObject` is a simple key-value mapping where values are either strings or `undefined`. 

```typescript
type DataObject = { [key: string]: string | undefined; };
```

### DataObjectBuilder

The `DataObjectBuilder` class provides an interface to incrementally build a `DataObject`. It supports adding data from environment variables, JSON strings, `.env` files, and more.
DataObjectBuilder is immutable, so each method creates a new DataObjectBuilder.

#### Basic Usage

1. **Creating a New DataObjectBuilder Instance**

   To start building a new `DataObject`, simply instantiate `DataObjectBuilder`:

   ```typescript
   import { DataObjectBuilder } from './DataObjectBuilder';

   let builder = v.data.new(); // or new DataObjectBuilder()
   ```

2. **Adding Environment Variables**

   Easily include all current environment variables into your data object:

   ```typescript
   builder = builder.addEnv();
   ```
   
   You can additional start off with env using the helper method `v.data.env`
   
   ```typescript
   let builder = v.data.env();
   ```

3. **Adding Data from an Object**

   Incorporate configuration data from a regular JavaScript object. Non-string values are automatically converted to JSON strings:

   ```typescript
   const appConfig = {
     port: 8080,
     name: "MyApp",
     features: { logging: true, debugMode: false },
   };

   builder = builder.addObject(appConfig);
   ```

    You can additional start off with an object using the helper method `v.data.obj`
   
   ```typescript
   const builder = v.data.obj({
     port: 8080,
     name: "MyApp",
     features: { logging: true, debugMode: false },
   });
   ```
5. **Adding Data from a JSON String**

   Parse a JSON string and include its data:

   ```typescript
   const jsonString = '{"apiUrl": "https://api.example.com", "timeout": 5000}';
   builder = builder.addJsonFormat(jsonString);
   ```

    You can additional start off with a JSON string using the helper method `v.data.json`
   
   ```typescript
   const builder = v.data.json('{"apiUrl": "https://api.example.com", "timeout": 5000}');
   ```

4. **Adding Data from a .env Format**

   If you have a `.env` formatted string containing environment variables, you can parse and add those variables:

   ```typescript
   const envFormat = `
   # Variables
   
   API_URL=http://api.example.com;
   
   TIMEOUT="5000";
   `
   builder = builder.addDotEnvFormat(envFormat);
   ```

5. **File Helpers**
    `DataObjectBuilder` has two methods that allow importing from `.env` and `json` files with the following signature

    - `path`: The path of the file to import
    - `when`: Conditional, if condition is `false` - skips adding the file content. Defaults to `true`
    - `optional`: If `false`, throws an error if the file does not exist. Defaults to `true`
    ```typescript
    .addJsonFile(path: string, when: boolean = true, optional: boolean = true);

    .addDotEnvFile(path: string, when: boolean = true, optional: boolean = true);
    
    //example

    builder = builder
        .addEnvFile('./production.env', process.env.NODE_ENV === 'production');
        .addEnvFile('./development.env', process.env.NODE_ENV === 'development');
    ```

6. **Chaining**
    
    As `DataObjectBuilder` methods return a new builder instance, allowing for method chaining:

    ```typescript
    const finalDataObject = new DataObjectBuilder()
        .addEnv()
        .addObject(appConfig)
        .addDotEnvFile('./.env')
        .toDataObject();

    console.log(finalDataObject);
    ```

7. **Finalizing and Retrieving the DataObject**

   Once you've added all your data sources, finalize the builder to get your `DataObject`:

   ```typescript
   const finalDataObject: DataObject = builder.toDataObject();
   
   console.log(finalDataObject);
   ```

## Settings

The `Settings` class is the centerpiece of varcor, tying all the individual pieces together into a cohesive system for managing application settings. It leverages the variables defined using varcor's helper functions, providing a structured and type-safe approach to parsing, validating, and accessing configuration data from various sources.

### Overview

The `Settings` class allows developers to define a schema of expected environment variables using the previously described variable helpers (`number`, `string`, `boolean`, etc.). This schema is then used to parse and validate the actual environment variables, ensuring they meet the specified criteria (type, presence, value constraints) before the application consumes them.

### Defining Settings

To define your application's settings, you create a new instance of the `Settings` class, passing in an object that maps setting names to their corresponding variables:

```typescript
import { v } from 'varcor';

const appSettings = v.settings({
  PORT: v.number().min(1024).max(65535).defaultTo(3000),
  DATABASE_URL: v.string(),
  FEATURE_FLAG: v.boolean().optional()
});
```

In this example, `PORT` is expected to be a number between 1024 and 65535 with a default of 3000 if not specified, `DATABASE_URL` is a required string, and `FEATURE_FLAG` is an optional boolean.

### Parsing and Accessing Settings

Once defined, you can parse and access your settings from the environment or other data sources using the `parseValues` method. This method returns an object containing the parsed settings, throwing an error if any variable fails to meet its defined criteria:

```typescript
try {
  const parsedSettings = appSettings.parseValues(process.env);
  console.log('Configuration loaded successfully:', parsedSettings);
} catch (error) {
  console.error('Failed to load configuration:', error);
}
```

The `parseValues` method ensures that all settings are validated according to their definitions. If validation passes, you get a type-safe and easily accessible configuration object. If validation fails, the error provides detailed information about which settings were invalid and why.