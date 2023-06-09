# IOCC

Simple class dependency injection library for Typescript

## Table of Contents  

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
	- [Container Initialization](#container-initialization)
	- [Dependency Registration](#dependency-registration)
	- [Dependency Resolution](#dependency-resolution)
	- [Protection against captive dependencies](#protection-against-captive-dependencies)
- [FAQ](#faq)

## Features

- Multiple container support
- Injection using type hinting & decorators
- Support singleton and transient dependencies
- Run on both browser and server
- Zero dependencies except `reflect-metadata`
- Protection against [captive dependencies](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines#captive-dependency)

## Installation

This library uses `reflect-metadata` for dependency resolution, so you have to install it also.

```bash
npm install reflect-metadata
npm install iocc
```

## Quick Start

Import the `reflect-metadata` library on the project entry point.

```typescript
// index.ts

import "reflect-metadata";
```

Declare and register some dependencies

```typescript
import { Singleton, Transient } from "iocc";

@Singleton()
class BookService {}

@Transient()
class ShelfService {
	public constructor(
		private readonly bookService: BookService,
	) {}
}

@Transient()
class LibraryService {
	public constructor(
		private readonly shelfService: ShelfService,
	) {}
}
```

Resolve them anywhere

```typescript
import { Container, IContainer } from "iocc";

const container: IContainer = Container.of();

const libraryService: LibraryService = container.resolve(LibraryService);
```

## Documentation

### Container Initialization

Container is initialized in two ways:

#### Explicitly initializing via container factory:

Container can be initialized using the factory function `Container.of()`:

```typescript
import { Container, IContainer } from "iocc";

const defaultContainer: IContainer = Container.of(); // Default container instance

const TestContainerIdentifier: symbol = Symbol("TEST_CONTAINER");
const container: IContainer = Container.of(TestContainerIdentifier); // Test container instance
```

These two instances of `IContainer` are separated and contain their own dependencies. No dependency from one container can interact or use dependency from the other container.

#### Using `Singleton` or `Transient` decorators:

Container can be also be initialized using the injection decorators:

```typescript
import { Container, IContainer, Singleton, Transient } from "iocc";

// New default container is initialized and "Library" is registered
@Singleton()
class Library {}

// Existing default container is used and "Hall" is also registered
@Singleton()
class Hall {}

// New TEST_CONTAINER container is initialized and "Book" is registered
const TestContainerIdentifier: symbol = Symbol("TEST_CONTAINER");
@Transient(TestContainerIdentifier)
class Book {}

// Existing TEST_CONTAINER container is used and "City" is also registered
@Transient(TestContainerIdentifier)
class City {}
```

There are two separate containers being initialized, one is the default container and the other one using the identifier `TestContainerIdentifier`. Note that at the same time, along with container initialization, the classes are also registered with the respective containers.

### Dependency Registration

Dependencies are registered in three ways:

#### Using decorators

This is the most simple form of dependency registration

```typescript
import { Singleton, Transient } from "iocc";

// Register a singleton class in default container
@Singleton()
class Library {}

// Register a transient class in default container
@Transient()
class Book {}

const TEST_CONTAINER = Symbol("TEST_CONTAINER");

// Register a singleton class in TEST_CONTAINER container
@Singleton(TEST_CONTAINER)
class City {}

// Register a transient class in TEST_CONTAINER container
@Transient(TEST_CONTAINER)
class Hall {}
```

#### Using explicit container instance

Dependencies can be registered using container instance by passing dependency to the container

```typescript
import { Container, IContainer } from "iocc";

class Book {}

class Library {}

const container: IContainer = Container.of();

// As transient
container.registerTransient(Book);

// As singleton
container.registerSingleton(Library);
```

#### Using explicit container instance and injection token

Dependencies can be registered using container instance by passing injection token and dependency to the container. This is useful, when you want to depend upon abstracion instead of implementaion details

```typescript
import { Token, Container, IContainer } from "iocc";

interface IBook {}
class Book implements IBook {}

interface ILibrary {}
class Library implements ILibrary {}

const container: IContainer = Container.of();

// As transient
const bookToken = new Token<IBook>("BOOK");
container.registerTransient(bookToken, Book);

// As singleton
const libraryToken = new Token<ILibrary>("LIBRARY");
container.registerSingleton(libraryToken, Library);
```

### Dependency Resolution

Dependencies are resolved in three ways:

#### Using container instance:

Dependencies that are registered in the container without the injection token can be resolved from the container simply by passing the required dependency to the container

```typescript
import { Container, IContainer } from "iocc";

class Book {}

const container: IContainer = Container.of();
container.registerSingleton(Book);

const book: Book = container.resolve(Book);
```

#### Using container instance and injection token:

Dependencies that are registered in the container with the injection token can be resolved from the container simply by passing the injection token to the container

```typescript
import { Token, Container, IContainer } from "iocc";

interface IBook {}
class Book implements IBook {}
const BookToken: Token<IBook> = new Token<IBook>("BOOK");

const container: IContainer = Container.of();
container.registerSingleton(BookToken, Book);

const book: IBook = container.resolve(BookToken);
```

#### Auto resolution in other dependencies:

Dependencies that are utilized in other dependencies can be resolved by:

- If they are registered using the decorator or expicitly in the container instance without using token, then they will be inferred automatically

```typescript
import { Container, IContainer, Singleton } from "iocc";

class Book {}

// Registered using decorator
@Singleton()
class Library {
    public constructor(
        // It will be inferred and injected at runtime
        private readonly book: Book,
    ) {}
}

const container: IContainer = Container.of();

// Registered using container instance without injection token
container.registerSingleton(Book);

const library: Library = container.resolve(Library);
```

- If they are registered expicitly in the container instance with injection token, then they will should be injected using the `Inject` decorator

```typescript
import { Token, Inject, Container, IContainer, Singleton } from "iocc";

interface IBook {}
class Book implements IBook {}
const BookToken: Token<IBook> = new Token<IBook>("BOOK");

// Registered using decorator
@Singleton()
class Library {
    public constructor(
        // It must be injected using the decorator as it is registerd using the injection token
        @Inject(BookToken) private readonly book: IBook,
    ) {}
}

const container: IContainer = Container.of();

// Registered using container instance with injection token
container.registerSingleton(BookToken, Book);

const library: Library = container.resolve(Library);
```

### Protection against captive dependencies

According to the documentation at [Microsoft .NET Core](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines#captive-dependency), captive dependency is a dependency whose instance is expected to be destroyed earlier than the dependant instance, but is kept captive, due the life cycle of the dependant.

Consider this example:

```typescript
import { v4 as uuid } from "uuid";
import { Singleton, Transient, Container, IContainer } from "iocc";

@Transient()
class TaxCodeCalculator {
    private readonly _taxCode: string;

    public get taxCode(): string {
        return this._taxCode;
    }
    
    public constructor() {
        this._taxCode = uuid();
    }
}

@Singleton()
class OrderApiGateway {
    public constructor(
        // A transient dependency is injected inside a singleton dependency
        private readonly taxCalculator: TaxCodeCalculator
    ) {}

    public getOrderNumber(): string {
        return `SDNU-${taxCalculator.taxCode}`;
    }
}

const conainer: IContainer = Container.of();

// Somewhere in the application
const orderApiGateway = container.resolve(OrderApiGateway);
console.log(orderApiGateway.getOrderNumber()); // prints abe91712-2e55-442c-95f7-d3704c11a254
```

In the above example, when you call the `orderApiGateway.getOrderNumber()` in the same application lifecycle, you will expect to have a different order number each time, as `TaxCodeCalculator` is a transient dependency, but since it is injected in a singleton `OrderApiGateway` whose instance is created once per application lifecycle, it will keep the `TaxCodeCalculator` also alive throughout the application lifecycle.

IOCC protects you from these captive dependencies, so when you try to resolve the `OrderApiGateway`, it will produce the following error:

```
CaptiveDependencyException [Error]: Captive dependency detected: Singleton[OrderApiGateway] -> Transient[TaxCodeCalculator]
```

## FAQ

- Can it resolve type hinted dependency when used as typed imports?

No. When you try to resolve the dependencies like this:

```typescript
// file1.ts

import { Singleton } from "iocc";

@Singleton()
export class Book {}

// file2.ts

import { Singleton } from "iocc";
// Book is a type import instead of a value import!!
import type { Book } from "./file1";

@Singleton()
export class Library {
    public constructor(
        // This will fail
        private readonly book: Book,
    ) {}
}
```

- Can I add a proxy instance on a dependency?

Yes, but there is a catch. Consider an example where the constructor initialization is trapped using proxies:

```typescript
const Decorator = <T>(target: Constructable<T>): Constructable<T> => {
	return new Proxy(target, {
		construct(concrete: Constructable<T>, args: Array<any>) {}
	})
}

@Singleton()
class DemoService {}

@Singleton()
@Decorator
class UserService {
	public constructor(
		private readonly demoService: DemoService,
	) {}
}
```

Here the `UserService` instance will be created, but `demoService` will be undefined inside of `userService`. That is because when we returned the proxified constructor from the `Decorator` function, the metadata properties from `UserService` are lost.

To work around this issue, use the helper function `copyMetadata` like this inside the `Decorator` function:

```typescript
import { copyMetadata } from "iocc";

const Decorator = <T>(target: Constructable<T>): Constructable<T> => {
	const proxifiedTarget = new Proxy(target, {
		construct(concrete: Constructable<T>, args: Array<any>) {}
	});

	// This will copy the metadata properties from the original class constructor to the proxified one.
	copyMetadata(target, proxifiedTarget);

	return proxifiedTarget;
}
```

It will preserve the metadata on the proxy constructor
