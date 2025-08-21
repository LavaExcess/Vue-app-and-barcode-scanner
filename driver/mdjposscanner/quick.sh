#!/bin/bash

_find_system_arch_() {
    local arch=$(uname -m)
    case "$arch" in
        x86_64|amd64)
            echo "x64"
            ;;
        i386|i686)
            echo "x86"
            ;;
        *)
            echo "x64"
            ;;
    esac
}

ARCH=$(_find_system_arch_)
echo "ARCH: $ARCH"

# Install udev rules only if they don't exist
if [ ! -f "/etc/udev/rules.d/20-mindeo.rules" ]; then
    echo "Installing udev rules..."
    sudo cp 20-mindeo.rules /etc/udev/rules.d
    sudo udevadm control --reload-rules
    sudo udevadm trigger
else
    echo "Udev rules already installed."
fi

# Run the test program
if [ "$1" == "--cli" ]; then
    # Run CLI test program if --cli parameter is provided
    echo "Running CLI test program..."
    LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$(pwd)/$ARCH java -cp .:* Main
else
    # Run GUI test program by default
    echo "Running GUI test program..."
    LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$(pwd)/$ARCH java -cp .:* MyWindow
fi
