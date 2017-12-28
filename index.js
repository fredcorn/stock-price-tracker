import http from 'http';
import Promise from 'bluebird'
import moment from 'moment'
import yahooFinance from 'yahoo-finance';
const quoteProm = Promise.promisify(yahooFinance.quote)
const stockCodes = ['DPW', 'WATT', 'TEUM']

const getStockPrice = (stockCode)=>{
  return new Promise((resolve, reject)=>{
    return quoteProm({
      symbol: stockCode,
      modules: [ 'price', 'summaryDetail' ] // see the docs for the full list
    })
    .then((quotes)=>{
      resolve(quotes)
    })
  })
}

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

setInterval(()=>{
  Promise.map(stockCodes, (stockCode)=>{
    return getStockPrice(stockCode)
    .then(quotes=>{
      return {
        stockCode,
        price: quotes.price.regularMarketPrice.toFixed(2)
      }
    })
  })
  .call("sort", (a, b)=>{
    return a.stockCode - b.stockCode
  })
  .reduce((messages, res)=>{
    const msg = `${res.stockCode} ${res.price}`
    messages.push(msg)
    return messages
  }, [])
  .then(messages=>{
    console.log("%s - %s", moment().format("LTS"), messages.join(' | '))
  })
}, 3000)