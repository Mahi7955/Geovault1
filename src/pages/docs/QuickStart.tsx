import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QuickStart() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Quick Start Guide</h1>
        <p className="text-xl text-muted-foreground">
          Get up and running with SecureVault in minutes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Before getting started with SecureVault, ensure you have:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
            <li>A modern web browser (Chrome, Firefox, Safari, or Edge)</li>
            <li>An active internet connection</li>
            <li>Location services enabled on your device (for geo-verification features)</li>
            <li>A valid email address for account creation</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Create an Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>Navigate to the SecureVault application</li>
            <li>Click on the <Badge>Get Started</Badge> button on the homepage</li>
            <li>You'll be redirected to the authentication page</li>
            <li>Click on <Badge variant="outline">Sign Up</Badge> to create a new account</li>
            <li>Enter your email address and create a strong password</li>
            <li>Click <Badge>Sign Up</Badge> to complete registration</li>
            <li>You'll be automatically logged in and redirected to your dashboard</li>
          </ol>
          
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm font-semibold mb-2">Password Requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Minimum 6 characters</li>
              <li>Mix of letters and numbers recommended</li>
              <li>Special characters for enhanced security</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: Create Your First Secret</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>From your dashboard, click the <Badge>Create Secret</Badge> button</li>
            <li>Fill in the secret details:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li><strong>Title:</strong> A descriptive name for your secret</li>
                <li><strong>Secret Content:</strong> The sensitive information you want to share</li>
                <li><strong>Max Views:</strong> How many times the secret can be accessed (default: 1)</li>
                <li><strong>Expires In:</strong> How many hours until the secret expires (default: 24)</li>
              </ul>
            </li>
            <li><em>(Optional)</em> Attach a file by dragging and dropping or clicking to browse</li>
            <li><em>(Optional)</em> Enable geo-restrictions:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Click <Badge variant="outline">Get Current Location</Badge> to use your current coordinates</li>
                <li>Or manually enter latitude and longitude values</li>
              </ul>
            </li>
            <li>Click <Badge>Create Secret</Badge> to generate your secure link</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 3: Share Your Secret</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Once created, you'll see:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
            <li>A unique shareable URL</li>
            <li>A QR code that can be scanned</li>
            <li>A <Badge variant="outline">Copy Link</Badge> button for easy sharing</li>
            <li>A <Badge variant="outline">Create Another</Badge> button to create more secrets</li>
          </ul>
          
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mt-4">
            <p className="text-sm">
              <strong>Important:</strong> Share this link only with the intended recipient. Anyone with the link
              can attempt to access the secret (subject to geo-restrictions and view limits).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 4: View a Secret (Recipient Side)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>Open the shared secret link in your browser</li>
            <li>You'll see the secret title and basic information</li>
            <li>If geo-restrictions are enabled, click <Badge>Verify Location & View Secret</Badge></li>
            <li>Grant location permission when prompted by your browser</li>
            <li>If you're within the allowed location (100m radius):
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>The secret content will be displayed</li>
                <li>Any attached files will be shown</li>
                <li>The view count will be decremented</li>
              </ul>
            </li>
            <li>If outside the allowed location, access will be denied with distance information</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 5: Manage Your Secrets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>From your dashboard, you can:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
            <li><strong>View Statistics:</strong> See total secrets, active secrets, and total views</li>
            <li><strong>Search Secrets:</strong> Use the search bar to filter by title</li>
            <li><strong>Share Secrets:</strong> Click the share icon to get the link or QR code</li>
            <li><strong>Delete Secrets:</strong> Click the delete button with confirmation</li>
            <li><strong>Monitor Status:</strong> Check if secrets are Active or Expired</li>
            <li><strong>View Details:</strong> See remaining views and expiration times</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">Now that you're familiar with the basics, explore:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
            <li>Advanced security features in the Security section</li>
            <li>Audit logs to track access attempts</li>
            <li>API documentation for integration</li>
            <li>Best practices for secure secret sharing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
