import { createApp } from "./app";

const port = process.env.PORT || 5000;

const app = createApp();

app.listen(port, () => {
  console.log(`Backend API listening on port ${port}`);
});
