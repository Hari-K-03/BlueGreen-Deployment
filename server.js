const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.VERSION || "Blue";

app.get("/", (req, res) => {
    res.send(`
        <h1>Blue-Green Deployment Demo</h1>
        <p>Running Version: ${VERSION}</p>
    `);
});

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});