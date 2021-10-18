var Airtable = require('airtable')

const express = require('express')
const path = require('path')

const config = require('./config.js')

var base = new Airtable({
  endpointUrl: 'https://api.airtable.com',
  apiKey: config.airtable_api_key
}).base(config.airtable_base)

const app = express()
const port = process.env.PORT || '8080'

// set the view engine to ejs
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// We use the /dynamic route so that if you'
app.get('/dynamic', (req, res) => {
  base(config.airtable_table_name).select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 3,
    view: "Grid view"
  }).firstPage().then(records => {
    var fetched_records = []
    records.forEach((record) => {
      if(record.fields.Status.toLowerCase() == 'live'){
        fetched_records.push({
          title: record.fields.Title,
          message: record.fields.Message,
          
        })
      }
    })

    res.render('pages/annoucements', {
      data_rows: fetched_records
    })
  }, function done(err) {
      if (err) { console.error(err); return; }
  })
})

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`)
})