sudo apt install -y curl maven nodejs npm unzip &&
sudo apt install -y ./deviceservice.deb &&

# Install web application.
curl -L -O https://github.com/LavaExcess/Vue-app-and-barcode-scanner/archive/refs/heads/driver.zip &&
unzip driver.zip -d /tmp/ &&
mv /tmp/Vue-app-and-barcode-scanner-driver ~/web &&
cd ~/web &&
sudo cp ~/Downloads/device/*.* /usr/share/Mindeo/deviceservice &&
sudo /usr/share/Mindeo/deviceservice/runservice.sh &&
sudo cat /usr/share/Mindeo/deviceservice/deviceservice.log &&
npm install -y