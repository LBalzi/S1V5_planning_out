const express = require('express');
const app = express();
const records = require('./records');

app.use(express.json());

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch(err) {
      next(err);
    }
  }
}



//Send a GET request to /quotes to READ a list of quotes
app.get('/quotes', async (req, res)=>{
  try {
  const quotes = await records.getQuotes();
  res.json(quotes);
  } catch(err) {
    res.json({message: err.message})
  }
});
// Send a GET request to /quotes/:id to READ a quote
app.get('/quotes/:id', async (req, res)=>{
 try {
  const quote = await records.getQuote(req.params.id);
  if(quote) {
  res.json(quote);
  } else {
    res.status(404).json({message: "Quote not found"});
  }
 } catch(err) {
  res.json({message: err.message})
 }
});

// Send a POST request to /quotes to CREATE a new quote
app.post('/quotes', asyncHandler( async (req, res)=> {
  if(req.body.author && req.body.quote) {
    const quote = await records.createQuote({
      quote: req.body.quote,
      author: req.body.author
    });
  } else {
    res.status(400).json({message: "Quote and author required."});
  }
}));

// Send a PUT request to /quotes/:id to UPDATE a quote
app.put('/quotes/:id', asyncHandler(async (req, res) => {
  const quote = await records.getQuote(req.params.id);
  
  if (quote) {
    const updatedQuote = {
      ...quote, 
      quote: req.body.quote,
      author: req.body.author
    };

    await records.updateQuote(updatedQuote);
    res.status(204).end();
  } else {
    res.status(404).json({ message: "Quote wasn't found" });
  }
}));



// Send a DELETE request to /quotes/:id to delete a quote
app.delete("/quotes/:id", async(req, res, next) => {
  try {
    const quote = await records.getQuote(req.params.id);
    await records.deleteQuote(quote);
    res.status(204).end();
  } catch(err) {
    next(err);
  }

});


// Send a GET request to READ a random quote

app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  })
});



app.listen(3000, () => console.log('Quote API listening on port 3000!'));
