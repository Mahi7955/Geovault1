import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Architecture() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">System Architecture</h1>
        <p className="text-xl text-muted-foreground">
          Understanding SecureVault's technical architecture and design principles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Architecture Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            SecureVault follows a modern three-tier architecture pattern with clear separation of concerns:
          </p>
          <div className="space-y-4 mt-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">1. Presentation Layer (Frontend)</h3>
              <p className="text-sm text-muted-foreground">
                React-based single-page application (SPA) built with TypeScript, providing a responsive and 
                interactive user interface. Uses shadcn/ui components for consistent design and Tailwind CSS 
                for styling.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">2. Application Layer (Backend)</h3>
              <p className="text-sm text-muted-foreground">
                Serverless architecture using Supabase Edge Functions (Deno runtime) for business logic,
                authentication handling, and third-party API integrations. Provides RESTful endpoints and
                handles complex operations like location verification.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">3. Data Layer (Database & Storage)</h3>
              <p className="text-sm text-muted-foreground">
                PostgreSQL database managed by Supabase with Row-Level Security (RLS) policies for data
                protection. Object storage for file attachments with public/private bucket configurations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Component Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Frontend Components</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm font-mono">
                <div>src/pages/ - Page-level components</div>
                <div className="ml-4">├── Index.tsx - Landing page</div>
                <div className="ml-4">├── Auth.tsx - Authentication</div>
                <div className="ml-4">├── Dashboard.tsx - User dashboard</div>
                <div className="ml-4">├── CreateSecret.tsx - Secret creation</div>
                <div className="ml-4">└── ViewSecret.tsx - Secret viewing</div>
                <div className="mt-3">src/components/ - Reusable components</div>
                <div className="ml-4">├── ui/ - Base UI components (shadcn)</div>
                <div className="ml-4">├── StatCard.tsx - Statistics display</div>
                <div className="ml-4">├── ShareSecretDialog.tsx - Share functionality</div>
                <div className="ml-4">└── PasswordStrength.tsx - Password validator</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Backend Functions</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm font-mono">
                <div>supabase/functions/</div>
                <div className="ml-4">└── verify-location/</div>
                <div className="ml-8">└── index.ts - Location verification logic</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Database Schema</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm font-mono">
                <div>public.profiles - User profile data</div>
                <div>public.secrets - Encrypted secret storage</div>
                <div>public.audit_logs - Access attempt tracking</div>
                <div>storage.secret-files - File attachment bucket</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Flow Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Secret Creation Flow</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>User authenticates via Supabase Auth (JWT token issued)</li>
              <li>User fills secret creation form (title, content, restrictions)</li>
              <li>If file attached, upload to Supabase Storage, get URL</li>
              <li>Content encrypted client-side using Base64 (encryption key hashed)</li>
              <li>Secret metadata saved to PostgreSQL with RLS protection</li>
              <li>Unique secret URL generated and returned to user</li>
              <li>User can share URL with recipient</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Secret Access Flow</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>Recipient opens shared secret URL</li>
              <li>Frontend fetches secret metadata (without decrypted content)</li>
              <li>System checks if secret is active and has remaining views</li>
              <li>If geo-restricted, prompt user for location permission</li>
              <li>Browser captures GPS coordinates</li>
              <li>Coordinates sent to verify-location Edge Function</li>
              <li>Edge Function calculates distance using Haversine formula</li>
              <li>If within 100m radius:
                <ul className="list-disc ml-6 mt-1">
                  <li>Access granted, content decrypted and displayed</li>
                  <li>Remaining views decremented</li>
                  <li>Audit log created with viewer details</li>
                  <li>File attachment displayed if present</li>
                </ul>
              </li>
              <li>If outside radius, access denied with distance shown</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Authentication Layer</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• JWT-based authentication</li>
                <li>• Secure session management</li>
                <li>• Password hashing (bcrypt)</li>
                <li>• Auto-confirm email (dev mode)</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Data Protection</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Row-Level Security (RLS)</li>
                <li>• Encrypted content storage</li>
                <li>• HTTPS/TLS encryption</li>
                <li>• Secure file storage</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Access Control</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User-specific data isolation</li>
                <li>• Geo-location verification</li>
                <li>• View count enforcement</li>
                <li>• Time-based expiration</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Audit & Monitoring</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete access logging</li>
                <li>• IP address tracking</li>
                <li>• User agent detection</li>
                <li>• Timestamp recording</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scalability & Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Frontend Optimization</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Code splitting and lazy loading</li>
              <li>React Query for efficient data fetching and caching</li>
              <li>Optimized bundle size with Vite</li>
              <li>Responsive design for all device sizes</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Backend Scalability</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Serverless architecture auto-scales with demand</li>
              <li>Database connection pooling</li>
              <li>CDN distribution for static assets</li>
              <li>Efficient database queries with proper indexing</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-sm">
            <strong>Architecture Principle:</strong> SecureVault follows a "security-first" design philosophy
            where every architectural decision prioritizes data protection, user privacy, and system integrity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
