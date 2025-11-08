import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Database() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Database Design</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive overview of SecureVault's database architecture and schema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Technology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            SecureVault uses <strong>PostgreSQL 15+</strong> as its primary database, managed through Supabase.
            PostgreSQL provides robust ACID compliance, advanced security features, and excellent performance for
            our use case.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ACID transactions</li>
                <li>• Row-Level Security (RLS)</li>
                <li>• JSONB support</li>
                <li>• Full-text search</li>
                <li>• Triggers and functions</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Performance</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• B-tree indexes</li>
                <li>• Connection pooling</li>
                <li>• Query optimization</li>
                <li>• Efficient data types</li>
                <li>• Materialized views</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schema Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              Table: profiles
              <Badge variant="outline">public schema</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Stores user profile information extending Supabase's auth.users table.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Column</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Constraints</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  <tr className="border-b border-border/50">
                    <td className="py-2">id</td>
                    <td className="py-2">UUID</td>
                    <td className="py-2">PRIMARY KEY, FK to auth.users</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">email</td>
                    <td className="py-2">TEXT</td>
                    <td className="py-2">NOT NULL</td>
                  </tr>
                  <tr>
                    <td className="py-2">created_at</td>
                    <td className="py-2">TIMESTAMPTZ</td>
                    <td className="py-2">NOT NULL, DEFAULT now()</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              Table: secrets
              <Badge variant="outline">public schema</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Core table storing encrypted secrets with access control metadata.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Column</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Constraints</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  <tr className="border-b border-border/50">
                    <td className="py-2">id</td>
                    <td className="py-2">UUID</td>
                    <td className="py-2">PRIMARY KEY, DEFAULT gen_random_uuid()</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">owner_id</td>
                    <td className="py-2">UUID</td>
                    <td className="py-2">NOT NULL, FK to auth.users</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">title</td>
                    <td className="py-2">TEXT</td>
                    <td className="py-2">NOT NULL</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">encrypted_content</td>
                    <td className="py-2">TEXT</td>
                    <td className="py-2">NOT NULL</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">encryption_key_hash</td>
                    <td className="py-2">TEXT</td>
                    <td className="py-2">NOT NULL</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">max_views</td>
                    <td className="py-2">INTEGER</td>
                    <td className="py-2">NOT NULL, DEFAULT 1</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">remaining_views</td>
                    <td className="py-2">INTEGER</td>
                    <td className="py-2">NOT NULL</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">expire_at</td>
                    <td className="py-2">TIMESTAMPTZ</td>
                    <td className="py-2">NOT NULL</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">geo_restrictions</td>
                    <td className="py-2">JSONB</td>
                    <td className="py-2">NULLABLE</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">is_active</td>
                    <td className="py-2">BOOLEAN</td>
                    <td className="py-2">NOT NULL, DEFAULT true</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">file_url</td>
                    <td className="py-2">TEXT</td>
                    <td className="py-2">NULLABLE</td>
                  </tr>
                  <tr>
                    <td className="py-2">created_at</td>
                    <td className="py-2">TIMESTAMPTZ</td>
                    <td className="py-2">NOT NULL, DEFAULT now()</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              Table: audit_logs
              <Badge variant="outline">public schema</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Tracks all access attempts and security events for compliance and monitoring.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Column</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Constraints</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  <tr className="border-b border-border/50">
                    <td className="py-2">id</td>
                    <td className="py-2">UUID</td>
                    <td className="py-2">PRIMARY KEY, DEFAULT gen_random_uuid()</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">secret_id</td>
                    <td className="py-2">UUID</td>
                    <td className="py-2">NOT NULL, FK to secrets</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">viewer_email</td>
                    <td className="py-2">TEXT</td>
                    <td className="py-2">NOT NULL</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">viewer_ip</td>
                    <td className="py-2">TEXT</td>
                    <td className="py-2">NULLABLE</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">viewer_location</td>
                    <td className="py-2">JSONB</td>
                    <td className="py-2">NULLABLE</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">user_agent</td>
                    <td className="py-2">TEXT</td>
                    <td className="py-2">NULLABLE</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">action</td>
                    <td className="py-2">TEXT</td>
                    <td className="py-2">NOT NULL</td>
                  </tr>
                  <tr>
                    <td className="py-2">timestamp</td>
                    <td className="py-2">TIMESTAMPTZ</td>
                    <td className="py-2">NOT NULL, DEFAULT now()</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JSONB Column Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">geo_restrictions (secrets table)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Stores geographic coordinates and restrictions for location-based access control.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs font-mono">
{`{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 100,  // meters
  "address": "New York, NY, USA"  // optional
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">viewer_location (audit_logs table)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Records the viewer's location data when accessing a secret.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs font-mono">
{`{
  "latitude": 40.7580,
  "longitude": -73.9855,
  "address": "Times Square, New York, NY",
  "distance": 7.2,  // km from restriction point
  "timestamp": "2025-01-15T14:30:00Z"
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Functions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">handle_new_user()</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Trigger function that automatically creates a profile entry when a new user signs up.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs font-mono">
{`CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">deactivate_expired_secrets()</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Scheduled function that deactivates secrets that have expired or exhausted their view limit.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs font-mono">
{`CREATE FUNCTION public.deactivate_expired_secrets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.secrets
  SET is_active = false
  WHERE is_active = true
  AND (expire_at < NOW() OR remaining_views <= 0);
END;
$$;`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Buckets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              Bucket: secret-files
              <Badge>Public</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Stores file attachments associated with secrets (images, videos, audio, PDFs).
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li><strong>Max file size:</strong> 50 MB</li>
              <li><strong>Allowed types:</strong> image/*, video/*, audio/*, application/pdf</li>
              <li><strong>Public access:</strong> Yes (requires URL knowledge)</li>
              <li><strong>File naming:</strong> UUID-based to prevent conflicts</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indexes and Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The following indexes are automatically created for optimal query performance:
          </p>
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm font-mono">
            <div>• PRIMARY KEY indexes on all id columns (B-tree)</div>
            <div>• INDEX on secrets.owner_id for user-specific queries</div>
            <div>• INDEX on secrets.is_active for filtering active secrets</div>
            <div>• INDEX on audit_logs.secret_id for audit trail lookups</div>
            <div>• INDEX on audit_logs.timestamp for chronological queries</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-sm">
            <strong>Database Design Principle:</strong> The schema follows normalization best practices while
            using JSONB for flexible, semi-structured data. All tables use UUID primary keys for security
            and distributed system compatibility.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
