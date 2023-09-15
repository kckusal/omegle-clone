import express from "express";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use((req, res) => {
  res.status(404);

  return res.json({
    success: false,
    payload: null,
    message: `API SAYS: Handler not found for path: ${req.path}`,
  });
});

app.listen(PORT, () =>
  console.log(`REST API server ready at: http://localhost:${PORT}`)
);
