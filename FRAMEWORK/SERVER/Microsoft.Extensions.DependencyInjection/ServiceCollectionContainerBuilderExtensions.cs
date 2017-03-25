// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

using System;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class ServiceCollectionContainerBuilderExtensions
    {
        /// <summary>
        /// Creates an <see cref="IServiceProvider"/> containing services from the provided <see cref="IServiceCollection"/>.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection"/> containing service descriptors.</param>
        /// <returns>The<see cref="IServiceProvider"/>.</returns>

        public static IServiceProvider BuildServiceProvider(this IServiceCollection services)
        {
            return BuildServiceProvider(services, ServiceProviderOptions.Default);
        }

        /// <summary>
        /// Creates an <see cref="IServiceProvider"/> containing services from the provided <see cref="IServiceCollection"/>
        /// optionaly enabling scope validation.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection"/> containing service descriptors.</param>
        /// <param name="validateScopes">
        /// <c>true</c> to perform check verifying that scoped services never gets resolved from root provider; otherwise <c>false</c>.
        /// </param>
        /// <returns>The<see cref="IServiceProvider"/>.</returns>
        public static IServiceProvider BuildServiceProvider(this IServiceCollection services, bool validateScopes)
        {
            return services.BuildServiceProvider(new ServiceProviderOptions { ValidateScopes = validateScopes });
        }

        /// <summary>
        /// Creates an <see cref="IServiceProvider"/> containing services from the provided <see cref="IServiceCollection"/>
        /// optionaly enabling scope validation.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection"/> containing service descriptors.</param>
        /// <param name="options">
        /// Configures various service provider behaviors.
        /// </param>
        /// <returns>The<see cref="IServiceProvider"/>.</returns>
        public static IServiceProvider BuildServiceProvider(this IServiceCollection services, ServiceProviderOptions options)
        {
            if (services == null)
            {
                throw new ArgumentNullException(nameof(services));
            }

            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            return new ServiceProvider(services, options);
        }
    }
}