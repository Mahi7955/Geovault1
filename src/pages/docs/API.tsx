import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function API() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Complete API reference for SecureVault integration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            SecureVault provides a RESTful API built on Supabase, offering both database operations
            through the Supabase client and custom Edge Functions for complex business logic.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Base URL</h3>
              <code className="text-xs bg-muted p-2 rounded block">
                https://aomnizyslwmxhtwbvdkx.supabase.co
              </code>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground">JWT Bearer Tokens</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Content Type</h3>
              <p className="text-sm text-muted-foreground">application/json</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="signup">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signout">Sign Out</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup" className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>POST</Badge>
                  <code className="text-sm">/auth/v1/signup</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Create a new user account</p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Request Body:</p>
                  <pre className="text-xs overflow-x-auto">
{`{
  "email": "user@example.com",
  "password": "securePassword123"
}`}
                  </pre>
                </div>
                
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p className="text-sm font-semibold mb-2">Response (201 Created):</p>
                  <pre className="text-xs overflow-x-auto">
{`{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "created_at": "2025-01-15T10:00:00Z"
  },
  "session": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here",
    "expires_in": 3600
  }
}`}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="signin" className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>POST</Badge>
                  <code className="text-sm">/auth/v1/token?grant_type=password</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Authenticate existing user</p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Request Body:</p>
                  <pre className="text-xs overflow-x-auto">
{`{
  "email": "user@example.com",
  "password": "securePassword123"
}`}
                  </pre>
                </div>
                
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p className="text-sm font-semibold mb-2">Response (200 OK):</p>
                  <pre className="text-xs overflow-x-auto">
{`{
  "access_token": "jwt-token-here",
  "refresh_token": "refresh-token-here",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  }
}`}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="signout" className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>POST</Badge>
                  <code className="text-sm">/auth/v1/logout</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">End user session</p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Headers:</p>
                  <pre className="text-xs overflow-x-auto">
{`Authorization: Bearer <access_token>`}
                  </pre>
                </div>
                
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p className="text-sm font-semibold mb-2">Response (204 No Content)</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Secrets API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">GET</Badge>
              <code className="text-sm">/rest/v1/secrets</code>
            </div>
            <p className="text-sm text-muted-foreground mb-4">List all secrets for authenticated user</p>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Headers:</p>
              <pre className="text-xs overflow-x-auto">
{`Authorization: Bearer <access_token>
apikey: <anon_key>`}
              </pre>
            </div>
            
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold mb-2">Query Parameters:</p>
              <ul className="text-xs space-y-1 mt-2">
                <li>• <code>select=*</code> - Select specific columns</li>
                <li>• <code>is_active=eq.true</code> - Filter by active status</li>
                <li>• <code>order=created_at.desc</code> - Sort results</li>
                <li>• <code>limit=10</code> - Limit results</li>
              </ul>
            </div>
            
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold mb-2">Response (200 OK):</p>
              <pre className="text-xs overflow-x-auto">
{`[
  {
    "id": "uuid-here",
    "title": "API Key",
    "encrypted_content": "encrypted-data",
    "max_views": 1,
    "remaining_views": 1,
    "expire_at": "2025-01-16T10:00:00Z",
    "is_active": true,
    "geo_restrictions": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "file_url": "https://...",
    "created_at": "2025-01-15T10:00:00Z"
  }
]`}
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>POST</Badge>
              <code className="text-sm">/rest/v1/secrets</code>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Create a new secret</p>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Request Body:</p>
              <pre className="text-xs overflow-x-auto">
{`{
  "title": "Database Password",
  "encrypted_content": "base64-encoded-content",
  "encryption_key_hash": "sha256-hash",
  "max_views": 3,
  "remaining_views": 3,
  "expire_at": "2025-01-16T10:00:00Z",
  "geo_restrictions": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "file_url": "optional-file-url"
}`}
              </pre>
            </div>
            
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold mb-2">Response (201 Created):</p>
              <pre className="text-xs overflow-x-auto">
{`{
  "id": "new-uuid",
  "owner_id": "user-uuid",
  "title": "Database Password",
  ...
}`}
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="destructive">DELETE</Badge>
              <code className="text-sm">/rest/v1/secrets?id=eq.{'{'}id{'}'}</code>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Delete a secret</p>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Response (204 No Content)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edge Functions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>POST</Badge>
              <code className="text-sm">/functions/v1/verify-location</code>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Verify user location and grant secret access</p>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Request Body:</p>
              <pre className="text-xs overflow-x-auto">
{`{
  "secretId": "uuid-of-secret",
  "viewerLat": 40.7580,
  "viewerLng": -73.9855
}`}
              </pre>
            </div>
            
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold mb-2">Response (200 OK) - Access Granted:</p>
              <pre className="text-xs overflow-x-auto">
{`{
  "allowed": true,
  "content": "decrypted-secret-content",
  "fileUrl": "https://...",
  "viewerLocation": "Times Square, New York, NY",
  "distance": 7.2
}`}
              </pre>
            </div>
            
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold mb-2">Response (403 Forbidden) - Access Denied:</p>
              <pre className="text-xs overflow-x-auto">
{`{
  "allowed": false,
  "message": "Access denied. You are 15.2 km away from the allowed location.",
  "viewerLocation": "Brooklyn, NY"
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-red-500 pl-4">
              <p className="font-semibold text-sm">400 Bad Request</p>
              <p className="text-xs text-muted-foreground">Invalid request parameters or malformed JSON</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="font-semibold text-sm">401 Unauthorized</p>
              <p className="text-xs text-muted-foreground">Missing or invalid authentication token</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="font-semibold text-sm">403 Forbidden</p>
              <p className="text-xs text-muted-foreground">Valid authentication but insufficient permissions</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold text-sm">404 Not Found</p>
              <p className="text-xs text-muted-foreground">Requested resource does not exist</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="font-semibold text-sm">429 Too Many Requests</p>
              <p className="text-xs text-muted-foreground">Rate limit exceeded</p>
            </div>
            <div className="border-l-4 border-gray-500 pl-4">
              <p className="font-semibold text-sm">500 Internal Server Error</p>
              <p className="text-xs text-muted-foreground">Server-side error occurred</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-sm">
            <strong>Rate Limiting:</strong> API requests are rate-limited to 100 requests per minute per user.
            Exceeding this limit will result in 429 responses. Contact support for higher limits.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
