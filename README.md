# Global Inspiration Vietnam mobile application
This is a networking application that help finding people with specific skill.

## Install & Start

Install Node.js

```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.3/install.sh | bash # Mac or linux, follow the instructions
nvm install stable
```

Prepare the application environment

```bash
npm install -g ionic@beta cordova gulp
git clone https://github.com/riobus/ionic.git
cd ionic
npm install       # or `npm run reinstall` if you get an error
npm start         # start the application (ionic serve)
```

Run

```bash
npm start               # start the application in the browser (ionic serve)
npm run android         # deploy the app to the connected device (ionic run android)
ionic emulate android   # deploy the app to an emulator 
```
