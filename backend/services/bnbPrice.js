const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd";


async function getBnbUsdPrice() {

  const headers = {
    "Accept":
      "application/json"
  };


  if (
    process.env.COINGECKO_API_KEY
  ) {

    headers[
      "x-cg-demo-api-key"
    ] =
      process.env.COINGECKO_API_KEY;

  }


  const response =
    await fetch(
      COINGECKO_URL,
      {
        method:
          "GET",

        headers,

        signal:
          AbortSignal.timeout(
            10000
          )
      }
    );


  if (
    !response.ok
  ) {

    throw new Error(
      `CoinGecko price request failed: ${response.status}`
    );

  }


  const data =
    await response.json();


  const price =
    Number(
      data?.binancecoin?.usd
    );


  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {

    throw new Error(
      "Invalid BNB/USD price received"
    );

  }


  return price;
}


module.exports =
  getBnbUsdPrice;