import "dotenv/config";

import app from "./app.js";

const PORT = process.env.PORT || 3000;

// The hosting environment supplies PORT in production; local development
// falls back to the documented API port.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
