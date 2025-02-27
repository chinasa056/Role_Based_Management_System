require('dotenv').config();
require('./config/database')

const express = require("express")
const adminRouter = require("./routes/adminRouter")
const teacherRouter = require("./routes/teacherRouter")
const studentRouter = require("./routes/studendRouter")


const PORT = 2020;

const app = express();

app.use(express.json());
app.use("/api/v1", adminRouter)
app.use("/api/v1",teacherRouter)
app.use("/api/v1",studentRouter)


app.listen(PORT, () => {
    console.log(`app is listening to port: ${PORT}`);

})