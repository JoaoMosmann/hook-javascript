window.client = new DL.Client({
  url: "http://localhost/doubleleft/dl-api/api/index.php/",
  appId: '1',
  key: "5ac2e373f80fff96cc85ea864e880847"
});

test("API", function() {
  ok( client.url == "http://localhost/doubleleft/dl-api/api/index.php/", "url OK");
  ok( client.appId == "1", "'appId' OK");
  ok( client.key == "q1uU7tFtXnLad6FIGGn2cB+gxcx64/uPoDhqe2Zn5AE=", "'secret' OK");
});
