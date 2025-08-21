import jpos.*;
import jpos.events.*;

public class Main {
    public static void main(String[] args) {
        // Print current working directory
        String currentPath = System.getProperty("user.dir");
        System.out.println("Current working directory: " + currentPath);

        // Create scanners
        Scanner scanner0 = new Scanner();
        Scanner scanner1 = new Scanner();
        
        try {
            // Configure scanner0
            scanner0.open("MdScanner_0");
            scanner0.claim(1000);
            scanner0.setDeviceEnabled(true);
            scanner0.setDataEventEnabled(true);
            System.out.println("Device MdScanner_0 enabled");

            // Configure scanner1
            scanner1.open("MdScanner_1");
            scanner1.claim(1000);
            scanner1.setDeviceEnabled(true);
            scanner1.setDataEventEnabled(true);
            System.out.println("Device MdScanner_1 enabled");

            // Add data listener for scanner0
            scanner0.addDataListener(new DataListener() {
                public void dataOccurred(DataEvent event) {
                    try {
                        byte[] buffer = scanner0.getScanData();
                        String data = new String(buffer).trim();
                        System.out.println("MdScanner_0 scan data received: " + data);
                        // Release the event
                        scanner0.setDataEventEnabled(true);
                    } catch (JposException e) {
                        e.printStackTrace();
                    }
                }
            });
            
            // Add data listener for scanner1
            scanner1.addDataListener(new DataListener() {
                public void dataOccurred(DataEvent event) {
                    try {
                        byte[] buffer = scanner1.getScanData();
                        String data = new String(buffer).trim();
                        System.out.println("MdScanner_1 scan data received: " + data);
                        // Release the event
                        scanner1.setDataEventEnabled(true);
                    } catch (JposException e) {
                        e.printStackTrace();
                    }
                }
            });

            // Keep application running
            System.out.println("Press Enter to exit...");
            System.in.read();
            
            // Clean up resources when done
            scanner0.setDeviceEnabled(false);
            scanner0.release();
            scanner0.close();
            
            scanner1.setDeviceEnabled(false);
            scanner1.release();
            scanner1.close();
            
        } catch (JposException e) {
            e.printStackTrace();
        } catch (java.io.IOException e) {
            e.printStackTrace();
        }
    }
}
