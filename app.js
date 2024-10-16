const morgan = require("morgan");
const express = require("express");
const router = require("./routes/index");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const logger = require("./config/logger")

const port = process.env.PORT || 3000;
const corsOption = {
  optionsSuccessStatus: 200,
};

process.env.TZ = 'UTC';

app.use(cors(corsOption));
//app.use(morgan("tiny"));
app.use(morgan(":method :status :url :response-time ms", { stream: { write: (message) => logger.http(message.trim()) } }));

app.use(express.json());

app.use("/", router, (req, res, next) => {
  res.send("welcome to muti sns service");
});

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(500);
});

app.listen(port, () => {
  try {
    logger.debug(`Express is running on port ${port}`);
  } catch (err) {
    console.log(err);
  }

});
