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

const express = require('express');
const path = require('path');
const Airtable = require('airtable');
const config = require('./config.js');

const airtable = new Airtable({
  endpointUrl: 'https://api.airtable.com',
  apiKey: config.airtable_personal_access_token
});

const base = airtable.base(config.airtable_base);
const app = express();
const port = process.env.PORT || '8080';

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set up static files directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Dynamic route
app.get('/dynamic', (req, res) => {
  // Fetch the first 3 records from Airtable
  base(config.airtable_table_name)
    .select({
      maxRecords: 3,
      view: 'Grid view',
    })
    .firstPage()
    .then((records) => {
      const liveRecords = records.filter(
        (record) => record.fields.Status.toLowerCase() === 'live'
      );

      const responseData = liveRecords.map((record) => ({
        title: record.fields.Title,
        message: record.fields.Message,
      }));

      res.render('pages/announcements', {
        data_rows: responseData,
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
