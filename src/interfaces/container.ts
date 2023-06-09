import type { Token } from "@/di";
import type { Constructable, DependencyMap, IDependencyRegisterOptions, SingletonDependencyMap } from "@/types";

export interface IContainer {
	/**
	 * Resolve dependency with the provided token
	 *
	 * @template T
	 * @param {Token<T>} dependency Dependency token
	 * @return {T} Resolved dependency
	 * @author Muhammad Waqar
	 */
	resolve<T>(dependency: Token<T>): T;

	/**
	 * Resolve dependency with the provided constructor
	 *
	 * @template T
	 * @param {Constructable<T>} dependency Dependency constructor
	 * @return {T} Resolved dependency
	 * @author Muhammad Waqar
	 */
	resolve<T>(dependency: Constructable<T>): T;

	/**
	 * Register a singleton dependency using the dependency constructor
	 *
	 * @template T
	 * @param {Constructable<T>} token Dependency constructor
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	registerSingleton<T>(token: Constructable<T>): void;

	/**
	 * Register a singleton dependency using the dependency constructor
	 *
	 * @template T
	 * @param {Constructable<T>} token Dependency constructor
	 * @param {IDependencyRegisterOptions} dependency Dependency register options
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	registerSingleton<T>(token: Constructable<T>, dependency: IDependencyRegisterOptions): void;

	/**
	 * Register a singleton dependency using the dependency token
	 *
	 * @template T
	 * @param {Token<T>} token Dependency token
	 * @param {Constructable<T>} dependency Dependency constructor
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	registerSingleton<T>(token: Token<T>, dependency: Constructable<T>): void;

	/**
	 * Register a singleton dependency using the dependency token
	 *
	 * @template T
	 * @param {Token<T>} token Dependency token
	 * @param {Constructable<T>} dependency Dependency constructor
	 * @param {IDependencyRegisterOptions} registerOptions Dependency register options
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	registerSingleton<T>(token: Token<T>, dependency: Constructable<T>, registerOptions: IDependencyRegisterOptions): void;

	/**
	 * Register a transient dependency using the dependency constructor
	 *
	 * @template T
	 * @param {Constructable<T>} token Dependency constructor
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	registerTransient<T>(token: Constructable<T>): void;

	/**
	 * Register a transient dependency using the dependency constructor
	 *
	 * @template T
	 * @param {Constructable<T>} token Dependency constructor
	 * @param {IDependencyRegisterOptions} dependency Dependency register options
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	registerTransient<T>(token: Constructable<T>, dependency: IDependencyRegisterOptions): void;

	/**
	 * Register a transient dependency using the dependency token
	 *
	 * @template T
	 * @param {Token<T>} token Dependency token
	 * @param {Constructable<T>} dependency Dependency constructor
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	registerTransient<T>(token: Token<T>, dependency: Constructable<T>): void;

	/**
	 * Register a transient dependency using the dependency token
	 *
	 * @template T
	 * @param {Token<T>} token Dependency token
	 * @param {Constructable<T>} dependency Dependency constructor
	 * @param {IDependencyRegisterOptions} registerOptions Dependency register options
	 * @return {void}
	 * @throws DuplicateDependencyException
	 * @author Muhammad Waqar
	 */
	registerTransient<T>(token: Token<T>, dependency: Constructable<T>, registerOptions: IDependencyRegisterOptions): void;

	/**
	 * Retrieves the list of all singleton dependencies that have been requested from the container till yet
	 *
	 * @return {SingletonDependencyMap} Map of resolved singleton dependencies with their tokens
	 * @author Muhammad Waqar
	 */
	getResolvedSingletonDependencies(): SingletonDependencyMap;

	/**
	 * Retrieves the list of all registered dependencies for the container
	 *
	 * @return {DependencyMap} Map of registered dependencies with their tokens and resolution type
	 * @author Muhammad Waqar
	 */
	getRegisteredDependencies(): DependencyMap;

	/**
	 * Creates a default token for the given dependency constructor
	 *
	 * @template T
	 * @param {Constructable<T>} dependency Dependency constructor
	 * @return {Token<T>} Default token for the dependency constructor
	 * @author Muhammad Waqar
	 */
	createDependencyToken<T>(dependency: Constructable<T>): Token<T>;
}
