import express from "express";

const app = express();
app.use(express.json());

let count = 0;

app.post("/subscriber", (req, res) => {
  count++;

  console.log("attempt number:", count);
  console.log("received body:", req.body);

  if (count <= 2) {
    return res.status(500).json({ message: "temporary failure" });
  }

  return res.status(200).json({ message: "success on retry" });
});

app.listen(8080, () => {
  console.log("test receiver running on http://localhost:8080/subscriber");
});