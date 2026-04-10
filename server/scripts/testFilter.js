const http = require("http");

function test(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path,
      method: "GET",
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", (e) => reject(e));
    req.end();
  });
}

(async () => {
  try {
    console.log("Testing price range 0-15 (encoded)");
    const r1 = await test(
      "/api/v1/post/limit?priceNumber%5B%5D=0&priceNumber%5B%5D=15",
    );
    console.log(r1.status, r1.body.slice(0, 500));

    console.log("\nTesting categoryCode filter (CTCH)");
    const r2 = await test("/api/v1/post/limit?categoryCode=CTCH");
    console.log(r2.status, r2.body.slice(0, 300));
  } catch (err) {
    console.error("test failed", err && err.message);
  }
})();
