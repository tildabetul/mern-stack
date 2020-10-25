Udemy MERN Stack Front to Back

Dependencies

1. mongo (nosql db) from https://cloud.mongodb.com/
- use company mail address for sign-in (finbyte)
- Created cluster name is 'BetulsMongoCluster'

2. npm
- npm init (enter the parameters; it will create package.json automatically at the end)
- npm i express express-validator bcryptjs config gravatar jsonwebtoken mongoose request
- npm i -D nodemon concurrently 
so you can run server via 'nodemon server' and it hot-reloads

3. react 
- npx create-react-app client (create react app into client folder)
- cd client
- npm i axios react-router-dom redux react-redux redux-thunk redux-devtools-extension moment react-moment uuid

REDUX for keeping "app-level-state"

Flow:

    Action -> Reducer -> STATE -> Update Views


