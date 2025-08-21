# Mindeo JavaPOS Scanner Library

## Introduction

Mindeo JavaPOS Scanner Library is a barcode scanner driver library that complies with the JavaPOS standard, used for connecting and controlling Mindeo barcode scanner devices. This library implements the Scanner service interface in the JavaPOS specification, allowing Java applications to interact with Mindeo scanners through a standardized interface.

## Features

- Support for Mindeo barcode scanners connected via HID interface
- Compliant with JavaPOS 1.6 standard specification
- Provides device auto-recognition and event notification mechanism
- Supports multiple scanners connected and used simultaneously
- Supports distinguishing each scanner by device serial number or device node path
- Supports hot-plugging
- Supports sending commands to scanners via DirectIO
- Supports initial command lists
- Cross-platform support (currently Linux only, Windows support coming soon)
- Multi-architecture support (arm64, arm32, x86, x64)

## System Requirements

- Java JDK 8 or higher
- Linux operating system (tested on Ubuntu16 and ArchLinux2025)

## Quick Start

### Extract the SDK Package

```bash
tar -jxvf mdjposscanner-DATE.tar.bz2
```

The extraction will produce the following files:

- `mdjposscanner.jar` Java package
- `jpos106.jar` JavaPOS 1.6 standard library
- `xerces.jar` XML parsing library
- `x64/libmdjposscanner.so` 64-bit shared library file
- `x86/libmdjposscanner.so` 32-bit shared library file
- `v7a/libmdjposscanner.so` armv7a shared library file
- `v8a/libmdjposscanner.so` armv8a shared library file
- `readme.md` User manual
- `jpos.xml` Sample JavaPOS configuration file
- `jpos.properties` Sample JavaPOS configuration file
- `Main.java` Sample code
- `mdjposscanner-test.jar` Sample test program

### Run the Verification Program

The project includes a sample test program (`mdjposscanner-test.jar`) that can be used to verify the SDK and scanner functionality:

After extracting the SDK package, modify the `jpos.xml` file, replacing `Identifier` with your device's serial number or Linux device node path.

```xml
<prop name="Identifier" type="String" value="SNSNSNSNSN" />
```

Or

```xml
<prop name="Identifier" type="String" value="/dev/hidraw0" />
```

Then run the test script:

```bash
./quick.sh # Run the GUI test program
./quick.sh --cli # Run the CLI test program
```

At this point, if there are no issues, you should see that the scanner connects successfully, and scan results will be printed in the console.

## Usage

### Install Dependencies

On Debian/Ubuntu systems:

```bash
sudo apt install openjdk-8-jdk
```

On ArchLinux systems:

```bash
sudo pacman -S jdk8-openjdk
```

### Install udev Rules

```bash
sudo cp 20-mindeo.rules /etc/udev/rules.d
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Only after correctly installing the udev rules can the scanner devices be properly recognized. Otherwise, you may not be able to open the devices due to insufficient permissions.

You can check the permissions of the `/dev/hidraw*` device nodes to verify if the installation was successful.

```bash
ls -l /dev/hidraw*
```

After correctly installing the udev rules, the device node permissions should be `crw-rw-rw-`, otherwise they will be `crw-------`.

### Integrate the SDK into Your Project

Integrate into your project by following these steps:

1. Select the correct architecture's `libmdjposscanner.so` and add it to your library path
2. Add all JAR packages from the SDK to your classpath
3. Ensure the `jpos.xml` and `jpos.properties` files are in your classpath
4. Use the standard jpos interface to develop your application

### Create jpos.xml Configuration File

Create a `jpos.xml` file to define your scanner device:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jposEntries>
    <JposEntry logicalName="MdScanner_0">
        <creation factoryClass="com.mindeo.javapos.MDScannerServiceFactory"
            serviceClass="com.mindeo.javapos.MDScannerService" />
        <vendor name="Mindeo, Corp." />
        <jpos category="Scanner" version="1.6" />
        <product description="Mindeo Barcode Scanner" name="Mindeo Scanner" />
        <prop name="Interface" type="String" value="HID" />
        <prop name="Identifier" type="String" value="YOUR_DEVICE_IDENTIFIER" />
        <prop name="Initial1" type="String" value="%%%DEF" />
        <prop name="Initial2" type="String" value="9001D00" />
    </JposEntry>
</jposEntries>
```

Please replace `YOUR_DEVICE_IDENTIFIER` with your device's actual serial number (e.g., `SNSNSNSNSN`) or Linux device node path (e.g., `/dev/hidraw0`).  
If you have multiple scanners, you can add multiple `JposEntry` elements, each with a different `logicalName` and corresponding `Identifier`.  

Two methods are supported to distinguish different scanners:

1. Specify device serial number through the `Identifier` property, e.g., `SNSNSNSNSN`
2. Specify device node path through the `Identifier` property, e.g., `/dev/hidraw0`

You can specify initial commands through the `Initial1`, `Initial2`, ... properties, which will be automatically sent after the device is successfully opened.

### Create jpos.properties File

Create a `jpos.properties` file or use the sample provided in the project:

```
jpos.loader.serviceManagerClass=jpos.loader.simple.SimpleServiceManager
jpos.config.regPopulatorClass=jpos.config.simple.xml.XercesRegPopulator
```

Note: The `jpos.properties` file must be placed in the `jpos/res` directory at the same level as `Main.java`,
The `jpos.xml` file can be specified by the `jpos.properties` file; by default it uses the `jpos.xml` file in the same directory as `Main.java`.

### Troubleshooting

1. **Unable to open device**
   - Check the USB connection
   - Confirm that udev rules are correctly set
   - Use the `lsusb` command to verify that the device is recognized by the system
   - Check that the device serial number matches the one configured in jpos.xml

2. **Unable to receive scan data**
   - Ensure that `setDataEventEnabled(true)` has been called
   - Ensure that DataListener has been correctly added
   - Check that the scanner is in an enabled state (`setDeviceEnabled(true)`)

### API Documentation

The Mindeo JavaPOS Scanner library follows the JavaPOS 1.6 specification and implements the `ScannerService16` interface. For complete API documentation, please refer to the official JavaPOS documentation.

Main classes:
- `MDScannerService`: Implements the JavaPOS scanner service interface
- `MDScannerServiceFactory`: Used to create scanner service instances

directIO commands:

``` java
scanner.directIO(100, null, "YOUR_COMMAND");
```

- The first parameter `100` is a fixed value
- The second parameter `null` is a fixed value
- The third parameter `"YOUR_COMMAND"` is the command sent to the scanner, refer to the Mindeo scanner user manual for specific commands

## License

Copyright (C), 2004-2025, MINDEO, Shenzhen MinDe Electronics Technology Ltd.
