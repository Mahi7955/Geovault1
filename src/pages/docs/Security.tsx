import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";

export default function Security() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Security Overview</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive security architecture and threat mitigation strategies
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          SecureVault implements multiple layers of security to protect sensitive data throughout its lifecycle.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Security Layers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Layer 1: Transport Security
            </h3>
            <div className="ml-7 space-y-2 text-sm text-muted-foreground">
              <p><strong>TLS 1.3 Encryption:</strong> All data transmitted between clients and servers is encrypted using the latest TLS protocol.</p>
              <p><strong>HTTPS Enforcement:</strong> HTTP requests are automatically redirected to HTTPS.</p>
              <p><strong>HSTS Headers:</strong> Strict-Transport-Security headers prevent protocol downgrade attacks.</p>
              <p><strong>Certificate Pinning:</strong> Production deployments use certificate pinning for additional security.</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Layer 2: Application Security
            </h3>
            <div className="ml-7 space-y-2 text-sm text-muted-foreground">
              <p><strong>JWT Authentication:</strong> JSON Web Tokens with short expiration times (1 hour) for session management.</p>
              <p><strong>Refresh Tokens:</strong> Secure refresh token rotation prevents token theft.</p>
              <p><strong>CSRF Protection:</strong> SameSite cookie attributes and CSRF tokens on sensitive operations.</p>
              <p><strong>XSS Prevention:</strong> React's built-in XSS protection plus Content Security Policy headers.</p>
              <p><strong>SQL Injection Prevention:</strong> Parameterized queries and ORM usage eliminate SQL injection vectors.</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Layer 3: Data Security
            </h3>
            <div className="ml-7 space-y-2 text-sm text-muted-foreground">
              <p><strong>Encryption at Rest:</strong> All database data is encrypted using AES-256 encryption.</p>
              <p><strong>Content Encryption:</strong> Secret content is encrypted before storage using Base64 encoding (production uses AES-GCM).</p>
              <p><strong>Key Management:</strong> Encryption keys are hashed and stored separately from encrypted content.</p>
              <p><strong>Secure File Storage:</strong> Uploaded files are stored in isolated buckets with access controls.</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Layer 4: Access Control
            </h3>
            <div className="ml-7 space-y-2 text-sm text-muted-foreground">
              <p><strong>Row-Level Security:</strong> PostgreSQL RLS policies ensure users can only access their own data.</p>
              <p><strong>Geo-Fencing:</strong> Location-based access control with 100-meter precision using Haversine formula.</p>
              <p><strong>View Limits:</strong> Automatic secret deactivation after configured view limit is reached.</p>
              <p><strong>Time-Based Expiration:</strong> Secrets automatically expire and become inaccessible after set duration.</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Layer 5: Monitoring & Auditing
            </h3>
            <div className="ml-7 space-y-2 text-sm text-muted-foreground">
              <p><strong>Access Logging:</strong> All secret access attempts are logged with full context.</p>
              <p><strong>IP Tracking:</strong> Viewer IP addresses are recorded for forensic analysis.</p>
              <p><strong>User Agent Detection:</strong> Browser and device information captured for security monitoring.</p>
              <p><strong>Location Logging:</strong> GPS coordinates and geocoded addresses stored in audit trail.</p>
              <p><strong>Anomaly Detection:</strong> Unusual access patterns trigger security alerts.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Threat Model & Mitigation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Threat: Unauthorized Access
              </h3>
              <p className="text-sm text-muted-foreground mb-2"><strong>Risk:</strong> Attackers attempting to access secrets without authorization.</p>
              <p className="text-sm"><strong>Mitigation:</strong></p>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-1">
                <li>JWT-based authentication with short expiration</li>
                <li>Geo-location verification for restricted secrets</li>
                <li>View limit enforcement</li>
                <li>Time-based expiration</li>
                <li>Comprehensive audit logging</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Threat: Data Breach
              </h3>
              <p className="text-sm text-muted-foreground mb-2"><strong>Risk:</strong> Database compromise exposing sensitive secrets.</p>
              <p className="text-sm"><strong>Mitigation:</strong></p>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-1">
                <li>Encryption at rest using AES-256</li>
                <li>Encrypted secret content storage</li>
                <li>Separate encryption key storage</li>
                <li>Row-Level Security policies</li>
                <li>Regular security audits</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Threat: Man-in-the-Middle Attacks
              </h3>
              <p className="text-sm text-muted-foreground mb-2"><strong>Risk:</strong> Interception of data in transit.</p>
              <p className="text-sm"><strong>Mitigation:</strong></p>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-1">
                <li>TLS 1.3 encryption for all communications</li>
                <li>HTTPS enforcement with HSTS</li>
                <li>Certificate pinning in production</li>
                <li>Secure WebSocket connections</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-500" />
                Threat: Location Spoofing
              </h3>
              <p className="text-sm text-muted-foreground mb-2"><strong>Risk:</strong> Attackers falsifying GPS coordinates to bypass geo-restrictions.</p>
              <p className="text-sm"><strong>Mitigation:</strong></p>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-1">
                <li>Server-side location verification using Edge Functions</li>
                <li>Google Maps API for address validation</li>
                <li>Audit logging of all location data</li>
                <li>Multiple verification factors (IP geolocation cross-check planned)</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-500" />
                Threat: Session Hijacking
              </h3>
              <p className="text-sm text-muted-foreground mb-2"><strong>Risk:</strong> Attackers stealing and reusing user sessions.</p>
              <p className="text-sm"><strong>Mitigation:</strong></p>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-1">
                <li>HttpOnly and Secure cookie flags</li>
                <li>Short token expiration (1 hour)</li>
                <li>Refresh token rotation</li>
                <li>IP address validation (optional)</li>
                <li>Session termination on suspicious activity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance & Standards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">GDPR Compliance</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Data minimization principles</li>
                <li>• User consent management</li>
                <li>• Right to deletion (RTBF)</li>
                <li>• Data portability support</li>
                <li>• Privacy by design</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">OWASP Top 10</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Injection prevention</li>
                <li>• Authentication security</li>
                <li>• Sensitive data protection</li>
                <li>• Access control enforcement</li>
                <li>• Security misconfiguration checks</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">SOC 2 Type II</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Security controls documentation</li>
                <li>• Availability monitoring</li>
                <li>• Processing integrity</li>
                <li>• Confidentiality measures</li>
                <li>• Privacy frameworks</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">ISO 27001</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Information security management</li>
                <li>• Risk assessment procedures</li>
                <li>• Security policy enforcement</li>
                <li>• Incident response plans</li>
                <li>• Continuous improvement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Regular Activities</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li><strong>Weekly:</strong> Security patch reviews and critical updates</li>
              <li><strong>Monthly:</strong> Dependency vulnerability scans (npm audit, Snyk)</li>
              <li><strong>Quarterly:</strong> Penetration testing and security audits</li>
              <li><strong>Annually:</strong> Full security architecture review and compliance audit</li>
              <li><strong>Continuous:</strong> Automated security scanning in CI/CD pipeline</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Incident Response</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>24/7 security monitoring and alerting</li>
              <li>Dedicated incident response team</li>
              <li>Documented escalation procedures</li>
              <li>Post-incident analysis and reporting</li>
              <li>User notification within 72 hours for breaches</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> If you discover a security vulnerability, please report it to security@securevault.com. 
          We take all security reports seriously and will respond within 24 hours.
        </AlertDescription>
      </Alert>
    </div>
  );
}
