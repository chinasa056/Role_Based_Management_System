require('./config/database')

const express = require("express")
const adminRouter = require("./routes/adminRouter")
const teacherRouter = require("./routes/teacherRouter")
const studentRouter = require("./routes/studendRouter")


const PORT = 2020;

const app = express();

app.use(express.json());
app.use(adminRouter)
app.use(teacherRouter)
app.use(studentRouter)


app.listen(PORT, () => {
    console.log(`app is listening to port: ${PORT}`);

})