import { App } from "./app";

new App().server.listen(3000, () => {
    console.log(`App listening on the port 3000`);
  })