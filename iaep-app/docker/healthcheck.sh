#!/bin/sh
set -e

# Perform a simple HTTP GET to the health API endpoint
wget -qO- http://localhost:3000/api/health || exit 1
