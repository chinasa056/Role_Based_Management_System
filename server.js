const express = require("express")

const PORT = 2020;

const app = express();

app.use(express.json());

app.listen(PORT, () => {
    console.log(`app is listening to port: ${PORT}`);

})