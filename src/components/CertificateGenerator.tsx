import React, { useState, useEffect, useMemo } from "react";
import {
  Download,
  Copy,
  Key,
  Shield,
  Globe,
  Terminal,
  Lock,
  FileText,
  RotateCw,
} from "lucide-react";

type CertificateType =
  | "ssh-rsa"
  | "ssh-ed25519"
  | "ssl-csr"
  | "ssl-self-signed"
  | "jwt-token"
  | "api-key";

interface KeyPairData {
  username: string;
  email: string;
  comment: string;
  keySize: string;
  domain: string;
  organization: string;
  country: string;
  state: string;
  city: string;
  validDays: string;
  algorithm: string;
  passphrase: string;
}

// Generate a random string for keys
const generateRandomString = (length: number): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const certificateTemplates = {
  "ssh-rsa": {
    title: "SSH RSA Key Pair",
    icon: <Key size={20} />,
    template: (data: KeyPairData) => {
      const keyId = `rsa-key-${Date.now()}`;
      const publicKeyContent = generateRandomString(372);
      const privateKeyContent = generateRandomString(1679);

      return {
        publicKey: `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ${publicKeyContent} ${data.comment || `${data.username}@${data.email}`}`,
        privateKey: `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAgEA${privateKeyContent}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
-----END OPENSSH PRIVATE KEY-----`,
        info: `SSH RSA Key Pair Generated

Key Details:
- Algorithm: RSA
- Key Size: ${data.keySize} bits
- Comment: ${data.comment || `${data.username}@${data.email}`}
- Passphrase: ${data.passphrase ? 'Protected with passphrase' : 'No passphrase (less secure)'}
- Generated: ${new Date().toISOString()}
- Key ID: ${keyId}

Usage Instructions:
1. Save the private key to ~/.ssh/id_rsa (chmod 600)
2. Save the public key to ~/.ssh/id_rsa.pub
3. Add public key to remote server's ~/.ssh/authorized_keys
4. Test connection: ssh -i ~/.ssh/id_rsa user@server
${data.passphrase ? '5. Enter passphrase when prompted for key usage' : ''}

Security Notes:
- Keep private key secure and never share it
${data.passphrase ? '- Private key is encrypted with your passphrase' : '- Consider adding a passphrase for better security'}
- This is a demo key - generate real keys with ssh-keygen

${data.passphrase ? `
Passphrase Commands:
- Add passphrase: ssh-keygen -p -f ~/.ssh/id_rsa
- Remove passphrase: ssh-keygen -p -f ~/.ssh/id_rsa
- Change passphrase: ssh-keygen -p -f ~/.ssh/id_rsa` : ''}`,
      };
    },
  },
  "ssh-ed25519": {
    title: "SSH Ed25519 Key Pair",
    icon: <Lock size={20} />,
    template: (data: KeyPairData) => {
      const keyId = `ed25519-key-${Date.now()}`;
      const publicKeyContent = generateRandomString(43);
      const privateKeyContent = generateRandomString(88);

      return {
        publicKey: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA${publicKeyContent} ${data.comment || `${data.username}@${data.email}`}`,
        privateKey: `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACB${privateKeyContent}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
${generateRandomString(64)}
-----END OPENSSH PRIVATE KEY-----`,
        info: `SSH Ed25519 Key Pair Generated

Key Details:
- Algorithm: Ed25519 (Elliptic Curve)
- Key Size: 256 bits (equivalent to 3072-bit RSA)
- Comment: ${data.comment || `${data.username}@${data.email}`}
- Passphrase: ${data.passphrase ? 'Protected with passphrase' : 'No passphrase (less secure)'}
- Generated: ${new Date().toISOString()}
- Key ID: ${keyId}

Usage Instructions:
1. Save the private key to ~/.ssh/id_ed25519 (chmod 600)
2. Save the public key to ~/.ssh/id_ed25519.pub
3. Add public key to remote server's ~/.ssh/authorized_keys
4. Test connection: ssh -i ~/.ssh/id_ed25519 user@server
${data.passphrase ? '5. Enter passphrase when prompted for key usage' : ''}

Advantages of Ed25519:
- Faster key generation and verification
- Smaller key size with equivalent security
- Resistant to side-channel attacks
- Modern cryptographic standard

Security Notes:
- Keep private key secure and never share it
${data.passphrase ? '- Private key is encrypted with your passphrase' : '- Consider adding a passphrase for better security'}
- This is a demo key - generate real keys with ssh-keygen

${data.passphrase ? `
Passphrase Commands:
- Add passphrase: ssh-keygen -p -f ~/.ssh/id_ed25519
- Remove passphrase: ssh-keygen -p -f ~/.ssh/id_ed25519
- Change passphrase: ssh-keygen -p -f ~/.ssh/id_ed25519` : ''}`,
      };
    },
  },
  "ssl-csr": {
    title: "SSL Certificate Signing Request",
    icon: <Shield size={20} />,
    template: (data: KeyPairData) => {
      const csrContent = generateRandomString(1024);

      return {
        csr: `-----BEGIN CERTIFICATE REQUEST-----
MIICvDCCAaQCAQAwdzELMAkGA1UEBhMC${btoa(data.country).slice(0, 4)}MQswCQYDVQQI
DAI${btoa(data.state).slice(0, 6)}MREwDwYDVQQHDAh${btoa(data.city).slice(0, 8)}MSEwHwYDVQQK
DBg${btoa(data.organization).slice(0, 16)}MRUwEwYDVQQLDAxTU0wgU2VjdGlvbjEeMBwGA1UE
AwwV${btoa(data.domain).slice(0, 20)}
${csrContent}
-----END CERTIFICATE REQUEST-----`,
        info: `SSL Certificate Signing Request (CSR) Generated

Certificate Details:
- Common Name (CN): ${data.domain}
- Organization (O): ${data.organization}
- Organizational Unit (OU): SSL Section
- City/Locality (L): ${data.city}
- State/Province (ST): ${data.state}
- Country (C): ${data.country}
- Key Algorithm: RSA
- Key Size: ${data.keySize} bits
- Generated: ${new Date().toISOString()}

Next Steps:
1. Submit this CSR to a Certificate Authority (CA)
2. Complete domain validation process
3. Download the issued SSL certificate
4. Install certificate on your web server

Popular Certificate Authorities:
- Let's Encrypt (Free)
- DigiCert
- Comodo/Sectigo
- GlobalSign

Note: This is a sample CSR for demonstration.
Use OpenSSL or similar tools for production certificates.`,
      };
    },
  },
  "ssl-self-signed": {
    title: "Self-Signed SSL Certificate",
    icon: <Globe size={20} />,
    template: (data: KeyPairData) => {
      const certContent = generateRandomString(1200);
      const validFrom = new Date();
      const validTo = new Date();
      validTo.setDate(validTo.getDate() + parseInt(data.validDays));

      return {
        certificate: `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAk${btoa(data.country).slice(0, 4)}MRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQK
DBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwHhcN${validFrom.getFullYear()}${String(validFrom.getMonth() + 1).padStart(2, "0")}${String(validFrom.getDate()).padStart(2, "0")}000000Z
Fw0${validTo.getFullYear()}${String(validTo.getMonth() + 1).padStart(2, "0")}${String(validTo.getDate()).padStart(2, "0")}000000Z0RTE${btoa(data.domain).slice(0, 20)}
${certContent}
-----END CERTIFICATE-----`,
        privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKB
${generateRandomString(1400)}
-----END PRIVATE KEY-----`,
        info: `Self-Signed SSL Certificate Generated

Certificate Details:
- Common Name (CN): ${data.domain}
- Organization (O): ${data.organization}
- Country (C): ${data.country}
- Valid From: ${validFrom.toISOString().split("T")[0]}
- Valid To: ${validTo.toISOString().split("T")[0]}
- Key Algorithm: RSA
- Key Size: ${data.keySize} bits
- Private Key: ${data.passphrase ? 'Protected with passphrase' : 'No passphrase protection'}
- Serial Number: ${Math.random().toString(16).slice(2, 18)}
- Generated: ${new Date().toISOString()}

Usage:
1. Save certificate as server.crt
2. Save private key as server.key (chmod 600)
3. Configure web server (Apache/Nginx)
4. Browsers will show security warning (expected for self-signed)
${data.passphrase ? '5. Enter passphrase when server starts/reloads' : ''}

Web Server Configuration Examples:

Apache:
SSLCertificateFile /path/to/server.crt
SSLCertificateKeyFile /path/to/server.key
${data.passphrase ? 'SSLPassPhraseDialog builtin' : ''}

Nginx:
ssl_certificate /path/to/server.crt;
ssl_certificate_key /path/to/server.key;
${data.passphrase ? '# Note: Nginx will prompt for passphrase on startup' : ''}

${data.passphrase ? `
Passphrase Management:
- Remove passphrase: openssl rsa -in server.key -out server_nopass.key
- Change passphrase: openssl rsa -in server.key -des3 -out server_new.key
- Verify key: openssl rsa -in server.key -check` : ''}

Security Notes:
${data.passphrase ? '- Private key is encrypted and requires passphrase' : '- Consider adding passphrase protection for production'}
- Self-signed certificates are not trusted by browsers
- Use only for development/testing environments`,
      };
    },
  },
  "jwt-token": {
    title: "JWT Token Generator",
    icon: <FileText size={20} />,
    template: (data: KeyPairData) => {
      const header = btoa(
        JSON.stringify({
          alg: data.algorithm || "HS256",
          typ: "JWT",
        })
      ).replace(/=/g, "");

      const payload = btoa(
        JSON.stringify({
          sub: data.username,
          email: data.email,
          iat: Math.floor(Date.now() / 1000),
          exp:
            Math.floor(Date.now() / 1000) +
            parseInt(data.validDays) * 24 * 60 * 60,
          iss: data.organization,
          aud: data.domain,
        })
      ).replace(/=/g, "");

      const signature = generateRandomString(43).replace(/=/g, "");
      const token = `${header}.${payload}.${signature}`;

      return {
        token: token,
        info: `JWT Token Generated

Token Details:
- Algorithm: ${data.algorithm || "HS256"}
- Subject: ${data.username}
- Email: ${data.email}
- Issuer: ${data.organization}
- Audience: ${data.domain}
- Issued At: ${new Date().toISOString()}
- Expires: ${new Date(Date.now() + parseInt(data.validDays) * 24 * 60 * 60 * 1000).toISOString()}

Token Structure:
Header: ${header}
Payload: ${payload}
Signature: ${signature}

Usage Examples:

Authorization Header:
Authorization: Bearer ${token}

JavaScript:
localStorage.setItem('token', '${token}');

cURL:
curl -H "Authorization: Bearer ${token}" https://api.example.com/data

Python:
headers = {'Authorization': f'Bearer ${token}'}

Note: This is a demo token with a mock signature.
Use proper JWT libraries for production tokens.`,
      };
    },
  },
  "api-key": {
    title: "API Key Generator",
    icon: <Terminal size={20} />,
    template: (data: KeyPairData) => {
      const apiKey = `ak_${generateRandomString(32)}`;
      const secretKey = `sk_${generateRandomString(48)}`;
      const keyId = `key_${Date.now()}`;

      return {
        apiKey: apiKey,
        secretKey: secretKey,
        info: `API Key Pair Generated

Key Details:
- API Key: ${apiKey}
- Secret Key: ${secretKey}
- Key ID: ${keyId}
- Organization: ${data.organization}
- Created: ${new Date().toISOString()}
- Valid for: ${data.validDays} days

Usage Examples:

REST API Header:
X-API-Key: ${apiKey}
X-API-Secret: ${secretKey}

cURL:
curl -H "X-API-Key: ${apiKey}" \\
     -H "X-API-Secret: ${secretKey}" \\
     https://api.example.com/v1/data

JavaScript:
const headers = {
  'X-API-Key': '${apiKey}',
  'X-API-Secret': '${secretKey}'
};

Python:
headers = {
    'X-API-Key': '${apiKey}',
    'X-API-Secret': '${secretKey}'
}

Security Best Practices:
- Store keys securely (environment variables)
- Use HTTPS only
- Rotate keys regularly
- Monitor key usage
- Implement rate limiting

Note: These are demo keys for development/testing only.`,
      };
    },
  },
};

export default function CertificateGenerator() {
  const [certificateType, setCertificateType] =
    useState<CertificateType>("ssh-rsa");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"public" | "private" | "info">(
    "public"
  );
  const [regenerateKey, setRegenerateKey] = useState(0);
  const [formData, setFormData] = useState<KeyPairData>({
    username: "developer",
    email: "dev@example.com",
    comment: "",
    keySize: "2048",
    domain: "example.com",
    organization: "My Organization",
    country: "US",
    state: "California",
    city: "San Francisco",
    validDays: "365",
    algorithm: "HS256",
    passphrase: "",
  });

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRegenerate = () => {
    setRegenerateKey((prev) => prev + 1);
    showToastMessage("New certificate generated!");
  };

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToastMessage(`${type} copied to clipboard!`);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToastMessage(`Failed to copy ${type.toLowerCase()}`);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToastMessage(`${filename} downloaded!`);
  };

  const handleInputChange = (field: keyof KeyPairData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const certificateTypeOptions = [
    { value: "ssh-rsa", label: "SSH RSA", icon: <Key size={16} /> },
    { value: "ssh-ed25519", label: "SSH Ed25519", icon: <Lock size={16} /> },
    { value: "ssl-csr", label: "SSL CSR", icon: <Shield size={16} /> },
    {
      value: "ssl-self-signed",
      label: "Self-Signed SSL",
      icon: <Globe size={16} />,
    },
    { value: "jwt-token", label: "JWT Token", icon: <FileText size={16} /> },
    { value: "api-key", label: "API Key", icon: <Terminal size={16} /> },
  ];

  // Memoize certificate generation to prevent regeneration on every render
  const generated = useMemo(() => {
    const template = certificateTemplates[certificateType];
    return template.template(formData);
  }, [certificateType, formData, regenerateKey]);

  // Reset active tab when certificate type changes
  useEffect(() => {
    const availableTabs = Object.keys(generated);
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] as any);
    }
  }, [certificateType, generated, activeTab]);

  return (
    <div className="max-w-7xl">
      <h2 className="text-2xl font-bold mb-6">Certificate & Key Generator</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Certificate Type
            </label>
            <div className="grid grid-cols-1 gap-2">
              {certificateTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setCertificateType(option.value as CertificateType)
                  }
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                    certificateType === option.value
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {(certificateType === "ssh-rsa" ||
              certificateType === "ssh-ed25519") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.comment}
                    onChange={(e) =>
                      handleInputChange("comment", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional comment"
                  />
                </div>
                {certificateType === "ssh-rsa" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Size
                    </label>
                    <select
                      value={formData.keySize}
                      onChange={(e) =>
                        handleInputChange("keySize", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="2048">2048 bits</option>
                      <option value="3072">3072 bits</option>
                      <option value="4096">4096 bits</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passphrase (Optional)
                  </label>
                  <input
                    type="password"
                    value={formData.passphrase}
                    onChange={(e) =>
                      handleInputChange("passphrase", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter passphrase for additional security"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for no passphrase (less secure)
                  </p>
                </div>
              </>
            )}

            {(certificateType === "ssl-csr" ||
              certificateType === "ssl-self-signed") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) =>
                      handleInputChange("domain", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) =>
                      handleInputChange("organization", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Organization"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="US"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="California"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="San Francisco"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Size
                  </label>
                  <select
                    value={formData.keySize}
                    onChange={(e) =>
                      handleInputChange("keySize", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2048">2048 bits</option>
                    <option value="4096">4096 bits</option>
                  </select>
                </div>
                {certificateType === "ssl-self-signed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Days
                    </label>
                    <input
                      type="number"
                      value={formData.validDays}
                      onChange={(e) =>
                        handleInputChange("validDays", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="365"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Private Key Passphrase (Optional)
                  </label>
                  <input
                    type="password"
                    value={formData.passphrase}
                    onChange={(e) =>
                      handleInputChange("passphrase", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter passphrase to encrypt private key"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended for production certificates
                  </p>
                </div>
              </>
            )}

            {certificateType === "jwt-token" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username/Subject
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuer
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) =>
                      handleInputChange("organization", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Token issuer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audience
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) =>
                      handleInputChange("domain", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Token audience"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Algorithm
                  </label>
                  <select
                    value={formData.algorithm}
                    onChange={(e) =>
                      handleInputChange("algorithm", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="HS256">HS256</option>
                    <option value="HS384">HS384</option>
                    <option value="HS512">HS512</option>
                    <option value="RS256">RS256</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Days
                  </label>
                  <input
                    type="number"
                    value={formData.validDays}
                    onChange={(e) =>
                      handleInputChange("validDays", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="30"
                  />
                </div>
              </>
            )}

            {certificateType === "api-key" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) =>
                      handleInputChange("organization", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Organization"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Days
                  </label>
                  <input
                    type="number"
                    value={formData.validDays}
                    onChange={(e) =>
                      handleInputChange("validDays", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="90"
                  />
                </div>
              </>
            )}
          </div>

          {/* Regenerate Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleRegenerate}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-medium"
            >
              <RotateCw size={16} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex space-x-1 border-b border-gray-200">
            {Object.keys(generated).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {key === "publicKey"
                  ? "Public Key"
                  : key === "privateKey"
                    ? "Private Key"
                    : key === "certificate"
                      ? "Certificate"
                      : key === "csr"
                        ? "CSR"
                        : key === "token"
                          ? "JWT Token"
                          : key === "apiKey"
                            ? "API Key"
                            : key === "secretKey"
                              ? "Secret Key"
                              : key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {Object.entries(generated).map(
              ([key, content]) =>
                activeTab === key && (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">
                        {key === "publicKey"
                          ? "Public Key"
                          : key === "privateKey"
                            ? "Private Key"
                            : key === "certificate"
                              ? "Certificate"
                              : key === "csr"
                                ? "Certificate Signing Request"
                                : key === "token"
                                  ? "JWT Token"
                                  : key === "apiKey"
                                    ? "API Key"
                                    : key === "secretKey"
                                      ? "Secret Key"
                                      : key.charAt(0).toUpperCase() +
                                        key.slice(1)}
                      </label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(content, key)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
                        >
                          <Copy size={14} />
                          <span>Copy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              content,
                              `${key}.${key === "info" ? "txt" : key === "publicKey" ? "pub" : key === "privateKey" ? "key" : key === "certificate" ? "crt" : key === "csr" ? "csr" : "txt"}`
                            )
                          }
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={content}
                      readOnly
                      rows={key === "info" ? 20 : 12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-xs resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-up">
          <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
