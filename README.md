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
2. Add a <code>.csv</code> file with the database data to the <code>API/</code> folder:
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

### Run application 
- Start up:<br> <code>docker-compose up</code>
- Shut down:<br><code>docker-compose down</code>