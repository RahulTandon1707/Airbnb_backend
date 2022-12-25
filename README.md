# Airbnb_backend

This is backend of Airbnb Project.Frontend repository is different named as Airbnb_frontend.You need to run both frontend and backend in order to run the project
You need to install nodemon,you can write:

'npm i nodemon'

In package.json in scripts,it will be like

     "scripts": {
          "start": "node ./bin/www",
          "server": "nodemon ./bin/www"
      }
  
 Then cmd to run your server becomes
 'npm run server'
 
         Note:- You must run apache and mysql server in xampp i order to run backend successfully in your system
 
 To install necessary packages,you can write
 
       'npm i' or 'npm install'
 
 This will install node_module folder with necessary packages.
 
 
 However,you also need to install some more packages and that are stated below along with their commands to install:
 
     "express-fileupload": "npm i express-fileupload",
     "express-session": "npm i express-session",
     "mysql":"npm i mysql", 
  Finally the dependencies object in package.json should look like this:-
  
      "dependencies": {
          "cookie-parser": "~1.4.4",
          "cors": "^2.8.5",
          "debug": "~2.6.9",
          "ejs": "~2.6.1",
          "express": "~4.16.1",
          "express-fileupload": "^1.4.0",
          "express-session": "^1.17.3",
          "http-errors": "~1.6.3",
          "morgan": "~1.9.1",
          "mysql": "^2.18.1"
      }
