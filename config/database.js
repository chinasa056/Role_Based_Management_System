require ('dotenv').config();
const mongoose = require('mongoose');

const DB = process.env.MONGODB_URI;


mongoose.connect(DB)
.then(() => {
    console.log('Connected to database established successfully')
})
.catch((error) => {
    console.log( 'Error conneting to database' + error.message);
    
})
