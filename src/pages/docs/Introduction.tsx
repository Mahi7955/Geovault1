import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, MapPin, Clock, FileText, Activity } from "lucide-react";

export default function Introduction() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Introduction to SecureVault</h1>
        <p className="text-xl text-muted-foreground">
          A comprehensive guide to understanding and using SecureVault for secure secret sharing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What is SecureVault?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            SecureVault is an advanced web-based application designed to facilitate secure sharing of sensitive information
            with robust geo-location verification and time-based access controls. Built with modern web technologies and
            security best practices, it ensures that your secrets remain confidential and accessible only to authorized recipients.
          </p>
          <p>
            The platform combines encryption, location-based authentication, and comprehensive audit logging to provide
            a multi-layered security approach for sharing passwords, API keys, credentials, and other sensitive data.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <Lock className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">End-to-End Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  All secrets are encrypted before storage using industry-standard encryption algorithms
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Geo-Location Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Restrict secret access to specific geographic locations with 100-meter precision
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Time-Based Expiration</h3>
                <p className="text-sm text-muted-foreground">
                  Set automatic expiration times to ensure secrets don't remain accessible indefinitely
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">File Attachments</h3>
                <p className="text-sm text-muted-foreground">
                  Attach images, videos, audio files, or PDFs up to 50MB alongside text secrets
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Activity className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Audit Trail</h3>
                <p className="text-sm text-muted-foreground">
                  Complete logging of all access attempts with IP addresses, locations, and timestamps
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">View Limits</h3>
                <p className="text-sm text-muted-foreground">
                  Control how many times a secret can be accessed before automatic deactivation
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Use Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Corporate Security</h3>
            <p className="text-sm text-muted-foreground">
              Share sensitive corporate credentials, API keys, and access tokens with team members while ensuring
              they can only be accessed from approved office locations.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Personal Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Send passwords, account recovery codes, or private information to friends and family with the assurance
              that unauthorized parties cannot intercept or access the data.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Legal & Compliance</h3>
            <p className="text-sm text-muted-foreground">
              Share confidential legal documents or compliance materials with geographic and time restrictions
              that meet regulatory requirements.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Healthcare</h3>
            <p className="text-sm text-muted-foreground">
              Securely transmit patient information or medical records with HIPAA-compliant access controls and
              comprehensive audit trails.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentation Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">This documentation is organized into the following sections:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
            <li><strong>Getting Started:</strong> Quick start guides and project overview</li>
            <li><strong>Architecture:</strong> System design and technical infrastructure</li>
            <li><strong>Features:</strong> Detailed feature documentation and usage</li>
            <li><strong>Database:</strong> Schema design and data management</li>
            <li><strong>API Documentation:</strong> Endpoint references and integration guides</li>
            <li><strong>Security:</strong> Security measures and best practices</li>
            <li><strong>Guides:</strong> User and administrator guides</li>
            <li><strong>Help:</strong> Troubleshooting and support resources</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-sm">
            <strong>Note:</strong> SecureVault is designed with security as the top priority. All code undergoes
            regular security audits, and we follow industry best practices for encryption, authentication, and
            data protection.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
