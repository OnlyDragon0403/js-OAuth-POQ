import { URL } from 'url';
import express from 'express';
import got from 'got';

const CLIENT_ID = "pmQegCYcs446TVEvQA2M"; // insert your client_id here
const CLIENT_SECRET = "t15kzzbnssg47b0ldf6pt47j6hkkp4044"; // insert your client_secret here
const LINK = "https://s2w-dev-firebase.herokuapp.com/"; // for production, please use https://www.poq.gg
const SCOPE = "email";
const PORT = 8080;

const demo = `http://localhost:${PORT}/get`;

const url = new URL("/api/oauth2/authorize", LINK);
url.searchParams.set("response_type", "code");
url.searchParams.set("scope", SCOPE);
url.searchParams.set("redirect_uri", demo);
url.searchParams.set("client_id", CLIENT_ID);

console.log("test:", url.toString())
const main = `
<html>
  <head>
  </head>
  <body>
    <a href="${url.toString()}">Connect</a>
  </body>
</html>
`;

const app = express();

async function getInfo(code) {
  console.log("getInfo:code", code)
  console.log("getInfo response1")
  const response1 = await got.post("api/oauth2/token", {
    prefixUrl: LINK,
    form: {
      code,
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: demo,
    },
    responseType: "json",
  });

  console.log("response1", response1.body.access_token)
  console.log("getInfo response2")
  const response2 = await got.get("api/v1/wallets/@me", {
    prefixUrl: LINK,
    headers: {
      Authorization: `Bearer ${response1.body.access_token}`,
    },
    responseType: "json",
  });
  console.log("response2", response2.body)

  return response2.body;
}

app.get("/", (req, res) => {
  console.log("app.get:", req.query)
  if (!req.query.code) {
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    return res.status(200).send(main);
  } else {
    getInfo(req.query.code)
      .then((response) => res.send(response))
      .catch((error) => res.send(error));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${demo}`);
});