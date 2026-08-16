"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  connectMockProvider,
  disconnectCatalogConnection,
  fetchCatalogSyncLogs,
  fetchCatalogSyncOverview,
  linkWhatsAppFromMeta,
  testCatalogConnection,
  updateCatalogConnection,
  type CatalogSyncConnection,
  type CatalogSyncPlatform,
} from "@/features/admin/services/catalogSync";
import { isWhatsAppBusinessAccountId } from "@/features/catalog-sync/providers/whatsapp/ids";

function pageAssets(value: unknown): Array<{
  id: string;
  name?: string;
  username?: string | null;
  instagramAccountId?: string | null;
  instagramUsername?: string | null;
}> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || !("id" in item) || typeof (item as { id: unknown }).id !== "string") {
      return [];
    }
    const row = item as {
      id: string;
      name?: unknown;
      username?: unknown;
      instagramAccountId?: unknown;
      instagramUsername?: unknown;
    };
    return [
      {
        id: row.id,
        name: typeof row.name === "string" ? row.name : undefined,
        username: typeof row.username === "string" ? row.username : null,
        instagramAccountId: typeof row.instagramAccountId === "string" ? row.instagramAccountId : null,
        instagramUsername: typeof row.instagramUsername === "string" ? row.instagramUsername : null,
      },
    ];
  });
}

function optionList(value: unknown): Array<{ id: string; name?: string }> {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is { id: string; name?: string } => {
    return Boolean(item && typeof item === "object" && "id" in item && typeof (item as { id: unknown }).id === "string");
  });
}

export function PlatformIntegrationsTab() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [platforms, setPlatforms] = useState<CatalogSyncPlatform[]>([]);
  const [connections, setConnections] = useState<CatalogSyncConnection[]>([]);
  const [logs, setLogs] = useState<Array<{ id: string; created_at: string; product_name: string | null; platform: string; action: string; status: string; error: string | null }>>([]);
  const [wabaId, setWabaId] = useState("");
  const [googleMerchantId, setGoogleMerchantId] = useState("");
  const [googleDataSource, setGoogleDataSource] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [overview, history] = await Promise.all([fetchCatalogSyncOverview(), fetchCatalogSyncLogs()]);
    setPlatforms(overview.platforms);
    setConnections(overview.connections);
    setLogs(history.logs);
    const google = overview.connections.find((item) => item.provider === "google");
    if (typeof google?.config.merchantId === "string") setGoogleMerchantId(google.config.merchantId);
    if (typeof google?.config.dataSource === "string") setGoogleDataSource(google.config.dataSource);
    const whatsappConn = overview.connections.find((item) => item.provider === "whatsapp");
    const storedWaba = typeof whatsappConn?.config.wabaId === "string" ? whatsappConn.config.wabaId : "";
    setWabaId(isWhatsAppBusinessAccountId(storedWaba) ? storedWaba : "");
  };

  useEffect(() => {
    void load().catch((error) => {
      toast({
        title: "Could not load integrations",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    });
  }, []);

  useEffect(() => {
    const connected = searchParams.get("sync_connected");
    const error = searchParams.get("sync_error");
    if (connected) {
      toast({ title: `${connected} connected`, description: "Review catalog mapping below, then sync products." });
    }
    if (error) {
      toast({ title: "Could not connect platform", description: error, variant: "destructive" });
    }
  }, [searchParams, toast]);

  const byProvider = useMemo(() => {
    const map = new Map<string, CatalogSyncConnection>();
    for (const connection of connections) map.set(connection.provider, connection);
    return map;
  }, [connections]);

  const meta = byProvider.get("meta");
  const whatsapp = byProvider.get("whatsapp");
  const google = byProvider.get("google");
  const mock = byProvider.get("mock");

  return (
    <div className="h-full min-h-0 overflow-y-auto p-3 md:p-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Social channels</h2>
          <p className="text-sm text-muted-foreground">
            Connect official catalog APIs, then publish products from Catalog Products. Nothing is sent automatically.
          </p>
        </div>

        <ProviderCard
          title="Meta"
          subtitle="Facebook and Instagram share one Commerce catalog. Sync does not turn on Facebook Shop; enable that in Meta Business Suite if you want a public shop on the Page."
          connected={meta?.status === "connected"}
          name={meta?.displayName}
          error={meta?.lastError}
        >
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <a href="/api/admin/catalog-sync/oauth/meta">Connect Meta</a>
            </Button>
            {meta ? (
              <>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => void onTest(meta.id)}>
                  Test connection
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => void onDisconnect(meta.id)}>
                  Disconnect
                </Button>
              </>
            ) : null}
          </div>
          {meta ? <MetaConfig connection={meta} onSave={onSaveMeta} /> : null}
        </ProviderCard>

        <ProviderCard
          title="WhatsApp Business"
          subtitle="WhatsApp uses the same Meta catalog as Facebook. After that catalog is attached in WhatsApp Manager, Facebook Sync already updates WhatsApp. A Cloud API WABA ID is optional."
          connected={whatsapp?.status === "connected"}
          name={whatsapp?.displayName}
          error={whatsapp?.lastError}
        >
          {!meta ? (
            <p className="text-sm text-muted-foreground">Connect Meta first, then link WhatsApp to that catalog.</p>
          ) : (
            <div className="space-y-3">
              {optionList(meta.config.wabas).length > 0 ? (
                <div className="space-y-1.5">
                  <Label htmlFor="waba-id">WhatsApp Business Account (optional)</Label>
                  <select
                    id="waba-id"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={wabaId}
                    onChange={(event) => setWabaId(event.target.value)}
                  >
                    <option value="">Use Meta catalog only</option>
                    {optionList(meta.config.wabas).map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name || account.id}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Leave the WABA field empty unless Meta Business Suite lists a Cloud API WhatsApp account. Do not paste
                  a product ID, catalog ID, or the website WhatsApp number.
                </p>
              )}
              <Button size="sm" disabled={busy} onClick={() => void onLinkWhatsApp()}>
                {whatsapp ? "Use Meta catalog for WhatsApp" : "Link WhatsApp to Meta catalog"}
              </Button>
              {whatsapp ? (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => void onDisconnect(whatsapp.id)}>
                  Disconnect
                </Button>
              ) : null}
            </div>
          )}
        </ProviderCard>

        <ProviderCard
          title="Google Merchant Center"
          subtitle="Product catalog sync. Google Business Profile posts are a separate API and are not included."
          connected={google?.status === "connected"}
          name={google?.displayName}
          error={google?.lastError}
        >
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <a href="/api/admin/catalog-sync/oauth/google">Connect Google</a>
            </Button>
            {google ? (
              <>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => void onTest(google.id)}>
                  Test connection
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => void onDisconnect(google.id)}>
                  Disconnect
                </Button>
              </>
            ) : null}
          </div>
          <GoogleOAuthHint />
          {google ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="merchant-id">Merchant ID</Label>
                <Input id="merchant-id" value={googleMerchantId} onChange={(event) => setGoogleMerchantId(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="datasource-id">API data source ID</Label>
                <Input id="datasource-id" value={googleDataSource} onChange={(event) => setGoogleDataSource(event.target.value)} />
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void updateCatalogConnection(google.id, {
                    config: { merchantId: googleMerchantId.trim(), dataSource: googleDataSource.trim() },
                  }).then(load)
                }
              >
                Save Merchant settings
              </Button>
            </div>
          ) : null}
        </ProviderCard>

        {platforms.some((platform) => platform.id === "mock") ? (
          <ProviderCard
            title="Development mock"
            subtitle="Local catalog for testing create/update/delete without publishing live products."
            connected={mock?.status === "connected"}
            name={mock?.displayName}
          >
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={busy} onClick={() => void onMock("success")}>
                Connect mock
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => void onMock("failure")}>
                Connect failing mock
              </Button>
              {mock ? (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => void onDisconnect(mock.id)}>
                  Disconnect
                </Button>
              ) : null}
            </div>
          </ProviderCard>
        ) : null}

        <Card className="layer-1">
          <CardHeader>
            <CardTitle>Sync history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sync activity yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border-b border-border py-2 text-sm last:border-0">
                  <p>
                    {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
                      new Date(log.created_at)
                    )}{" "}
                    · {log.product_name || "Product"} · {log.platform} · {log.action} · {log.status}
                  </p>
                  {log.error ? <p className="text-xs text-destructive">{log.error}</p> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  async function onTest(id: string) {
    setBusy(true);
    try {
      const result = await testCatalogConnection(id);
      toast({
        title: result.ok ? "Connection is valid" : "Connection failed",
        description: result.error || result.displayName,
        variant: result.ok ? "default" : "destructive",
      });
      await load();
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Try Connect Google again.",
        variant: "destructive",
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onDisconnect(id: string) {
    setBusy(true);
    try {
      await disconnectCatalogConnection(id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onMock(scenario: string) {
    setBusy(true);
    try {
      await connectMockProvider(scenario);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onLinkWhatsApp() {
    const catalogId = typeof meta?.config.catalogId === "string" ? meta.config.catalogId : "";
    if (!catalogId) {
      toast({ title: "Select a Meta catalog first.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await linkWhatsAppFromMeta({
        wabaId: isWhatsAppBusinessAccountId(wabaId) ? wabaId.trim() : undefined,
        catalogId,
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not link WhatsApp",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  async function onSaveMeta(connection: CatalogSyncConnection, config: Record<string, unknown>) {
    await updateCatalogConnection(connection.id, { config });
    await load();
  }
}

function ProviderCard({
  title,
  subtitle,
  connected,
  name,
  error,
  children,
}: {
  title: string;
  subtitle: string;
  connected: boolean;
  name?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <Card className="layer-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>{title}</span>
          <span className="text-xs font-medium text-muted-foreground">
            {connected ? `Connected${name ? ` · ${name}` : ""}` : "Not connected"}
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function GoogleOAuthHint() {
  const [callback, setCallback] = useState("");

  useEffect(() => {
    const host = window.location.hostname;
    const local = host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
    const origin = local ? `http://localhost:${window.location.port || "3000"}` : window.location.origin;
    setCallback(`${origin}/api/admin/catalog-sync/oauth/google/callback`);
  }, []);

  if (!callback) return null;

  return (
    <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
      <p>
        <span className="font-medium text-foreground">Google hasn’t verified this app</span> is expected until you
        submit verification. Merchant Center needs the Content API scope. For your own login, keep the consent screen
        in <span className="text-foreground">Testing</span> and add the Google account you sign in with as a{" "}
        <span className="text-foreground">Test user</span> (Google Cloud → APIs &amp; Services → OAuth consent screen).
        Then on the warning page click <span className="text-foreground">Advanced</span> →{" "}
        <span className="text-foreground">Go to Moon Steel (unsafe)</span>. Only you should do that; customers never
        connect this app.
      </p>
      <p>
        <span className="font-medium text-foreground">Google denied Merchant Center access</span> usually means the
        Google account is not Admin on that Merchant Center, Merchant API is off in Google Cloud, or this Cloud project
        is not registered. Enable{" "}
        <a
          className="text-foreground underline"
          href="https://console.cloud.google.com/apis/library/merchantapi.googleapis.com?project=moon-steel-fab-project"
          target="_blank"
          rel="noreferrer"
        >
          Merchant API
        </a>
        , then in Merchant Center → Settings → People confirm the Google account you click Connect with is Admin. The
        website must be verified. Click <span className="text-foreground">Connect Google</span> (not Test) so Moon Steel
        can register this Cloud project. Google may return 401 until that registration finishes; wait a few minutes if
        the first connect still fails.
      </p>
      <p>
        Google <code className="rounded bg-muted px-1 py-0.5 text-[11px]">redirect_uri_mismatch</code> means this exact
        URL is missing from the OAuth client. In Google Cloud → Credentials → your Web application client, add it under{" "}
        <span className="text-foreground">Authorized redirect URIs</span> (not JavaScript origins):
        <span className="mt-1 block break-all font-mono text-[11px] text-foreground">{callback}</span>
        Also add JavaScript origin <span className="font-mono text-foreground">http://localhost:3000</span> for local
        testing. Use this admin URL: localhost, not 0.0.0.0.
      </p>
    </div>
  );
}

function MetaConfig({
  connection,
  onSave,
}: {
  connection: CatalogSyncConnection;
  onSave: (connection: CatalogSyncConnection, config: Record<string, unknown>) => Promise<void>;
}) {
  const pages = pageAssets(connection.config.pages);
  const catalogs = optionList(connection.config.catalogs);
  const [pageId, setPageId] = useState(String(connection.config.pageId ?? ""));
  const [catalogId, setCatalogId] = useState(String(connection.config.catalogId ?? ""));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {pages.length > 0 ? (
        <div className="space-y-1.5">
          <Label htmlFor="meta-page">Facebook Page</Label>
          <select
            id="meta-page"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={pageId}
            onChange={(event) => setPageId(event.target.value)}
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.name || page.id}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {catalogs.length > 0 ? (
        <div className="space-y-1.5">
          <Label htmlFor="meta-catalog">Product catalog</Label>
          <select
            id="meta-catalog"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={catalogs.some((catalog) => catalog.id === catalogId) ? catalogId : ""}
            onChange={(event) => setCatalogId(event.target.value)}
          >
            <option value="">Select a catalog</option>
            {catalogs.map((catalog) => (
              <option key={catalog.id} value={catalog.id}>
                {catalog.name || catalog.id}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground sm:col-span-2">
          No catalogs were listed. Paste the catalog ID from Meta Business Suite → Commerce Manager.
        </p>
      )}
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="meta-catalog-id">Catalog ID</Label>
        <Input
          id="meta-catalog-id"
          value={catalogId}
          onChange={(event) => setCatalogId(event.target.value.trim())}
          placeholder="Numeric catalog ID"
        />
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          void onSave(connection, {
            pageId,
            pageName: pages.find((page) => page.id === pageId)?.name,
            pageUsername: pages.find((page) => page.id === pageId)?.username ?? null,
            instagramAccountId: pages.find((page) => page.id === pageId)?.instagramAccountId ?? null,
            instagramUsername: pages.find((page) => page.id === pageId)?.instagramUsername ?? null,
            catalogId,
            catalogName: catalogs.find((catalog) => catalog.id === catalogId)?.name,
          })
        }
      >
        Save Meta mapping
      </Button>
    </div>
  );
}
