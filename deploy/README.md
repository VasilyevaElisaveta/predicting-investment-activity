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

3. Fill out the inventory.yml file:
- ansible_host
- ansible_user

4. Add a <code>.log</code> file to the <code>data/</code> folder. If you don't have one, the program will create it automatically.

### Download Ansible
- Update packages:<br><code>sudo apt update</code>
- Install Ansible:<br><code>sudo apt install ansible</code>

### Run application
- Download and install Docker:<br>  <code>ansible-playbook -i inventory.yml install-docker.yml</code>
- Load data into the database:<br><code>ansible-playbook -i inventory.yml run-docker.yml</code>
Command line arguments:
	- <code> -e file_name=\<your file name\></code> <b>-</b> name of the file that data you want to load to database
- Configure ufw rules:<br>  <code>ansible-playbook -i inventory.yml configure-ufw.yml</code>