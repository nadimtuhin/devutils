# DevUtils - Developer Tools for Everyday Tasks

![DevUtils Preview](./screenshots/preview.png)

DevUtils is a collection of essential developer utilities that work entirely in your browser. No data leaves your computer - everything works offline!

## 🚀 Features

- **Format & Beautify**
  - SQL Formatter
  - JSON Beautifier
  - HTML Minify/Beautify
  - CSS Minify/Beautify
  - JavaScript Minify/Beautify

- **Converters**
  - PHP Array ↔ JSON
  - PHP Serialized Data
  - String Case Converter
  - SVG to CSS
  - Color Formats
  - Hex ↔ ASCII
  - cURL to Code

- **Developer Tools**
  - Certificate Decoder
  - Line Sorter
  - Markdown Preview
  - Cron Job Parser

## 🛠 Tech Stack

- React + TypeScript
- Vite
- TailwindCSS
- Various formatting libraries

## 🏃‍♂️ Running Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/devutils.git

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔒 Security Scanning

This project uses [Trivy](https://trivy.dev/) for security vulnerability scanning. 

### Installing Trivy

First, install Trivy on your system:

**macOS (using Homebrew):**
```bash
brew install trivy
```

**Linux:**
```bash
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

**Windows (using Chocolatey):**
```bash
choco install trivy
```

**Or download directly from [GitHub releases](https://github.com/aquasecurity/trivy/releases)**

### Running Security Scans

Once Trivy is installed, you can run security scans using these npm scripts:

```bash
# Full security scan (vulnerabilities, secrets, config issues)
npm run security:scan

# Scan only dependencies
npm run security:scan-deps

# Generate JSON report
npm run security:scan-json

# Generate HTML report
npm run security:scan-html
```

The project also includes automated security scanning via GitHub Actions that runs on:
- Every push to main/develop branches
- Every pull request
- Weekly scheduled scans

Security reports are automatically uploaded to the GitHub Security tab for review.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/devutils&type=Date)](https://star-history.com/#yourusername/devutils&Date)

## 📸 Screenshots

Here are some of our popular tools in action:

### JSON Beautifier
![JSON Beautifier](./screenshots/json-to-code.png)

### SQL Formatter
![SQL Formatter](./screenshots/sql-formatter.png)

### Color Converter
![Color Converter](./screenshots/color-converter.png)

### Certificate Decoder
![Certificate Decoder](./screenshots/certificate-decoder.png)

## 🙏 Acknowledgments

- All the amazing open-source libraries that make this possible
- Our contributors and users who help improve the tools 