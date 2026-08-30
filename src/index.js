import 'dotenv/config';
import app from './app.js';
import connectDb from './db/connectDB.js';

const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log('MongoDB connected successfully');
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log('We got some issues: ' + err);
  });