# Predicting investment activity
Collecting data on Gross Regional Product (GRP) and the volume of investments in fixed assets over the past 3-5 years; analyzing the dynamics of these investments and building a model for forecasting future investment levels for the next year.
## Launch
### Preparation
1. Fill out the .env file:
- POSTGRES_USER
- POSTGRES_PASSWORD
- POSTGRES_DB
- POSTGRES_HOST
- POSTGRES_PORT
2. Add a <code>.csv</code> file with the database data to the <code>data/</code> folder:
Required columns:
<table>
<tr>
<th>Column name</th>
<th>Data type</th>
</tr>
<tr>
<th>Округ</th>
<th>String</th>
</tr>
<tr>
<th>Регион</th>
<th>String</th>
</tr>
<tr>
<th>Год</th>
<th>Integer Number</th>
</tr>
<tr>
<th>Инвестиции</th>
<th>Float Number</th>
</tr>
<tr>
<th>ВРП</th>
<th>Float Number</th>
</tr>
<tr>
<th>Население</th>
<th>Integer Number</th>
</tr>
<tr>
<th>Безработица</th>
<th>Float Number</th>
</tr>
<tr>
<th>Средняя_ЗП</th>
<th>Float Number</th>
</tr>
<tr>
<th>Преступления</th>
<th>Float Number</th>
</tr>
<tr>
<th>Оборот_розницы</th>
<th>Float Number</th>
</tr>
<tr>
<th>Денежные_доходы</th>
<th>Float Number</th>
</tr>
<tr>
<th>Научные_исследования</th>
<th>Float Number</th>
</tr>
</table>

3. Add a <code>.log</code> file to the <code>data/</code> folder. If you don't have one, the program will create it automatically.

### Run application
- Start up:<br>  <code>docker-compose up -d</code>
- Load data into the database:<br><code>docker-compose exec backend uv run -m app.async_load_data</code>
Command line arguments:
	-  <code>--reset</code> <b>-</b> reset database; automatically reset database when loading data (optional)
	-  <code>--file-name</code> <b>-</b> name of the file that data you want to load to database
- Shut down:<br><code>docker-compose down</code>