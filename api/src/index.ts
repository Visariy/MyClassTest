import app from './app';

const port: number = parseInt(process.env.PORT || '3000');
const host: string = process.env.HOST || '0.0.0.0';

app()
  .then((server) =>
    server.listen(port, host, () => {
      console.log(`server listing on ${port} port`);
    })
  )
  .catch((e) => {
    console.error('There was an error when starting the server', e);
  });
