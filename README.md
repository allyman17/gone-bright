# Gone Bright - Hue Controller

A modern, cross-platform desktop application for controlling your Philips Hue smart lighting system. Built with Electron, React, and TypeScript.

## Features

- **Room-Based Control**: Organize and control lights by room with intuitive cards
- **Individual Light Control**: Fine-tune brightness and color for each light
- **Scene Management**: Quickly activate pre-configured scenes for any room
- **Real-time Updates**: Live status updates with automatic polling every 5 seconds
- **Persistent Connection**: Bridge connection details are saved and automatically restored
- **Demo Mode**: Try the app without a physical Hue Bridge
- **Search & Filter**: Quickly find lights with built-in search functionality
- **Cross-Platform**: Available for Linux, macOS, and Windows

## Prerequisites

- Node.js (v16 or higher)
- A Philips Hue Bridge (or use Demo Mode)
- Hue Bridge API credentials (IP address and username)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd open-hue-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up Gemini API key in `.env.local` for AI features:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Development

Run the app in development mode:

```bash
npm run dev
```

Run as Electron app:

```bash
npm run electron:dev
```

## Building

Build the application for your platform:

```bash
npm run electron:build
```

This will create distributable packages in the `release` directory:
- **Linux**: AppImage and .deb packages
- **macOS**: .dmg and .zip
- **Windows**: NSIS installer and portable executable

## Connecting to Your Hue Bridge

### First Time Setup

1. Find your Hue Bridge IP address (check your router or use the Hue app)
2. Create a new user on your bridge:
   - Press the physical button on your Hue Bridge
   - Within 30 seconds, make a POST request to: `https://<bridge-ip>/api`
   - Body: `{"devicetype":"gone_bright#desktop"}`
   - Save the returned username
3. Accept the HTTPS certificate warning in your browser by visiting `https://<bridge-ip>`
4. Enter your Bridge IP and username in the app

### Demo Mode

Don't have a Hue Bridge? Click "Try Demo Mode" to explore the app with simulated lights and rooms.

## Project Structure

```
├── components/          # React components
│   ├── Assistant.tsx    # AI assistant integration
│   ├── Connect.tsx      # Bridge connection screen
│   ├── Dashboard.tsx    # Main room dashboard
│   ├── Layout.tsx       # App layout wrapper
│   ├── LightControl.tsx # Individual light controls
│   ├── SceneModal.tsx   # Scene selection modal
│   └── ui.tsx          # Reusable UI components
├── services/           # Business logic
│   ├── geminiService.ts # AI integration
│   └── hueService.ts    # Hue Bridge API client
├── App.tsx             # Main application component
├── main.ts             # Electron main process
├── preload.ts          # Electron preload script
└── types.ts            # TypeScript type definitions
```

## Technologies

- **Electron**: Cross-platform desktop framework
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Lucide React**: Icon library
- **Philips Hue API v2**: Smart lighting control

## License

This project is private and not licensed for public use.

## Troubleshooting

### Connection Issues

- Ensure your computer is on the same network as your Hue Bridge
- Accept the HTTPS certificate by visiting `https://<bridge-ip>` in your browser
- Verify your username is valid by testing it with the Hue API directly

### Build Issues

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist dist-electron release`
- Ensure you have the latest Node.js LTS version

## Contributing

This is a private project. Contact the maintainer for contribution guidelines.
