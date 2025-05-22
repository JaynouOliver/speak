# Electron React Application

This is an Electron application built with React.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Install the main dependencies:
```bash
npm install
```

2. The React app dependencies will be installed automatically through the postinstall script.

## Development

To run the application in development mode:

```bash
npm run dev
```

This will start both the Electron app and the React development server.

## Building

To build the React app:

```bash
npm run build
```

## Project Structure

- `main.js` - Main Electron process file
- `src/` - React application directory
  - `src/public/` - Static files
  - `src/src/` - React source code 