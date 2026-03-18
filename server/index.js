const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/routes", require("./routes/routes"));
app.use("/trains", require("./routes/trains"));
app.use("/trips", require("./routes/trips"));

app.listen(5000, () => {
  console.log("Server started on port 5000");
});