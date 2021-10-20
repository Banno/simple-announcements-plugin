/*
 * Copyright 2021 Jack Henry & Associates, Inc.®
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
          message: record.fields.Message
        })
      }
    })

    res.render('pages/announcements', {
      data_rows: fetched_records
    })
  }, function done(err) {
      if (err) { console.error(err); return; }
  })
})

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`)
})