// Main entry point - using the singleton pattern
import { Application } from './main/index';

// Use the singleton pattern to get the application instance
console.log('Application entry point starting');
const application = Application.getInstance();

// Initialize the application with proper error handling
application.initialize().catch(error => {
  console.error('Error initializing application:', error);
});
