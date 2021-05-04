import express from 'express';

const main = async () => {
  const app = express();
  const PORT = 8001;
  app.get('/', (req, res) => res.send('Express + TypeScript Server'));
  app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
  });
};

main().catch((error) => {
  console.log(error, 'There was an error starting the server');
});
