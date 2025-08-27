sudo apt install -y curl nodejs npm unzip &&

# Install web application.
curl -L -O https://github.com/LavaExcess/Vue-app-and-barcode-scanner/archive/refs/heads/driver.zip &&
unzip Vue-app-and-barcode-scanner-driver.zip -d /tmp/ &&
mv /tmp/Vue-app-and-barcode-scanner-driver /home/master/web &&
cd /home/master/web &&
cp deploy/device/*.*  /usr/share/Mindeo/deviceservice
npm install -y
