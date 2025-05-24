// Main entry point - using the new modular structure
import { app } from 'electron';
import { Application } from './main/index';

// Start the application
const application = new Application();
application.initialize().catch(console.error);
