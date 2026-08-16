import type { SocialProvider } from "./types";

export class ProviderRegistry {
  private readonly providers = new Map<string, SocialProvider>();

  register(provider: SocialProvider) {
    this.providers.set(provider.id, provider);
    return this;
  }

  get(id: string): SocialProvider | undefined {
    return this.providers.get(id);
  }

  require(id: string): SocialProvider {
    const provider = this.get(id);
    if (!provider) {
      throw new Error(`Unknown catalog sync provider: ${id}`);
    }
    return provider;
  }

  list(): SocialProvider[] {
    return [...this.providers.values()];
  }

  platforms() {
    return this.list().flatMap((provider) => provider.platforms);
  }

  platform(platformId: string) {
    return this.platforms().find((platform) => platform.id === platformId);
  }

  providerForPlatform(platformId: string): SocialProvider | undefined {
    const platform = this.platform(platformId);
    if (!platform) return undefined;
    return this.get(platform.providerId);
  }
}

export const providerRegistry = new ProviderRegistry();
