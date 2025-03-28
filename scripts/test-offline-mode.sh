#!/bin/bash

# Mission Fresh - Offline Mode Test Helper
# This script helps test offline functionality by toggling the network interface

# Color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root/admin
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root/administrator (use sudo)${NC}"
  exit 1
fi

# Detect operating system
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Windows;;
    MINGW*)     MACHINE=Windows;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo -e "${BLUE}=== Mission Fresh Offline Mode Testing Utility ===${NC}"
echo -e "${BLUE}OS detected: ${MACHINE}${NC}"
echo ""

# Function to disable network
disable_network() {
  echo -e "${YELLOW}Disabling network connection...${NC}"
  
  if [ "$MACHINE" == "Mac" ]; then
    # Get active network service
    ACTIVE_SERVICE=$(networksetup -listnetworkserviceorder | grep "^\([0-9]\+\).*:.*" | head -1 | sed -E 's/^.*\((.*),.*\)$/\1/')
    if [ -z "$ACTIVE_SERVICE" ]; then
      echo -e "${RED}Failed to identify active network service${NC}"
      exit 1
    fi
    networksetup -setnetworkserviceenabled "$ACTIVE_SERVICE" off
  elif [ "$MACHINE" == "Linux" ]; then
    # Get default network interface
    DEFAULT_IFACE=$(ip route | grep default | awk '{print $5}' | head -1)
    if [ -z "$DEFAULT_IFACE" ]; then
      echo -e "${RED}Failed to identify default network interface${NC}"
      exit 1
    fi
    ip link set "$DEFAULT_IFACE" down
  elif [ "$MACHINE" == "Windows" ]; then
    # Windows - for MINGW/Git Bash
    # Get default network interface
    DEFAULT_IFACE=$(netsh interface show interface | grep "Connected" | head -1 | awk -F' ' '{for(i=NF;i>0;i--) printf "%s ", $i}')
    if [ -z "$DEFAULT_IFACE" ]; then
      echo -e "${RED}Failed to identify default network interface${NC}"
      exit 1
    fi
    netsh interface set interface "$DEFAULT_IFACE" disable
  fi
  
  echo -e "${GREEN}Network disabled. Your application is now offline.${NC}"
  echo -e "${YELLOW}App will remain in offline mode until you enable the network${NC}"
}

# Function to enable network
enable_network() {
  echo -e "${YELLOW}Enabling network connection...${NC}"
  
  if [ "$MACHINE" == "Mac" ]; then
    # Get active network service
    ACTIVE_SERVICE=$(networksetup -listnetworkserviceorder | grep "^\([0-9]\+\).*:.*" | head -1 | sed -E 's/^.*\((.*),.*\)$/\1/')
    if [ -z "$ACTIVE_SERVICE" ]; then
      echo -e "${RED}Failed to identify active network service${NC}"
      exit 1
    fi
    networksetup -setnetworkserviceenabled "$ACTIVE_SERVICE" on
  elif [ "$MACHINE" == "Linux" ]; then
    # Get default network interface
    DEFAULT_IFACE=$(ip route | grep default | awk '{print $5}' | head -1)
    if [ -z "$DEFAULT_IFACE" ]; then
      DEFAULT_IFACE=$(ip link show | grep "state UP" | head -1 | cut -d: -f2 | tr -d ' ')
      if [ -z "$DEFAULT_IFACE" ]; then
        echo -e "${RED}Failed to identify default network interface${NC}"
        exit 1
      fi
    fi
    ip link set "$DEFAULT_IFACE" up
  elif [ "$MACHINE" == "Windows" ]; then
    # Windows - for MINGW/Git Bash
    # Get default network interface
    DEFAULT_IFACE=$(netsh interface show interface | grep "Disconnected" | head -1 | awk -F' ' '{for(i=NF;i>0;i--) printf "%s ", $i}')
    if [ -z "$DEFAULT_IFACE" ]; then
      echo -e "${RED}Failed to identify default network interface${NC}"
      exit 1
    fi
    netsh interface set interface "$DEFAULT_IFACE" enable
  fi
  
  echo -e "${GREEN}Network enabled. Your application is now online.${NC}"
  echo -e "${YELLOW}Check if data syncing works correctly in the app.${NC}"
}

# Function to show help
show_help() {
  echo -e "Usage: sudo ./test-offline-mode.sh [OPTION]"
  echo -e "Helper utility for testing Mission Fresh offline mode."
  echo -e ""
  echo -e "Options:"
  echo -e "  --disable    Disable network connection"
  echo -e "  --enable     Enable network connection"
  echo -e "  --toggle     Toggle network connection status"
  echo -e "  --help       Display this help and exit"
  echo -e ""
  echo -e "Examples:"
  echo -e "  sudo ./test-offline-mode.sh --disable"
  echo -e "  sudo ./test-offline-mode.sh --enable"
  echo -e "  sudo ./test-offline-mode.sh --toggle"
  echo -e ""
  echo -e "Note: This script requires administrator/root privileges."
}

# Function to toggle network
toggle_network() {
  # Check current network status
  if ping -c 1 google.com > /dev/null 2>&1; then
    disable_network
  else
    enable_network
  fi
}

# Parse command line arguments
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

case "$1" in
  --disable)
    disable_network
    ;;
  --enable)
    enable_network
    ;;
  --toggle)
    toggle_network
    ;;
  --help)
    show_help
    ;;
  *)
    echo -e "${RED}Unknown option: $1${NC}"
    show_help
    exit 1
    ;;
esac

echo ""
echo -e "${BLUE}=== Testing Steps ===${NC}"
echo -e "1. Navigate to http://localhost:5001/app (or whatever port your app is running on)"
echo -e "2. Go to Settings > App Settings > Test Offline Mode"
echo -e "3. Try saving and fetching data while offline"
echo -e "4. Run this script again with --enable to restore network and test syncing"
echo ""
echo -e "${YELLOW}Happy testing!${NC}" 